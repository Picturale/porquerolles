import { expect, test } from '@playwright/test';

test.describe('Vision Picturale Community - Core App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/core-app/');
  });

  test('should load the core application homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Calibration d'Impression/);
    
    // Vérifier que les éléments principaux sont présents
    await expect(page.locator('#app')).toBeVisible();
    
    // Vérifier que le canvas est présent
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Vérifier que la navigation est présente
    const nav = page.locator('nav, .navigation, .nav');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should load design tokens', async ({ page }) => {
    // Vérifier que les design tokens CSS sont chargés
    const designTokensLink = page.locator('link[href*="design-tokens.css"]');
    await expect(designTokensLink).toBeAttached();
  });
});

test.describe('Vision Picturale Community - Social App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/social-app/');
  });

  test('should load the social application', async ({ page }) => {
    await expect(page).toHaveTitle(/Vision Picturale Community/);
    
    // Vérifier que le root React est présent
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should render React components', async ({ page }) => {
    // Attendre que React soit chargé
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'il y a du contenu dans le root
    const rootContent = await page.locator('#root').textContent();
    expect(rootContent).toBeTruthy();
  });
});

test.describe('Cross-browser compatibility', () => {
  ['core-app', 'social-app'].forEach(app => {
    test(`${app} should work on mobile viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/${app}/`);
      
      // Vérifier que l'app est responsive
      const mainContent = page.locator(app === 'core-app' ? '#app' : '#root');
      await expect(mainContent).toBeVisible();
      
      // Vérifier que le contenu n'overflow pas
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });
  });
});
