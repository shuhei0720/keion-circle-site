import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    // 管理者としてログイン
    await loginAsAdmin(page);
  });

  test('admin can create a new post', async ({ page }) => {
    await page.goto('/posts/new');

    await page.fill('input[name="title"]', 'Test Post');
    await page.fill('textarea[name="content"]', '# Test Content\nThis is a test post.');
    await page.click('button[type="submit"]');

    await expect(page.getByText('投稿を作成しました')).toBeVisible();
    await expect(page).toHaveURL(/\/posts$/);
  });

  test('displays posts list', async ({ page }) => {
    await page.goto('/posts');

    await expect(page.getByRole('heading', { name: /投稿一覧/i })).toBeVisible();
    // 投稿カードが表示されることを確認
    await expect(page.locator('.post-card').first()).toBeVisible();
  });

  test('user can like a post', async ({ page }) => {
    await page.goto('/posts');

    const likeButton = page.locator('button[aria-label="いいね"]').first();
    const initialLikes = await likeButton.textContent();
    
    await likeButton.click();
    await page.waitForTimeout(500); // APIレスポンス待機

    const updatedLikes = await likeButton.textContent();
    expect(updatedLikes).not.toBe(initialLikes);
  });

  test('user can comment on a post', async ({ page }) => {
    await page.goto('/posts');
    
    // 最初の投稿のコメントセクションを開く
    await page.locator('.post-card').first().click();
    
    await page.fill('textarea[placeholder*="コメント"]', 'Test comment');
    await page.click('button:has-text("送信")');

    await expect(page.getByText('Test comment')).toBeVisible();
  });

  test('admin can delete a post', async ({ page }) => {
    await page.goto('/posts');

    const postCard = page.locator('.post-card').first();
    const postTitle = await postCard.locator('h3').textContent();

    await postCard.locator('button[aria-label="削除"]').click();
    await page.click('button:has-text("削除")'); // 確認ダイアログ

    await expect(page.getByText('投稿を削除しました')).toBeVisible();
    await expect(page.getByText(postTitle!)).not.toBeVisible();
  });
});
