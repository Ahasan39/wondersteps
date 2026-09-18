import type { Stars } from '../../types/game.ts'
export function completionCoins(stars: Stars) { return [0,30,50,75][stars] }
