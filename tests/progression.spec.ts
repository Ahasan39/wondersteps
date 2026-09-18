import { test, expect, type Page } from '@playwright/test'
import { completeLevel, createInitialProgress, recordAttempt } from '../src/engine/progressEngine.ts'
import { PROGRESS_KEY } from '../src/storage/progressStorage.ts'
import type { PlayerProgress } from '../src/types/game.ts'

const widths = [320,360,375,390,414,430,480,768,1024,1280,1440,1920]
function completedProgress(count: number): PlayerProgress {
  let progress = createInitialProgress()
  for (let id = 1; id <= count; id++) {
    const started = recordAttempt(progress, id)
    if (!started.ok) throw new Error(started.error)
    const result = completeLevel(started.value, { levelId: id, score: 100 + id, stars: 3, coinsEarned: 10 })
    if (!result.ok) throw new Error(result.error)
    progress = result.value
  }
  return progress
}
async function seed(page: Page, progress: PlayerProgress) {
  await page.addInitScript(({ key, progress }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(progress))
  }, { key: PROGRESS_KEY, progress })
}
async function read(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!) as PlayerProgress, PROGRESS_KEY)
}
function errorsFor(page: Page) {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  return errors
}

test('fresh route protection and GameShell visits never record attempts or completion', async ({ page }) => {
  const errors = errorsFor(page)
  for (const id of ['20', '2', '999', '0', '-1', 'abc', '01', '1.0', '1e0']) {
    await page.goto('/wondersteps/#/play/' + id)
    await expect(page).toHaveURL(/#\/levels$/)
    await expect(page.getByRole('heading', { name: 'Your adventure awaits' })).toBeVisible()
  }
  await page.goto('/wondersteps/#/play/1')
  await expect(page.getByRole('heading', { name: 'Color Match', exact: true })).toBeVisible()
  await expect(page.getByText('LEVEL 1 · Sunny Meadow')).toBeVisible()
  await expect(page.getByRole('button', { name: /Complete level/i })).toHaveCount(0)
  await page.reload()
  const progress = await read(page)
  expect(progress.coins).toBe(0)
  expect(progress.levels.every(level => !level.completed && level.attempts === 0)).toBeTruthy()
  expect(errors).toEqual([])
})

test('engine-generated completion loads map, counters and replay; refresh and reopen preserve it', async ({ page, context }) => {
  await seed(page, completedProgress(1))
  await page.goto('/wondersteps/#/levels')
  await expect(page.locator('.completed')).toHaveCount(1)
  await expect(page.locator('.current')).toHaveCount(1)
  await expect(page.locator('.level-node:disabled')).toHaveCount(18)
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible()
  await expect(page.getByLabel('3 earned stars', { exact: true })).toBeVisible()
  await expect(page.getByLabel('10 coins', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Level 1: Color Match, completed' }).click()
  await expect(page.getByText('Best score: 101')).toBeVisible()
  await page.reload()
  expect((await read(page)).levels[0].attempts).toBe(1)
  const reopened = await context.newPage()
  await page.close()
  await reopened.goto('/wondersteps/#/play/2')
  await expect(reopened.getByRole('heading', { name: 'Count It', exact: true })).toBeVisible()
  await reopened.reload()
  await expect(reopened).toHaveURL(/#\/play\/2$/)
  await reopened.goto('/wondersteps/#/play/3')
  await expect(reopened).toHaveURL(/#\/levels$/)
})

test('reset confirmation traps focus, cancels safely, resets persistently and preserves sound', async ({ page }) => {
  const errors = errorsFor(page)
  await seed(page, completedProgress(2))
  await page.goto('/wondersteps/#/settings')
  await page.getByRole('button', { name: 'Off', exact: true }).click()
  const reset = page.getByRole('button', { name: 'Reset progress', exact: true })
  await reset.click()
  const dialog = page.getByRole('dialog', { name: 'Start a fresh adventure?' })
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('button', { name: 'Keep my progress' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Yes, reset progress' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Keep my progress' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(reset).toBeFocused()
  expect((await read(page)).coins).toBe(20)
  await reset.click()
  await page.getByRole('button', { name: 'Keep my progress' }).click()
  expect((await read(page)).levels[0].completed).toBeTruthy()
  await reset.click()
  await page.getByRole('button', { name: 'Yes, reset progress' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(reset).toBeFocused()
  await expect(page.getByRole('button', { name: 'On', exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Your adventure is reset and saved.')
  const clean = await read(page)
  expect(clean.coins).toBe(0)
  expect(clean.levels.every(level => !level.completed && level.stars === 0 && level.attempts === 0)).toBeTruthy()
  await page.reload()
  await page.goto('/wondersteps/#/levels')
  await expect(page.locator('.level-node:disabled')).toHaveCount(19)
  await expect(page.locator('.current .level-node')).toHaveAttribute('aria-label', 'Level 1: Color Match, current')
  expect(errors).toEqual([])
})

test('real storage events update another tab and guards respond to reset', async ({ page, context }) => {
  await page.goto('/wondersteps/#/levels')
  await expect(page.locator('.current')).toHaveCount(1)
  const other = await context.newPage()
  await other.goto('/wondersteps/#/levels')
  await expect(other.locator('.current')).toHaveCount(1)
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), { key: PROGRESS_KEY, progress: completedProgress(1) })
  await expect(other.locator('.completed')).toHaveCount(1)
  await other.goto('/wondersteps/#/play/2')
  await expect(other.getByRole('heading', { name: 'Count It', exact: true })).toBeVisible()
  await page.goto('/wondersteps/#/settings')
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, reset progress' }).click()
  await expect(other).toHaveURL(/#\/levels$/)
  await expect(other.locator('.level-node:disabled')).toHaveCount(19)
  await page.evaluate(key => localStorage.removeItem(key), PROGRESS_KEY)
  await expect(other.locator('.current')).toHaveCount(1)
  await page.evaluate(() => localStorage.clear())
  await expect(other.locator('.completed')).toHaveCount(0)
  await other.close()
})

test('malformed, partial and manually edited storage recover without console errors', async ({ page }) => {
  const errors = errorsFor(page)
  await page.goto('/wondersteps/#/settings')
  for (const raw of ['{broken', JSON.stringify({ version: 999 }), JSON.stringify({ version: 1, coins: -1, highestUnlockedLevel: 20, levels: [{ levelId: 1, completed: false, stars: 8, attempts: -1 }, { levelId: 20, completed: true, stars: 3 }] })]) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: PROGRESS_KEY, raw })
    await page.reload()
    await expect(page.getByText(/Saved progress needed recovery/)).toBeVisible()
    const recovered = await read(page)
    expect(recovered.version).toBe(1)
    expect(recovered.coins).toBe(0)
    expect(recovered.levels[19].completed).toBeFalsy()
    await page.goto('/wondersteps/#/play/20')
    await expect(page).toHaveURL(/#\/levels$/)
    await page.goto('/wondersteps/#/settings')
  }
  expect(errors).toEqual([])
})

test('denied browser storage remains usable and reset reports session-only recovery', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError') } })
  })
  const errors = errorsFor(page)
  await page.goto('/wondersteps/#/settings')
  await expect(page.getByText(/Browser saving is unavailable/)).toBeVisible()
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, reset progress' }).click()
  await expect(page.getByRole('status')).toHaveText(/could not save the change/)
  await page.goto('/wondersteps/#/play/1')
  await expect(page.getByRole('heading', { name: 'Color Match', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('completed maps, final journey, long names, GameShell and reset dialog fit every viewport', async ({ page }) => {
  const errors = errorsFor(page)
  const finalProgress = { ...completedProgress(20), coins: Number.MAX_SAFE_INTEGER }
  await seed(page, finalProgress)
  for (const [width, height] of [...widths.map(width => [width,900]), [667,375]]) {
    await page.setViewportSize({ width, height })
    await page.goto('/wondersteps/#/levels')
    await expect(page.locator('.completed')).toHaveCount(20)
    await expect(page.locator('.current')).toHaveCount(0)
    await expect(page.getByText(/Every step is complete/)).toBeVisible()
    await page.waitForTimeout(220)
    const contained = await page.locator('.level-stop').evaluateAll(nodes => nodes.every(node => {
      const box = node.getBoundingClientRect()
      const parent = node.closest('.world-section')!.getBoundingClientRect()
      return box.left >= parent.left && box.right <= parent.right && box.bottom <= parent.bottom
    }))
    expect(contained, 'completed map at ' + width).toBeTruthy()
    for (const route of ['/play/18', '/settings']) {
      await page.goto('/wondersteps/#' + route)
      await expect(page.locator('h1')).toBeVisible()
      if (route === '/settings') {
        await page.getByRole('button', { name: 'Reset progress', exact: true }).click()
        const dialog = await page.getByRole('dialog').boundingBox()
        expect(dialog!.width).toBeLessThanOrEqual(width - 31)
        expect(dialog!.height).toBeLessThanOrEqual(height - 31)
        expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy()
        if (width === 320) await page.screenshot({ path: 'artifacts/phase3-reset-320.png', fullPage: true })
        await page.keyboard.press('Escape')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ' ' + route).toBeTruthy()
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/wondersteps/#/levels')
  await page.waitForTimeout(250)
  await page.screenshot({ path: 'artifacts/phase3-completed-map.png', fullPage: true, animations: 'disabled' })
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/wondersteps/#/play/18')
  await page.waitForTimeout(250)
  await page.screenshot({ path: 'artifacts/phase3-game-shell-320.png', fullPage: true, animations: 'disabled' })
  expect(errors).toEqual([])
})
