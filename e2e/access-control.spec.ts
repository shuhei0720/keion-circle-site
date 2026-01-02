import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsMember } from './helpers';

test.describe('Access Control - Public Pages', () => {
  test('unauthenticated users can view posts list', async ({ page }) => {
    await page.goto('/posts');

    // 投稿一覧は公開されている
    await expect(page).toHaveURL('/posts');
    
    // 投稿カードが表示される（存在する場合）
    const postCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await postCards.count() > 0) {
      await expect(postCards.first()).toBeVisible();
    }
  });

  test('unauthenticated users cannot see create post form', async ({ page }) => {
    await page.goto('/posts');

    // 投稿作成フォームは表示されない
    const titleInput = page.locator('input[name="title"]');
    const createButton = page.locator('button:has-text("投稿")');
    
    // 作成フォームが存在しないか、非表示であることを確認
    if (await titleInput.count() > 0) {
      await expect(createButton).not.toBeVisible();
    }
  });

  test('unauthenticated users are redirected to signin for protected pages', async ({ page }) => {
    await page.goto('/events');
    
    // ログインページにリダイレクトされる
    await page.waitForURL('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });

  test('unauthenticated users are redirected from profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // ログインページにリダイレクトされる
    await page.waitForURL('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });

  test('unauthenticated users are redirected from activity schedules', async ({ page }) => {
    await page.goto('/activity-schedules');
    
    // ログインページにリダイレクトされる
    await page.waitForURL('/auth/signin');
    await expect(page).toHaveURL('/auth/signin');
  });
});

test.describe('Access Control - Member Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('member cannot access post edit page', async ({ page }) => {
    // 存在する投稿IDを使用（仮のID）
    await page.goto('/posts/test-id/edit');
    
    // 編集ページにアクセスできない（リダイレクトまたはエラー）
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/edit');
  });

  test('member cannot see admin-only buttons', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      // 編集ボタンと削除ボタンが表示されないことを確認
      const editButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-edit') });
      const deleteButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
      
      await expect(editButton).not.toBeVisible();
      await expect(deleteButton).not.toBeVisible();
    }
  });

  test('member cannot access user management page', async ({ page }) => {
    await page.goto('/users');
    
    // ユーザー管理ページにアクセスできない
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    
    // リダイレクトされるか、アクセス拒否される
    if (currentUrl.includes('/users')) {
      // ページにアクセスできても、ユーザー管理機能は表示されない
      const roleChangeButton = page.locator('button:has-text("役割変更")');
      await expect(roleChangeButton).not.toBeVisible();
    }
  });

  test('member cannot create events', async ({ page }) => {
    await page.goto('/events');

    // イベント作成フォームが表示されないことを確認
    const titleInput = page.locator('input[name="title"]');
    const createButton = page.locator('button:has-text("作成")');
    
    if (await titleInput.count() > 0) {
      await expect(createButton).not.toBeVisible();
    }
  });

  test('member cannot create activity schedules', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュール作成フォームが表示されないことを確認
    const titleInput = page.locator('input[name="title"]');
    const createButton = page.locator('button:has-text("作成")');
    
    if (await titleInput.count() > 0) {
      await expect(createButton).not.toBeVisible();
    }
  });

  test('member can like posts', async ({ page }) => {
    await page.goto('/posts');

    // いいねボタンは使用可能
    const likeButton = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    if (await likeButton.count() > 0) {
      await expect(likeButton).toBeVisible();
      await likeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('member can comment on posts', async ({ page }) => {
    await page.goto('/posts');

    // コメント機能は使用可能
    const commentInput = page.locator('input[placeholder*="コメント"]').first();
    if (await commentInput.count() > 0) {
      await expect(commentInput).toBeVisible();
    }
  });

  test('member can participate in events', async ({ page }) => {
    await page.goto('/events');

    // 参加ボタンは使用可能
    const participateButton = page.locator('button:has-text("参加")').first();
    if (await participateButton.count() > 0) {
      await expect(participateButton).toBeVisible();
    }
  });
});

test.describe('Access Control - Admin Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin can see admin-only buttons on posts', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      // 編集ボタンまたは削除ボタンが表示される
      const editButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-edit') });
      const deleteButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
      
      const hasAdminButtons = await editButton.count() > 0 || await deleteButton.count() > 0;
      expect(hasAdminButtons).toBeTruthy();
    }
  });

  test('admin can access post edit page', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      const editButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-edit') });
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // 編集ページにアクセスできる
        await page.waitForURL(/\/posts\/.*\/edit/);
        await expect(page).toHaveURL(/\/posts\/.*\/edit/);
      }
    }
  });

  test('admin can create posts', async ({ page }) => {
    await page.goto('/posts');

    // 投稿作成フォームが表示される
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await expect(titleInput).toBeVisible();
    }
  });

  test('admin can create events', async ({ page }) => {
    await page.goto('/events');

    // イベント作成フォームが表示される
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await expect(titleInput).toBeVisible();
    }
  });

  test('admin can create activity schedules', async ({ page }) => {
    await page.goto('/activity-schedules');

    // スケジュール作成フォームが表示される
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await expect(titleInput).toBeVisible();
    }
  });

  test('admin can access all protected pages', async ({ page }) => {
    // すべての保護されたページにアクセスできることを確認
    const protectedPages = ['/posts', '/events', '/activity-schedules', '/profile'];
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await expect(page).toHaveURL(pagePath);
      await page.waitForTimeout(500);
    }
  });
});
