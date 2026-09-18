import { createContext } from 'react'
import type { ProgressStore } from './progressStore.ts'
export const ProgressContext = createContext<ProgressStore | null>(null)
