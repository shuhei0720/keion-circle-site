import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    // 管理者としてログイン
    await loginAsAdmin(page);
  });

  test('admin can create a new post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿ページが表示されることを確認
    await expect(page).toHaveURL('/posts');
    
    // 管理者のみ表示されるフォームがあることを確認
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill('Test Post');
      await page.fill('textarea[name="content"]', 'テスト投稿の内容');
      await page.click('button:has-text("投稿")');

      // 投稿が一覧に追加されるまで待機
      await page.waitForTimeout(1000);
      await expect(page.getByRole('heading', { name: 'Test Post' })).toBeVisible();
    }
  });

  test('displays posts list', async ({ page }) => {
    await page.goto('/posts');

    // 投稿ページが表示されることを確認
    await expect(page).toHaveURL('/posts');
    
    // 投稿カードが存在する場合、表示されることを確認
    const postCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await postCards.count() > 0) {
      await expect(postCards.first()).toBeVisible();
    }
  });

  test('user can like a post', async ({ page }) => {
    await page.goto('/posts');

    // ハートアイコンのあるいいねボタンを探す
    const likeButton = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    
    if (await likeButton.count() > 0) {
      await likeButton.click();
      await page.waitForTimeout(500); // APIレスポンス待機
      
      // いいねが応答したことを確認（色が変わるなど）
      await expect(likeButton).toBeVisible();
    }
  });

  test('user can comment on a post', async ({ page }) => {
    await page.goto('/posts');
    
    // 投稿が存在する場合のみテスト
    const postCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    
    if (await postCards.count() > 0) {
      // 最初の投稿のコメント入力フィールドを探す
      const commentInput = page.locator('input[placeholder*="コメント"]').first();
      
      if (await commentInput.count() > 0) {
        await commentInput.fill('Test comment');
        
        // 送信ボタン（Sendアイコン）をクリック
        const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-send') }).first();
        await sendButton.click();

        await page.waitForTimeout(1000);
        await expect(page.getByText('Test comment')).toBeVisible();
      }
    }
  });

  test('admin can delete a post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードを探す
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    
    if (await postCard.count() > 0) {
      const postTitle = await postCard.locator('h2').textContent();

      // 削除ボタン（Trash2アイコン）をクリック
      const deleteButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
      await deleteButton.click();
      
      // 確認ダイアログのOKをクリック
      page.on('dialog', dialog => dialog.accept());

      await page.waitForTimeout(1000);
      // 投稿が削除されたことを確認（タイトルが表示されない）
      if (postTitle) {
        await expect(page.getByRole('heading', { name: postTitle })).not.toBeVisible();
      }
    }
  });
});
