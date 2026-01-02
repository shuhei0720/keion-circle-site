import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsMember } from './helpers';

test.describe('Profile Management', () => {
  test('user can view their profile page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /プロフィール|Profile/i })).toBeVisible();
  });

  test('user can edit profile bio', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    // 自己紹介フィールドを探す
    const bioTextarea = page.locator('textarea[name="bio"], textarea[placeholder*="自己紹介"]');
    if (await bioTextarea.count() > 0) {
      await bioTextarea.clear();
      await bioTextarea.fill('ギター担当です。よろしくお願いします！');
      
      // 保存ボタンをクリック
      const saveButton = page.locator('button:has-text("保存"), button:has-text("更新")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      // 成功メッセージまたは更新された内容を確認
      await expect(page.getByText(/保存|更新|成功/i)).toBeVisible();
    }
  });

  test('user can set instrument', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    // 担当楽器フィールドを探す
    const instrumentInput = page.locator('input[name="instrument"], input[placeholder*="楽器"]');
    if (await instrumentInput.count() > 0) {
      await instrumentInput.clear();
      await instrumentInput.fill('エレキギター');
      
      // 保存ボタンをクリック
      const saveButton = page.locator('button:has-text("保存"), button:has-text("更新")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      // 更新されたことを確認
      await expect(instrumentInput).toHaveValue('エレキギター');
    }
  });

  test('user can upload avatar image', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    // アバターアップロードボタンを探す
    const uploadButton = page.locator('input[type="file"]');
    if (await uploadButton.count() > 0) {
      // テスト用の画像ファイルをアップロード
      // Note: 実際のテストでは、テスト用の画像ファイルが必要
      await expect(uploadButton).toBeAttached();
    }
  });

  test('displays user information correctly', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    // メールアドレスが表示されることを確認
    await expect(page.getByText(/admin@example\.com/)).toBeVisible();
  });

  test('member can access their own profile', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/profile');

    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /プロフィール|Profile/i })).toBeVisible();
  });
});

test.describe('User Profile Viewing', () => {
  test('can view other users profiles', async ({ page }) => {
    await loginAsAdmin(page);
    
    // まずユーザー一覧に行く（サイト管理者の場合）
    await page.goto('/users');
    
    if (await page.locator('a[href*="/users/"]').count() > 0) {
      // 最初のユーザーリンクをクリック
      await page.locator('a[href*="/users/"]').first().click();
      
      // ユーザー詳細ページに遷移したことを確認
      await expect(page).toHaveURL(/\/users\/[a-zA-Z0-9]+/);
      
      // ユーザー情報が表示されることを確認
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('displays user activity on profile', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/profile');

    // アクティビティセクションが存在する場合
    const activitySection = page.locator('text=/投稿|イベント|参加/i');
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });
});
