import { test, expect } from '@playwright/test';

const generateUniqueEmail = () => `test-${Date.now()}@example.com`;

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Sign In and Sign Up buttons when not authenticated', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should navigate to login page when clicking Sign In', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to signup page when clicking Sign Up from navbar', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  test('should display login form with all elements', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/login');
    
    const authForm = page.locator('form').filter({ hasText: /Sign In/ });
    await expect(authForm.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(authForm.getByPlaceholder('••••••••').first()).toBeVisible();
    await expect(authForm.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });

  test('should display signup form with all elements', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL('/signup');
    
    const authForm = page.locator('form').filter({ hasText: /Sign Up/ });
    await expect(authForm.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(authForm.getByPlaceholder('••••••••').first()).toBeVisible();
    await expect(authForm.getByPlaceholder('••••••••').last()).toBeVisible();
    await expect(authForm.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  test('should show error for mismatched passwords on signup', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL('/signup');
    
    const authForm = page.locator('form').filter({ hasText: /Sign Up/ });
    await authForm.getByPlaceholder('you@example.com').fill('test@example.com');
    await authForm.getByPlaceholder('••••••••').first().fill('password123');
    await authForm.getByPlaceholder('••••••••').last().fill('differentpassword');
    await authForm.getByRole('button', { name: 'Sign Up' }).click();
    
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should navigate from login to signup and back', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
    
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/signup');
    
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');
  });

  test.describe('with Firebase Auth', () => {
    test('should signup a new user and redirect to home', async ({ page }) => {
      const email = generateUniqueEmail();
      
      await page.getByRole('button', { name: 'Sign Up' }).click();
      await page.waitForURL('/signup');
      
      const authForm = page.locator('form').filter({ hasText: /Sign Up/ });
      await authForm.getByPlaceholder('you@example.com').fill(email);
      await authForm.getByPlaceholder('••••••••').first().fill('password123');
      await authForm.getByPlaceholder('••••••••').last().fill('password123');
      await authForm.getByRole('button', { name: 'Sign Up' }).click();
      
      await expect(page).toHaveURL('/');
      await expect(page.getByText(email)).toBeVisible();
    });

    test('should login with existing user credentials', async ({ page }) => {
      const email = generateUniqueEmail();
      
      await page.getByRole('button', { name: 'Sign Up' }).click();
      await page.waitForURL('/signup');
      
      const signupForm = page.locator('form').filter({ hasText: /Sign Up/ });
      await signupForm.getByPlaceholder('you@example.com').fill(email);
      await signupForm.getByPlaceholder('••••••••').first().fill('password123');
      await signupForm.getByPlaceholder('••••••••').last().fill('password123');
      await signupForm.getByRole('button', { name: 'Sign Up' }).click();
      
      await expect(page).toHaveURL('/');
      await expect(page.getByText(email)).toBeVisible();
      
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('/login');
      
      const loginForm = page.locator('form').filter({ hasText: /Sign In/ });
      await loginForm.getByPlaceholder('you@example.com').fill(email);
      await loginForm.getByPlaceholder('••••••••').first().fill('password123');
      await loginForm.getByRole('button', { name: 'Sign In' }).click();
      
      await expect(page).toHaveURL('/');
      await expect(page.getByText(email)).toBeVisible();
    });

    test('should show error for invalid login credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('/login');
      
      const loginForm = page.locator('form').filter({ hasText: /Sign In/ });
      await loginForm.getByPlaceholder('you@example.com').fill('nonexistent@example.com');
      await loginForm.getByPlaceholder('••••••••').first().fill('wrongpassword');
      await loginForm.getByRole('button', { name: 'Sign In' }).click();
      
      await expect(page.locator('.bg-red-100')).toBeVisible();
    });
  });
});
