import { useEffect,useMemo,useRef,type ReactNode } from 'react'
import { usePreferences } from '../store/PreferencesContext'
import { AudioContext } from './AudioContext'
import { createAudioManager,type AudioManager } from './audioManager'

export function AudioProvider({children}:{children:ReactNode}){
 const {musicEnabled,sfxEnabled}=usePreferences()
 const manager=useRef<AudioManager|null>(null)
 const controls=useMemo(()=>({
  activate:()=>{void manager.current?.activate()},
  emit:(event:Parameters<AudioManager['emit']>[0])=>manager.current?.emit(event),
  startGame:()=>manager.current?.startGame(),
  endGame:()=>manager.current?.endGame(),
 }),[])
 useEffect(()=>{
  const audio=createAudioManager();manager.current=audio
  const visibility=()=>audio.setHidden(document.hidden)
  const hide=()=>audio.setHidden(true)
  visibility()
  const tap=(event:MouseEvent)=>{
   if(!event.isTrusted||!(event.target instanceof Element))return
   const control=event.target.closest('button,a')
   if(!control||control.hasAttribute('disabled')||control.classList.contains('answer-card')||control.hasAttribute('data-game-start'))return
   void audio.activate();audio.emit('buttonTap')
  }
  document.addEventListener('click',tap,true)
  document.addEventListener('visibilitychange',visibility)
  window.addEventListener('pagehide',hide)
  window.addEventListener('pageshow',visibility)
  return ()=>{document.removeEventListener('click',tap,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);audio.dispose();manager.current=null}
 },[])
 useEffect(()=>{manager.current?.setPreferences({version:1,musicEnabled,sfxEnabled})},[musicEnabled,sfxEnabled])
 return <AudioContext.Provider value={controls}>{children}</AudioContext.Provider>
}
