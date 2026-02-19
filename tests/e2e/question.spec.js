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

  test('should handle question not found or error gracefully', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/question?q=nonexistentquestion12345');
    await expect(page.locator('text=Loading...')).toBeVisible();
    await expect(page.locator('text=Loading...')).toBeHidden({ timeout: 10000 });
    
    const hasError = await page.locator('text=Failed to load question data').isVisible();
    const hasNoMatch = await page.locator('text=No matches found').isVisible();
    
    console.log('Console errors captured:', consoleErrors);
    expect(consoleErrors).toHaveLength(0);
    expect(hasError || hasNoMatch).toBe(true);
  });

  test('should load question data without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/question?q=test');
    await expect(page.locator('text=Loading...')).toBeVisible();
    await expect(page.locator('text=Loading...')).toBeHidden({ timeout: 10000 });
    
    console.log('Console errors on question load:', consoleErrors);
    
    expect(consoleErrors).toHaveLength(0);
  });
});
