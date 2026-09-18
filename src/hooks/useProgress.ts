import { useContext, useSyncExternalStore } from 'react'
import { getCurrentLevel, getHighestUnlockedLevel, getLevelProgress, getLevelStatus, getTotalStars, isLevelUnlocked } from '../engine/progressEngine'
import { ProgressContext } from '../store/ProgressContext'

export function useProgress() {
  const store = useContext(ProgressContext)
  if (!store) throw new Error('ProgressProvider required')
  const { progress, persistence } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return {
    progress, persistence, totalStars: getTotalStars(progress), totalCoins: progress.coins,
    currentLevel: getCurrentLevel(progress), highestUnlockedLevel: getHighestUnlockedLevel(progress),
    getLevelProgress: (id: number) => getLevelProgress(store.getSnapshot().progress, id),
    isLevelUnlocked: (id: number) => isLevelUnlocked(progress, id),
    isLevelCompleted: (id: number) => getLevelProgress(progress, id)?.completed ?? false,
    getLevelStars: (id: number) => getLevelProgress(progress, id)?.stars ?? 0,
    getBestScore: (id: number) => getLevelProgress(progress, id)?.bestScore ?? 0,
    statusFor: (id: number) => getLevelStatus(progress, id),
    completeLevel: store.completeLevel, recordAttempt: store.recordAttempt,
    awardCoins: store.awardCoins, spendCoins: store.spendCoins, resetProgress: store.resetProgress,
  }
}
