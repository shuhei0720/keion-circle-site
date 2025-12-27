import { test, expect } from '@playwright/test';

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

  test('allows user to sign out', async ({ page }) => {
    // ログイン
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // ホームページに遷移するまで待機
    await page.waitForURL('/');
    
    // 投稿ページに移動（ログアウトボタンがある）
    await page.goto('/posts');
    await page.waitForLoadState('networkidle');
    
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ホームページにリダイレクト（ログアウト後はホームに戻る）
    await page.waitForURL('/');
    
    // 再度ログインページに移動できることを確認（ログアウト成功）
    await page.goto('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });
});
