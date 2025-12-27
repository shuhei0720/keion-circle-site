import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('displays login page for unauthenticated users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'BOLD 軽音' })).toBeVisible();
    await expect(page.getByText('メールアドレス')).toBeVisible();
    await expect(page.getByText('パスワード')).toBeVisible();
  });

  test('redirects to home after successful login', async ({ page }) => {
    // テスト用の管理者アカウントでログイン
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // リダイレクト後、ホームページが表示されることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByText('投稿一覧')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // アラートが表示されることを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('ログインに失敗');
      await dialog.accept();
    });
  });

  test('allows user to sign out', async ({ page }) => {
    // ログイン
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ホームページに遷移するまで待機
    await page.waitForURL('/');

    // ユーザーメニューを開く（アバター画像またはメニューボタンをクリック）
    await page.click('img[alt*="avatar"], button:has-text("メニュー"), [class*="user-menu"]');
    
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ログインページにリダイレクト
    await expect(page).toHaveURL('/auth/signin');
  });
});
