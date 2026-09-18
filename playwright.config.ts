import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './tests', timeout: 120000, use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium' }, webServer: { command: 'npm run preview -- --host 127.0.0.1', url: 'http://127.0.0.1:4173/wondersteps/', reuseExistingServer: true } })
