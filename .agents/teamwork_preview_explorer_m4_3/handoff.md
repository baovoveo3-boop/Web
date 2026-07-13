# Handoff Report — Milestone 4 (R3: Public Download Page & Navbar)

## 1. Observation
- Observed `components/Header.tsx` path and structure.
  - The component imports `usePathname` on line 5:
    `import { usePathname } from 'next/navigation';`
  - Current desktop navigation is on lines 105-125:
    ```tsx
    106:           <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
    107:             <Link href="/" data-testid="nav-link-home" className="text-zinc-300 hover:text-white transition flex items-center gap-1">
    108:               <span>🏠</span> Trang chủ
    109:             </Link>
    ...
    ```
  - Current mobile navigation is on lines 202-219:
    ```tsx
    202:           <Link href="/" data-testid="nav-link-home" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={() => setIsOpen(false)}>
    203:             <span>🏠</span> Trang chủ
    204:           </Link>
    ...
    ```
- Observed `e2e/settings.spec.ts` test expectations:
  - Test suite defines sub-tests under `R3: Public Download Page` (lines 415-463) and boundary cases (lines 629-689).
  - Missing settings check (`R3-B1`):
    `await expect(page.locator('text=Không tìm thấy phiên bản ứng dụng')).toBeVisible();`
    `const dlBtn = page.locator('button:has-text("Tải App Launcher")');`
    `await expect(dlBtn).toBeDisabled();`
  - Version & URL Binding check (`R3-F2`):
    `await expect(page.locator('text=Phiên bản: 1.9.9')).toBeVisible();`
    `const dlButton = page.locator('a:has-text("Tải App Launcher"), button:has-text("Tải App Launcher")');`
    `await expect(dlButton).toHaveAttribute('href', 'https://example.com/launcher.exe');`
  - Target blank check (`R3-F3`):
    `const dlButton = page.locator('a:has-text("Tải App Launcher")');`
    `await expect(dlButton).toHaveAttribute('target', '_blank');`
  - Navbar active check (`R3-B4`):
    `const activeLink = page.locator('header a[href="/download"]');`
    `await expect(activeLink).toHaveClass(/active|text-neonPurple/);`

---

## 2. Logic Chain
- **Step 1 (Pathname detection)**: In `Header.tsx`, `usePathname` retrieves the active route. By checking `pathname === '/download'`, we can dynamically apply active css classes.
- **Step 2 (Active navbar style requirement)**: Since `R3-B4` expects the active link to have a class matching `/active|text-neonPurple/`, adding the classes `text-neonPurple active` satisfies the check.
- **Step 3 (Missing db document fallback)**: If `settings/general` is missing or incomplete, the warning text `Không tìm thấy phiên bản ứng dụng` must be shown, and the action button must be disabled. Under standard HTML, an `<a>` tag cannot be natively disabled. Therefore, we should render a `<button disabled>` tag when settings are missing/invalid, and an `<a>` tag when settings are present. This aligns with Playwright selecting either `a:has-text("Tải App Launcher")` or `button:has-text("Tải App Launcher")`.
- **Step 4 (Cache and updates)**: Fetching configuration on the client side using Firebase Client SDK (`getDoc` within `useEffect`) ensures that every page load/reload calls the Firestore API directly, validating dynamic updates as required by `R3-B3: Stale Cache Validation`.

---

## 3. Caveats
- Playwright tests mock the Firestore client on the client-side (`window.mockDbState`). Therefore, client-side data fetching (`"use client"`) is required to ensure the E2E mocks work correctly. Standard server-side dynamic rendering would bypass client-side database mocks and cause tests to fail.

---

## 4. Conclusion
The implementation plan for Milestone 4 (R3) consists of:
1. Creating `app/download/page.tsx` as a Client Component utilizing the standard Firestore client SDK to query `settings/general`.
2. Rendering dynamic page states: loader spinner during fetch, `<button disabled>` and a warning message if config is missing, and `<a>` with `target="_blank"` and `href` if config is valid.
3. Updating `components/Header.tsx` to insert the `/download` link for desktop and mobile layouts with `active` / `text-neonPurple` conditional styling classes.

---

## 5. Verification Method
- Execute the Playwright E2E suite locally:
  `npx playwright test e2e/settings.spec.ts`
- Expected outcome: All `R3` tests (`R3-F1` to `R3-F5` and `R3-B1` to `R3-B5`) pass successfully.
