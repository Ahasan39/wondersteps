import { test, expect, type Page } from '@playwright/test'
import { alphabet } from '../src/games/alphabet-match/content.ts'
import { completeLevel, createInitialProgress } from '../src/engine/progressEngine.ts'
import { PROGRESS_KEY } from '../src/storage/progressStorage.ts'
import type { PlayerProgress } from '../src/types/game.ts'
const widths=[320,360,375,390,414,430,480,768,1024,1280,1440,1920]
async function read(page:Page):Promise<PlayerProgress>{return page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),PROGRESS_KEY)}
async function seed(page:Page){
 let progress=createInitialProgress()
 for(let id=1;id<=4;id++){const done=completeLevel(progress,{levelId:id,score:1100,stars:3,coinsEarned:75});if(!done.ok)throw Error(done.error);progress=done.value}
 await page.addInitScript(({key,progress})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(progress))},{key:PROGRESS_KEY,progress})
}
async function correctLabel(page:Page,id:number){
 if(id===2){const count=await page.locator('.count-object').count();expect(count).toBeGreaterThan(0);return String(count)}
 if(id===3){const letter=await page.locator('.prompt-letter').innerText();return alphabet.find(item=>item.letter===letter)!.choice.label}
 return (await page.locator('.prompt-word').innerText()).trim()
}
async function play(page:Page,id:number,wrongPerRound=0){
 await page.getByRole('button',{name:'Start',exact:true}).click()
 for(let round=1;round<=10;round++){
  await expect(page.getByText('Round '+round+' / 10',{exact:true})).toBeVisible()
  const label=await correctLabel(page,id)
  if(wrongPerRound){
   // Numeric answers have a single visible numeral rather than a second word label.
   const buttons=page.locator('.answer-card')
   let wrongIndex=0
   while(await buttons.nth(wrongIndex).getAttribute('aria-label')===label)wrongIndex++
   for(let n=0;n<wrongPerRound;n++)await buttons.nth(wrongIndex).click()
   await expect(page.getByRole('status').filter({hasText:'Almost! Try again'})).toBeVisible()
   await expect(page.getByText('Round '+round+' / 10',{exact:true})).toBeVisible()
  }
  await page.getByRole('button',{name:label,exact:true}).click()
  await expect(page.locator('.answer-correct')).toHaveCount(1)
  await expect(page.locator('.answer-card:disabled')).toHaveCount(4)
  if(round<10)await expect(page.getByText('Round '+(round+1)+' / 10',{exact:true})).toBeVisible()
 }
 await expect(page.getByRole('heading',{name:'Level Complete!',exact:true})).toBeVisible()
}
test('fresh player completes five games sequentially with results, unlocks and persisted rewards',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.goto('/wondersteps/#/play/1')
 expect((await read(page)).levels[0].attempts).toBe(0)
 for(let id=1;id<=5;id++){
  await play(page,id)
  await expect(page.locator('.level-result').getByRole('img',{name:'3 of 3 stars'})).toBeVisible()
  await expect(page.getByText('New best!',{exact:true})).toBeVisible()
  expect((await read(page)).coins).toBe(id*75)
  const progress=await read(page)
  expect(progress.levels[id-1]).toMatchObject({completed:true,attempts:1,bestScore:1100,stars:3})
  expect(progress.levels[id].completed).toBe(false)
  if(id<5){await expect(page.getByText('Level '+(id+1)+' Unlocked!',{exact:true})).toBeVisible();await page.getByRole('link',{name:'Next Level'}).click()}
  else await page.getByRole('link',{name:'Back to Adventure',exact:true}).click()
 }
 await expect(page.locator('.completed')).toHaveCount(5);await expect(page.locator('.current')).toHaveCount(1)
 await page.reload();expect((await read(page)).coins).toBe(375)
 await page.goto('/wondersteps/#/play/6');await expect(page.getByText(/Shape Match gameplay is coming/)).toBeVisible()
 expect(errors).toEqual([])
})
test('replay can improve stars then score worse without lowering bests or farming coins',async({page})=>{
 await page.goto('/wondersteps/#/play/1');await play(page,1,1)
 expect((await read(page)).levels[0]).toMatchObject({bestScore:700,stars:1,attempts:1});expect((await read(page)).coins).toBe(30)
 await page.getByRole('button',{name:'Replay Level'}).click();await play(page,1)
 expect((await read(page)).levels[0]).toMatchObject({bestScore:1100,stars:3,attempts:2});expect((await read(page)).coins).toBe(30)
 await expect(page.getByText('Level 2 Unlocked!',{exact:true})).toHaveCount(0)
 await page.getByRole('button',{name:'Replay Level'}).click();await play(page,1,2)
 expect((await read(page)).levels[0]).toMatchObject({bestScore:1100,stars:3,attempts:3});expect((await read(page)).coins).toBe(30)
 await expect(page.getByText('New best!',{exact:true})).toHaveCount(0);await expect(page.locator('.level-result').getByRole('img',{name:'0 of 3 stars'})).toBeVisible()
 await page.reload();await expect(page.getByText('Best score: 1100')).toBeVisible()
})
test('refresh and Back discard unfinished rounds; Start alone records attempts; reset still works',async({page})=>{
 await page.goto('/wondersteps/#/play/1');await page.reload();expect((await read(page)).levels[0].attempts).toBe(0)
 await page.getByRole('button',{name:'Start',exact:true}).dblclick()
 await expect(page.getByText('Round 1 / 10',{exact:true})).toBeVisible()
 expect((await read(page)).levels[0].attempts).toBe(1)
 await page.getByRole('button',{name:/Turn sound preference/}).click()
 expect((await read(page)).levels[0].attempts).toBe(1)
 await page.reload();await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible()
 expect((await read(page)).levels[0].attempts).toBe(1)
 await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('link',{name:'Back to levels'}).click()
 await expect(page.getByRole('heading',{name:'Your adventure awaits'})).toBeVisible()
 expect((await read(page)).levels[0]).toMatchObject({completed:false,attempts:2,bestScore:0})
 await page.goto('/wondersteps/#/play/1');await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible()
 await page.goto('/wondersteps/#/settings');await page.getByRole('button',{name:'Reset progress',exact:true}).click()
 await page.getByRole('dialog').getByRole('button',{name:'Yes, reset progress',exact:true}).click()
 expect((await read(page)).levels.every(l=>!l.completed&&l.attempts===0)).toBeTruthy()
})
test('keyboard answers lock during feedback, repeated keys do not score twice, reduced motion stays still',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/wondersteps/#/play/1')
 await page.getByRole('button',{name:'Start',exact:true}).focus();await page.keyboard.press('Enter')
 const label=await correctLabel(page,1);const correct=page.getByRole('button',{name:label,exact:true})
 await correct.focus();await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.up('Enter')
 await expect(page.getByText('Score: 100',{exact:true})).toBeVisible()
 await expect(page.locator('.answer-card:disabled')).toHaveCount(4)
 await expect(page.getByText('Round 2 / 10',{exact:true})).toBeVisible()
 await expect(page.locator('.question-prompt h2')).toBeFocused()
 const next=page.getByRole('button',{name:await correctLabel(page,1),exact:true});await next.focus();await page.keyboard.press('Space')
 await expect(page.getByText('Score: 200',{exact:true})).toBeVisible()
})
test('five games fit all target widths and landscape with clear non-overlapping objects and controls',async({page})=>{
 await seed(page)
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 for(const {width,height} of [...widths.map(width=>({width,height:800})),{width:667,height:375},{width:320,height:568},{width:390,height:667}]){
  await page.setViewportSize({width,height})
  for(let id=1;id<=5;id++){
   await page.goto('/wondersteps/#/play/'+id);await page.getByRole('button',{name:'Start',exact:true}).click()
   await expect(page.locator('.choice-grid')).toBeVisible()
   await page.waitForTimeout(200)
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' level '+id).toBeTruthy()
   const boxes=await page.locator('.answer-card').evaluateAll(nodes=>nodes.map(node=>{const b=node.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,right:b.right,clipped:node.scrollWidth>node.clientWidth}}))
   expect(boxes.every(b=>b.width>=44&&b.height>=44&&b.bottom<=height&&b.x>=0&&b.right<=width&&!b.clipped),width+' level '+id+' '+JSON.stringify(boxes)).toBeTruthy()
   const objects=await page.locator('.count-object').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()))
   expect(objects.every((a,i)=>objects.every((b,j)=>i===j||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top))).toBeTruthy()
   const label=await correctLabel(page,id);await page.getByRole('button',{name:label,exact:true}).click()
   await expect(page.getByRole('status').filter({hasText:/Great job/})).toBeVisible()
   if(width===390||width===667)await page.screenshot({path:'artifacts/phase4-'+id+'-'+width+'.png',animations:'disabled'})
  }
 }
 expect(errors).toEqual([])
})
test('completion screens stay contained and actions remain touch-sized across widths',async({page})=>{
 await page.goto('/wondersteps/#/play/1');await play(page,1)
 for(const width of [...widths,667]){
  await page.setViewportSize({width,height:width===667?375:800})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
  const actions=await page.locator('.result-actions a,.result-actions button').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return b.width>=44&&b.height>=44&&n.scrollWidth<=n.clientWidth}))
  expect(actions.every(Boolean),String(width)).toBeTruthy()
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/phase4-result.png',fullPage:true,animations:'disabled'})
})
