export type LevelStatus = 'locked' | 'current' | 'completed'
export interface Level { id: number; name: string; worldId: string }
export interface World { id: string; name: string; description: string; theme: 'meadow' | 'forest' | 'cloud' | 'galaxy' }
export interface LevelProgress { levelId: number; completed: boolean; stars: 0 | 1 | 2 | 3; bestScore: number | null }
export interface PlayerProgress { highestUnlockedLevel: number; levels: LevelProgress[]; stars: number; coins: number; achievementIds: string[]; rewardIds: string[] }
export interface Achievement { id: string; title: string; description: string }
export interface Reward { id: string; title: string; description: string; coinCost: number }

