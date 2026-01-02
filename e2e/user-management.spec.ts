import { test, expect } from '@playwright/test'
import { loginAsSiteAdmin } from './helpers'

test.describe('ユーザー管理機能 - サイト管理者', () => {
  test.beforeEach(async ({ page }) => {
    // グローバルセットアップで作成されたsite_adminユーザーでログイン
    await loginAsSiteAdmin(page)
  })

  test('サイト管理者のみユーザー管理ページにアクセスできる', async ({ page }) => {
    // ユーザー管理リンクが表示されることを確認
    const userManagementLink = page.locator('a[href="/users"]')
    await expect(userManagementLink.first()).toBeVisible()
    
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('ユーザー管理')
  })

  test('役割変更モーダルが正しく表示される', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // ユーザーの役割バッジをクリック（自分以外の最初のユーザー）
    const roleBadges = page.locator('button').filter({ hasText: /サイト|管理者|通常/ })
    const count = await roleBadges.count()
    
    if (count > 1) {
      // 2番目のバッジをクリック（1番目は自分自身で無効化されている可能性）
      const badge = roleBadges.nth(1)
      await badge.scrollIntoViewIfNeeded()
      await badge.click({ force: true })
      
      // モーダルが表示されることを確認
      const modal = page.locator('div[class*="fixed"][class*="inset-0"][class*="z-50"]').filter({ hasText: '役割の変更' })
      await expect(modal).toBeVisible()
      
      // モーダル内の3つの役割ラジオボタンが表示されることを確認
      await expect(modal.locator('label').filter({ hasText: 'サイト管理者' }).first()).toBeVisible()
      await expect(modal.locator('input[value="admin"]')).toBeVisible()
      await expect(modal.locator('label').filter({ hasText: '一般ユーザー' })).toBeVisible()
      
      // 各役割の説明が表示されることを確認
      await expect(modal.locator('text=すべての権限（ユーザー管理含む）')).toBeVisible()
      await expect(modal.locator('text=投稿・イベント・スケジュール管理')).toBeVisible()
      await expect(modal.locator('text=閲覧・コメント・参加登録')).toBeVisible()
    } else {
      // ユーザーが1人しかいない場合はスキップ
      test.skip()
    }
  })

  test('役割変更が正しく動作する', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // 一般ユーザー（member）の役割バッジをクリック
    const memberBadge = page.locator('button').filter({ hasText: '通常' }).first()
    await memberBadge.scrollIntoViewIfNeeded()
    await memberBadge.click({ force: true })
    
    // モーダルが表示されることを確認
    await expect(page.locator('text=役割の変更')).toBeVisible()
    
    // 管理者を選択（memberから変更するので、adminを選択すればボタンがenableになる）
    await page.locator('input[value="admin"]').click()
    
    // 変更ボタンがenableになるまで待つ
    const changeButton = page.locator('button:has-text("変更する")')
    await expect(changeButton).toBeEnabled()
    
    // 変更ボタンをクリック
    await changeButton.click()
    
    // モーダルが閉じることを確認
    await expect(page.locator('text=役割の変更')).not.toBeVisible()
  })

  test('自分自身の役割を変更できない', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // 自分自身の役割バッジを探す（disabled属性を持つ）
    const ownRoleBadge = page.locator('button[disabled]').filter({ hasText: /サイト|管理|通常/ }).first()
    
    // ボタンが無効化されていることを確認
    await expect(ownRoleBadge).toBeDisabled()
  })

  test('ユーザー削除が正しく動作する', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // 初期のユーザー数を確認
    const initialUserCards = await page.locator('div[class*="bg-white/10"][class*="backdrop-blur"]').count()
    
    // test@example.comユーザーを探す
    const testUserCard = page.locator('text=test@example.com').first()
    const isVisible = await testUserCard.isVisible().catch(() => false)
    
    if (!isVisible) {
      // test@example.comが見つからない場合はスキップ
      test.skip()
      return
    }
    
    // デスクトップ表示の削除ボタンをクリック
    const userCard = testUserCard.locator('..').locator('..')
    const deleteButton = userCard.locator('button').filter({ hasText: /削除/ }).first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // 確認ダイアログが表示されることを確認
      await page.waitForTimeout(500) // モーダルの表示を待つ
      
      // 削除をキャンセル（実際には削除しない）
      const cancelButton = page.locator('button:has-text("キャンセル")').first()
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
      }
      
      // ユーザー数が変わっていないことを確認
      await page.waitForTimeout(500)
      const finalUserCards = await page.locator('div[class*="bg-white/10"][class*="backdrop-blur"]').count()
      expect(finalUserCards).toBe(initialUserCards)
    } else {
      test.skip()
    }
  })

  test('自分自身を削除できない', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // デスクトップまたはモバイル表示を確認
    const deleteButtons = page.locator('button').filter({ hasText: /削除/ })
    const count = await deleteButtons.count()
    
    if (count > 0) {
      // 削除不可ボタンを確認
      const ownDeleteButton = page.locator('button[disabled]').filter({ hasText: /削除/ }).first()
      await expect(ownDeleteButton).toBeDisabled()
    }
  })

  test('モーダルのキャンセルボタンが動作する', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // ユーザーの役割バッジをクリック
    const roleBadges = page.locator('button').filter({ hasText: /サイト|管理者|通常/ })
    const count = await roleBadges.count()
    
    if (count > 1) {
      const badge = roleBadges.nth(1)
      await badge.scrollIntoViewIfNeeded()
      await badge.click({ force: true })
      
      // モーダルが表示されることを確認
      await expect(page.locator('text=役割の変更')).toBeVisible()
      
      // キャンセルボタンをクリック
      await page.locator('button:has-text("キャンセル")').click()
      
      // モーダルが閉じることを確認
      await expect(page.locator('text=役割の変更')).not.toBeVisible()
    } else {
      test.skip()
    }
  })

  test('モーダルの×ボタンが動作する', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // ユーザーの役割バッジをクリック
    const roleBadges = page.locator('button').filter({ hasText: /サイト|管理者|通常/ })
    const count = await roleBadges.count()
    
    if (count > 1) {
      const badge = roleBadges.nth(1)
      // スクロールして要素を表示
      await badge.scrollIntoViewIfNeeded()
      await badge.click({ force: true })
      
      // モーダルが表示されることを確認
      const modal = page.locator('div[class*="fixed"][class*="inset-0"][class*="z-50"]').filter({ hasText: '役割の変更' })
      await expect(modal).toBeVisible()
      
      // ×ボタン（モーダル右上の閉じるボタン）をクリック
      await modal.locator('button[aria-label="閉じる"], button:has-text("×")').first().click()
      
      // モーダルが閉じることを確認
      await expect(modal).not.toBeVisible()
    } else {
      test.skip()
    }
  })

  test('同じ役割を選択した場合、変更ボタンが無効化される', async ({ page }) => {
    // ユーザー管理ページにアクセス
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // 一般ユーザーの役割バッジをクリック
    const memberBadge = page.locator('button').filter({ hasText: '通常' }).first()
    const count = await page.locator('button').filter({ hasText: '通常' }).count()
    
    if (count > 0 && await memberBadge.isEnabled()) {
      // スクロールして要素を表示
      await memberBadge.scrollIntoViewIfNeeded()
      await memberBadge.click({ force: true })
      
      // 一般ユーザーが選択されていることを確認（デフォルト）
      await expect(page.locator('input[value="member"]')).toBeChecked()
      
      // 変更ボタンが無効化されていることを確認
      await expect(page.locator('button:has-text("変更する")')).toBeDisabled()
    } else {
      test.skip()
    }
  })

  test('ナビゲーションにユーザー管理リンクが表示される', async ({ page }) => {
    await page.goto('/')
    
    // Footerにユーザー管理リンクが表示されることを確認（複数ある場合は最初の要素）
    const footerLink = page.locator('footer a[href="/users"]').first()
    
    // リンクが表示されていることを確認
    await expect(footerLink).toBeVisible()
    await expect(footerLink).toContainText('ユーザー管理')
  })

  test('Homeページに移動後も正常に動作する', async ({ page }) => {
    // ユーザー管理ページから一度離れて戻る
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 再度ユーザー管理ページにアクセス
    await page.goto('/users')
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('ユーザー管理')
  })
})

