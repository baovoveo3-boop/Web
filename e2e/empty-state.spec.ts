import { test, expect } from '@playwright/test';

test.describe('Homepage Coming Soon Empty State Tests', () => {

  test('Verify Coming Soon cards render when products catalog is empty', async ({ page }) => {
    // Inject mock script to return empty lists in useStoreProducts
    await page.addInitScript(() => {
      window.webpackChunk_N_E = window.webpackChunk_N_E || [];
      const originalPush = window.webpackChunk_N_E.push;
      window.webpackChunk_N_E.push = function(...args) {
        const modules = args[0][1];
        if (modules) {
          for (const key of Object.keys(modules)) {
            const originalFunc = modules[key];
            modules[key] = function(module, exports, require) {
              originalFunc(module, exports, require);
              // Intercept getDocs to return an empty snap
              if (exports && exports.getDocs) {
                exports.getDocs = () => Promise.resolve({
                  size: 0,
                  docs: [],
                  forEach: () => {}
                });
              }
            };
          }
        }
        return originalPush.apply(this, args);
      };
    });

    await page.goto('/');

    // Check that empty state grid is visible for both Tools and Courses
    const comingSoonGrids = page.locator('[data-testid="coming-soon-grid"]');
    await expect(comingSoonGrids).toHaveCount(2);

    const comingSoonCards = page.locator('[data-testid="coming-soon-card"]');
    await expect(comingSoonCards).toHaveCount(6); // 3 for tools + 3 for courses

    // Verify title and badge visibility
    const firstTitle = comingSoonCards.first().locator('[data-testid="coming-soon-title"]');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toBeEmpty();

    const firstBadge = comingSoonCards.first().locator('[data-testid="coming-soon-badge"]');
    await expect(firstBadge).toBeVisible();
    await expect(firstBadge).toHaveText(/Sắp ra mắt/i);
  });
});
