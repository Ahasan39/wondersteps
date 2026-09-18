import { createContext, useContext } from 'react'
export const PreferencesContext = createContext<{ soundEnabled: boolean; toggleSound: () => void } | null>(null)
export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('PreferencesProvider required')
  return value
}
