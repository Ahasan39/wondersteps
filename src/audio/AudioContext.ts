import { createContext,useContext } from 'react'
import type { AudioEvent } from './audioEvents'
export interface AudioControls {activate:()=>void;emit:(event:AudioEvent)=>void;startGame:()=>void;endGame:()=>void}
export const AudioContext=createContext<AudioControls|null>(null)
export function useAudio(){
 const audio=useContext(AudioContext)
 if(!audio)throw new Error('AudioProvider required')
 return audio
}
