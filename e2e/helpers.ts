import { Page } from '@playwright/test';

/**
 * 管理者としてログイン
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.getByRole('textbox', { name: 'メールアドレス' }).fill('admin@example.com');
  await page.getByLabel('パスワード').fill('password123');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('/');
}

/**
 * 一般ユーザーとしてログイン
 */
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.getByRole('textbox', { name: 'メールアドレス' }).fill(email);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('/');
}
