import { useCallback,useRef,useState,type ReactNode } from 'react'
import { PreferencesContext } from './PreferencesContext'
import { defaultAudioPreferences,loadAudioPreferences,saveAudioPreferences,type AudioPreferences } from '../audio/preferences'
export function PreferencesProvider({children}:{children:ReactNode}){
 const [state,setState]=useState(()=>{try{return {preferences:loadAudioPreferences(window.localStorage),persisted:true}}catch{return {preferences:{...defaultAudioPreferences},persisted:false}}})
 const current=useRef(state.preferences)
 const commit=useCallback((change:(value:AudioPreferences)=>AudioPreferences)=>{
  const preferences=change(current.current);current.current=preferences
  let persisted=false
  try{persisted=saveAudioPreferences(window.localStorage,preferences)}catch{/* Preferences remain usable in memory. */}
  setState({preferences,persisted})
 },[])
 const toggleSound=useCallback(()=>commit(value=>{const enabled=!(value.musicEnabled||value.sfxEnabled);return {...value,musicEnabled:enabled,sfxEnabled:enabled}}),[commit])
 const toggleMusic=useCallback(()=>commit(value=>({...value,musicEnabled:!value.musicEnabled})),[commit])
 const toggleSfx=useCallback(()=>commit(value=>({...value,sfxEnabled:!value.sfxEnabled})),[commit])
 const {preferences,persisted}=state
 return <PreferencesContext.Provider value={{...preferences,soundEnabled:preferences.musicEnabled||preferences.sfxEnabled,toggleSound,toggleMusic,toggleSfx,preferencesPersisted:persisted}}>{children}</PreferencesContext.Provider>
}
