import { createInitialProgress, isNonNegativeInteger, SCHEMA_VERSION } from '../engine/progressEngine.ts'
import type { PlayerProgress, Stars } from '../types/game.ts'

export const PROGRESS_KEY = 'wondersteps.player-progress'
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export type PersistenceStatus = 'available' | 'recovered' | 'unavailable'
export interface LoadedProgress { progress: PlayerProgress; status: PersistenceStatus; needsSave: boolean }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value) ?? ''
}
function timestamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : fallback
}
function ids(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id)))].slice(0, 256) : []
}
/** Unknown versions reset safely; future migrations can be dispatched here by version. */
export function sanitizeProgress(value: unknown, now = new Date().toISOString()): PlayerProgress {
  const initial = createInitialProgress(now)
  if (!isRecord(value) || value.version !== SCHEMA_VERSION) return initial
  const createdAt = timestamp(value.createdAt, now)
  const updatedAt = timestamp(value.updatedAt, createdAt)
  const rawLevels = Array.isArray(value.levels) ? value.levels.filter(isRecord) : []
  let reachedUnfinished = false
  return {
    version: SCHEMA_VERSION, createdAt, updatedAt: updatedAt < createdAt ? createdAt : updatedAt,
    coins: isNonNegativeInteger(value.coins) ? value.coins : 0,
    achievementIds: ids(value.achievementIds), rewardIds: ids(value.rewardIds),
    levels: initial.levels.map(empty => {
      // First record wins for duplicate IDs; unknown IDs never enter the model.
      const raw = rawLevels.find(level => level.levelId === empty.levelId)
      const unlocked = !reachedUnfinished
      const completed = unlocked && raw?.completed === true
      if (!completed) reachedUnfinished = true
      if (!raw || !unlocked) return empty
      return {
        ...empty, completed,
        stars: completed && isNonNegativeInteger(raw.stars) && raw.stars <= 3 ? raw.stars as Stars : 0,
        bestScore: completed && isNonNegativeInteger(raw.bestScore) ? raw.bestScore : 0,
        attempts: isNonNegativeInteger(raw.attempts) ? raw.attempts : 0,
        completedAt: completed ? timestamp(raw.completedAt, updatedAt) : null,
      }
    }),
  }
}
export function createProgressStorage(getStorage: () => StoragePort = () => window.localStorage) {
  return {
    load(now = new Date().toISOString()): LoadedProgress {
      try {
        const raw = getStorage().getItem(PROGRESS_KEY)
        if (raw === null) return { progress: createInitialProgress(now), status: 'available', needsSave: true }
        if (raw.length > 100_000) return { progress: createInitialProgress(now), status: 'recovered', needsSave: true }
        let value: unknown
        try { value = JSON.parse(raw) } catch { return { progress: createInitialProgress(now), status: 'recovered', needsSave: true } }
        const progress = sanitizeProgress(value, now)
        const needsSave = canonical(value) !== canonical(progress)
        return { progress, status: needsSave ? 'recovered' : 'available', needsSave }
      } catch { return { progress: createInitialProgress(now), status: 'unavailable', needsSave: false } }
    },
    save(progress: PlayerProgress): boolean {
      try { getStorage().setItem(PROGRESS_KEY, JSON.stringify(progress)); return true } catch { return false }
    },
    clear(): boolean {
      try { getStorage().removeItem(PROGRESS_KEY); return true } catch { return false }
    },
  }
}
export type ProgressStorage = ReturnType<typeof createProgressStorage>
