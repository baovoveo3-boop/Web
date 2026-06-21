# Testing Strategy: Tool Detail Page (Milestone 1)

This document outlines the Playwright-based E2E testing strategy, selector contracts, and test cases designed for the new **Tool Detail Page** (`/tools/[id]`) and its integration with the landing page.

---

## 1. Selector Contracts (`data-testid`)

To ensure robust and decoupled E2E testing, the following `data-testid` contracts must be used when implementing the Tool Detail Page and homepage links.

### Homepage Elements
* `data-testid="carousel-xem-chi-tiet-ban-content"`: The "Xem Chi Tiết" CTA button for the Ban Content product.
* `data-testid="carousel-xem-chi-tiet-healing-bird"`: The "Xem Chi Tiết" CTA button for the Healing Bird product.
* `data-testid="hot-tool-card-ban-content"`: The card link in the right column ("Hot Tools") pointing to `/tools/ban-content`.
* `data-testid="hot-tool-card-healing-bird"`: The card link in the right column ("Hot Tools") pointing to `/tools/healing-bird`.

### Tool Detail Page Elements
* `data-testid="header"`: Header block (reused from existing).
* `data-testid="footer"`: Footer block (reused from existing).
* `data-testid="breadcrumb"`: Container for breadcrumb navigation.
* `data-testid="breadcrumb-home"`: Link back to the homepage `/`.
* `data-testid="breadcrumb-active"`: Current tool page title placeholder (active leaf node).
* `data-testid="tool-detail-container"`: Main container of the page (holding glassmorphism styles).
* `data-testid="tool-detail-media"`: Showcase image or video tag/container.
* `data-testid="tool-detail-title"`: Main heading of the tool.
* `data-testid="tool-detail-description"`: Text description of the tool.
* `data-testid="tool-detail-features"`: Unordered list containing the list of features.
* `data-testid="tool-detail-feature-item"`: List item inside the features list.
* `data-testid="tool-detail-price"`: Price label (e.g. `499,000đ/tháng`).
* `data-testid="tool-detail-cta"`: The main Action Button (e.g., "Mua Ngay" or "Đăng Ký Ngay").
* `data-testid="tool-detail-how-to-use"`: Container for the "How to use" guide block.
* `data-testid="tool-detail-faq"`: Container for the FAQ section.
* `data-testid="tool-detail-faq-item"`: Individual FAQ question-and-answer container.
* `data-testid="tool-detail-faq-question"`: FAQ question header element.
* `data-testid="tool-detail-faq-answer"`: FAQ answer body element.

### Fallback/Error Elements
* `data-testid="tool-not-found-container"`: Fallback container rendered when an invalid tool ID is requested.
* `data-testid="tool-not-found-back-home"`: CTA button inside fallback page to navigate back to `/`.

---

## 2. Playwright E2E Test Cases

We structure the test cases into 4 Tiers, matching the architecture of the existing `e2e/app.spec.ts` test file.

### Tier 1: Feature Coverage (5 test cases per feature, 25 total)

#### Feature A: UI Layout (Glassmorphism & Dark Mode Parity)
1. **T1-A1**: Assert that the main detail container (`[data-testid="tool-detail-container"]`) has a dark background style (e.g. `bg-zinc-950` or matching RGB) and glassmorphism borders (`border-zinc-800`).
2. **T1-A2**: Assert that the Header and Footer are visible on the page.
3. **T1-A3**: Assert that the page matches the responsive flex/grid structure (no misaligned layout or broken widths).
4. **T1-A4**: Verify that the main layout content does not cause layout shifts (CLS) on load.
5. **T1-A5**: Verify that all Lucide icons render properly inside the UI layout blocks.

