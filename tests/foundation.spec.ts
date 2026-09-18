import { test, expect } from '@playwright/test'
const widths = [320,360,375,390,414,430,480,768,1024,1280,1440,1920]
const routes = ['/', '/levels', '/play/1', '/play/2', '/results/1', '/achievements', '/rewards', '/settings', '/play/999', '/unknown']
test('all routes adapt without overflow or runtime errors', async ({ page }) => {
const errors: string[] = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
for (const width of widths) {
await page.setViewportSize({ width, height: 900 })
for (const route of routes) {
await page.goto('/wondersteps/#' + route)
await expect(page.locator('h1')).toBeVisible()
expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), width + ' ' + route).toBeTruthy()
}
}
expect(errors).toEqual([])
})
test('map, navigation, preference, reduced motion and subpath assets', async ({ page }) => {
await page.goto('/wondersteps/#/levels')
await expect(page.locator('.level-node:disabled')).toHaveCount(19)
await expect(page.locator('a.level-node')).toHaveCount(1)
await page.getByRole('link', { name: 'Level 1: Color Match, current' }).click()
await expect(page.getByRole('heading', { name: 'Color Match' })).toBeVisible()
await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible()
await page.goto('/wondersteps/#/settings')
await page.getByRole('button', { name: 'Off', exact: true }).click()
await expect(page.getByRole('button', { name: 'On', exact: true })).toHaveAttribute('aria-pressed', 'true')
await page.reload()
await expect(page.getByRole('button', { name: 'On', exact: true })).toBeVisible()
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.goto('/wondersteps/#/')
await page.waitForTimeout(250)
expect(await page.locator('.mascot').evaluate(el => getComputedStyle(el).transform)).toBe('none')
await page.getByRole('link', { name: 'Skip to content' }).focus()
await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
await page.keyboard.press('Enter')
await expect(page.locator('main')).toBeFocused()
await expect(page.getByRole('heading', { name: /Small steps/ })).toBeVisible()
const assets = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(elements => elements.map(el => el.getAttribute('src') || el.getAttribute('href')))
expect(assets.every(asset => asset?.startsWith('/wondersteps/'))).toBeTruthy()
})
test('visual snapshots and landscape layout', async ({ page }) => {
for (const [name, width, height, route] of [['phase2-desktop',1440,1000,'/'],['phase2-mobile',390,844,'/'],['phase2-map',390,844,'/levels'],['phase2-map-desktop',1440,1000,'/levels'],['phase2-landscape',667,375,'/'],['phase2-rewards',390,844,'/rewards']] as const) {
await page.setViewportSize({ width, height })
await page.goto('/wondersteps/#' + route)
await expect(page.locator('h1')).toBeVisible()
expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
await page.locator('main').focus()
await expect(page.locator('.skip-link')).toHaveCSS('top', '-100px')
await page.waitForTimeout(220)
await page.screenshot({ path: 'artifacts/' + name + '.png', fullPage: true, animations: 'disabled' })
}
})

test('responsive composition, labels and touch targets', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/wondersteps/#/')
    await expect(page.locator('.hero-controls')).toBeVisible()
    await page.waitForTimeout(220)
    const copy = (await page.locator('.hero-copy').boundingBox())!
    const art = (await page.locator('.hero-art').boundingBox())!
    const controls = (await page.locator('.hero-controls').boundingBox())!
    if (width < 768) {
      expect(art.y).toBeGreaterThanOrEqual(copy.y + copy.height - 1)
      expect(controls.y).toBeGreaterThanOrEqual(art.y + art.height - 1)
    } else {
      expect(art.x).toBeGreaterThan(copy.x)
      expect(controls.y).toBeLessThan(art.y + art.height)
    }
    await page.goto('/wondersteps/#/levels')
    await expect(page.locator('.level-name')).toHaveCount(20)
    await page.waitForTimeout(220)
    const geometry = await page.locator('.level-stop').evaluateAll(nodes => nodes.map(node => {
      const label = node.querySelector('.level-name')!
      const control = node.querySelector('.level-node')!.getBoundingClientRect()
      const box = label.getBoundingClientRect()
      const region = node.closest('.world-section')!.getBoundingClientRect()
      return { contained: box.left >= region.left && box.right <= region.right && box.bottom <= region.bottom, touch: control.width >= 44 && control.height >= 44, font: parseFloat(getComputedStyle(label).fontSize) >= 14 }
    }))
    expect(geometry.every(node => node.contained && node.touch && node.font), String(width)).toBeTruthy()
    const regions = await page.locator('.world-section').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()))
    expect(regions.every((region, index) => index === 0 || region.y > regions[index - 1].y + regions[index - 1].height)).toBeTruthy()
    if (width >= 768) expect(regions.every(region => region.height < 500)).toBeTruthy()
  }
})

test('home destinations, back navigation and session preference', async ({ page }) => {
  for (const name of ['Let’s play', 'Explore levels', 'Start journey', 'See the map', 'Explore Sunny Meadow']) {
    await page.goto('/wondersteps/#/')
    await page.getByRole('link', { name: new RegExp(name) }).click()
    await expect(page).toHaveURL(/#\/levels$/)
    await page.getByRole('link', { name: 'Back home' }).click()
    await expect(page).toHaveURL(/#\/$/)
  }
  for (const [name, route] of [['Little victories', 'achievements'], ['Pip’s treasures', 'rewards'], ['Just your way', 'settings']]) {
    await page.goto('/wondersteps/#/')
    await page.getByRole('link', { name: new RegExp(name) }).click()
    await expect(page).toHaveURL(new RegExp('#/' + route + '$'))
    if (route !== 'settings') {
      await page.getByRole('link', { name: 'Back to adventure' }).click()
      await expect(page).toHaveURL(/#\/levels$/)
    }
  }
  await page.goto('/wondersteps/#/settings')
  await page.getByRole('button', { name: 'Off', exact: true }).click()
  await page.getByRole('link', { name: 'Back home' }).click()
  await expect(page.getByRole('button', { name: 'Turn sound preference off' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: /Let’s play/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/levels$/)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('wondersteps.player-progress')!).version)).toBe(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.current .level-node')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.route-content')).toHaveCSS('transform', 'none')
})
