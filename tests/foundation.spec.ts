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
await expect(page.getByText(/gameplay is coming/)).toBeVisible()
await page.goto('/wondersteps/#/settings')
await page.getByRole('button', { name: 'Off', exact: true }).click()
await expect(page.getByRole('button', { name: 'On', exact: true })).toHaveAttribute('aria-pressed', 'true')
await page.reload()
await expect(page.getByRole('button', { name: 'Off', exact: true })).toBeVisible()
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
for (const [name, width, height, route] of [['desktop',1440,1000,'/'],['mobile',390,844,'/'],['map',390,844,'/levels'],['landscape',667,375,'/']] as const) {
await page.setViewportSize({ width, height })
await page.goto('/wondersteps/#' + route)
await expect(page.locator('h1')).toBeVisible()
expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
await page.locator('main').focus()
await expect(page.locator('.skip-link')).toHaveCSS('top', '-100px')
await page.screenshot({ path: 'artifacts/' + name + '.png', fullPage: true, animations: 'disabled' })
}
})
