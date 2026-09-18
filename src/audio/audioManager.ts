import type { AudioEvent,AudioSynth } from './audioEvents.ts'
import type { AudioPreferences } from './preferences.ts'
import { defaultAudioPreferences } from './preferences.ts'

export interface AudioDependencies {createContext:()=>AudioContext;loadSynth:(context:AudioContext)=>Promise<AudioSynth>}
function browserContext():AudioContext {
 const BrowserAudio=window.AudioContext??(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext
 return new BrowserAudio()
}
const browserDependencies:AudioDependencies={
 createContext:browserContext,
 loadSynth:async context=>(await import('./audioSynth.ts')).createAudioSynth(context),
}
/** One context, one lazy synth and one music loop. All failures are optional audio failures. */
export function createAudioManager(dependencies:AudioDependencies=browserDependencies){
 let context:AudioContext|null=null,synth:AudioSynth|null=null,loading:Promise<void>|null=null
 let preferences={...defaultAudioPreferences},activated=false,hidden=false,wantsMusic=false,disposed=false
 let pending:AudioEvent[]=[]
 const safe=(operation:()=>void)=>{try{operation()}catch{/* Unsupported audio never affects gameplay. */}}
 function sync(){
  if(!synth)return
  safe(()=>{
   if(!disposed&&!hidden&&activated&&preferences.musicEnabled&&wantsMusic&&context?.state==='running')synth!.startMusic()
   else synth!.stopMusic()
   if(hidden||!preferences.sfxEnabled||context?.state!=='running')synth!.stopEffects()
   if(!hidden&&preferences.sfxEnabled&&context?.state==='running'){
    const queued=pending;pending=[]
    for(const event of queued)synth!.play(event)
   }
  })
 }
 function ensureSynth(){
  if(!context||disposed||hidden||!activated||!(preferences.musicEnabled||preferences.sfxEnabled))return Promise.resolve()
  if(synth){sync();return Promise.resolve()}
  if(loading)return loading
  const target=context
  loading=Promise.resolve().then(()=>dependencies.loadSynth(target)).then(next=>{
   if(disposed||target!==context){next.dispose();return}
   synth=next;sync()
  }).catch(()=>{pending=[]}).finally(()=>{loading=null})
  return loading
 }
 async function resume(){
  if(!context||disposed||hidden)return
  try{await context.resume();sync()}catch{pending=[];sync()}
 }
 const manager={
  async activate(){
   if(disposed||hidden)return
   activated=true
   // Create/resume synchronously inside the trusted click before loading synthesis code.
   try{
    if(!context){context=dependencies.createContext();context.onstatechange=sync}
   }catch{return}
   const resumed=resume()
   await Promise.all([resumed,ensureSynth()])
   if(!preferences.musicEnabled&&!preferences.sfxEnabled&&context)safe(()=>{void context!.suspend().catch(()=>{})})
  },
  setPreferences(next:AudioPreferences){
   preferences={...next}
   if(!preferences.sfxEnabled)pending=[]
   sync()
   if(activated&&!hidden&&(preferences.musicEnabled||preferences.sfxEnabled)){
    void resume();void ensureSynth()
   }else if(context&&!preferences.musicEnabled&&!preferences.sfxEnabled){
    safe(()=>{void context!.suspend().catch(()=>{})})
   }
  },
  startGame(){wantsMusic=true;void manager.activate();manager.emit('gameStart')},
  endGame(){wantsMusic=false;pending=[];sync();safe(()=>synth?.stopEffects())},
  emit(event:AudioEvent){
   if(disposed||hidden||!activated||!preferences.sfxEnabled)return
   if(synth&&context?.state==='running')safe(()=>synth!.play(event))
   else{
    if(pending.length<8)pending.push(event)
    if(!loading)void manager.activate()
   }
  },
  setHidden(value:boolean){
   hidden=value;pending=[];sync()
   if(value&&context)safe(()=>{void context!.suspend().catch(()=>{})})
   else if(activated&&(preferences.musicEnabled||preferences.sfxEnabled)){void resume();void ensureSynth()}
  },
  dispose(){
   disposed=true;pending=[];safe(()=>synth?.dispose())
   if(context)safe(()=>{context!.onstatechange=null;void context!.close().catch(()=>{})})
   context=null;synth=null
  },
 }
 return manager
}
export type AudioManager=ReturnType<typeof createAudioManager>
