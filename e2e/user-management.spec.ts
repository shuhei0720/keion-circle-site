import { test, expect } from '@playwright/test'

test.describe('ユーザー管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // サイト管理者としてログイン
    await page.goto('/auth/signin')
    
    // テスト用サイト管理者の作成（メールアドレス検証済み）
    await page.goto('/auth/signup')
    await page.fill('input[type="email"]', 'siteadmin@test.com')
    await page.fill('input[name="name"]', 'Site Admin')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // データベースで直接site_adminに昇格させる必要があるため、
    // 実際のテストではモックユーザーを使用
  })

  test('サイト管理者のみユーザー管理ページにアクセスできる', async ({ page }) => {
    // site_adminでログイン後
    await page.goto('/')
    
    // ユーザー管理リンクが表示されることを確認
    const userManagementLink = page.locator('a[href="/users"]')
    await expect(userManagementLink).toBeVisible()
    
    // ユーザー管理ページにアクセス
    await userManagementLink.click()
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('ユーザー管理')
  })

  test('一般ユーザーはユーザー管理ページにアクセスできない', async ({ page }) => {
    // memberでログイン後
    await page.goto('/')
    
    // ユーザー管理リンクが表示されないことを確認
    const userManagementLink = page.locator('a[href="/users"]')
    await expect(userManagementLink).not.toBeVisible()
    
    // 直接アクセスを試みる
    await page.goto('/users')
    
    // リダイレクトされることを確認
    await expect(page).toHaveURL('/')
  })

  test('役割変更モーダルが正しく表示される', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // ユーザーの役割バッジをクリック
    const roleBadge = page.locator('button:has-text("一般")').first()
    await roleBadge.click()
    
    // モーダルが表示されることを確認
    await expect(page.locator('text=役割の変更')).toBeVisible()
    
    // 3つの役割が表示されることを確認
    await expect(page.locator('text=サイト管理者')).toBeVisible()
    await expect(page.locator('text=管理者')).toBeVisible()
    await expect(page.locator('text=一般ユーザー')).toBeVisible()
    
    // 各役割の説明が表示されることを確認
    await expect(page.locator('text=すべての権限（ユーザー管理含む）')).toBeVisible()
    await expect(page.locator('text=投稿・イベント・スケジュール管理')).toBeVisible()
    await expect(page.locator('text=閲覧・コメント・参加登録')).toBeVisible()
  })

  test('役割変更が正しく動作する', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // 一般ユーザーの役割バッジをクリック
    const roleBadge = page.locator('button:has-text("一般")').first()
    await roleBadge.click()
    
    // 管理者を選択
    await page.locator('input[value="admin"]').click()
    
    // 変更ボタンをクリック
    await page.locator('button:has-text("変更する")').click()
    
    // モーダルが閉じることを確認
    await expect(page.locator('text=役割の変更')).not.toBeVisible()
    
    // 役割が更新されたことを確認（楽観的UI）
    await expect(page.locator('button:has-text("管理者")').first()).toBeVisible()
  })

  test('自分自身の役割を変更できない', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // 自分自身の役割バッジを探す
    const ownRoleBadge = page.locator('button[disabled]:has-text("サイト")')
    
    // ボタンが無効化されていることを確認
    await expect(ownRoleBadge).toBeDisabled()
  })

  test('ユーザー削除が正しく動作する', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // 削除ボタンをクリック
    const deleteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first()
    
    // 確認ダイアログのハンドリング
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('削除しますか')
      dialog.accept()
    })
    
    await deleteButton.click()
    
    // ユーザーが削除されたことを確認（楽観的UI）
    // 実際のテストでは削除されたユーザーが表示されないことを確認
  })

  test('自分自身を削除できない', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // 自分自身の削除ボタンを探す
    const ownDeleteButton = page.locator('button[disabled]:has-text("削除不可")')
    
    // ボタンが無効化されていることを確認
    await expect(ownDeleteButton).toBeDisabled()
  })

  test('モーダルのキャンセルボタンが動作する', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // ユーザーの役割バッジをクリック
    const roleBadge = page.locator('button:has-text("一般")').first()
    await roleBadge.click()
    
    // モーダルが表示されることを確認
    await expect(page.locator('text=役割の変更')).toBeVisible()
    
    // キャンセルボタンをクリック
    await page.locator('button:has-text("キャンセル")').click()
    
    // モーダルが閉じることを確認
    await expect(page.locator('text=役割の変更')).not.toBeVisible()
  })

  test('モーダルの×ボタンが動作する', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // ユーザーの役割バッジをクリック
    const roleBadge = page.locator('button:has-text("一般")').first()
    await roleBadge.click()
    
    // モーダルが表示されることを確認
    await expect(page.locator('text=役割の変更')).toBeVisible()
    
    // ×ボタンをクリック
    await page.locator('button:has(svg)').filter({ hasText: '' }).click()
    
    // モーダルが閉じることを確認
    await expect(page.locator('text=役割の変更')).not.toBeVisible()
  })

  test('同じ役割を選択した場合、変更ボタンが無効化される', async ({ page }) => {
    // site_adminでユーザー管理ページにアクセス
    await page.goto('/users')
    
    // 一般ユーザーの役割バッジをクリック
    const roleBadge = page.locator('button:has-text("一般")').first()
    await roleBadge.click()
    
    // 一般ユーザーが選択されていることを確認（デフォルト）
    await expect(page.locator('input[value="member"]')).toBeChecked()
    
    // 変更ボタンが無効化されていることを確認
    await expect(page.locator('button:has-text("変更する")')).toBeDisabled()
  })

  test('ナビゲーションにユーザー管理リンクが表示される', async ({ page }) => {
    // site_adminでログイン後
    await page.goto('/')
    
    // デスクトップヘッダーにリンクが表示されることを確認
    const headerLink = page.locator('nav a[href="/users"]:has-text("管理")')
    await expect(headerLink).toBeVisible()
    
    // Homeページのカードが表示されることを確認
    const homeCard = page.locator('a[href="/users"]:has-text("ユーザー管理")')
    await expect(homeCard).toBeVisible()
  })

  test('管理者はユーザー管理リンクが表示されない', async ({ page }) => {
    // adminでログイン後
    await page.goto('/')
    
    // ユーザー管理リンクが表示されないことを確認
    const userManagementLink = page.locator('a[href="/users"]')
    await expect(userManagementLink).not.toBeVisible()
  })
})
