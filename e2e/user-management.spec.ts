import { test, expect } from '@playwright/test'
import { loginAsSiteAdmin } from './helpers'

test.describe('ユーザー管理機能', () => {
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

  test('一般ユーザーはユーザー管理ページにアクセスできない', async ({ page }) => {
    // test@example.comは一般ユーザーとしてグローバルセットアップで作成されている
    // このテストはグローバルセットアップでtest@example.comが作成されることに依存
    test.skip() // まだtest@example.comの検証実装が必要なためスキップ
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
      await roleBadges.nth(1).click()
      
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
    
    // ユーザーの役割バッジをクリック
    const roleBadges = page.locator('button').filter({ hasText: /サイト|管理者|通常/ })
    const count = await roleBadges.count()
    
    if (count > 1) {
      await roleBadges.nth(1).click()
      
      // 管理者を選択
      await page.locator('input[value="admin"]').click()
      
      // 変更ボタンをクリック
      await page.locator('button:has-text("変更する")').click()
      
      // モーダルが閉じることを確認
      await expect(page.locator('text=役割の変更')).not.toBeVisible()
    } else {
      test.skip()
    }
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
    // このテストは実際の削除を行うため、スキップ
    // 実際の環境ではテスト用ユーザーを作成してから削除する必要があります
    test.skip()
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
      await roleBadges.nth(1).click()
      
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
      await roleBadges.nth(1).click()
      
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
      await memberBadge.click()
      
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
    
    // デスクトップヘッダーまたはHomeページカードにリンクが表示されることを確認
    const headerLink = page.locator('nav a[href="/users"]').first()
    const homeCard = page.locator('a[href="/users"]').filter({ hasText: 'ユーザー管理' }).first()
    
    // いずれかが表示されていることを確認
    const isHeaderVisible = await headerLink.isVisible().catch(() => false)
    const isCardVisible = await homeCard.isVisible().catch(() => false)
    
    expect(isHeaderVisible || isCardVisible).toBeTruthy()
  })

  test('管理者はユーザー管理リンクが表示されない', async ({ page }) => {
    // このテストはadmin役割のユーザーが必要なためスキップ
    // 実際にはadmin@example.comがsite_adminなので、別のadminユーザーが必要
    test.skip()
  })
})