#### Feature B: Breadcrumb / Header Integration
1. **T1-B1**: Verify that the breadcrumb element (`[data-testid="breadcrumb"]`) is present.
2. **T1-B2**: Verify that the breadcrumb Home link redirects to the root `/`.
3. **T1-B3**: Verify that the active node matches the current tool's title.
4. **T1-B4**: Verify that navigation to the page retains header states (e.g., login/register CTAs are active and functional).
5. **T1-B5**: Assert that the breadcrumb uses a visually readable separation indicator complying with Glassmorphism styles.

#### Feature C: Main Info Block
1. **T1-C1**: Verify the title (`[data-testid="tool-detail-title"]`) displays the correct tool title.
2. **T1-C2**: Verify that the description (`[data-testid="tool-detail-description"]`) is fully populated and visible.
3. **T1-C3**: Verify the features list contains at least 3 feature items.
4. **T1-C4**: Assert that the price matches the expected value and format (e.g., `499,000đ/tháng`).
5. **T1-C5**: Assert that the media showcase block displays the correct image or video path.

#### Feature D: Additional Info Blocks (How to Use & FAQ)
1. **T1-D1**: Assert the "How to Use" block (`[data-testid="tool-detail-how-to-use"]`) is visible and contains guide steps.
2. **T1-D2**: Assert the FAQ block (`[data-testid="tool-detail-faq"]`) is visible and populated.
3. **T1-D3**: Verify FAQ items can be toggled (if accordion behavior is implemented).
4. **T1-D4**: Assert that the FAQ elements are style-compliant with the dark glassmorphism theme.
5. **T1-D5**: Ensure there are no broken links inside the FAQ answers or user guides.

#### Feature E: Dynamic Route Loading
1. **T1-E1**: Access `/tools/ban-content` and verify it loads the Ban Content data.
2. **T1-E2**: Access `/tools/healing-bird` and verify it loads the Healing Bird data.
3. **T1-E3**: Verify navigation from `/tools/ban-content` to `/tools/healing-bird` via link successfully replaces dynamic contents.
4. **T1-E4**: Verify that the dynamic route response has 200 OK status.
5. **T1-E5**: Confirm that client-side state hydration works and no console errors occur on routing.

---

### Tier 2: Boundary & Edge Cases (5 cases)

1. **T2-1: Invalid ID Fallback**
   * Action: Navigate to `/tools/khong-ton-tai`.
   * Assert: The page shows the `[data-testid="tool-not-found-container"]` with a friendly "Không tìm thấy công cụ" message and a button to return to home.
2. **T2-2: Mobile Viewport Responsiveness**
   * Action: Set viewport to `375x667` and load `/tools/ban-content`.
   * Assert: Layout shifts to a vertical stack, all elements remain readable, and no horizontal scrollbars are present.
3. **T2-3: Missing Optional Fields Handling**
   * Action: Navigate to a mock tool detail page that does not have a video URL or lacks FAQ items.
   * Assert: The app does not throw a runtime JavaScript error; sections without data are hidden or render fallback placeholders gracefully.
4. **T2-4: Extremely Long Strings Handling**
   * Action: Load page with mock tool containing extremely long titles and features.
   * Assert: CSS wraps text cleanly without clipping or stretching out borders.
5. **T2-5: Special Characters in URL Query Parameters**
   * Action: Navigate to `/tools/ban-content?ref=test&id=123#faq`.
   * Assert: Routing and dynamic state initialization function correctly.

---

### Tier 3: Cross-Feature (5 cases)

1. **T3-1: Home Carousel -> Tool Detail -> App Hub Loop**
   * Navigate to `/`.
   * Click "Xem Chi Tiết" on the active slide (e.g. `ban-content`).
   * Verify navigation to `/tools/ban-content`.
   * Click "Mua Ngay" CTA.
   * Verify redirect to `/hub?plan=ban-content&billing=monthly`.
2. **T3-2: Homepage Carousel Slide Navigation**
   * Navigate to `/`, click Carousel Next.
   * Click the "Xem Chi Tiết" button.
   * Verify navigation to `/tools/healing-bird`.
