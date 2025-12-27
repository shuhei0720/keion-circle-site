import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000, // 各テストのタイムアウト: 30秒
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // アクション（クリック、入力など）のタイムアウト: 10秒
  },
  projects: [
    // CI環境ではChromiumのみ実行（高速化）
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // ローカルまたは定期実行時のみ他のブラウザでテスト
    ...(!process.env.CI || process.env.FULL_E2E_TEST ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    ] : []),
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2分でタイムアウト
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
