import test from 'node:test'
import assert from 'node:assert/strict'
import { AUDIO_PREFERENCES_KEY,defaultAudioPreferences,loadAudioPreferences,saveAudioPreferences } from '../src/audio/preferences.ts'
import { audioEvents,type AudioEvent,type AudioSynth } from '../src/audio/audioEvents.ts'
import { createAudioManager } from '../src/audio/audioManager.ts'
import { createAudioSynth } from '../src/audio/audioSynth.ts'

const both={version:1 as const,musicEnabled:true,sfxEnabled:true}
const flush=()=>new Promise<void>(resolve=>setImmediate(resolve))
function fixture({resumeFailure=false,loadFailure=false,creationFailure=false}={}){
 const counts={created:0,loaded:0,resumed:0,suspended:0,closed:0,musicStarts:0,musicStops:0,disposed:0}
 let state='suspended',musicPlaying=false
 const events:AudioEvent[]=[]
 const context={
  get state(){return state},
  resume(){counts.resumed++;if(resumeFailure)return Promise.reject(new Error('Autoplay denied'));state='running';return Promise.resolve()},
  suspend(){counts.suspended++;state='suspended';return Promise.resolve()},
  close(){counts.closed++;state='closed';return Promise.resolve()},
 } as unknown as AudioContext
 const synth={
  startMusic(){if(!musicPlaying){musicPlaying=true;counts.musicStarts++}},
  stopMusic(){if(musicPlaying){musicPlaying=false;counts.musicStops++}},
  stopEffects(){},
  play(event:AudioEvent){events.push(event)},
  dispose(){counts.disposed++;musicPlaying=false},
 }
 const manager=createAudioManager({createContext:()=>{counts.created++;if(creationFailure)throw Error('Unsupported');return context},loadSynth:async()=>{counts.loaded++;if(loadFailure)throw Error('No audio');return synth}})
 return {manager,counts,events,interrupt(){state='suspended';context.onstatechange?.call(context,new Event('statechange'))},get musicPlaying(){return musicPlaying}}
}
test('audio defaults are silent and missing, malformed or future preferences recover safely',()=>{
 const storage=(raw:string|null)=>({getItem:()=>raw,setItem:()=>{}})
 assert.deepEqual(loadAudioPreferences(storage(null)),defaultAudioPreferences)
 for(const raw of ['broken','null','[]','{"version":2,"musicEnabled":true}','x'.repeat(1001)])assert.deepEqual(loadAudioPreferences(storage(raw)),defaultAudioPreferences)
 assert.deepEqual(loadAudioPreferences(storage('{"version":1,"musicEnabled":true,"sfxEnabled":"true"}')),{version:1,musicEnabled:true,sfxEnabled:false})
 assert.deepEqual(loadAudioPreferences({getItem:()=>{throw Error('Denied')},setItem:()=>{}}),defaultAudioPreferences)
})
test('music and SFX persist independently in a dedicated key and leave player progress untouched',()=>{
 const values=new Map([['wondersteps.player-progress','existing-save']])
 const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)}}
 assert.equal(saveAudioPreferences(storage,{...both,sfxEnabled:false}),true)
 assert.deepEqual(loadAudioPreferences(storage),{...both,sfxEnabled:false})
 assert.equal(values.get('wondersteps.player-progress'),'existing-save');assert.ok(values.has(AUDIO_PREFERENCES_KEY))
 assert.equal(saveAudioPreferences({getItem:()=>null,setItem:()=>{throw Error('Quota')}},both),false)
})
test('no context, synthesis code or playback is created before deliberate activation',async()=>{
 const f=fixture();f.manager.setPreferences(both);f.manager.emit('correct');f.manager.setHidden(false)
 await flush();assert.equal(f.counts.created,0);assert.equal(f.counts.loaded,0);assert.deepEqual(f.events,[])
 await f.manager.activate();assert.equal(f.counts.created,1);assert.equal(f.counts.loaded,1);assert.equal(f.musicPlaying,false)
 f.manager.dispose()
})
test('Start routes its event, creates one context and one loop; repeated activation cannot duplicate music',async()=>{
 const f=fixture();f.manager.setPreferences(both);f.manager.startGame();await flush()
 assert.equal(f.counts.created,1);assert.equal(f.counts.loaded,1);assert.equal(f.counts.musicStarts,1);assert.deepEqual(f.events,['gameStart'])
 await f.manager.activate();f.manager.setPreferences(both);await flush()
 assert.equal(f.counts.created,1);assert.equal(f.counts.loaded,1);assert.equal(f.counts.musicStarts,1)
 f.manager.endGame();assert.equal(f.musicPlaying,false);f.manager.dispose()
})
test('semantic SFX events route exactly once per accepted emit and obey independent preferences',async()=>{
 const f=fixture();f.manager.setPreferences({...both,musicEnabled:false});await f.manager.activate()
 for(const event of audioEvents)f.manager.emit(event)
 assert.deepEqual(f.events,[...audioEvents]);assert.equal(f.musicPlaying,false)
 f.manager.setPreferences({...both,sfxEnabled:false});f.manager.emit('incorrect')
 assert.equal(f.events.length,audioEvents.length)
 f.manager.startGame();await flush();assert.equal(f.musicPlaying,true);f.manager.dispose()
})
test('muting stops music, unmuting resumes a previously activated game and navigation stops it',async()=>{
 const f=fixture();f.manager.setPreferences(both);f.manager.startGame();await flush()
 f.manager.setPreferences(defaultAudioPreferences);assert.equal(f.musicPlaying,false)
 f.manager.setPreferences(both);await flush();assert.equal(f.musicPlaying,true)
 f.manager.endGame();await flush();assert.equal(f.musicPlaying,false)
 f.manager.setHidden(true);f.manager.setHidden(false);await flush();assert.equal(f.musicPlaying,false)
 f.manager.dispose()
})
test('hidden pages suspend playback, suppress SFX and resume only an activated enabled game',async()=>{
 const f=fixture();f.manager.setPreferences(both);f.manager.startGame();await flush()
 f.manager.setHidden(true);assert.equal(f.musicPlaying,false);f.manager.emit('correct');assert.deepEqual(f.events,['gameStart'])
 f.manager.setHidden(false);await flush();assert.equal(f.musicPlaying,true);assert.equal(f.counts.created,1)
 f.manager.setPreferences({...both,musicEnabled:false});f.manager.setHidden(true);f.manager.setHidden(false);await flush();assert.equal(f.musicPlaying,false)
 f.manager.dispose()
})
test('rejected resume, failed synthesis and unavailable browser audio are non-throwing fallbacks',async()=>{
 for(const options of [{resumeFailure:true},{loadFailure:true},{creationFailure:true}]){
  const f=fixture(options);f.manager.setPreferences(both);await f.manager.activate();f.manager.startGame();f.manager.emit('correct')
  f.manager.setHidden(true);f.manager.setHidden(false);await flush();assert.equal(f.musicPlaying,false)
  f.manager.dispose();await flush()
 }
})
test('native interruptions stop music and an accepted later gesture can recover without duplicates',async()=>{
 const f=fixture();f.manager.setPreferences(both);f.manager.startGame();await flush()
 f.interrupt();assert.equal(f.musicPlaying,false)
 f.manager.emit('correct');await flush();assert.equal(f.musicPlaying,true)
 assert.equal(f.counts.created,1);assert.deepEqual(f.events,['gameStart','correct'])
 f.manager.dispose()
})
test('a late synthesis load after unmount is disposed and never begins playback',async()=>{
 let deliver:(value:AudioSynth)=>void=()=>{}
 let disposed=0,started=0
 const context={state:'running',resume:()=>Promise.resolve(),suspend:()=>Promise.resolve(),close:()=>Promise.resolve()} as unknown as AudioContext
 const manager=createAudioManager({createContext:()=>context,loadSynth:()=>new Promise(resolve=>{deliver=resolve})})
 manager.setPreferences(both);const activation=manager.activate();await flush();manager.dispose()
 deliver({startMusic:()=>{started++},stopMusic:()=>{},play:()=>{},stopEffects:()=>{},dispose:()=>{disposed++}})
 await activation;assert.equal(started,0);assert.equal(disposed,1)
})
test('native synth schedules gentle envelopes and lower music gain, bounds voices and cleans its loop',()=>{
 const gains:{gain:{value:number;setValueAtTime:()=>void;linearRampToValueAtTime:()=>void;exponentialRampToValueAtTime:()=>void};connect:()=>void;disconnect:()=>void}[]=[]
 const voices:{frequency:{value:number};type:string;onended:(()=>void)|null;connect:()=>void;disconnect:()=>void;start:()=>void;stop:()=>void}[]=[]
 const context={
  state:'running',currentTime:0,destination:{},
  createGain(){const gain={gain:{value:0,setValueAtTime:()=>{},linearRampToValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},connect:()=>{},disconnect:()=>{}};gains.push(gain);return gain},
  createOscillator(){const voice={frequency:{value:0},type:'sine',onended:null as (()=>void)|null,connect:()=>{},disconnect:()=>{},start:()=>{},stop:()=>{}};voices.push(voice);return voice},
 } as unknown as AudioContext
 const synth=createAudioSynth(context);assert.ok(gains[0].gain.value<gains[1].gain.value)
 synth.startMusic();const first=voices.length;synth.startMusic();assert.equal(voices.length,first)
 for(let i=0;i<30;i++)synth.play('correct');assert.ok(voices.length<=24)
 synth.stopMusic();synth.stopEffects();synth.dispose()
 voices.forEach(voice=>voice.onended?.())
 assert.ok(voices.every(voice=>Number.isFinite(voice.frequency.value)&&voice.frequency.value>0))
})
