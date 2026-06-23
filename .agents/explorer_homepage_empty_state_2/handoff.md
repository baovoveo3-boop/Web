# Handoff Report — Homepage Coming Soon Empty State design

## 1. Observation
*   **Target File**: `app/page.tsx`
*   **Code Structure**: The rendering logic in `app/page.tsx` directly queries Firestore via `useStoreProducts()`.
    *   *Tools Section* (line 351-473): Checked `TOOLS.length > 5` for carousel vs grid mapping, but failed to handle `TOOLS.length === 0`, which renders an empty grid wrapper when products are empty.
    *   *Courses Section* (line 475-541): Rendered `COURSES.slice(0, 5)` mapping without any empty checks or loading indicators, causing the section to be empty when courses are missing.
*   **Design History**: We analyzed other agent reports, components, and helper scripts in the `.agents/` folder and confirmed that the original "Sắp ra mắt" glow/sparkle cards are missing from the codebase.
*   **Git Logs**: Checked `.git/logs/HEAD` and confirmed only 1 commit ("Initial commit") exists in the local git history. Therefore, no historical card designs could be extracted from prior commits.
*   **E2E Test Suite**: Checked `e2e/app.spec.ts` and `e2e/tools.spec.ts` and confirmed no existing tests cover empty states for tools or courses.

---

## 2. Logic Chain
*   **Observation 1 (Missing checks)** -> To prevent the page from showing empty headers and lists when Firestore is empty, we must add a conditional check on `TOOLS.length` and `COURSES.length` once `loading` is `false`.
*   **Observation 2 (Glassmorphism Dark Theme)** -> To match the visual parity of the landing page, the fallback Coming Soon cards must adapt the glassmorphic styling system. By applying `bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80` and `hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]`, the cards align perfectly with the theme.
*   **Observation 3 (Glow / Shimmer / Sparkle)** -> We recreate high-fidelity animated effects by adding:
    1.  An absolute positioned blurred radial gradient backdrop (e.g. `bg-neonPurple/20`) for the glow.
    2.  `animate-ping` indicators with varying animation-durations to mimic blinking stars/sparkles.
    3.  A linear gradient reflection shimmer shifting across the card on hover using custom `@keyframes shimmer` injected via `dangerouslySetInnerHTML` to keep the code modular and self-contained.
*   **Observation 4 (Lack of E2E tests)** -> We define `data-testid` contracts (`coming-soon-grid`, `coming-soon-card`, `coming-soon-title`, `coming-soon-badge`) so that Playwright can mock Firestore to return 0 products and verify that 3 fallback cards are rendered for both tools and courses.

---

## 3. Caveats
*   **No Active Run Attestation**: We did not execute build or E2E commands locally as terminal execution timed out due to non-interactive environment approvals.
*   **Firestore Sync**: This design assumes that the empty state is only evaluated after the async fetching is complete (`loading === false`). Using `loading` in the conditional rendering prevents layout shifts/flickering.

---

## 4. Conclusion
*   We proposed a complete design and implementation strategy to build high-fidelity Glassmorphic "Sắp ra mắt" fallback cards on the homepage when the products list is empty.
*   The strategy adds custom animations (sparkles and shimmer) and incorporates standard E2E selector contracts (`data-testid="coming-soon-card"`).

---

## 5. Verification Method
1.  **Code Review**: Verify the strategy and exact JSX/CSS templates inside `E:\Youtube\Ban Content\Web\.agents\explorer_homepage_empty_state_2\analysis.md`.
2.  **Implementation Check**: Once the worker implements the cards, run:
    ```bash
    npm run build
    ```
    Confirm that the static export compiles successfully.
3.  **Run E2E Tests**: Run:
    ```bash
    npx playwright test
    ```
    Verify that all tests pass, and write a new test case mocking empty Firestore products to assert that `coming-soon-card` elements are rendered.
