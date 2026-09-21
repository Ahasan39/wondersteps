import type { AudioEvent,AudioSynth } from './audioEvents.ts'

// Original WonderSteps eight-bar score: bell melody, warm chord bed and soft bass.
const melody=[
 [72,76,79,81,79,76,74,76],[79,81,84,81,79,76,74,0],
 [69,72,76,79,76,72,69,72],[76,79,81,79,76,72,74,0],
 [65,69,72,76,74,72,69,72],[69,72,77,76,74,72,69,0],
 [67,71,74,79,77,74,71,74],[79,77,76,74,72,0,0,0],
] as const
const chords=[[48,52,55],[48,52,55],[45,48,52],[45,48,52],[41,45,48],[41,45,48],[43,47,50],[43,47,50]]
const phrases:Record<AudioEvent,readonly number[]>={
 gameStart:[72,76,79,84],buttonTap:[79],correct:[76,79,84],incorrect:[67,64],
 star:[84,91],coin:[88,93],levelComplete:[72,76,79,84,88],levelUnlock:[79,83,86,91],
}
const hz=(midi:number)=>440*2**((midi-69)/12)
export function createAudioSynth(context:AudioContext):AudioSynth{
 const music=context.createGain(),effects=context.createGain()
 const normalMusicGain=.34,duckedMusicGain=.12
 music.gain.value=normalMusicGain;effects.gain.value=.55
 music.connect(context.destination);effects.connect(context.destination)
 const musicVoices=new Set<OscillatorNode>(),effectVoices=new Set<OscillatorNode>()
 let timer:ReturnType<typeof setInterval>|null=null,step=0,nextAt=0
 function note(midi:number,when:number,duration:number,volume:number,bus:GainNode,type:OscillatorType='sine'){
  if(musicVoices.size+effectVoices.size>=24)return
  const oscillator=context.createOscillator(),envelope=context.createGain()
  const voices=bus===music?musicVoices:effectVoices
  oscillator.type=type;oscillator.frequency.value=hz(midi)
  envelope.gain.setValueAtTime(0,when)
  envelope.gain.linearRampToValueAtTime(volume,when+.018)
  envelope.gain.exponentialRampToValueAtTime(.0001,when+duration)
  oscillator.connect(envelope);envelope.connect(bus);voices.add(oscillator)
  oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();envelope.disconnect()}
  oscillator.start(when);oscillator.stop(when+duration+.02)
 }
 function silence(voices:Set<OscillatorNode>){
  for(const oscillator of voices){try{oscillator.stop()}catch{/* Already ended. */}}
  voices.clear()
 }
 function pump(){
  if(context.state!=='running')return
  // Skip stale scheduling after system sleep rather than playing a backlog.
  if(nextAt<context.currentTime-.3)nextAt=context.currentTime+.04
  while(nextAt<context.currentTime+.16){
   const bar=Math.floor(step/8),beat=step%8,pitch=melody[bar][beat]
   if(pitch)note(pitch,nextAt,.48,.13,music)
   if(beat===0){
    for(const chord of chords[bar])note(chord+12,nextAt,2.35,.032,music,'triangle')
    note(chords[bar][0],nextAt,.7,.095,music,'triangle')
   }
   if(beat===4)note(chords[bar][0]+7,nextAt,.65,.07,music,'triangle')
   step=(step+1)%64;nextAt+=.3125 // 96 bpm, eighth notes; 20-second loop.
  }
 }
 return {
  startMusic(){if(timer!==null)return;step=0;nextAt=context.currentTime+.04;pump();timer=setInterval(pump,100)},
  stopMusic(){if(timer!==null)clearInterval(timer);timer=null;silence(musicVoices)},
  setDucked(value){
   const now=context.currentTime,target=value?duckedMusicGain:normalMusicGain
   music.gain.cancelScheduledValues(now);music.gain.setValueAtTime(music.gain.value,now);music.gain.linearRampToValueAtTime(target,now+(value?.12:.22))
  },
  play(event){
   const pitches=phrases[event],quiet=event==='buttonTap'||event==='incorrect'
   pitches.forEach((pitch,index)=>note(pitch,context.currentTime+.005+index*(event==='levelComplete'?.13:.075),event==='buttonTap'?.07:quiet?.18:.3,quiet?.07:.16,effects))
  },
  stopEffects(){silence(effectVoices)},
  dispose(){if(timer!==null)clearInterval(timer);timer=null;silence(musicVoices);silence(effectVoices);music.disconnect();effects.disconnect()},
 }
}
