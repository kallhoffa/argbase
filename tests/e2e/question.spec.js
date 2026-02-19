const { test, expect } = require('@playwright/test');

test.describe('Question Page', () => {
  test('should show loading state initially', async ({ page }) => {
    await page.goto('/question?q=test');
    await expect(page.locator('text=Loading...')).toBeVisible();
  });

  test('should have navigation bar', async ({ page }) => {
    await page.goto('/question?q=test');
    await expect(page.locator('nav')).toBeVisible();
  });
});
