import { levels } from '../data/worlds.ts'
import type { LevelCompletionResult, LevelProgress, LevelStatus, PlayerProgress, Result, Stars, StarThresholds } from '../types/game.ts'

export const SCHEMA_VERSION = 1 as const
export const isNonNegativeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
export const isValidLevelId = (id: number) => Number.isInteger(id) && levels.some(level => level.id === id)
export function createInitialProgress(now = new Date().toISOString()): PlayerProgress {
  return {
    version: SCHEMA_VERSION, coins: 0, achievementIds: [], rewardIds: [], createdAt: now, updatedAt: now,
    levels: levels.map(level => ({ levelId: level.id, completed: false, stars: 0, bestScore: 0, attempts: 0, completedAt: null })),
  }
}
export function getLevelProgress(progress: PlayerProgress, id: number): LevelProgress | undefined {
  return progress.levels.find(level => level.levelId === id)
}
export function getCurrentLevel(progress: PlayerProgress): number | null {
  return levels.find(level => !getLevelProgress(progress, level.id)?.completed)?.id ?? null
}
export function getHighestUnlockedLevel(progress: PlayerProgress): number {
  return getCurrentLevel(progress) ?? levels[levels.length - 1].id
}
export function isLevelUnlocked(progress: PlayerProgress, id: number) {
  return isValidLevelId(id) && id <= getHighestUnlockedLevel(progress)
}
export function getTotalStars(progress: PlayerProgress) {
  return progress.levels.reduce((total, level) => total + level.stars, 0)
}
export function getLevelStatus(progress: PlayerProgress, id: number): LevelStatus {
  if (!isLevelUnlocked(progress, id)) return 'locked'
  return getLevelProgress(progress, id)?.completed ? 'completed' : 'current'
}

function updateLevel(progress: PlayerProgress, next: LevelProgress, now: string): PlayerProgress {
  return { ...progress, updatedAt: now, levels: progress.levels.map(level => level.levelId === next.levelId ? next : level) }
}
export function recordAttempt(progress: PlayerProgress, id: number, now = new Date().toISOString()): Result<PlayerProgress> {
  if (!isValidLevelId(id)) return { ok: false, error: 'invalid-level' }
  if (!isLevelUnlocked(progress, id)) return { ok: false, error: 'level-locked' }
  const previous = getLevelProgress(progress, id)!
  if (!Number.isSafeInteger(previous.attempts + 1)) return { ok: false, error: 'numeric-overflow' }
  return { ok: true, value: updateLevel(progress, { ...previous, attempts: previous.attempts + 1 }, now) }
}
export function completeLevel(progress: PlayerProgress, input: LevelCompletionResult, now = new Date().toISOString()): Result<PlayerProgress> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'invalid-input' }
  if (!isValidLevelId(input.levelId)) return { ok: false, error: 'invalid-level' }
  if (!isLevelUnlocked(progress, input.levelId)) return { ok: false, error: 'level-locked' }
  if (!isNonNegativeInteger(input.score)) return { ok: false, error: 'invalid-score' }
  if (!isNonNegativeInteger(input.stars) || input.stars > 3) return { ok: false, error: 'invalid-stars' }
  if (!isNonNegativeInteger(input.coinsEarned)) return { ok: false, error: 'invalid-coins' }
  const previous = getLevelProgress(progress, input.levelId)!
  const coins = progress.coins + (previous.completed ? 0 : input.coinsEarned)
  if (!Number.isSafeInteger(coins)) return { ok: false, error: 'numeric-overflow' }
  const next = updateLevel(progress, {
    ...previous, completed: true, completedAt: previous.completedAt ?? now,
    stars: Math.max(previous.stars, input.stars) as Stars, bestScore: Math.max(previous.bestScore, input.score),
  }, now)
  return { ok: true, value: { ...next, coins } }
}
export function awardCoins(progress: PlayerProgress, amount: number, now = new Date().toISOString()): Result<PlayerProgress> {
  if (!isNonNegativeInteger(amount)) return { ok: false, error: 'invalid-coins' }
  if (!Number.isSafeInteger(progress.coins + amount)) return { ok: false, error: 'numeric-overflow' }
  return { ok: true, value: { ...progress, coins: progress.coins + amount, updatedAt: now } }
}
export function spendCoins(progress: PlayerProgress, amount: number, now = new Date().toISOString()): Result<PlayerProgress> {
  if (!isNonNegativeInteger(amount)) return { ok: false, error: 'invalid-coins' }
  if (amount > progress.coins) return { ok: false, error: 'insufficient-coins' }
  return { ok: true, value: { ...progress, coins: progress.coins - amount, updatedAt: now } }
}
/** Thresholds belong to each future game, not to one universal scoring table. */
export function calculateStars(score: number, thresholds: StarThresholds): Result<Stars> {
  if (!isNonNegativeInteger(score)) return { ok: false, error: 'invalid-score' }
  if (typeof thresholds !== 'object' || thresholds === null) return { ok: false, error: 'invalid-thresholds' }
  const { one, two, three } = thresholds
  if (![one, two, three].every(isNonNegativeInteger) || !(one < two && two < three)) {
    return { ok: false, error: 'invalid-thresholds' }
  }
  return { ok: true, value: score >= three ? 3 : score >= two ? 2 : score >= one ? 1 : 0 }
}
