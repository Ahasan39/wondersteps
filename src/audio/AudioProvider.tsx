import { useEffect,useMemo,useRef,type ReactNode } from 'react'
import { usePreferences } from '../store/PreferencesContext'
import { AudioContext } from './AudioContext'
import { createAudioManager,type AudioManager } from './audioManager'
import { createVoiceManager,type VoiceManager } from './voiceManager'

export function AudioProvider({children}:{children:ReactNode}){
 const {musicEnabled,sfxEnabled,voiceEnabled}=usePreferences()
 const manager=useRef<AudioManager|null>(null)
 const voice=useRef<VoiceManager|null>(null)
 const controls=useMemo(()=>({
  activate:()=>{void manager.current?.activate();voice.current?.activate()},
  emit:(event:Parameters<AudioManager['emit']>[0])=>manager.current?.emit(event),
  startGame:()=>{voice.current?.activate();manager.current?.startGame()},
  endGame:()=>{voice.current?.cancel();manager.current?.endGame()},
  speakPrompt:(question:Parameters<VoiceManager['speakPrompt']>[0])=>voice.current?.speakPrompt(question),
  speakCorrectPraise:()=>voice.current?.speakCorrectPraise(),speakRetryEncouragement:()=>voice.current?.speakRetryEncouragement(),
  speakLevelComplete:()=>voice.current?.speakLevelComplete(),cancelVoice:()=>voice.current?.cancel(),
 }),[])
 useEffect(()=>{
  const audio=createAudioManager();manager.current=audio
  const speech=createVoiceManager({synthesis:'speechSynthesis' in window?window.speechSynthesis:null,createUtterance:text=>new SpeechSynthesisUtterance(text),onSpeakingChange:value=>audio.setVoiceActive(value)})
  voice.current=speech
  const visibility=()=>audio.setHidden(document.hidden)
  const hide=()=>{audio.setHidden(true);speech.setHidden(true)}
  visibility()
  const tap=(event:MouseEvent)=>{
   if(!event.isTrusted||!(event.target instanceof Element))return
   const control=event.target.closest('button,a')
   if(!control||control.hasAttribute('disabled')||control.classList.contains('answer-card')||control.hasAttribute('data-game-start'))return
   void audio.activate();speech.activate();audio.emit('buttonTap')
  }
  document.addEventListener('click',tap,true)
  const visibilityAll=()=>{visibility();speech.setHidden(document.hidden)}
  document.addEventListener('visibilitychange',visibilityAll)
  window.addEventListener('pagehide',hide)
  window.addEventListener('pageshow',visibilityAll)
  return ()=>{document.removeEventListener('click',tap,true);document.removeEventListener('visibilitychange',visibilityAll);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibilityAll);speech.dispose();audio.dispose();manager.current=null;voice.current=null}
 },[])
 useEffect(()=>{manager.current?.setPreferences({version:1,musicEnabled,sfxEnabled,voiceEnabled});voice.current?.setEnabled(voiceEnabled)},[musicEnabled,sfxEnabled,voiceEnabled])
 return <AudioContext.Provider value={controls}>{children}</AudioContext.Provider>
}
