import { createContext,useContext } from 'react'
import type { AudioEvent } from './audioEvents'
import type { Question } from '../games/shared/types'
export interface AudioControls {activate:()=>void;emit:(event:AudioEvent)=>void;startGame:()=>void;endGame:()=>void;speakPrompt:(question:Question)=>void;speakCorrectPraise:()=>void;speakRetryEncouragement:()=>void;speakLevelComplete:()=>void;cancelVoice:()=>void}
export const AudioContext=createContext<AudioControls|null>(null)
export function useAudio(){
 const audio=useContext(AudioContext)
 if(!audio)throw new Error('AudioProvider required')
 return audio
}
