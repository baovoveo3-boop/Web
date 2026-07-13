import { test, expect } from '@playwright/test';

test.describe('Ban Content E2E Test Suite', () => {

  test.describe('Tier 1 - Feature Coverage', () => {
    
    test.describe('Landing Page', () => {
      test('L-T1-1: Verify page loads successfully with 200 OK', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);
      });

      test('L-T1-2: Verify Header navigation bar exists', async ({ page }) => {
        await page.goto('/');
        const header = page.locator('[data-testid="header"]');
        await expect(header).toBeVisible();
      });

      test('L-T1-3: Verify Brand Logo exists in Header', async ({ page }) => {
        await page.goto('/');
        const logo = page.locator('[data-testid="brand-logo"]');
        await expect(logo).toBeVisible();
      });

      test('L-T1-4: Verify main Hero heading and subtitle exist', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('[data-testid="hero-heading"]');
        const subtitle = page.locator('[data-testid="hero-subtitle"]');
        await expect(heading).toBeVisible();
        await expect(subtitle).toBeVisible();
      });

      test('L-T1-5: Verify Footer exists', async ({ page }) => {
        await page.goto('/');
        const footer = page.locator('[data-testid="footer"]');
        await expect(footer).toBeVisible();
      });
    });

    test.describe.skip('Scroll Sequence', () => {
      test('S-T1-1: Verify scroll sequence section exists', async ({ page }) => {
        await page.goto('/');
        const scrollSection = page.locator('[data-testid="scroll-sequence-section"]');
        await expect(scrollSection).toBeVisible();
      });

      test('S-T1-2: Verify sticky wrapper exists', async ({ page }) => {
        await page.goto('/');
        const stickyWrapper = page.locator('[data-testid="scroll-sticky-wrapper"]');
        await expect(stickyWrapper).toBeVisible();
      });

      test('S-T1-3: Verify scroll sequence canvas/image exists', async ({ page }) => {
        await page.goto('/');
        const canvas = page.locator('[data-testid="scroll-canvas"], [data-testid="scroll-image"]');
        await expect(canvas.first()).toBeVisible();
      });

      test('S-T1-4: Verify text overlay container exists', async ({ page }) => {
        await page.goto('/');
        const overlay = page.locator('[data-testid="scroll-text-overlay"]');
        await expect(overlay).toBeVisible();
      });

      test('S-T1-5: Verify scroll sequence has text content inside overlay', async ({ page }) => {
        await page.goto('/');
        const overlay = page.locator('[data-testid="scroll-text-overlay"]');
        await expect(overlay).not.toBeEmpty();
      });
    });

    test.describe('Pricing Tiers', () => {
      test('P-T1-1: Verify pricing section exists', async ({ page }) => {
        await page.goto('/');
        const pricingSection = page.locator('[data-testid="pricing-section"]');
        await expect(pricingSection).toBeVisible();
      });

      test('P-T1-2: Verify billing toggle exists', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('[data-testid="pricing-toggle"]');
        await expect(toggle).toBeVisible();
      });

      test('P-T1-3: Verify Free tier card exists', async ({ page }) => {
        await page.goto('/');
        const card = page.locator('[data-testid="pricing-card-free"]');
        await expect(card).toBeVisible();
      });

      test('P-T1-4: Verify VIP tier card exists', async ({ page }) => {
        await page.goto('/');
        const card = page.locator('[data-testid="pricing-card-vip"]');
        await expect(card).toBeVisible();
      });

      test('P-T1-5: Verify Ultimate tier card exists', async ({ page }) => {
        await page.goto('/');
        const card = page.locator('[data-testid="pricing-card-ultimate"]');
        await expect(card).toBeVisible();
      });
    });

    test.describe('App Hub Dashboard', () => {
      test('D-T1-1: Verify `/hub` page loads successfully', async ({ page }) => {
        const response = await page.goto('/hub');
        expect(response?.status()).toBe(200);
      });

      test('D-T1-2: Verify App Hub sidebar exists', async ({ page }) => {
        await page.goto('/hub');
        const sidebar = page.locator('[data-testid="hub-sidebar"]');
        await expect(sidebar).toBeVisible();
      });

      test('D-T1-3: Verify App Hub stats cards exist', async ({ page }) => {
        await page.goto('/hub');
        const stats = page.locator('[data-testid="stat-banned-content"], [data-testid="stat-active-scans"], [data-testid="stat-cpu-usage"], [data-testid="stat-account-tier"]');
        expect(await stats.count()).toBeGreaterThanOrEqual(1);
      });

      test('D-T1-4: Verify App Hub charts container exists', async ({ page }) => {
        await page.goto('/hub');
        const container = page.locator('[data-testid="hub-charts-container"]');
        await expect(container).toBeVisible();
      });

      test('D-T1-5: Verify Logout/Back button exists', async ({ page }) => {
        await page.goto('/hub');
        const logoutBtn = page.locator('[data-testid="hub-logout-btn"]');
        await expect(logoutBtn).toBeVisible();
      });
    });

  });

  test.describe('Tier 2 - Boundary & Corner Cases', () => {
    
    test.describe('Landing Page Edge Cases', () => {
      test('L-T2-1: Verify navigation link destinations exist', async ({ page }) => {
        await page.goto('/');
        const homeLink = page.locator('[data-testid="nav-link-home"]');
        const hubLink = page.locator('[data-testid="nav-link-hub"]');
        await expect(homeLink).toHaveAttribute('href');
        await expect(hubLink).toHaveAttribute('href');
      });

      test('L-T2-2: Verify hero CTA links have correct destinations', async ({ page }) => {
        await page.goto('/');
        const hubCTA = page.locator('[data-testid="hero-cta-hub"]');
        const pricingCTA = page.locator('[data-testid="hero-cta-pricing"]');
        await expect(hubCTA).toHaveAttribute('href', '/hub');
        await expect(pricingCTA).toHaveAttribute('href', '#pricing');
      });

      test('L-T2-3: Verify page layout does not break on small mobile screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        const header = page.locator('[data-testid="header"]');
        await expect(header).toBeVisible();
      });

      test('L-T2-4: Verify custom or default 404 response on invalid route', async ({ page }) => {
        // Since it's a static export, HTTP status code checks are unreliable on static hosts.
        // We navigate to a non-existent page and verify that we see 404 or "not found" text.
        await page.goto('/non-existent-page-route-12345', { failOnStatusCode: false });
        const content = await page.locator('body').textContent();
        const contains404 = content?.toLowerCase().includes('404') || content?.toLowerCase().includes('not found');
        expect(contains404).toBe(true);
      });

      test('L-T2-5: Verify page layout does not break on large screens', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');
        const header = page.locator('[data-testid="header"]');
        await expect(header).toBeVisible();
      });
    });

    test.describe.skip('Scroll Sequence Edge Cases', () => {
      test('S-T2-1: Verify scroll sequence has correct sticky height configuration', async ({ page }) => {
        await page.goto('/');
        const scrollSection = page.locator('[data-testid="scroll-sequence-section"]');
        await expect(scrollSection).toBeVisible();
        const style = await scrollSection.getAttribute('style') || '';
        const className = await scrollSection.getAttribute('class') || '';
        const hasHeight = style.includes('height') || className.includes('h-') || className.includes('min-h-');
        expect(hasHeight).toBe(true);
      });

      test('S-T2-2: Verify canvas/image contains width/height configurations', async ({ page }) => {
        await page.goto('/');
        const canvas = page.locator('[data-testid="scroll-canvas"], [data-testid="scroll-image"]');
        await expect(canvas.first()).toBeVisible();
      });

      test('S-T2-3: Verify scroll sequence doesn\'t cause layout shift / horizontal overflow', async ({ page }) => {
        await page.goto('/');
        const overflowX = await page.evaluate(() => {
          return window.getComputedStyle(document.body).overflowX;
        });
        expect(overflowX).toBe('hidden');
      });

      test('S-T2-4: Verify scroll-triggered overlay contains active feature titles', async ({ page }) => {
        await page.goto('/');
        const overlayText = await page.locator('[data-testid="scroll-text-overlay"]').textContent();
        expect(overlayText?.length).toBeGreaterThan(0);
      });

      test('S-T2-5: Verify sticky wrapper has viewport pinning classes', async ({ page }) => {
        await page.goto('/');
        const sticky = page.locator('[data-testid="scroll-sticky-wrapper"]');
        const classes = await sticky.getAttribute('class') || '';
        const isSticky = classes.includes('sticky') || classes.includes('fixed');
        expect(isSticky).toBe(true);
      });
    });

    test.describe('Pricing Tiers Edge Cases', () => {
      test('P-T2-1: Verify clicking pricing toggle changes the prices', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('[data-testid="pricing-toggle"]');
        const vipPrice = page.locator('[data-testid="price-value-vip"]');
        
        const initialPriceText = await vipPrice.textContent();
        await toggle.click();
        const updatedPriceText = await vipPrice.textContent();
        
        expect(initialPriceText).not.toEqual(updatedPriceText);
      });

      test('P-T2-2: Verify clicking toggle multiple times is consistent', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('[data-testid="pricing-toggle"]');
        const vipPrice = page.locator('[data-testid="price-value-vip"]');
        
        const price1 = await vipPrice.textContent();
        await toggle.click();
        const price2 = await vipPrice.textContent();
        await toggle.click();
        const price3 = await vipPrice.textContent();
        
        expect(price1).not.toEqual(price2);
        expect(price1).toEqual(price3);
      });

      test('P-T2-3: Verify choice CTA links exist on pricing cards', async ({ page }) => {
        await page.goto('/');
        const selectFree = page.locator('[data-testid="pricing-select-free"]');
        const selectVip = page.locator('[data-testid="pricing-select-vip"]');
        const selectUltimate = page.locator('[data-testid="pricing-select-ultimate"]');
        
        await expect(selectFree).toHaveAttribute('href');
        await expect(selectVip).toHaveAttribute('href');
        await expect(selectUltimate).toHaveAttribute('href');
      });

      test('P-T2-4: Verify VIP badge exists only on VIP card', async ({ page }) => {
        await page.goto('/');
        const badge = page.locator('[data-testid="pricing-vip-badge"]');
        await expect(badge).toBeVisible();
        
        const freeCard = page.locator('[data-testid="pricing-card-free"]');
        await expect(freeCard.locator('[data-testid="pricing-vip-badge"]')).toHaveCount(0);
      });

      test('P-T2-5: Verify pricing layout adapts to mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        const section = page.locator('[data-testid="pricing-section"]');
        await expect(section).toBeVisible();
      });
    });

    test.describe('App Hub Edge Cases', () => {
      test('D-T2-1: Verify sidebar navigation link structures', async ({ page }) => {
        await page.goto('/hub');
        const overview = page.locator('[data-testid="sidebar-link-overview"]');
        const analytics = page.locator('[data-testid="sidebar-link-analytics"]');
        const settings = page.locator('[data-testid="sidebar-link-settings"]');
        await expect(overview).toBeVisible();
        await expect(analytics).toBeVisible();
        await expect(settings).toBeVisible();
      });

      test('D-T2-2: Verify account tier card shows correct value', async ({ page }) => {
        await page.goto('/hub');
        const tier = page.locator('[data-testid="stat-account-tier"]');
        await expect(tier).toBeVisible();
        await expect(tier).not.toBeEmpty();
      });

      test('D-T2-3: Verify mockup chart renders graphic SVG elements', async ({ page }) => {
        await page.goto('/hub');
        const svg = page.locator('[data-testid="hub-chart-graphic"]');
        await expect(svg).toBeVisible();
      });

      test('D-T2-4: Verify layout renders correctly on small viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/hub');
        const sidebar = page.locator('[data-testid="hub-sidebar"]');
        await expect(sidebar).toBeVisible();
      });

      test('D-T2-5: Verify user profile area renders user information', async ({ page }) => {
        await page.goto('/hub');
        const profile = page.locator('[data-testid="hub-user-profile"]');
        await expect(profile).toBeVisible();
        await expect(profile).not.toBeEmpty();
      });
    });

  });

  test.describe('Tier 3 - Cross-Feature Combinations', () => {

    test('X-T3-1: Verify theme continuity (dark mode style parity across views)', async ({ page }) => {
      await page.goto('/');
      const landingBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      await page.goto('/hub');
      const hubBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      expect(landingBg).toEqual(hubBg);
      
      // Ensure background is dark (R, G, B components all less than 30)
      const rgb = landingBg.match(/\d+/g)?.map(Number) || [0, 0, 0];
      expect(rgb[0]).toBeLessThan(30);
      expect(rgb[1]).toBeLessThan(30);
      expect(rgb[2]).toBeLessThan(30);
    });

    test('X-T3-2: Verify Navigation loop between Landing and Hub', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-testid="nav-link-hub"]').click();
      await expect(page).toHaveURL(/\/hub/);

      await page.locator('[data-testid="hub-logout-btn"]').click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('X-T3-3: Verify pricing selection monthly redirect query params', async ({ page }) => {
      await page.goto('/');
      const cta = page.locator('[data-testid="pricing-select-vip"]');
      const href = await cta.getAttribute('href');
      expect(href).toContain('/hub?plan=vip&billing=monthly');
    });

    test('X-T3-4: Verify pricing selection yearly redirect query params', async ({ page }) => {
      await page.goto('/');
      const toggle = page.locator('[data-testid="pricing-toggle"]');
      await toggle.click();
      const cta = page.locator('[data-testid="pricing-select-ultimate"]');
      const href = await cta.getAttribute('href');
      expect(href).toContain('/hub?plan=ultimate&billing=yearly');
    });

  });

  test.describe('Tier 4 - Real-World Application Scenarios', () => {

    test('A-T4-1: VIP Plan Checkout and Onboarding Flow', async ({ page }) => {
      await page.goto('/');
      const pricingSection = page.locator('[data-testid="pricing-section"]');
      await pricingSection.scrollIntoViewIfNeeded();

      const toggle = page.locator('[data-testid="pricing-toggle"]');
      await toggle.click(); // Switch to yearly

      const selectVip = page.locator('[data-testid="pricing-select-vip"]');
      await selectVip.click();

      await expect(page).toHaveURL(/\/hub\?plan=vip&billing=yearly/);
      
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toContainText('VIP (Yearly)');
    });

    test('A-T4-2: Ultimate Plan Checkout and Onboarding Flow', async ({ page }) => {
      await page.goto('/');
      const cta = page.locator('[data-testid="hero-cta-pricing"]');
      await cta.click();

      const selectUltimate = page.locator('[data-testid="pricing-select-ultimate"]');
      await selectUltimate.click();

      await expect(page).toHaveURL(/\/hub\?plan=ultimate&billing=monthly/);
      
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toContainText('Ultimate (Monthly)');
    });

    test('A-T4-3: Product Exploration Flow', async ({ page }) => {
      await page.goto('/');
      
      // Go to app hub via navigation bar
      await page.locator('[data-testid="nav-link-hub"]').click();
      await expect(page).toHaveURL(/\/hub/);

      // Verify stats
      const stats = page.locator('[data-testid="stat-banned-content"]');
      await expect(stats).toBeVisible();

      // Return to homepage
      await page.locator('[data-testid="hub-logout-btn"]').click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('A-T4-4: Mobile Experience Flow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const menuBtn = page.locator('[data-testid="menu-toggle-btn"]');
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      // Wait for navigation link to expand and display
      const pricingLink = page.locator('[data-testid="nav-link-pricing"]');
      await expect(pricingLink).toBeVisible();
      await pricingLink.click();

      const selectFree = page.locator('[data-testid="pricing-select-free"]');
      await expect(selectFree).toBeVisible();
      await selectFree.click();

      await expect(page).toHaveURL(/\/hub\?plan=free&billing=monthly/);
      
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toContainText('Free');
    });

    test('A-T4-5: Cross-Feature Validation Flow', async ({ page }) => {
      await page.goto('/');
      
      const header = page.locator('[data-testid="header"]');
      const footer = page.locator('[data-testid="footer"]');
      await expect(header).toBeVisible();
      await expect(footer).toBeVisible();

      // Verify multiple pricing clicks
      const toggle = page.locator('[data-testid="pricing-toggle"]');
      await toggle.click();
      await toggle.click(); // Toggle back to monthly

      const selectVip = page.locator('[data-testid="pricing-select-vip"]');
      await selectVip.click();

      await expect(page).toHaveURL(/\/hub\?plan=vip&billing=monthly/);
      
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toContainText('VIP (Monthly)');
    });

  });

});
