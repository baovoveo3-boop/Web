# Handoff Report — Tool Detail Page Testing Strategy (Milestone 1)

## 1. Observation

- **Next.js Static Export Configuration**: In `next.config.js`, `output: 'export'` is active (line 3):
  ```js
  output: 'export',
  ```
- **Static Hosting in E2E Server**: In `playwright.config.ts`, the server is running from a static build folder `out` (lines 20-25):
  ```typescript
  webServer: {
    command: 'npx http-server out -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  ```
- **Existing Page Routing**: Inside `app/`, the main sections are home (`page.tsx`) and hub (`hub/page.tsx`). The home page has `HERO_PRODUCTS` containing the raw data for `Ban Content` and `Healing Bird` (lines 11-42).
- **Home Carousel Actions**: In `app/page.tsx`, the Carousel's "Xem Chi Tiết" button is currently a static button without any redirect or routing links (lines 104-106):
  ```tsx
  <button className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-105 transition transform shadow-[0_0_20px_rgba(34,197,94,0.4)] relative z-30">
    Xem Chi Tiết →
  </button>
  ```
- **E2E Testing Structure**: In `e2e/app.spec.ts` and `e2e/adversarial.spec.ts`, tests are organized by tiers (Tier 1 Feature Coverage, Tier 2 Boundaries, Tier 3 Cross-Feature, Tier 4 Real-World, Tier 5 Adversarial) using standard prefixes like `L-T1-x`, `X-T3-x`, `A-T4-x`, etc.

## 2. Logic Chain

- Since the app is built as a static site (`output: 'export'`), Next.js resolves dynamic routes like `/tools/[id]` at build time. Therefore, `app/tools/[id]/page.tsx` must implement `generateStaticParams()` to output static paths (`ban-content` and `healing-bird`).
- Direct navigation to invalid IDs (e.g. `/tools/khong-ton-tai`) will bypass client-side routing on initial load and hit the web server, which serves a 404 page. A static fallback or a robust `not-found` handler is required.
- Standardizing dynamic page IDs (e.g., `ban-content`, `healing-bird`) matching the carousel slides ensures seamless linking.
- Defining a structured set of `data-testid` attributes (selector contracts) allows decoupling tests from style variations (like glassmorphism classes) and enables consistent validation of layout elements across viewport changes.

## 3. Caveats

- We assumed that `data/tools.ts` will be created as a TypeScript file containing an array of tool data. If the structure changes to an external API or JSON file, the tests will still pass as long as they follow the `data-testid` contracts.
- E2E tests are configured to run against `out` build directory. Thus, changes in development must be built (`npm run build`) before running E2E tests (`npm run test:e2e`).

## 4. Conclusion

We have designed a 4-tier E2E Playwright test suite for the upcoming Tool Detail Page (`/tools/[id]`), aligned with the project's existing hierarchy and testing conventions. It covers UI, navigation, media block, additional guides (FAQ, How to Use), dynamic routes, mobile responsiveness, and custom 404 fallback page logic. Implementing the detailed `data-testid` attributes in the React components will ensure a high-coverage, maintainable, and robust implementation of Milestone 1.

## 5. Verification Method

To verify the strategy and selectors once the implementer finishes:
1. Ensure the new page `/tools/[id]` is implemented.
2. Build the app using:
   ```bash
   npm run build
   ```
3. Run the E2E tests:
   ```bash
   npm run test:e2e
   ```
4. Verify the test suite outputs successful execution and no failures occur on chromium desktop or mobile viewports.
