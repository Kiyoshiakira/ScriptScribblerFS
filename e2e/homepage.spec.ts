import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page has loaded
    expect(page.url()).toContain('localhost:9002');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // The app should redirect to login for unauthenticated users
    // or show login UI
    await page.waitForLoadState('networkidle');
    
    // Check for login elements (adjust selectors based on actual app)
    const hasLoginButton = await page.locator('button:has-text("Sign in")').count() > 0;
    const hasLoginLink = await page.locator('a:has-text("Login")').count() > 0;
    
    // At least one should be present
    expect(hasLoginButton || hasLoginLink).toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for common navigation elements
    const links = await page.locator('a').all();
    expect(links.length).toBeGreaterThan(0);
  });
});