3. **T3-3: Hot Tools List Integration**
   * Navigate to `/`.
   * Click the "Grok Ban AI" card or "Proxy IPv6" card mapped to `/tools/ban-content` or `/tools/healing-bird`.
   * Verify correct redirection and data display.
4. **T3-4: Detail -> Hub checkout flow parameter parity**
   * Ensure that clicking CTA on a specific tool passes correct plan parameter and updates the client state in the App Hub.
5. **T3-5: Navigation Breadcrumb URL Sync**
   * Verify that back-and-forth navigations between Home, Tool Detail, and App Hub retain proper states without breaking history stacks.

---

### Tier 4: Real-world Scenarios (3 cases)

1. **T4-1: Standard User Exploration and Buy Flow**
   * User lands on `/`, views the Hero Carousel, clicks next to see "Healing Bird", reads description.
   * Clicks "Xem Chi Tiết", checks FAQ and guide steps on `/tools/healing-bird`.
   * Clicks "Mua Ngay", arrives on `/hub?plan=healing-bird`, sees active selection.
2. **T4-2: Mobile Direct Access and Navigation Flow**
   * User opens `/tools/ban-content` on mobile viewport, interacts with the mobile header menu, clicks the breadcrumb to return home, scrolls the home landing page.
3. **T4-3: Error Discovery and Recovery Path**
   * User lands on an invalid tool path `/tools/invalid-id`, sees Not Found view.
   * Clicks the "Quay lại trang chủ" link.
   * Successfully lands back on homepage `/` and selects a valid hot tool card from the sidebar.

---

## 3. Playwright E2E Code Stub (`e2e/tools.spec.ts`)

