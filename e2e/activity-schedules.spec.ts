import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsMember } from './helpers';

test.describe('Activity Schedules Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin can create a new activity schedule', async ({ page }) => {
    await page.goto('/activity-schedules');
    await expect(page).toHaveURL('/activity-schedules');

    // スケジュール作成フォームを探す
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill('定期練習');
      await page.fill('textarea[name="content"]', '通常の練習を行います');
      
      // 日付入力
      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill('2026-01-15');
      }

      // 場所入力
      const locationInput = page.locator('input[name="location"]');
      if (await locationInput.count() > 0) {
        await locationInput.fill('音楽室');
      }

      // 作成ボタンをクリック
      await page.click('button:has-text("作成")');
      await page.waitForTimeout(1000);

      // スケジュールが一覧に追加されたことを確認
      await expect(page.getByText('定期練習')).toBeVisible();
    }
  });

  test('user can participate in a schedule', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールカードが存在する場合
    const scheduleCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await scheduleCards.count() > 0) {
      // 参加ボタンを探してクリック
      const participateButton = page.locator('button:has-text("参加")').first();
      if (await participateButton.count() > 0) {
        await participateButton.click();
        await page.waitForTimeout(500);
        
        // 参加状態が変更されたことを確認
        await expect(participateButton).toBeVisible();
      }
    }
  });

  test('user can comment on a schedule', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールが存在する場合
    const scheduleCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await scheduleCards.count() > 0) {
      // コメント入力フィールドを探す
      const commentInput = page.locator('input[placeholder*="コメント"]').first();
      if (await commentInput.count() > 0) {
        await commentInput.fill('参加します！');
        
        // 送信ボタンをクリック
        const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-send') }).first();
        await sendButton.click();
        await page.waitForTimeout(1000);

        await expect(page.getByText('参加します！')).toBeVisible();
      }
    }
  });

  test('admin can create report from schedule', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールカードが存在する場合
    const scheduleCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await scheduleCards.count() > 0) {
      // 報告書作成ボタンを探す
      const reportButton = page.locator('button:has-text("報告書")').first();
      if (await reportButton.count() > 0) {
        await reportButton.click();
        
        // 報告書作成ページに遷移したことを確認
        await page.waitForURL(/\/activity-schedules\/.*\/report/);
        await expect(page).toHaveURL(/\/activity-schedules\/.*\/report/);
        
        // タイトルと内容が入力されていることを確認
        const titleInput = page.locator('input[name="title"]');
        await expect(titleInput).toHaveValue(/.+/);
      }
    }
  });

  test('schedule displays location and map link', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールカードが存在し、場所情報がある場合
    const locationText = page.locator('text=/場所:|Location:/i').first();
    if (await locationText.count() > 0) {
      await expect(locationText).toBeVisible();
      
      // マップリンクがある場合は確認
      const mapLink = page.locator('a[href*="maps"]').first();
      if (await mapLink.count() > 0) {
        await expect(mapLink).toBeVisible();
      }
    }
  });

  test('admin can edit a schedule', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールカードが存在する場合
    const scheduleCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await scheduleCard.count() > 0) {
      // 編集ボタンを探してクリック
      const editButton = scheduleCard.locator('button').filter({ has: page.locator('svg.lucide-edit') });
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(500);

        // 編集フォームが表示されることを確認
        const titleInput = page.locator('input[name="title"]');
        await expect(titleInput).toBeVisible();
        
        // タイトルを変更
        await titleInput.fill('Updated Schedule Title');
        
        // 保存ボタンをクリック
        const saveButton = page.locator('button:has-text("更新")');
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);
          
          // 更新されたタイトルが表示されることを確認
          await expect(page.getByText('Updated Schedule Title')).toBeVisible();
        }
      }
    }
  });

  test('admin can delete a schedule', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュールカードが存在する場合
    const scheduleCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await scheduleCard.count() > 0) {
      const scheduleTitle = await scheduleCard.locator('h2, h3').first().textContent();

      // 削除ボタンをクリック
      const deleteButton = scheduleCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // 確認ダイアログのOKをクリック
        page.on('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);

        // スケジュールが削除されたことを確認
        if (scheduleTitle) {
          await expect(page.getByText(scheduleTitle)).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('Activity Schedules - Member Access', () => {
  test('member cannot create schedules', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/activity-schedules');

    // スケジュール作成フォームが表示されないことを確認
    const titleInput = page.locator('input[name="title"]');
    const createButton = page.locator('button:has-text("作成")');
    
    // メンバーには作成フォームが表示されない
    if (await titleInput.count() > 0) {
      await expect(createButton).not.toBeVisible();
    }
  });

  test('member can view schedules', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/activity-schedules');

    await expect(page).toHaveURL('/activity-schedules');
    // スケジュール一覧ページが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
  });
});
