import { test } from 'node:test'
import assert from 'node:assert/strict'
import { awardCoins, calculateStars, completeLevel, createInitialProgress, getCurrentLevel, getHighestUnlockedLevel, getLevelProgress, getLevelStatus, getTotalStars, isLevelUnlocked, recordAttempt, spendCoins } from '../src/engine/progressEngine.ts'
import { createProgressStorage, PROGRESS_KEY, sanitizeProgress, type StoragePort } from '../src/storage/progressStorage.ts'
import { createProgressStore } from '../src/store/progressStore.ts'
import type { PlayerProgress, Result } from '../src/types/game.ts'

const now = '2026-09-18T10:00:00.000Z'
function success<T>(result: Result<T>): T { if (!result.ok) assert.fail(result.error); return result.value }
function finish(progress: PlayerProgress, levelId = 1, score = 100, stars: 0 | 1 | 2 | 3 = 2, coinsEarned = 10) {
  return success(completeLevel(progress, { levelId, score, stars, coinsEarned }, now))
}
function memoryStorage() {
  const values = new Map<string, string>()
  const port: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) }, removeItem: key => { values.delete(key) } }
  return { port, storage: createProgressStorage(() => port), values }
}

test('fresh progress has exactly 20 empty levels and only Level 1 unlocked', () => {
  const initial = createInitialProgress(now)
  assert.equal(initial.version, 1)
  assert.equal(initial.levels.length, 20)
  assert.deepEqual(initial.levels.map(level => [level.completed, level.stars, level.bestScore, level.attempts, level.completedAt]), Array(20).fill([false,0,0,0,null]))
  assert.deepEqual(initial.achievementIds, [])
  assert.deepEqual(initial.rewardIds, [])
  assert.equal(getTotalStars(initial), 0)
  assert.equal(initial.coins, 0)
  assert.equal(getCurrentLevel(initial), 1)
  for (let id = 1; id <= 20; id++) assert.equal(isLevelUnlocked(initial, id), id === 1)
  assert.equal(isLevelUnlocked(initial, 0), false)
  assert.equal(isLevelUnlocked(initial, 21), false)
})
test('completion unlocks exactly the next sequential level and does not mutate input', () => {
  const initial = createInitialProgress(now)
  assert.deepEqual(completeLevel(initial, { levelId: 2, score: 1, stars: 1, coinsEarned: 1 }), { ok: false, error: 'level-locked' })
  assert.deepEqual(completeLevel(initial, { levelId: 3, score: 1, stars: 1, coinsEarned: 1 }), { ok: false, error: 'level-locked' })
  const next = finish(initial)
  assert.equal(getLevelStatus(next, 1), 'completed')
  assert.equal(getLevelStatus(next, 2), 'current')
  assert.equal(getLevelStatus(next, 3), 'locked')
  assert.equal(getCurrentLevel(next), 2)
  assert.equal(getHighestUnlockedLevel(next), 2)
  assert.equal(initial.levels[0].completed, false)
  assert.equal(getLevelProgress(next, 1)?.completedAt, now)
})
test('replays keep independent best scores/stars and never duplicate completion coins', () => {
  const first = finish(createInitialProgress(now))
  const lower = finish(first, 1, 20, 1, 1000)
  assert.equal(lower.coins, 10)
  assert.equal(getLevelProgress(lower, 1)?.bestScore, 100)
  assert.equal(getLevelProgress(lower, 1)?.stars, 2)
  const highScore = finish(lower, 1, 200, 0, 1000)
  assert.equal(getLevelProgress(highScore, 1)?.bestScore, 200)
  assert.equal(getLevelProgress(highScore, 1)?.stars, 2)
  const highStars = finish(highScore, 1, 10, 3, 1000)
  assert.equal(getLevelProgress(highStars, 1)?.bestScore, 200)
  assert.equal(getTotalStars(highStars), 3)
  assert.equal(highStars.coins, 10)
  assert.equal(getLevelProgress(highStars, 1)?.completedAt, now)
})
test('zero-star completion is valid and its first zero-coin reward cannot be farmed', () => {
  const first = finish(createInitialProgress(now), 1, 0, 0, 0)
  assert.equal(getCurrentLevel(first), 2)
  assert.equal(finish(first, 1, 200, 3, 99).coins, 0)
})
test('Level 20 ends the journey without Level 21', () => {
  let progress = createInitialProgress(now)
  for (let id = 1; id <= 20; id++) progress = finish(progress, id)
  assert.equal(getCurrentLevel(progress), null)
  assert.equal(getHighestUnlockedLevel(progress), 20)
  assert.equal(isLevelUnlocked(progress, 21), false)
  assert.equal(progress.levels.length, 20)
  assert.equal(progress.coins, 200)
  assert.equal(getTotalStars(progress), 40)
  for (let id = 1; id <= 20; id++) assert.equal(getLevelStatus(progress, id), 'completed')
})
test('attempts increment only through the explicit started-session API, including replay', () => {
  const initial = createInitialProgress(now)
  const started = success(recordAttempt(initial, 1, now))
  assert.equal(getLevelProgress(started, 1)?.attempts, 1)
  const replayed = success(recordAttempt(finish(started), 1, now))
  assert.equal(getLevelProgress(replayed, 1)?.attempts, 2)
  assert.equal(getLevelProgress(replayed, 2)?.attempts, 0)
  assert.deepEqual(recordAttempt(initial, 2), { ok: false, error: 'level-locked' })
  assert.deepEqual(recordAttempt(initial, 999), { ok: false, error: 'invalid-level' })
})
test('completion rejects invalid IDs, stars, scores and coins', () => {
  const initial = createInitialProgress(now)
  for (const levelId of [0, 21, 1.5, NaN, Infinity]) assert.equal(completeLevel(initial, { levelId, score: 0, stars: 0, coinsEarned: 0 }).ok, false)
  for (const score of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.deepEqual(completeLevel(initial, { levelId: 1, score, stars: 0, coinsEarned: 0 }), { ok: false, error: 'invalid-score' })
  for (const stars of [-1, 4, 1.5, NaN]) assert.deepEqual(completeLevel(initial, { levelId: 1, score: 0, stars: stars as 0, coinsEarned: 0 }), { ok: false, error: 'invalid-stars' })
  for (const coinsEarned of [-1, 0.5, NaN, Infinity]) assert.deepEqual(completeLevel(initial, { levelId: 1, score: 0, stars: 0, coinsEarned }), { ok: false, error: 'invalid-coins' })
})
test('wallet award, spending, overspending and negative values', () => {
  const initial = createInitialProgress(now)
  const earned = success(awardCoins(initial, 25, now))
  assert.equal(earned.coins, 25)
  assert.equal(success(spendCoins(earned, 10, now)).coins, 15)
  assert.equal(success(spendCoins(earned, 25, now)).coins, 0)
  assert.deepEqual(spendCoins(earned, 26), { ok: false, error: 'insufficient-coins' })
  for (const amount of [-1, 1.5, NaN, Infinity]) {
    assert.deepEqual(awardCoins(earned, amount), { ok: false, error: 'invalid-coins' })
    assert.deepEqual(spendCoins(earned, amount), { ok: false, error: 'invalid-coins' })
  }
})
test('numeric overflow is rejected without losing prior state', () => {
  const maximum = { ...createInitialProgress(now), coins: Number.MAX_SAFE_INTEGER }
  assert.deepEqual(awardCoins(maximum, 1), { ok: false, error: 'numeric-overflow' })
  assert.deepEqual(completeLevel(maximum, { levelId: 1, score: 0, stars: 0, coinsEarned: 1 }), { ok: false, error: 'numeric-overflow' })
  const attempts = { ...maximum, levels: maximum.levels.map(level => level.levelId === 1 ? { ...level, attempts: Number.MAX_SAFE_INTEGER } : level) }
  assert.deepEqual(recordAttempt(attempts, 1), { ok: false, error: 'numeric-overflow' })
})
test('star calculation supports per-level thresholds and exact boundaries', () => {
  const thresholds = { one: 10, two: 20, three: 30 }
  for (const [score, stars] of [[0,0],[9,0],[10,1],[19,1],[20,2],[29,2],[30,3],[100,3]]) assert.equal(success(calculateStars(score, thresholds)), stars)
  assert.equal(success(calculateStars(30, { one: 50, two: 70, three: 90 })), 0)
  for (const invalid of [{ one: -1, two: 2, three: 3 }, { one: 2, two: 2, three: 3 }, { one: 3, two: 2, three: 1 }, { one: 1, two: 2.5, three: 3 }]) assert.deepEqual(calculateStars(10, invalid), { ok: false, error: 'invalid-thresholds' })
  assert.deepEqual(calculateStars(-1, thresholds), { ok: false, error: 'invalid-score' })
})
test('missing storage, valid save/load and clear', () => {
  const { storage } = memoryStorage()
  assert.deepEqual(storage.load(now).progress, createInitialProgress(now))
  const progress = finish(createInitialProgress(now))
  assert.equal(storage.save(progress), true)
  assert.deepEqual(storage.load().progress, progress)
  assert.equal(storage.load().status, 'available')
  assert.equal(storage.clear(), true)
  assert.equal(storage.load(now).progress.coins, 0)
})
test('malformed, oversized, outdated and unknown schemas recover safely', () => {
  const { storage, values } = memoryStorage()
  for (const raw of ['{bad', 'null', '[]', JSON.stringify({ version: 0 }), JSON.stringify({ version: 2 }), 'x'.repeat(100_001)]) {
    values.set(PROGRESS_KEY, raw)
    assert.deepEqual(storage.load(now), { progress: createInitialProgress(now), status: 'recovered', needsSave: true })
  }
})
test('partial/manual data is sanitized and cannot skip sequential unlocks', () => {
  const sanitized = sanitizeProgress({
    version: 1, highestUnlockedLevel: 20, stars: 99, coins: -5, createdAt: 'bad',
    achievementIds: ['future-id', 'future-id', 1, 'private space'], rewardIds: null,
    levels: [{ levelId: 1, completed: true, stars: 99, bestScore: -3, attempts: -1 }, { levelId: 3, completed: true, stars: 3, bestScore: 100 }, { levelId: 999, completed: true }],
  }, now)
  assert.equal(sanitized.coins, 0)
  assert.equal(getTotalStars(sanitized), 0)
  assert.equal(getCurrentLevel(sanitized), 2)
  assert.equal(isLevelUnlocked(sanitized, 3), false)
  assert.equal(getLevelProgress(sanitized, 3)?.completed, false)
  assert.deepEqual(sanitized.achievementIds, ['future-id'])
  assert.equal(sanitized.levels.length, 20)
  assert.equal(sanitized.createdAt, now)
  assert.equal(sanitized.levels[0].completedAt, now)
})
test('sanitizer preserves valid attempts and bests, drops duplicate and locked records', () => {
  const progress = finish(success(recordAttempt(createInitialProgress(now), 1, now)))
  assert.deepEqual(sanitizeProgress(progress, now), progress)
  const modified = sanitizeProgress({ ...progress, levels: [...progress.levels, { levelId: 1, completed: true, stars: 3, bestScore: 999 }, { levelId: 30 }] }, now)
  assert.deepEqual(modified, progress)
  assert.equal(sanitizeProgress({ version: 1, levels: [{ levelId: 1, completed: false, stars: 3, bestScore: 10, attempts: 2 }] }, now).levels[0].attempts, 2)
  assert.equal(sanitizeProgress({ version: 1, levels: [{ levelId: 1, completed: false, stars: 3 }] }, now).levels[0].stars, 0)
})
test('storage access and quota failures never throw', () => {
  const unavailable = createProgressStorage(() => { throw new Error('Access denied') })
  assert.equal(unavailable.load(now).status, 'unavailable')
  assert.equal(unavailable.save(createInitialProgress(now)), false)
  assert.equal(unavailable.clear(), false)
  const quota = createProgressStorage(() => ({ getItem: () => null, setItem: () => { throw new Error('Quota') }, removeItem: () => { throw new Error('Denied') } }))
  assert.equal(quota.load(now).status, 'available')
  assert.equal(quota.save(createInitialProgress(now)), false)
})
test('store operations notify subscribers, persist once, and reject without writes', () => {
  const { storage } = memoryStorage()
  const store = createProgressStore(storage)
  let notifications = 0
  const unsubscribe = store.subscribe(() => notifications++)
  assert.equal(store.completeLevel({ levelId: 3, score: 1, stars: 1, coinsEarned: 1 }).ok, false)
  assert.equal(notifications, 0)
  success(store.recordAttempt(1))
  success(store.completeLevel({ levelId: 1, score: 100, stars: 2, coinsEarned: 10 }))
  success(store.completeLevel({ levelId: 1, score: 50, stars: 1, coinsEarned: 10 }))
  assert.equal(notifications, 3)
  assert.equal(store.getSnapshot().progress.coins, 10)
  assert.deepEqual(storage.load().progress, store.getSnapshot().progress)
  unsubscribe()
  success(store.awardCoins(1))
  assert.equal(notifications, 3)
})
test('store reset is persisted and a new store restores the clean state', () => {
  const { storage } = memoryStorage()
  const store = createProgressStore(storage)
  success(store.completeLevel({ levelId: 1, score: 100, stars: 3, coinsEarned: 10 }))
  const reloaded = createProgressStore(storage)
  assert.equal(getCurrentLevel(reloaded.getSnapshot().progress), 2)
  success(reloaded.resetProgress())
  const clean = createProgressStore(storage).getSnapshot().progress
  assert.equal(getCurrentLevel(clean), 1)
  assert.equal(getTotalStars(clean), 0)
  assert.equal(clean.coins, 0)
  assert.equal(clean.levels[0].attempts, 0)
})
test('store continues in memory when persistence fails and reports the limitation', () => {
  const store = createProgressStore(createProgressStorage(() => { throw new Error('Denied') }))
  assert.deepEqual(success(store.completeLevel({ levelId: 1, score: 100, stars: 2, coinsEarned: 5 })), { persisted: false })
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 2)
  assert.equal(store.getSnapshot().persistence, 'unavailable')
  assert.deepEqual(success(store.resetProgress()), { persisted: false })
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 1)
})

