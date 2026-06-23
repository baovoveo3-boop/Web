# Handoff Report — Homepage Coming Soon Empty State design

## 1. Observation
*   **Target Code File**: `E:\Youtube\Ban Content\Web\app\page.tsx`.
*   **Tools Render Block**: Lines 351-473:
    ```tsx
    {TOOLS.length > 5 ? (
      <ElasticCarousel>
        {TOOLS.slice(0, 5).map((tool) => { ... })}
      </ElasticCarousel>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => { ... })}
      </div>
    )}
    ```
*   **Courses Render Block**: Lines 487-538:
    ```tsx
    <div className={
      COURSES.length > 5 
        ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }>
      {COURSES.slice(0, 5).map((course) => { ... })}
    </div>
    ```
*   **History & Comments**: We audited the git history via `.git/logs/HEAD` and found only a single initial commit:
    `0000000000000000000000000000000000000000 23ad5275e89602aaad142d2848a39b7b6558d870 baovoveo3-boop <baovoveo3@gmail.com> 1782060192 +0700 commit (initial): Initial commit`
    This proves there is no historical "Sắp ra mắt" card code checked into git. Additionally, we checked `data/tools.ts`, `data/courses.ts`, `data/store.ts`, and `app/page.tsx` and found no commented-out layout files.
*   **Scraped Artifacts**: Check `scraped_content.txt` line 45 which lists `Đang cập nhật những khóa học chất lượng cao`.

---

## 2. Logic Chain
1.  **Empty Array Mapping Behavior** (from Observation 1): When the Firestore products catalog is empty, `TOOLS.length` and `COURSES.length` will both be `0`. The current page logic maps over these empty arrays without any checks, resulting in empty layouts under the section headers.
2.  **Design Recovery** (from Observation 2): Since no historical implementation exists in the git records, the Coming Soon cards must be designed from scratch.
3.  **Glassmorphic Design Parity** (from existing codebase files like `components/ToolDetailClient.tsx`): The new fallback cards must match the existing UI. By styling the cards with translucent dark elements (`bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]`), they integrate smoothly.
4.  **twinkle & Glow Animations** (from existing animations like `components/CircuitAnimation.tsx`): High-fidelity card features can be added via CSS Keyframes inside a scoped `<style>` block using `dangerouslySetInnerHTML` combined with Tailwind `animate-ping` parameters, avoiding any global style dependencies.
5.  **E2E Selector Contracts**: Standardizing test IDs (`coming-soon-grid`, `coming-soon-card`, `coming-soon-title`, `coming-soon-badge`) allows Playwright to intercept Firebase's `getDocs` API call and verify fallback page renders.

---

## 3. Caveats
*   **Command Execution Approval**: We did not compile the build or execute Playwright tests locally, as terminal command requests timed out awaiting manual approval in this non-interactive environment.
*   **Flicker Control**: The empty state check must only run after the asynchronous loading state (`loading`) becomes `false`, preventing layout shifting on page load.

---

## 4. Conclusion
*   We proposed a comprehensive strategy and styling blueprint to implement high-fidelity glassmorphic "Sắp ra mắt" fallback cards (with twinkle star and hover shimmer effects) in `app/page.tsx` when the products collection is empty.
*   The fallback cards support proper E2E contracts (`data-testid="coming-soon-card"`).

---

## 5. Verification Method
*   **Static Inspection**: Confirm design specs and component structures in `E:\Youtube\Ban Content\Web\.agents\explorer_homepage_empty_state_3\analysis.md`.
*   **Build Check**: Execute `npm run build` in the `Web/` project root directory and ensure the static build compiles without errors.
*   **E2E Validation**: Execute Playwright tests using `npx playwright test`. Use the proposed initial script injection to mock empty database responses and ensure the cards display correctly.
