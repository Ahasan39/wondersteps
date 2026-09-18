import { awardCoins, completeLevel, createInitialProgress, recordAttempt, spendCoins } from '../engine/progressEngine.ts'
import { PROGRESS_KEY, type PersistenceStatus, type ProgressStorage } from '../storage/progressStorage.ts'
import type { LevelCompletionResult, PlayerProgress, Result } from '../types/game.ts'

export type OperationResult = Result<{ persisted: boolean }>
export interface ProgressSnapshot { progress: PlayerProgress; persistence: PersistenceStatus }

/** A synchronous external store gives callers predictable operation results and avoids stale batched state. */
export function createProgressStore(storage: ProgressStorage) {
  const loaded = storage.load()
  let snapshot: ProgressSnapshot = { progress: loaded.progress, persistence: loaded.status }
  const subscribers = new Set<() => void>()
  function publish(progress: PlayerProgress, persistence: PersistenceStatus) {
    snapshot = { progress, persistence }
    subscribers.forEach(subscriber => subscriber())
  }
  function commit(result: Result<PlayerProgress>): OperationResult {
    if (!result.ok) return result
    const persisted = storage.save(result.value)
    publish(result.value, persisted ? 'available' : 'unavailable')
    return { ok: true, value: { persisted } }
  }
  const store = {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { subscribers.add(listener); return () => { subscribers.delete(listener) } },
    completeLevel: (input: LevelCompletionResult) => commit(completeLevel(snapshot.progress, input)),
    recordAttempt: (id: number) => commit(recordAttempt(snapshot.progress, id)),
    awardCoins: (amount: number) => commit(awardCoins(snapshot.progress, amount)),
    spendCoins: (amount: number) => commit(spendCoins(snapshot.progress, amount)),
    resetProgress(): OperationResult {
      // Save a fresh document even if removeItem fails; failures are reported, never thrown.
      storage.clear()
      return commit({ ok: true, value: createInitialProgress() })
    },
    connect(target: Window) {
      function onStorage(event: StorageEvent) {
        if (event.key !== PROGRESS_KEY && event.key !== null) return
        // No write-back: this prevents event loops. Last stored document wins.
        const next = storage.load()
        publish(next.progress, next.status)
      }
      target.addEventListener('storage', onStorage)
      // Re-read on attachment: another tab may have changed storage since initialization.
      const latest = storage.load()
      const persisted = latest.status !== 'unavailable' && (!latest.needsSave || storage.save(latest.progress))
      publish(latest.progress, persisted ? latest.status : 'unavailable')
      return () => target.removeEventListener('storage', onStorage)
    },
  }
  return store
}
export type ProgressStore = ReturnType<typeof createProgressStore>
