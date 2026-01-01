import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: process.env.FULL_E2E_TEST ? 60000 : 30000, // Full E2E: 60秒、通常: 30秒
  globalSetup: './e2e/global-setup.ts',
  // Full E2E時はクリティカルなテストのみ実行（user-management, email-verificationを除外）
  testIgnore: process.env.FULL_E2E_TEST
    ? ['**/user-management.spec.ts', '**/email-verification.spec.ts']
    : [],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: process.env.FULL_E2E_TEST ? 20000 : 10000, // Full E2E: 20秒、通常: 10秒
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
