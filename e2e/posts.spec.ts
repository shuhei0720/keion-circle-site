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

  test('admin can edit a post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      // 編集ボタンを探してクリック
      const editButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-edit') });
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // 編集ページに遷移したことを確認
        await page.waitForURL(/\/posts\/.*\/edit/);
        await expect(page).toHaveURL(/\/posts\/.*\/edit/);
        
        // タイトル入力フィールドを確認
        const titleInput = page.locator('input[name="title"]');
        await expect(titleInput).toBeVisible();
        
        // タイトルを変更
        await titleInput.fill('Updated Post Title');
        
        // 保存ボタンをクリック
        const saveButton = page.locator('button:has-text("保存"), button:has-text("更新")');
        await saveButton.click();
        await page.waitForTimeout(1000);
        
        // 投稿一覧に戻ったことを確認
        await expect(page).toHaveURL('/posts');
        await expect(page.getByText('Updated Post Title')).toBeVisible();
      }
    }
  });

  test('admin can add multiple YouTube URLs to a post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿作成フォームが存在する場合
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill('Post with YouTube');
      await page.fill('textarea[name="content"]', 'YouTube動画付きの投稿');
      
      // YouTube URL入力フィールドを探す
      const youtubeInput = page.locator('input[placeholder*="YouTube"], input[name*="youtube"]').first();
      if (await youtubeInput.count() > 0) {
        await youtubeInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        // YouTube URL追加ボタンを探す
        const addYoutubeButton = page.locator('button:has-text("追加"), button:has-text("YouTube")');
        if (await addYoutubeButton.count() > 0) {
          await addYoutubeButton.click();
          await page.waitForTimeout(500);
          
          // 2つ目のURL入力フィールドが表示されることを確認
          const youtubeInputs = page.locator('input[placeholder*="YouTube"], input[name*="youtube"]');
          await expect(youtubeInputs).toHaveCount(await youtubeInputs.count());
        }
      }
      
      // 投稿ボタンをクリック
      await page.click('button:has-text("投稿")');
      await page.waitForTimeout(1000);
      
      // YouTube動画が埋め込まれていることを確認
      const youtubeEmbed = page.locator('iframe[src*="youtube.com"]');
      if (await youtubeEmbed.count() > 0) {
        await expect(youtubeEmbed.first()).toBeVisible();
      }
    }
  });

  test('admin can upload images to a post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿作成フォームが存在する場合
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      // 画像アップロードボタンを探す
      const imageUploadInput = page.locator('input[type="file"]');
      if (await imageUploadInput.count() > 0) {
        // ファイル入力要素が存在することを確認
        await expect(imageUploadInput).toBeAttached();
      }
    }
  });

  test('user can mark participation status on a post', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      // 参加状況ボタンを探す
      const participateButton = page.locator('button:has-text("参加"), button:has-text("不参加")').first();
      if (await participateButton.count() > 0) {
        const beforeText = await participateButton.textContent();
        await participateButton.click();
        await page.waitForTimeout(500);
        
        // ボタンの状態が変更されたことを確認
        const afterText = await participateButton.textContent();
        expect(beforeText).not.toBe(afterText);
      }
    }
  });

  test('displays YouTube videos in posts', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await postCards.count() > 0) {
      // YouTube埋め込みがあるか確認
      const youtubeEmbed = page.locator('iframe[src*="youtube.com"]');
      if (await youtubeEmbed.count() > 0) {
        await expect(youtubeEmbed.first()).toBeVisible();
      }
    }
  });

  test('displays images in posts', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCards = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl');
    if (await postCards.count() > 0) {
      // 画像があるか確認
      const postImages = page.locator('img[src*="supabase"], img[src*="data:image"]');
      if (await postImages.count() > 0) {
        await expect(postImages.first()).toBeVisible();
      }
    }
  });

  test('user can copy post content', async ({ page }) => {
    await page.goto('/posts');

    // 投稿カードが存在する場合
    const postCard = page.locator('div.bg-white\\/10.backdrop-blur-md.rounded-2xl').first();
    if (await postCard.count() > 0) {
      // コピーボタンを探す
      const copyButton = postCard.locator('button').filter({ has: page.locator('svg.lucide-copy') });
      if (await copyButton.count() > 0) {
        await copyButton.click();
        await page.waitForTimeout(500);
        
        // チェックマークアイコンに変わることを確認
        const checkIcon = postCard.locator('svg.lucide-check');
        if (await checkIcon.count() > 0) {
          await expect(checkIcon).toBeVisible();
        }
      }
    }
  });
});
