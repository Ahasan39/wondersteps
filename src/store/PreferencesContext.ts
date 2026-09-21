import { createContext, useContext } from 'react'
export const PreferencesContext = createContext<{ soundEnabled:boolean; musicEnabled:boolean; sfxEnabled:boolean; voiceEnabled:boolean; toggleSound:()=>void; toggleMusic:()=>void; toggleSfx:()=>void; toggleVoice:()=>void; preferencesPersisted:boolean } | null>(null)
export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('PreferencesProvider required')
  return value
}
