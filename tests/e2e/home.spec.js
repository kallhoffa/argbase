import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/ArgBase/);
  });

  test('should display the logo and tagline', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ArgBase');
    await expect(page.locator('text=Every question answered')).toBeVisible();
  });

  test('should have a search input', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'What would you like to know?');
  });

  test('should navigate to question page on search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('What is gravity?');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/question\?q=What.*gravity/);
  });

  test('should have footer info text', async ({ page }) => {
    await expect(page.locator('text=Join us in building the world\'s knowledge base')).toBeVisible();
  });
});
