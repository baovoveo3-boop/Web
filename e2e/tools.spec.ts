import { test, expect } from '@playwright/test';

test.describe('Tool Detail Page E2E Test Suite', () => {

  test.describe('Tier 1 - Feature Coverage', () => {

    test.describe('UI Layout (Glassmorphism Dark Mode)', () => {
      test('TD-T1-1: Verify Glassmorphic page background color', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
        const rgb = bg.match(/\d+/g)?.map(Number) || [0, 0, 0];
        expect(rgb[0]).toBeLessThan(30);
        expect(rgb[1]).toBeLessThan(30);
        expect(rgb[2]).toBeLessThan(30);
      });

      test('TD-T1-2: Verify Glassmorphic card styling classes', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const container = page.locator('[data-testid="tool-detail-container"]');
        await expect(container).toBeVisible();
        const className = await container.getAttribute('class') || '';
        expect(className).toContain('backdrop-blur');
      });

      test('TD-T1-3: Verify no horizontal overflow in desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/tools/ban-content');
        const overflowX = await page.evaluate(() => window.getComputedStyle(document.body).overflowX);
        const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflowX === 'hidden' || !hasHorizontalScroll).toBe(true);
      });

      test('TD-T1-4: Verify layout elements display order', async ({ page }) => {
        await page.goto('/tools/ban-content');
        
        const header = page.locator('[data-testid="header"]');
        const breadcrumb = page.locator('[data-testid="breadcrumb"]');
        const container = page.locator('[data-testid="tool-detail-container"]');
        const footer = page.locator('[data-testid="footer"]');

        await expect(header).toBeVisible();
        await expect(breadcrumb).toBeVisible();
        await expect(container).toBeVisible();
        await expect(footer).toBeVisible();

        // Check relative vertical position to verify correct order
        const headerBox = await header.boundingBox();
        const breadcrumbBox = await breadcrumb.boundingBox();
        const containerBox = await container.boundingBox();
        const footerBox = await footer.boundingBox();

        if (headerBox && breadcrumbBox && containerBox && footerBox) {
          expect(headerBox.y).toBeLessThan(breadcrumbBox.y);
          expect(breadcrumbBox.y).toBeLessThan(containerBox.y);
          expect(containerBox.y).toBeLessThan(footerBox.y);
        }
      });

      test('TD-T1-5: Verify responsive container width', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const container = page.locator('[data-testid="tool-detail-container"]');
        await expect(container).toBeVisible();
        const classes = await container.getAttribute('class') || '';
        const hasMaxWidth = classes.includes('max-w-') || await container.evaluate(el => window.getComputedStyle(el).maxWidth !== 'none');
        expect(hasMaxWidth).toBe(true);
      });
    });

    test.describe('Breadcrumb / Header', () => {
      test('TD-T1-6: Verify Header is visible on detail page', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const header = page.locator('[data-testid="header"]');
        await expect(header).toBeVisible();
      });

      test('TD-T1-7: Verify Breadcrumb structure', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const breadcrumb = page.locator('[data-testid="breadcrumb"]');
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.locator('[data-testid="breadcrumb-home"]')).toBeVisible();
        await expect(breadcrumb.locator('[data-testid="breadcrumb-tools"]')).toBeVisible();
        await expect(breadcrumb.locator('[data-testid="breadcrumb-current"]')).toBeVisible();
      });

      test('TD-T1-8: Verify Breadcrumb home navigation', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const homeLink = page.locator('[data-testid="breadcrumb-home"]');
        await homeLink.click();
        await expect(page).toHaveURL(/\/$/);
      });

      test('TD-T1-9: Verify Breadcrumb current node text', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const current = page.locator('[data-testid="breadcrumb-current"]');
        await expect(current).toBeVisible();
        await expect(current).toHaveText(/Ban Content/i);
      });

      test('TD-T1-10: Verify Breadcrumb tools node text', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const toolsNode = page.locator('[data-testid="breadcrumb-tools"]');
        await expect(toolsNode).toBeVisible();
        await expect(toolsNode).not.toBeEmpty();
      });
    });

    test.describe('Main Info Block', () => {
      test('TD-T1-11: Verify showcase media is visible', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const media = page.locator('[data-testid="tool-media-container"]');
        await expect(media).toBeVisible();
        const image = media.locator('[data-testid="tool-image"]');
        const video = media.locator('[data-testid="tool-video"]');
        const hasMedia = (await image.count() > 0) || (await video.count() > 0);
        expect(hasMedia).toBe(true);
      });

      test('TD-T1-12: Verify title, tag, and description match data store', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const title = page.locator('[data-testid="tool-title"]');
        const tag = page.locator('[data-testid="tool-tag"]');
        const description = page.locator('[data-testid="tool-description"]');

        await expect(title).toHaveText(/Ban Content/i);
        await expect(tag).toBeVisible();
        await expect(description).not.toBeEmpty();
      });

      test('TD-T1-13: Verify features list exists and has items', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const list = page.locator('[data-testid="tool-features-list"]');
        await expect(list).toBeVisible();
        const items = list.locator('[data-testid="tool-feature-item"]');
        const count = await items.count();
        expect(count).toBeGreaterThanOrEqual(3);
      });

      test('TD-T1-14: Verify price displays correctly', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const price = page.locator('[data-testid="tool-price"]');
        await expect(price).toBeVisible();
        await expect(price).toHaveText(/499,000/);
      });

      test('TD-T1-15: Verify CTA button is visible and active', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const cta = page.locator('[data-testid="tool-cta"]');
        await expect(cta).toBeVisible();
        expect(await cta.isEnabled()).toBe(true);
      });
    });

    test.describe('Additional Info Blocks', () => {
      test('TD-T1-16: Verify How to Use section existence', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const section = page.locator('[data-testid="tool-how-to-use"]');
        await expect(section).toBeVisible();
      });

      test('TD-T1-17: Verify How to Use steps count', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const steps = page.locator('[data-testid="tool-how-to-use-step"]');
        const count = await steps.count();
        expect(count).toBeGreaterThanOrEqual(3);
      });

      test('TD-T1-18: Verify FAQ section existence', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const faq = page.locator('[data-testid="tool-faq"]');
        await expect(faq).toBeVisible();
      });

      test('TD-T1-19: Verify FAQ items text', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const items = page.locator('[data-testid="tool-faq-item"]');
        const count = await items.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
          const item = items.nth(i);
          const question = item.locator('[data-testid="tool-faq-question"]');
          const answer = item.locator('[data-testid="tool-faq-answer"]');
          await expect(question).not.toBeEmpty();
          await expect(answer).not.toBeEmpty();
        }
      });

      test('TD-T1-20: Verify FAQ interactive expansion', async ({ page }) => {
        await page.goto('/tools/ban-content');
        const firstQuestion = page.locator('[data-testid="tool-faq-question"]').first();
        const firstAnswer = page.locator('[data-testid="tool-faq-answer"]').first();

        // Check if answer starts hidden (depending on design, e.g. height 0, opacity 0, or collapsed)
        // If not collapsible in a hidden-by-default way, we still trigger a click and verify it remains or becomes visible.
        await firstQuestion.click();
        await page.waitForTimeout(100); // Wait for transition
        await expect(firstAnswer).toBeVisible();
      });
    });

    test.describe('Dynamic Route Loading', () => {
      test('TD-T1-21: Load Ban Content page directly', async ({ page }) => {
        const response = await page.goto('/tools/ban-content');
        expect(response?.status()).toBe(200);
        await expect(page.locator('[data-testid="tool-title"]')).toHaveText(/Ban Content/i);
      });

      test('TD-T1-22: Load Healing Bird page directly', async ({ page }) => {
        const response = await page.goto('/tools/healing-bird');
        expect(response?.status()).toBe(200);
        await expect(page.locator('[data-testid="tool-title"]')).toHaveText(/Healing Bird/i);
      });

      test('TD-T1-23: Verify document page title update', async ({ page }) => {
        await page.goto('/tools/ban-content');
        await expect(page).toHaveTitle(/Ban Content/i);
      });

      test('TD-T1-24: Verify state updates correctly when switching tools', async ({ page }) => {
        await page.goto('/tools/ban-content');
        
        // Locate link to healing bird (e.g. from hot tools sidebar or footer)
        const hotToolHealingBird = page.locator('[data-testid="hot-tool-healing-bird"]');
        await expect(hotToolHealingBird).toBeVisible();
        await hotToolHealingBird.click();
        
        await expect(page).toHaveURL(/\/tools\/healing-bird/);
        await expect(page.locator('[data-testid="tool-title"]')).toHaveText(/Healing Bird/i);
      });

      test('TD-T1-25: Verify Footer is visible on detail page', async ({ page }) => {
        await page.goto('/tools/healing-bird');
        const footer = page.locator('[data-testid="footer"]');
        await expect(footer).toBeVisible();
      });
    });

  });

  test.describe('Tier 2 - Boundary & Corner Cases', () => {

    test('TD-T2-1: Invalid ID Fallback', async ({ page }) => {
      // In Next.js static export with 404 fallback, navigating to non-existent route shows the fallback page.
      await page.goto('/tools/khong-ton-tai', { failOnStatusCode: false });
      const container = page.locator('[data-testid="not-found-container"]');
      await expect(container).toBeVisible();
      const backHome = page.locator('[data-testid="not-found-back-home"]');
      await expect(backHome).toBeVisible();
      await backHome.click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('TD-T2-2: Mobile Viewport Responsiveness', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tools/ban-content');
      
      const media = page.locator('[data-testid="tool-media-container"]');
      const info = page.locator('[data-testid="tool-main-info"]');
      const cta = page.locator('[data-testid="tool-cta"]');

      await expect(media).toBeVisible();
      await expect(info).toBeVisible();
      await expect(cta).toBeVisible();

      // Check no horizontal overflow scrollbar on mobile
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasHorizontalScroll).toBe(false);
    });

    test('TD-T2-3: Long Strings Handling', async ({ page }) => {
      await page.goto('/tools/ban-content');
      
      // Inject extremely long title and description dynamically into the DOM to verify layout stability
      await page.evaluate(() => {
        const titleEl = document.querySelector('[data-testid="tool-title"]');
        const descEl = document.querySelector('[data-testid="tool-description"]');
        if (titleEl) titleEl.textContent = 'A'.repeat(200);
        if (descEl) descEl.textContent = 'B'.repeat(1000);
      });

      // Verify that page doesn't overflow horizontally due to the long text
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasHorizontalScroll).toBe(false);

      const cta = page.locator('[data-testid="tool-cta"]');
      await expect(cta).toBeVisible();
      const ctaBox = await cta.boundingBox();
      expect(ctaBox).not.toBeNull();
    });

    test('TD-T2-4: Missing Optional Fields Handling', async ({ page }) => {
      // Listen for unhandled errors
      const errors: Error[] = [];
      page.on('pageerror', (err) => errors.push(err));

      await page.goto('/tools/healing-bird');
      
      // Check for presence of console errors
      expect(errors).toHaveLength(0);

      // If one of the tools dynamically lacks some optional parts (e.g. if Healing Bird has no video, it should be omitted)
      // For testing optional sections, we assert that the detail container still renders without throwing
      await expect(page.locator('[data-testid="tool-detail-container"]')).toBeVisible();
    });

    test('TD-T2-5: Query Parameter Sanitization & Fallback on CTA', async ({ page }) => {
      let dialogAlerted = false;
      page.on('dialog', async (dialog) => {
        dialogAlerted = true;
        await dialog.dismiss();
      });

      await page.goto('/tools/ban-content?promo=<script>alert("xss")</script>');
      await page.waitForTimeout(200); // Give script a chance to run if it could
      expect(dialogAlerted).toBe(false);

      const cta = page.locator('[data-testid="tool-cta"]');
      await expect(cta).toBeVisible();
      const href = await cta.getAttribute('href') || '';
      expect(href.includes('<script>')).toBe(false);
    });

  });

  test.describe('Tier 3 - Cross-Feature Combinations', () => {

    test('TD-T3-1: Navigation Loop (Home -> Detail -> Hub -> Home)', async ({ page }) => {
      // 1. Start at home
      await page.goto('/');
      
      // 2. Click carousel view details
      const viewDetailsBtn = page.locator('[data-testid="carousel-view-details"]');
      await expect(viewDetailsBtn).toBeVisible();
      await viewDetailsBtn.click();
      await expect(page).toHaveURL(/\/tools\/(ban-content|healing-bird)/);

      // 3. Click CTA button to redirect to hub
      const cta = page.locator('[data-testid="tool-cta"]');
      await expect(cta).toBeVisible();
      await cta.click();
      await expect(page).toHaveURL(/\/hub\?plan=(vip|ultimate)/);

      // 4. Click logout button to return to home
      const logoutBtn = page.locator('[data-testid="hub-logout-btn"]');
      await expect(logoutBtn).toBeVisible();
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('TD-T3-2: Theme and Asset Continuity', async ({ page }) => {
      // Capture body background color of home page
      await page.goto('/');
      const homeBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

      // Navigate to detail page
      await page.goto('/tools/ban-content');
      const detailBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

      // Navigate to Hub page
      await page.goto('/hub');
      const hubBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

      expect(detailBg).toBe(homeBg);
      expect(hubBg).toBe(homeBg);
    });

    test('TD-T3-3: CTA Plan Redirect with Query Params', async ({ page }) => {
      // Ban Content routes to /hub?plan=vip
      await page.goto('/tools/ban-content');
      const ctaBanContent = page.locator('[data-testid="tool-cta"]');
      await expect(ctaBanContent).toHaveAttribute('href', /\/hub\?plan=vip/);

      // Healing Bird routes to /hub?plan=ultimate
      await page.goto('/tools/healing-bird');
      const ctaHealingBird = page.locator('[data-testid="tool-cta"]');
      await expect(ctaHealingBird).toHaveAttribute('href', /\/hub\?plan=ultimate/);
    });

  });

  test.describe('Tier 4 - Real-World Application Scenarios', () => {

    test('TD-T4-1: User Exploration Journey', async ({ page }) => {
      // 1. User lands on home
      await page.goto('/');
      
      // 2. User navigates to Healing Bird page via hot tool sidebar link
      const hotToolLink = page.locator('[data-testid="hot-tool-healing-bird"]');
      await expect(hotToolLink).toBeVisible();
      await hotToolLink.click();
      await expect(page).toHaveURL(/\/tools\/healing-bird/);

      // 3. User reads features
      await expect(page.locator('[data-testid="tool-title"]')).toHaveText(/Healing Bird/i);
      const list = page.locator('[data-testid="tool-features-list"]');
      await expect(list).toBeVisible();

      // 4. User scrolls to read How to Use section and FAQ
      const howToUse = page.locator('[data-testid="tool-how-to-use"]');
      await howToUse.scrollIntoViewIfNeeded();
      await expect(howToUse).toBeVisible();

      const faq = page.locator('[data-testid="tool-faq"]');
      await faq.scrollIntoViewIfNeeded();
      await expect(faq).toBeVisible();

      // 5. User clicks CTA to purchase/activate
      const cta = page.locator('[data-testid="tool-cta"]');
      await cta.scrollIntoViewIfNeeded();
      await cta.click();

      // 6. User is redirected to onboarding hub matching Healing Bird (ultimate plan)
      await expect(page).toHaveURL(/\/hub\?plan=ultimate/);
      
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toContainText(/Ultimate/i);
    });

  });

});
