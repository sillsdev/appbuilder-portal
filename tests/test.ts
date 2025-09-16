import { expect, test } from '@playwright/test';

test('auth shared to tests', async ({ page }) => {
  await page.goto('/'); // should redirect to /tasks
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
