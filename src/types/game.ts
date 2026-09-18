export type LevelStatus = 'locked' | 'current' | 'completed'
export type Stars = 0 | 1 | 2 | 3
export interface StarThresholds { one: number; two: number; three: number }
export interface Level { id: number; name: string; worldId: string; starThresholds?: StarThresholds }
export interface World { id: string; name: string; description: string; theme: 'meadow' | 'forest' | 'cloud' | 'galaxy' }
export interface LevelProgress {
  readonly levelId: number
  readonly completed: boolean
  readonly stars: Stars
  readonly bestScore: number
  readonly attempts: number
  readonly completedAt: string | null
}
export interface PlayerProgress {
  readonly version: 1
  readonly levels: readonly LevelProgress[]
  readonly coins: number
  readonly achievementIds: readonly string[]
  readonly rewardIds: readonly string[]
  readonly createdAt: string
  readonly updatedAt: string
}
export interface Achievement { id: string; title: string; description: string }
export interface Reward { id: string; title: string; description: string; coinCost: number }
export type GameStatus = 'not-ready' | 'ready' | 'playing' | 'finished'
export interface ScoreResult {
  baseScore: number
  correctAnswers: number
  attempts: number
  speedBonus?: number
  perfectBonus?: number
  finalScore: number
}
export interface GameResult { levelId: number; score: ScoreResult; stars: Stars }
export interface LevelCompletionResult { levelId: number; score: number; stars: Stars; coinsEarned: number }
export type EngineError = 'invalid-input' | 'invalid-level' | 'level-locked' | 'invalid-score' | 'invalid-stars' | 'invalid-coins' | 'insufficient-coins' | 'numeric-overflow' | 'invalid-thresholds'
export type Result<T> = { ok: true; value: T } | { ok: false; error: EngineError }