test('store attachment reloads newer data, storage events never write back, cleanup removes the listener', () => {
  const { storage } = memoryStorage()
  let writes = 0
  const store = createProgressStore({ ...storage, save(progress) { writes++; return storage.save(progress) } })
  const target = new EventTarget() as unknown as Window
  const first = finish(createInitialProgress(now))
  storage.save(first)
  const disconnect = store.connect(target)
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 2)
  assert.equal(writes, 0)
  const second = finish(first, 2)
  storage.save(second)
  target.dispatchEvent(Object.assign(new Event('storage'), { key: 'unrelated-key' }))
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 2)
  target.dispatchEvent(Object.assign(new Event('storage'), { key: PROGRESS_KEY }))
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 3)
  assert.equal(writes, 0)
  storage.clear()
  target.dispatchEvent(Object.assign(new Event('storage'), { key: null }))
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 1)
  disconnect()
  storage.save(second)
  target.dispatchEvent(Object.assign(new Event('storage'), { key: PROGRESS_KEY }))
  assert.equal(getCurrentLevel(store.getSnapshot().progress), 1)
})

test('malformed completion shapes and missing threshold objects fail predictably', () => {
  assert.deepEqual(completeLevel(createInitialProgress(now), null as unknown as Parameters<typeof completeLevel>[1]), { ok: false, error: 'invalid-input' })
  assert.deepEqual(calculateStars(10, null as unknown as Parameters<typeof calculateStars>[1]), { ok: false, error: 'invalid-thresholds' })
  assert.deepEqual(calculateStars(10, {} as Parameters<typeof calculateStars>[1]), { ok: false, error: 'invalid-thresholds' })
})
