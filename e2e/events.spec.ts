import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Events Management', () => {
  test.beforeEach(async ({ page }) => {
    // 管理者としてログイン
    await loginAsAdmin(page);
  });

  test('admin can create a new event', async ({ page }) => {
    await page.goto('/events/new');

    await page.fill('input[name="title"]', 'Test Event');
    await page.fill('textarea[name="content"]', 'Event description');
    await page.fill('input[name="locationName"]', 'Test Venue');
    await page.click('button[type="submit"]');

    await expect(page.getByText('イベントを作成しました')).toBeVisible();
  });

  test('user can participate in an event', async ({ page }) => {
    await page.goto('/events');

    const participateButton = page.locator('button:has-text("参加")').first();
    await participateButton.click();

    await expect(participateButton).toHaveText(/参加中|キャンセル/);
  });

  test('admin can add songs to an event', async ({ page }) => {
    await page.goto('/events');
    await page.locator('.event-card').first().click();

    await page.click('button:has-text("課題曲を追加")');
    await page.fill('input[name="songTitle"]', 'Test Song');
    await page.fill('input[name="youtubeUrl"]', 'https://www.youtube.com/watch?v=test');
    await page.click('button:has-text("追加")');

    await expect(page.getByText('Test Song')).toBeVisible();
  });

  test('admin can create report from event', async ({ page }) => {
    await page.goto('/events');
    await page.locator('.event-card').first().click();

    await page.click('button:has-text("活動報告を作成")');

    // 投稿作成ページにリダイレクト
    await expect(page).toHaveURL(/\/posts\/new/);
    // イベント情報が自動入力されていることを確認
    await expect(page.locator('input[name="title"]')).not.toBeEmpty();
  });
});