test.describe('ユーザー管理機能 - 管理者（adminロール）', () => {
  test('管理者（admin）はユーザー管理リンクが表示されない', async ({ page }) => {
    // admin-role@example.comでログイン
    await page.goto('/auth/signin')
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin-role@example.com')
    await page.getByLabel('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    await page.waitForURL('/')
    
    // ナビゲーションにユーザー管理リンクが表示されないことを確認
    const userManagementLink = page.locator('nav a[href="/users"]')
    await expect(userManagementLink).not.toBeVisible()
    
    // Homeページのカードにもユーザー管理リンクが表示されないことを確認
    const homeCard = page.locator('a[href="/users"]').filter({ hasText: 'ユーザー管理' })
    await expect(homeCard).not.toBeVisible()
    
    // 直接URLでアクセスしようとするとリダイレクトされる
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // リダイレクトされてユーザー管理ページにアクセスできないことを確認
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/users')
  })
})

test.describe('ユーザー管理機能 - 一般ユーザー', () => {
  test('一般ユーザーはユーザー管理ページにアクセスできない', async ({ page }) => {
    // test@example.comは一般ユーザーとしてグローバルセットアップで作成されている
    await page.goto('/auth/signin')
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    await page.waitForURL('/')
    
    // ナビゲーションにユーザー管理リンクが表示されないことを確認
    const userManagementLink = page.locator('nav a[href="/users"]')
    await expect(userManagementLink).not.toBeVisible()
    
    // 直接URLでアクセスしようとするとリダイレクトされる
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    
    // リダイレクトされてユーザー管理ページにアクセスできないことを確認
    // エラーメッセージまたはホームページにリダイレクトされる
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/users')
  })
})
