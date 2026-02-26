import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ArgBase/i);
  });

  test('should show navigation bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('ArgBase')).toBeVisible();
  });

  test('should show search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('What would you like to know?')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/signup');
  });
});
