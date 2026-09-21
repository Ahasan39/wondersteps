import type { Question } from '../games/shared/types.ts'

export type VoiceKind='prompt'|'correct'|'retry'|'complete'
export interface VoiceDependencies {
 synthesis:SpeechSynthesis|null
 createUtterance:(text:string)=>SpeechSynthesisUtterance
 onSpeakingChange:(active:boolean)=>void
 random?:()=>number
}
const praise=['Great job!','Awesome!','Well done!','Excellent!','You got it!','Nice work!'] as const
const encouragement=['Try again!','Almost!','Oops, try again!','You can do it!','One more try!'] as const
export function promptText(question:Question){
 const prompt=question.prompt
 if(prompt.kind==='color')return `Find the color ${prompt.name}.`
 if(prompt.kind==='count'){const noun=prompt.visual==='star'?'stars':prompt.visual==='apple'?'apples':'flowers';return `How many ${noun} can you count?`}
 if(prompt.kind==='alphabet')return `Which one starts with ${prompt.letter}?`
 return `Find the ${prompt.name}.`
}
export function createVoiceManager({synthesis,createUtterance,onSpeakingChange,random=Math.random}:VoiceDependencies){
 let enabled=false,activated=false,hidden=false,disposed=false,lastPraise=-1,lastRetry=-1,voice:SpeechSynthesisVoice|null=null
 const chooseVoice=()=>{if(!synthesis)return;const voices=synthesis.getVoices();voice=voices.find(item=>/^en(-|_)/i.test(item.lang)&&item.localService)??voices.find(item=>/^en(-|_)/i.test(item.lang))??null}
 chooseVoice();synthesis?.addEventListener?.('voiceschanged',chooseVoice)
 const cancel=()=>{try{synthesis?.cancel()}catch{/* Speech is optional. */}onSpeakingChange(false)}
 const pick=(items:readonly string[],last:number)=>{let index=Math.floor(random()*items.length)%items.length;if(items.length>1&&index===last)index=(index+1)%items.length;return {text:items[index],index}}
 const speak=(text:string,_kind:VoiceKind)=>{
  cancel();if(!enabled||!activated||hidden||disposed||!synthesis)return false
  try{const utterance=createUtterance(text);utterance.lang='en-US';utterance.rate=.92;utterance.pitch=1.04;utterance.volume=1;if(voice)utterance.voice=voice
   utterance.onstart=()=>{if(!disposed&&!hidden)onSpeakingChange(true)}
   utterance.onend=utterance.onerror=()=>onSpeakingChange(false)
   synthesis.speak(utterance);return true
  }catch{onSpeakingChange(false);return false}
 }
 return {
  activate(){activated=true},setEnabled(value:boolean){enabled=value;if(!value)cancel()},setHidden(value:boolean){hidden=value;if(value)cancel()},
  speakPrompt(question:Question){return speak(promptText(question),'prompt')},
  speakCorrectPraise(){const next=pick(praise,lastPraise);lastPraise=next.index;return speak(next.text,'correct')},
  speakRetryEncouragement(){const next=pick(encouragement,lastRetry);lastRetry=next.index;return speak(next.text,'retry')},
  speakLevelComplete(){return speak('Level complete!','complete')},cancel,
  dispose(){disposed=true;cancel();synthesis?.removeEventListener?.('voiceschanged',chooseVoice)},
 }
}
export type VoiceManager=ReturnType<typeof createVoiceManager>
export const correctPraisePhrases=praise
export const retryEncouragementPhrases=encouragement
