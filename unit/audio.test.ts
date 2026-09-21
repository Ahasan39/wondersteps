import test from 'node:test'
import assert from 'node:assert/strict'
import { AUDIO_PREFERENCES_KEY,defaultAudioPreferences,loadAudioPreferences,saveAudioPreferences } from '../src/audio/preferences.ts'
import { audioEvents,type AudioEvent,type AudioSynth } from '../src/audio/audioEvents.ts'
import { createAudioManager } from '../src/audio/audioManager.ts'
import { createAudioSynth } from '../src/audio/audioSynth.ts'
import { createVoiceManager,promptText } from '../src/audio/voiceManager.ts'
import type { Question } from '../src/games/shared/types.ts'

const both={version:1 as const,musicEnabled:true,sfxEnabled:true,voiceEnabled:true}
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
  setDucked(){},
  stopEffects(){},
  play(event:AudioEvent){events.push(event)},
  dispose(){counts.disposed++;musicPlaying=false},
 }
 const manager=createAudioManager({createContext:()=>{counts.created++;if(creationFailure)throw Error('Unsupported');return context},loadSynth:async()=>{counts.loaded++;if(loadFailure)throw Error('No audio');return synth}})
 return {manager,counts,events,interrupt(){state='suspended';context.onstatechange?.call(context,new Event('statechange'))},get musicPlaying(){return musicPlaying}}
}
test('audio defaults enable gesture-gated voice while malformed or future preferences recover safely',()=>{
 const storage=(raw:string|null)=>({getItem:()=>raw,setItem:()=>{}})
 assert.deepEqual(loadAudioPreferences(storage(null)),defaultAudioPreferences)
 for(const raw of ['broken','null','[]','{"version":2,"musicEnabled":true}','x'.repeat(1001)])assert.deepEqual(loadAudioPreferences(storage(raw)),defaultAudioPreferences)
 assert.deepEqual(loadAudioPreferences(storage('{"version":1,"musicEnabled":true,"sfxEnabled":"true"}')),{version:1,musicEnabled:true,sfxEnabled:false,voiceEnabled:true})
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
 deliver({startMusic:()=>{started++},stopMusic:()=>{},setDucked:()=>{},play:()=>{},stopEffects:()=>{},dispose:()=>{disposed++}})
 await activation;assert.equal(started,0);assert.equal(disposed,1)
})
test('native synth schedules gentle envelopes and lower music gain, bounds voices and cleans its loop',()=>{
 const gains:{gain:{value:number;setValueAtTime:(value:number,time:number)=>void;linearRampToValueAtTime:(value:number,time:number)=>void;exponentialRampToValueAtTime:(value:number,time:number)=>void};connect:()=>void;disconnect:()=>void}[]=[]
 const ramps:number[]=[]
 const voices:{frequency:{value:number};type:string;onended:(()=>void)|null;connect:()=>void;disconnect:()=>void;start:()=>void;stop:()=>void}[]=[]
 const context={
  state:'running',currentTime:0,destination:{},
  createGain(){const gain={gain:{value:0,cancelScheduledValues:()=>{},setValueAtTime:()=>{},linearRampToValueAtTime:(value:number)=>{ramps.push(value)},exponentialRampToValueAtTime:()=>{}},connect:()=>{},disconnect:()=>{}};gains.push(gain);return gain},
  createOscillator(){const voice={frequency:{value:0},type:'sine',onended:null as (()=>void)|null,connect:()=>{},disconnect:()=>{},start:()=>{},stop:()=>{}};voices.push(voice);return voice},
 } as unknown as AudioContext
 const synth=createAudioSynth(context);assert.ok(gains[0].gain.value<gains[1].gain.value)
 synth.setDucked(true);synth.setDucked(false);assert.deepEqual(ramps.slice(0,2),[.12,.34])
 synth.startMusic();const first=voices.length;synth.startMusic();assert.equal(voices.length,first)
 for(let i=0;i<30;i++)synth.play('correct');assert.ok(voices.length<=24)
 synth.stopMusic();synth.stopEffects();synth.dispose()
 voices.forEach(voice=>voice.onended?.())
 assert.ok(voices.every(voice=>Number.isFinite(voice.frequency.value)&&voice.frequency.value>0))
})

function voiceFixture(supported=true){
 const spoken:string[]=[],active:boolean[]=[],listeners=new Set<()=>void>();let cancels=0,last:SpeechSynthesisUtterance|null=null
 const synthesis=supported?{getVoices:()=>[{lang:'en-GB',localService:true}],speak:(utterance:SpeechSynthesisUtterance)=>{last=utterance;spoken.push(utterance.text);utterance.onstart?.(new Event('start') as SpeechSynthesisEvent)},cancel:()=>{cancels++},addEventListener:(_name:string,listener:()=>void)=>listeners.add(listener),removeEventListener:(_name:string,listener:()=>void)=>listeners.delete(listener)} as unknown as SpeechSynthesis:null
 const manager=createVoiceManager({synthesis,createUtterance:text=>({text} as SpeechSynthesisUtterance),onSpeakingChange:value=>active.push(value),random:()=>0})
 return {manager,spoken,active,listeners,get cancels(){return cancels},end(){last?.onend?.(new Event('end') as SpeechSynthesisEvent)}}
}
const questions:Question[]=[
 {id:'c',instruction:'',prompt:{kind:'color',name:'Blue'},choices:[],correctAnswerId:''},
 {id:'n',instruction:'',prompt:{kind:'count',count:4,visual:'flower'},choices:[],correctAnswerId:''},
 {id:'a',instruction:'',prompt:{kind:'alphabet',letter:'A'},choices:[],correctAnswerId:''},
 {id:'x',instruction:'',prompt:{kind:'animal',name:'Lion',visual:'lion'},choices:[],correctAnswerId:''},
 {id:'f',instruction:'',prompt:{kind:'fruit',name:'Apple',visual:'apple'},choices:[],correctAnswerId:''},
]
test('voice derives all five prompts from current question data without revealing count answers',()=>{
 assert.deepEqual(questions.map(promptText),['Find the color Blue.','How many flowers can you count?','Which one starts with A?','Find the Lion.','Find the Apple.'])
})
test('voice cancels stale speech, avoids repeated praise and ducks only while speaking',()=>{
 const f=voiceFixture();f.manager.setEnabled(true);f.manager.activate();f.manager.speakPrompt(questions[0]);f.manager.speakCorrectPraise();f.manager.speakCorrectPraise();f.manager.speakRetryEncouragement();f.end()
 assert.deepEqual(f.spoken,['Find the color Blue.','Great job!','Awesome!','Try again!']);assert.ok(f.cancels>=4);assert.equal(f.active.at(-1),false);f.manager.dispose();assert.equal(f.listeners.size,0)
})
test('voice mute, hidden state, unsupported speech and cleanup are silent safe fallbacks',()=>{
 for(const supported of [true,false]){const f=voiceFixture(supported);f.manager.activate();assert.equal(f.manager.speakPrompt(questions[0]),false);f.manager.setEnabled(true);f.manager.setHidden(true);assert.equal(f.manager.speakCorrectPraise(),false);f.manager.setHidden(false);assert.equal(f.manager.speakLevelComplete(),supported);f.manager.dispose();assert.equal(f.manager.speakRetryEncouragement(),false)}
})
