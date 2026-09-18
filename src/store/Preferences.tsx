import { useState, type ReactNode } from 'react'
import { PreferencesContext } from './PreferencesContext'
export function PreferencesProvider({ children }: { children: ReactNode }) {
const [soundEnabled, setSoundEnabled] = useState(false)
return <PreferencesContext.Provider value={{ soundEnabled, toggleSound: () => setSoundEnabled(value => !value) }}>{children}</PreferencesContext.Provider>
}