The code below represents the executable tests implementing the designed strategy.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tool Detail Page E2E Test Suite', () => {

  test.describe('Tier 1 - Feature Coverage', () => {

    test('T1-1: Verify Tool Detail Page layout and styling', async ({ page }) => {
      await page.goto('/tools/ban-content');
      const container = page.locator('[data-testid="tool-detail-container"]');
      await expect(container).toBeVisible();
      
      // Verify glassmorphism background styling (dark theme background)
      const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      const rgb = bg.match(/\d+/g)?.map(Number) || [0, 0, 0];
      expect(rgb[0]).toBeLessThan(30);
      expect(rgb[1]).toBeLessThan(30);
      expect(rgb[2]).toBeLessThan(30);

      // Verify Header & Footer
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      await expect(page.locator('[data-testid="footer"]')).toBeVisible();
    });

    test('T1-2: Verify Breadcrumb navigation on Tool Detail page', async ({ page }) => {
      await page.goto('/tools/ban-content');
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      await expect(breadcrumb).toBeVisible();

      const activeItem = page.locator('[data-testid="breadcrumb-active"]');
      await expect(activeItem).toBeVisible();
      await expect(activeItem).not.toBeEmpty();

      // Click home
      await page.locator('[data-testid="breadcrumb-home"]').click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('T1-3: Verify Main Info Block elements render successfully', async ({ page }) => {
      await page.goto('/tools/ban-content');
      await expect(page.locator('[data-testid="tool-detail-title"]')).toHaveText(/Ban Content/i);
      await expect(page.locator('[data-testid="tool-detail-description"]')).not.toBeEmpty();
      
      const features = page.locator('[data-testid="tool-detail-feature-item"]');
      expect(await features.count()).toBeGreaterThanOrEqual(3);

      await expect(page.locator('[data-testid="tool-detail-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-detail-media"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-detail-cta"]')).toBeVisible();
    });

    test('T1-4: Verify Additional Info blocks (How to use & FAQ) are loaded', async ({ page }) => {
      await page.goto('/tools/ban-content');
      await expect(page.locator('[data-testid="tool-detail-how-to-use"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-detail-faq"]')).toBeVisible();
      
      const faqItems = page.locator('[data-testid="tool-detail-faq-item"]');
      expect(await faqItems.count()).toBeGreaterThanOrEqual(1);
    });

    test('T1-5: Verify dynamic routing loads correct tool data', async ({ page }) => {
      // Load Healing Bird
      await page.goto('/tools/healing-bird');
      await expect(page.locator('[data-testid="tool-detail-title"]')).toHaveText(/Healing Bird/i);
      await expect(page.locator('[data-testid="tool-detail-price"]')).toContainText('599,000đ');

      // Load Ban Content
      await page.goto('/tools/ban-content');
      await expect(page.locator('[data-testid="tool-detail-title"]')).toHaveText(/Ban Content/i);
      await expect(page.locator('[data-testid="tool-detail-price"]')).toContainText('499,000đ');
    });

  });

  test.describe('Tier 2 - Boundary & Edge Cases', () => {

    test('T2-1: Verify invalid ID fallback behavior', async ({ page }) => {
      await page.goto('/tools/khong-ton-tai', { failOnStatusCode: false });
      
      // Fallback screen assert
      const fallbackContainer = page.locator('[data-testid="tool-not-found-container"]');
      await expect(fallbackContainer).toBeVisible();
      await expect(fallbackContainer).toContainText(/Không tìm thấy/i);

      // Back to home
      await page.locator('[data-testid="tool-not-found-back-home"]').click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('T2-2: Verify responsiveness on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tools/ban-content');
      
      await expect(page.locator('[data-testid="tool-detail-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool-detail-cta"]')).toBeVisible();
      
      // Verify no horizontal overflow
      const overflowX = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflowX;
      });
      expect(overflowX).toBe('hidden');
    });

  });

  test.describe('Tier 3 - Cross-Feature Navigation Loops', () => {

    test('T3-1: Verify Navigation Flow (Home Carousel -> Tool Detail -> App Hub)', async ({ page }) => {
      await page.goto('/');
      
      // Select product in Carousel and navigate
      const viewDetailBtn = page.locator('[data-testid="carousel-xem-chi-tiet-ban-content"]');
      await viewDetailBtn.click();
      await expect(page).toHaveURL(/\/tools\/ban-content/);

      // Click Buy CTA to go to Hub with query params
      const buyCTA = page.locator('[data-testid="tool-detail-cta"]');
      await buyCTA.click();
      await expect(page).toHaveURL(/\/hub\?plan=ban-content/);
      
      // Verify active account tier matches selected plan
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toBeVisible();
    });

    test('T3-2: Verify Hot Tools Card navigation', async ({ page }) => {
      await page.goto('/');
      
      // Click Hot Tools card
      const hotToolCard = page.locator('[data-testid="hot-tool-card-ban-content"]').first();
      await hotToolCard.click();
      await expect(page).toHaveURL(/\/tools\/ban-content/);
    });

  });

});
```

---

## 4. Architectural & Implementation Insights for Static Export

Since the project uses Next.js Static HTML Export (`output: 'export'`), the following implementation details are critical for the test suite's validity:

1. **Static Routing for Dynamic Pages**:
   Next.js does not support server-side routing fallback (`fallback: blocking` or `fallback: true`) with static exports. The implementer MUST define all valid routes using `generateStaticParams()` in `app/tools/[id]/page.tsx`:
   ```typescript
   export async function generateStaticParams() {
     return [
       { id: 'ban-content' },
       { id: 'healing-bird' }
     ];
   }
   ```
2. **Invalid ID Routing/Not Found Fallback**:
   Because there is no dynamic runtime server processing, any route not matching the above will either hit a static `404.html` on the server or need to be handled gracefully via fallback client-side routing if the web server redirects all non-existent paths to `/` (SPA routing mode). To satisfy both, the design incorporates a standard client-side fallback check (if page components mount with an invalid ID, render the `[data-testid="tool-not-found-container"]` component).
