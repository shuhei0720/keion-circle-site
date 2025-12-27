import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays login page for unauthenticated users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });

  test('redirects to home after successful login', async ({ page }) => {
    // テスト用の管理者アカウントでログイン
    await page.goto('/auth/signin');
    
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // リダイレクト後、ホームページが表示されることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByText('投稿一覧')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/認証に失敗/i)).toBeVisible();
  });

  test('allows user to sign out', async ({ page }) => {
    // ログイン
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // ログアウト
    await page.click('button[aria-label="ユーザーメニュー"]');
    await page.click('text=ログアウト');

    // ログインページにリダイレクト
    await expect(page).toHaveURL('/auth/signin');
  });
});
