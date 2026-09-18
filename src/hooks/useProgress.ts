import type { LevelStatus, PlayerProgress } from '../types/game'
// Read-only initial state; a future storage adapter belongs behind this hook.
const initial: PlayerProgress = { highestUnlockedLevel: 1, levels: [], stars: 0, coins: 0, achievementIds: [], rewardIds: [] }
export function useProgress() {
const statusFor = (id: number): LevelStatus => initial.levels.some(level => level.levelId === id && level.completed) ? 'completed' : id <= initial.highestUnlockedLevel ? 'current' : 'locked'
return { progress: initial, statusFor }
}

