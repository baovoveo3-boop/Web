# Handoff Report: Public Download Page & Navbar (R3)

## 1. Observation
We analyzed the following files in the codebase:
- **`components/Header.tsx`** (Lines 106-125 & 202-220): Displays desktop and mobile navigation links. Uses `usePathname()` to track route active state.
- **`app/admin/settings/page.tsx`** (Lines 50, 99): Identifies that settings data is stored in the Firestore document path `settings/general` and maps to fields: `download_url`, `version`, and `force_update`.
- **`e2e/settings.spec.ts`** (Lines 415-465, 629-692, and 885-931): Specifies assertions for public access, version display, URL binding, redirection targets, and boundary/fallback states:
  - Line 430: `await expect(page.locator('text=Phiên bản: 1.9.9')).toBeVisible();`
  - Line 432: `const dlButton = page.locator('a:has-text("Tải App Launcher"), button:has-text("Tải App Launcher")');`
  - Line 444: `await expect(dlButton).toHaveAttribute('target', '_blank');`
  - Line 636: `await expect(page.locator('text=Không tìm thấy phiên bản ứng dụng')).toBeVisible();`
  - Line 638: `await expect(dlBtn).toBeDisabled();` (where `dlBtn` is located as `button:has-text("Tải App Launcher")`).
  - Line 676: `await expect(activeLink).toHaveClass(/active|text-neonPurple/);`

---

## 2. Logic Chain
1. **Navbar Styling Matching**: To satisfy `R3-B4: Navbar Active Styling`, the navigation link in `Header.tsx` must conditionalize its class list. If the pathname is `/download`, it must have the class `active` or `text-neonPurple`.
2. **Client-Side Firestore Loading**: The E2E tests mock database calls by intercepting the browser window's Webpack chunk exports of the Firestore SDK (`window.webpackChunk_N_E.push` in `e2e/settings.spec.ts` line 53). Therefore, we must implement client-side data fetching (using standard React client hooks) rather than Next.js Server Components.
3. **Download Button / Disabled State Behavior**:
   - When the settings document exists and has `download_url`, the page must render an anchor `<a>` tag with `target="_blank"` pointing to the url.
   - When the settings document is missing or the download URL is empty, the page must display a warning: `"Không tìm thấy phiên bản ứng dụng"`, and render a `<button>` tag that has the `disabled` attribute.
   - The label of the button must contain `"Tải App Launcher"`. Using `"Tải App Launcher cho PC"` satisfies both the user's aesthetic requirements and the test locator.

---

## 3. Caveats
- No actual code modifications were made as the Explorer role is strictly read-only.
- Assumed standard React client-side hooks are suitable for fetching the Firestore settings dynamically.

---

## 4. Conclusion
Implementing the R3 requirements requires:
- Creating a `"use client"` route at `app/download/page.tsx` that fetches `settings/general` from Firestore on mount.
- Handing over the active state conditionally between a functional `<a>` tag and a disabled `<button>` tag, showing the error message `"Không tìm thấy phiên bản ứng dụng"` if Firestore is empty.
- Injecting the `"Download"` tab in the desktop and mobile navbars in `components/Header.tsx` with proper Tailwind active routing class conditions.

---

## 5. Verification Method
1. Run the local dev server: `npm run dev` and visit `/download` to visually inspect the glassmorphism design.
2. Run the Playwright test suite to execute the exact validation suite:
   ```bash
   npx playwright test e2e/settings.spec.ts -g "R3"
   ```
3. Run the complete codebase build:
   ```bash
   npm run build
   ```
