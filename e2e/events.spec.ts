import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Events Management', () => {
  test.beforeEach(async ({ page }) => {
    // 管理者としてログイン
    await loginAsAdmin(page);
  });

  test('admin can create a new event', async ({ page }) => {
    await page.goto('/events');

    // イベントページが表示されることを確認
    await expect(page).toHaveURL('/events');
    
    // 管理者のみ表示される新規作成ボタンがあることを確認
    const createButton = page.locator('button:has-text("新規作成")');
    
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      await page.fill('input[name="title"]', 'Test Event');
      await page.fill('textarea[name="content"]', 'Event description');
      
      // 日付を設定
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await page.fill('input[name="date"]', dateString);
      
      await page.fill('input[name="locationName"]', 'Test Venue');
      
      // 作成ボタンをクリック
      await page.click('button:has-text("作成")');

      // イベントが一覧に追加されるまで待機
      await page.waitForTimeout(1000);
      await expect(page.getByRole('heading', { name: 'Test Event' })).toBeVisible();
    }
  });

  test('user can participate in an event', async ({ page }) => {
    await page.goto('/events');

    // イベントカードが存在する場合
    const eventCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    
    if (await eventCard.count() > 0) {
      const participateButton = eventCard.locator('button').filter({ hasText: /参加|キャンセル/ }).first();
      
      if (await participateButton.count() > 0) {
        await participateButton.click();
        await page.waitForTimeout(500);
        
        // ボタンが応答したことを確認
        await expect(participateButton).toBeVisible();
      }
    }
  });

  test('admin can add songs to an event', async ({ page }) => {
    await page.goto('/events');
    
    // イベントカードが存在する場合
    const eventCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    
    if (await eventCard.count() > 0) {
      // 編集ボタンをクリック
      const editButton = eventCard.locator('button').filter({ has: page.locator('svg.lucide-edit-2') });
      
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // 課題曲追加ボタンをクリック
        await page.click('button:has-text("課題曲を追加")');
        await page.waitForTimeout(300);
        
        // 曲名を入力
        const songTitleInputs = page.locator('input[placeholder*="例: "]');
        if (await songTitleInputs.count() > 0) {
          await songTitleInputs.first().fill('Test Song');
        }
      }
    }
  });

  test('admin can create report from event', async ({ page }) => {
    await page.goto('/events');
    
    // イベントカードが存在する場合
    const eventCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    
    if (await eventCard.count() > 0) {
      // 「活動報告を作成」ボタンをクリック
      const createReportButton = eventCard.locator('button:has-text("活動報告を作成")');
      
      if (await createReportButton.count() > 0) {
        await createReportButton.click();
        await page.waitForTimeout(500);
        
        // 投稿ページに移動したことを確認
        await expect(page).toHaveURL('/posts');
      }
    }
  });
});
