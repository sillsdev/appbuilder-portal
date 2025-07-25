import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Scriptoria' })).toBeVisible();
});
test('can login', async ({ page }) => {
  await page.goto('/');
  // Click the login button
  // Login and Login with new session
  await expect(page.getByRole('button', { name: 'Login' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  // Wait for the login page to load
  await expect(page.getByPlaceholder('yours@example.com')).toBeVisible();
  // Fill in the email and password
  await page.getByPlaceholder('yours@example.com').fill(process.env.CI_EMAIL ?? '');
  await page.getByPlaceholder('your password').fill(process.env.CI_PASSWORD ?? '');
  // Click the login button
  await page.getByRole('button', { name: 'Log In' }).click();
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
