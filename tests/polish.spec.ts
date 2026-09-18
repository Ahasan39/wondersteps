import { test,expect,type Page } from '@playwright/test'
import { AUDIO_PREFERENCES_KEY } from '../src/audio/preferences.ts'
import { PROGRESS_KEY } from '../src/storage/progressStorage.ts'
import { createInitialProgress,completeLevel } from '../src/engine/progressEngine.ts'
import { alphabet } from '../src/games/alphabet-match/content.ts'

interface AudioTrace {created:number;resumed:number;suspended:number;gains:number;notes:{bus:number;pitch:number}[]}
async function mockAudio(page:Page,{reject=false,enabled=true}={}){
 await page.addInitScript(({reject,enabled,key})=>{
  if(enabled&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,musicEnabled:true,sfxEnabled:true}))
  const trace:AudioTrace={created:0,resumed:0,suspended:0,gains:0,notes:[]}
  ;(window as unknown as {audioTrace:AudioTrace}).audioTrace=trace
  class Gain{
   gain={value:1,setValueAtTime:()=>{},linearRampToValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}}
   target:Gain|object|null=null
   connect(target:Gain|object){this.target=target}
   disconnect(){this.target=null}
  }
  class Oscillator{
   frequency={value:0};type='sine';onended:(()=>void)|null=null;target:Gain|null=null;timer:number|null=null;ended=false
   connect(target:Gain){this.target=target}
   disconnect(){this.target=null}
   start(){const bus=this.target?.target;trace.notes.push({bus:bus instanceof Gain?bus.gain.value:0,pitch:this.frequency.value})}
   stop(when?:number){
    if(this.timer!==null)window.clearTimeout(this.timer)
    const end=()=>{if(!this.ended){this.ended=true;this.onended?.()}}
    if(when===undefined)end();else this.timer=window.setTimeout(end,Math.max(0,(when-performance.now()/1000)*1000))
   }
  }
  class Context{
   state='suspended';destination={}
   constructor(){trace.created++}
   get currentTime(){return performance.now()/1000}
   resume(){trace.resumed++;if(reject)return Promise.reject(new Error('Playback denied'));this.state='running';return Promise.resolve()}
   suspend(){trace.suspended++;this.state='suspended';return Promise.resolve()}
   close(){this.state='closed';return Promise.resolve()}
   createGain(){trace.gains++;return new Gain()}
   createOscillator(){return new Oscillator()}
  }
  window.AudioContext=Context as unknown as typeof AudioContext
 },{reject,enabled,key:AUDIO_PREFERENCES_KEY})
}
async function trace(page:Page){return page.evaluate(()=>(window as unknown as {audioTrace:AudioTrace}).audioTrace)}
const sfx=(value:AudioTrace)=>value.notes.filter(note=>note.bus===.55)
const music=(value:AudioTrace)=>value.notes.filter(note=>note.bus===.25)
function captureErrors(page:Page){
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});return errors
}
async function finishColor(page:Page){
 await page.getByRole('button',{name:'Start',exact:true}).click()
 for(let round=1;round<=10;round++){
  await expect(page.getByText('Round '+round+' / 10',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:(await page.locator('.prompt-word').innerText()).trim(),exact:true}).click()
  if(round<10)await expect(page.getByText('Round '+(round+1)+' / 10',{exact:true})).toBeVisible()
 }
 await expect(page.getByRole('heading',{name:'Level Complete!',exact:true})).toBeVisible()
}
test('audio is idle on load, activates once after Start, reacts to accepted answers and pauses on hide or Back',async({page})=>{
 await mockAudio(page);const errors=captureErrors(page)
 await page.setViewportSize({width:390,height:844});await page.goto('/wondersteps/#/play/1')
 expect((await trace(page)).created).toBe(0)
 expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(entry=>entry.name.includes('audioSynth')))).toBe(false)
 await page.getByRole('button',{name:'Start',exact:true}).click()
 await expect.poll(async()=>sfx(await trace(page)).length).toBe(4)
 expect((await trace(page)).created).toBe(1);expect(music(await trace(page)).length).toBeGreaterThan(0)
 const correct=(await page.locator('.prompt-word').innerText()).trim()
 const wrong=(await page.locator('.answer-card').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')!))).find(label=>label!==correct)!
 const before=await page.locator('.choice-grid').evaluate(node=>({top:(node as HTMLElement).offsetTop,height:node.clientHeight}))
 await page.getByRole('button',{name:wrong,exact:true}).click()
 await expect(page.locator('[data-pip-state="encouraging"]')).toBeVisible()
 await expect(page.getByRole('status').filter({hasText:'Almost! Try again'})).toBeVisible()
 expect(sfx(await trace(page)).length).toBe(6);await expect(page.locator('.answer-card:disabled')).toHaveCount(0)
 await page.getByRole('button',{name:correct,exact:true}).evaluate(button=>{(button as HTMLButtonElement).click();(button as HTMLButtonElement).click();(button as HTMLButtonElement).click()})
 await expect(page.getByText('Score: 70',{exact:true})).toBeVisible()
 await expect(page.locator('[data-pip-state="happy"]')).toBeVisible();await expect(page.locator('.answer-card:disabled')).toHaveCount(4)
 expect(sfx(await trace(page)).length).toBe(9)
 const after=await page.locator('.choice-grid').evaluate(node=>({top:(node as HTMLElement).offsetTop,height:node.clientHeight}));expect(after).toEqual(before)
 await expect(page.getByText('Round 2 / 10',{exact:true})).toBeVisible()
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))})
 const paused=music(await trace(page)).length;await page.waitForTimeout(350);expect(music(await trace(page)).length).toBe(paused)
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))})
 await expect.poll(async()=>music(await trace(page)).length).toBeGreaterThan(paused);expect((await trace(page)).created).toBe(1)
 await page.getByRole('link',{name:'Back to levels',exact:true}).click();await expect(page.getByRole('heading',{name:'Your adventure awaits'})).toBeVisible()
 const stopped=music(await trace(page)).length;await page.waitForTimeout(350);expect(music(await trace(page)).length).toBe(stopped)
 await expect(page.getByRole('link',{name:'Ahasan39',exact:true})).toBeVisible();expect(errors).toEqual([])
})
test('Music and SFX persist independently, master mute works and reload never autoplays',async({page})=>{
 await mockAudio(page,{enabled:false});const errors=captureErrors(page)
 await page.goto('/wondersteps/#/settings');expect((await trace(page)).created).toBe(0)
 await page.getByRole('button',{name:'Enable music',exact:true}).click()
 await expect(page.getByRole('button',{name:'Disable music',exact:true})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('button',{name:'Enable sound effects',exact:true})).toHaveAttribute('aria-pressed','false')
 await page.reload();expect((await trace(page)).created).toBe(0)
 await expect(page.getByRole('button',{name:'Disable music',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Enable sound effects',exact:true}).click()
 await page.getByRole('button',{name:'Disable music',exact:true}).click()
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),AUDIO_PREFERENCES_KEY)).toEqual({version:1,musicEnabled:false,sfxEnabled:true})
 await page.getByRole('button',{name:'Turn sound preference off'}).click()
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),AUDIO_PREFERENCES_KEY)).toEqual({version:1,musicEnabled:false,sfxEnabled:false})
 await page.getByRole('button',{name:'Turn sound preference on'}).click()
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),AUDIO_PREFERENCES_KEY)).toEqual({version:1,musicEnabled:true,sfxEnabled:true})
 await page.reload();expect((await trace(page)).created).toBe(0);expect(errors).toEqual([])
})
test('blocked audio promises and malformed preferences cannot interrupt gameplay',async({page})=>{
 await mockAudio(page,{reject:true})
 await page.addInitScript(key=>localStorage.setItem(key,'broken'),AUDIO_PREFERENCES_KEY)
 const errors=captureErrors(page);await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/wondersteps/#/play/1');await page.getByRole('button',{name:'Turn sound preference on'}).click()
 await page.getByRole('button',{name:'Start',exact:true}).click()
 await page.getByRole('button',{name:(await page.locator('.prompt-word').innerText()).trim(),exact:true}).click()
 await expect(page.getByText('Round 2 / 10',{exact:true})).toBeVisible()
 await expect(page.locator('.game-spark')).toHaveCount(0);expect((await trace(page)).created).toBe(1);expect((await trace(page)).notes).toEqual([])
 expect(await page.locator('.pip-companion .mascot').evaluate(node=>getComputedStyle(node).transform)).toBe('none');expect(errors).toEqual([])
})
test('results reveal earned stars, actual coins and one-time unlock; replay and reduced motion do not repeat rewards',async({page})=>{
 await mockAudio(page);const errors=captureErrors(page);await page.setViewportSize({width:390,height:844})
 await page.goto('/wondersteps/#/play/1');await finishColor(page)
 await expect(page.getByRole('button',{name:'Replay Level'})).toBeEnabled();await expect(page.locator('[data-pip-state="celebrating"]')).toBeVisible()
 await expect(page.getByRole('img',{name:'3 of 3 stars'})).toBeVisible()
 await expect(page.locator('.result-stars .earned-star')).toHaveCount(3);await expect(page.locator('.celebration-sparkles .game-spark')).toHaveCount(8)
 await page.waitForTimeout(1500)
 const coinPitch=440*2**((93-69)/12),unlockPitch=440*2**((83-69)/12)
 const first=await trace(page)
 const countPitch=(value:AudioTrace,pitch:number)=>sfx(value).filter(note=>Math.abs(note.pitch-pitch)<.01).length
 expect(countPitch(first,coinPitch)).toBe(1);expect(countPitch(first,unlockPitch)).toBe(1)
 await expect(page.getByRole('link',{name:'Ahasan39',exact:true})).toBeVisible()
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Replay Level'}).click();await finishColor(page);await page.waitForTimeout(1500)
 await expect(page.locator('.game-spark')).toHaveCount(0);await expect(page.getByText('Level 2 Unlocked!',{exact:true})).toHaveCount(0)
 const replay=await trace(page);expect(countPitch(replay,coinPitch)).toBe(1);expect(countPitch(replay,unlockPitch)).toBe(1)
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).coins,PROGRESS_KEY)).toBe(75)
 await page.screenshot({path:'artifacts/phase41-result-mobile.png',fullPage:true,animations:'disabled'});expect(errors).toEqual([])
})
test('all five games have usable HUD, Pip, feedback and choices on portrait, short phones and three landscapes',async({page})=>{
 await mockAudio(page,{enabled:false});const errors=captureErrors(page)
 let progress=createInitialProgress();for(let id=1;id<=4;id++){const result=completeLevel(progress,{levelId:id,score:1100,stars:3,coinsEarned:75});if(!result.ok)throw Error(result.error);progress=result.value}
 await page.addInitScript(({key,progress})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(progress))},{key:PROGRESS_KEY,progress})
 const sizes=[[320,568],[360,640],[375,667],[390,844],[414,896],[430,932],[360,560],[480,800],[768,900],[1024,900],[1280,900],[1440,900],[1920,1080],[667,375],[740,360],[844,390]]
 for(const [width,height]of sizes){
  await page.setViewportSize({width,height})
  for(let id=1;id<=5;id++){
   await page.goto('/wondersteps/#/play/'+id)
   await expect(page.getByRole('link',{name:'Ahasan39',exact:true})).toBeVisible()
   await page.getByRole('button',{name:'Start',exact:true}).click();await expect(page.locator('.choice-grid')).toBeVisible();await page.waitForTimeout(180)
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+id).toBe(true)
   const boxes=await page.locator('.answer-card,.pip-companion,.round-progress,.question-prompt').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return {answer:node.classList.contains('answer-card'),left:box.left,right:box.right,top:box.top,bottom:box.bottom,width:box.width,height:box.height}}))
   expect(boxes.every(box=>box.left>=0&&box.right<=width&&box.top>=0&&box.bottom<=height),width+'x'+height+' level '+id+' '+JSON.stringify(boxes)).toBeTruthy()
   expect(boxes.filter(box=>box.answer).every(box=>box.width>=44&&box.height>=44)).toBeTruthy()
   if(width<768||height<500){
    await expect(page.locator('.gameplay-back')).toBeVisible();await expect(page.locator('.gameplay-heading')).toBeVisible()
    await expect(page.locator('.app-footer')).toBeHidden()
   }else await expect(page.getByRole('link',{name:'Ahasan39',exact:true})).toBeVisible()
   let answer:string
   if(id===2)answer=String(await page.locator('.count-object').count())
   else if(id===3){const letter=await page.locator('.prompt-letter').innerText();answer=alphabet.find(item=>item.letter===letter)!.choice.label}
   else answer=(await page.locator('.prompt-word').innerText()).trim()
   await page.getByRole('button',{name:answer,exact:true}).click();await expect(page.locator('[data-pip-state="happy"]')).toBeVisible()
   if((width===320||width===740)&&id<=5)await page.screenshot({path:'artifacts/phase41-game-'+id+'-'+width+'.png',animations:'disabled'})
  }
 }
 expect(errors).toEqual([])
})
