import { useEffect, useState, type ReactNode } from 'react'
import { createProgressStorage } from '../storage/progressStorage'
import { ProgressContext } from './ProgressContext'
import { createProgressStore } from './progressStore'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProgressStore(createProgressStorage()))
  useEffect(() => store.connect(window), [store])
  return <ProgressContext.Provider value={store}>{children}</ProgressContext.Provider>
}
