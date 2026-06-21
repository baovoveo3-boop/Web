# E2E Test Suite Ready (Milestone 1)

This test suite covers the new **Tool Detail Page (`/tools/[id]`)** features, verifying UI layout, breadcrumb structures, main product info blocks, additional information blocks (How to Use & FAQs), dynamic route loading, boundary/edge cases, cross-feature transitions, and real-world user exploration journeys.

---

## 1. How to Run the Tests

To run the new E2E tests specifically:

```bash
# Run only the tool detail page tests
npx playwright test e2e/tools.spec.ts

# Or using the package script
npm run test:e2e -- e2e/tools.spec.ts
```

To run the entire E2E test suite (including landing page, scroll sequence, pricing, and app hub tests):

```bash
# Run all tests
npm run test:e2e
```

*Note: Playwright will automatically spin up the static web server (`npx http-server out -p 3000`) before running tests.*

---

## 2. Test Coverage Summary

The test file `e2e/tools.spec.ts` covers 4 Tiers of E2E verification:

### Tier 1: Feature Coverage (5 areas, 25 tests)
1. **UI Layout (Glassmorphism Dark Mode)**
   - `TD-T1-1`: Verify page background color matches dark mode zinc-950 (`rgb < 30`).
   - `TD-T1-2`: Verify Glassmorphic card styling classes (e.g. `backdrop-blur`).
   - `TD-T1-3`: Verify no horizontal layout overflow on desktop viewports (`1280x800`).
   - `TD-T1-4`: Verify visual vertical order of layout elements (Header -> Breadcrumb -> Main Container -> Footer).
   - `TD-T1-5`: Verify responsive max-width constraint for page container.
2. **Breadcrumbs / Header**
   - `TD-T1-6`: Verify `[data-testid="header"]` is visible.
   - `TD-T1-7`: Verify breadcrumb structure exists (`breadcrumb`, `breadcrumb-home`, `breadcrumb-tools`, `breadcrumb-current`).
   - `TD-T1-8`: Verify breadcrumb home node links back to homepage `/`.
   - `TD-T1-9`: Verify breadcrumb current node shows current tool name (e.g. "Ban Content").
   - `TD-T1-10`: Verify breadcrumb tools category node text.
3. **Main Info Block**
   - `TD-T1-11`: Verify showcase media container and child image/video elements exist.
   - `TD-T1-12`: Verify title, tag, and description text match tool data.
   - `TD-T1-13`: Verify features list has at least 3 feature items.
   - `TD-T1-14`: Verify pricing info displays correct price formatting.
   - `TD-T1-15`: Verify CTA button is visible and active.
4. **Additional Info Blocks**
   - `TD-T1-16`: Verify "How to Use" guide section exists.
   - `TD-T1-17`: Verify there are at least 3 steps in "How to Use".
   - `TD-T1-18`: Verify FAQ section exists.
   - `TD-T1-19`: Verify FAQ questions and answers are non-empty.
   - `TD-T1-20`: Verify FAQ interactive expansion behavior.
5. **Dynamic Route Loading**
   - `TD-T1-21`: Direct access to `/tools/ban-content` loads correct data.
   - `TD-T1-22`: Direct access to `/tools/healing-bird` loads correct data.
   - `TD-T1-23`: Verify document `<title>` updates dynamically based on active tool.
   - `TD-T1-24`: Verify state updates correctly when switching tools via hot tools sidebar navigation.
   - `TD-T1-25`: Verify `[data-testid="footer"]` is visible on detail pages.

### Tier 2: Boundary & Corner Cases (5 tests)
- `TD-T2-1`: Invalid ID Fallback: Navigating to `/tools/khong-ton-tai` displays not found container and back-home CTA.
- `TD-T2-2`: Mobile Viewport Responsiveness: Verification at `375x667` with no horizontal overflow.
- `TD-T2-3`: Long Strings Handling: Verifies layout does not break when long strings are loaded.
- `TD-T2-4`: Missing Optional Fields Handling: Renders page smoothly without unhandled errors even if optional fields (video, FAQs) are absent.
- `TD-T2-5`: Query Parameter Sanitization & Fallback on CTA: Verifies query parameters are sanitized securely and do not trigger script execution.

### Tier 3: Cross-Feature Combinations (3 tests)
- `TD-T3-1`: Navigation Loop: Verifies full funnel transitions (Home -> Detail -> Hub -> Home) match URL mappings.
- `TD-T3-2`: Theme and Asset Continuity: Verifies dark mode body styles are shared across landing, detail, and hub pages.
- `TD-T3-3`: CTA Plan Redirect with Query Params: Verifies CTAs route to `/hub?plan=vip` for Ban Content and `/hub?plan=ultimate` for Healing Bird.

### Tier 4: Real-World Application Scenarios (1 test)
- `TD-T4-1`: User Exploration Journey: Simulates a complete user walkthrough (landing on home, navigating to Healing Bird detail page, reading features/guide/FAQs, clicking CTA, and landing on the activation dashboard with the ultimate plan activated).

---

## 3. Selector Contracts Compliance

The tests strictly adhere to the standardized selector specifications:
- Container: `[data-testid="tool-detail-container"]`
- Breadcrumbs: `[data-testid="breadcrumb"]`, `[data-testid="breadcrumb-home"]`, `[data-testid="breadcrumb-tools"]`, `[data-testid="breadcrumb-current"]`
- Media: `[data-testid="tool-media-container"]`, `[data-testid="tool-image"]`, `[data-testid="tool-video"]`
- Text: `[data-testid="tool-title"]`, `[data-testid="tool-tag"]`, `[data-testid="tool-description"]`, `[data-testid="tool-price"]`
- Features: `[data-testid="tool-features-list"]`, `[data-testid="tool-feature-item"]`
- CTA Button: `[data-testid="tool-cta"]`
- Guides: `[data-testid="tool-how-to-use"]`, `[data-testid="tool-how-to-use-step"]`
- FAQ: `[data-testid="tool-faq"]`, `[data-testid="tool-faq-item"]`, `[data-testid="tool-faq-question"]`, `[data-testid="tool-faq-answer"]`
- Fallback: `[data-testid="not-found-container"]`, `[data-testid="not-found-back-home"]`
- Home Integration: `[data-testid="carousel-view-details"]`, `[data-testid="hot-tool-ban-content"]`, `[data-testid="hot-tool-healing-bird"]`
