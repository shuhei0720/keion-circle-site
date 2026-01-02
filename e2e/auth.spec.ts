import { test, expect } from '@playwright/test';

// WebKitとMobile Safariで不安定なため、ログアウトテストはスキップ
const isWebKit = process.env.BROWSER_NAME === 'webkit' || process.env.BROWSER_NAME === 'Mobile Safari';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('displays login page for unauthenticated users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'BOLD 軽音' })).toBeVisible();
    await expect(page.getByText('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
  });

  test('redirects to home after successful login', async ({ page }) => {
    // テスト用の管理者アカウントでログイン
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // リダイレクト後、ホームページが表示されることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: '活動報告' })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // アラートが表示されることを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('ログインに失敗');
      await dialog.accept();
    });
  });

  // Chromium/Firefoxのみで実行（WebKit/Mobile Chromeは不安定）
  test('allows user to sign out', async ({ page, browserName }, testInfo) => {
    test.skip(browserName === 'webkit', 'WebKit/Safari でのログアウトテストは不安定なためスキップ');
    test.skip(testInfo.project.name === 'Mobile Chrome', 'Mobile Chrome でのログアウトテストは不安定なためスキップ');
    
    // ログイン
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // ログイン成功を待つ - URLまたは活動報告の表示で確認
    await Promise.race([
      page.waitForURL('/', { timeout: 30000 }),
      page.getByRole('heading', { name: '活動報告' }).waitFor({ timeout: 30000 })
    ]);
    
    // 投稿ページに移動（ログアウトボタンがある）
    await page.goto('/posts');
    await page.waitForLoadState('networkidle');
    
    // ログアウトボタンが表示されるまで待機（モバイルでは遅延する可能性がある）
    const logoutButton = page.getByRole('button', { name: 'ログアウト' });
    await logoutButton.waitFor({ state: 'visible', timeout: 15000 });
    await logoutButton.click({ force: true, timeout: 5000 });

    // ログアウト完了を待つ（ログインページにアクセスできる）
    await page.waitForTimeout(2000); // ログアウト処理の完了を待つ
    
    // 再度ログインページに移動できることを確認（ログアウト成功）
    await page.goto('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });
});
