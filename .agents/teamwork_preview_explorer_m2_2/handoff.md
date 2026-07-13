# Handoff Report — Milestone 2: Admin System Settings (R1)

This handoff report summarizes the findings, reasoning, implementation plan, and verification strategy for R1 (System Settings Page).

---

## 1. Observation

During read-only inspection, the following files and code blocks were examined:

### A. Sidebar Navigation (`app/admin/layout.tsx`):
Lines 51-62 contain the navigation menu:
```typescript
<nav className="flex flex-col gap-1">
  <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    📊 Thống kê Tổng quan
  </Link>
  <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    📦 Quản lý Sản phẩm
  </Link>
  <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    💳 Giao dịch & Đơn hàng
  </Link>
  <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    👥 Quản lý Người dùng
  </Link>
</nav>
```
Lines 76-89 contain the mobile quick navigation bar:
```typescript
<div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-zinc-800">
  <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
    📊 Thống kê
  </Link>
  ...
</div>
```

### B. Google Drive Link Conversion (`app/admin/products/page.tsx`):
Lines 71-83 define the utility function:
```typescript
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  const fileMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }
  const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes("drive.google.com/open") && openMatch && openMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  return trimmed;
};
```

### C. E2E Settings Specifications (`e2e/settings.spec.ts`):
Lines 244-255 verify the UI requirements of R1 settings page:
```typescript
await expect(page.locator('h1, h2')).toContainText('Cấu hình Hệ thống');
await expect(page.locator('input[placeholder="VD: 1.0.0"]')).toBeVisible();
await expect(page.locator('input[placeholder="Nhập link Google Drive..."]')).toBeVisible();
await expect(page.locator('button[role="switch"], input[type="checkbox"]')).toBeVisible();
await expect(page.locator('button:has-text("Lưu"), button[type="submit"]')).toBeVisible();
await expect(page.locator('button:has-text("Hủy")')).toBeVisible();
```
Lines 293-294 verify the save action utilizes a confirmation modal:
```typescript
await page.click('button:has-text("Lưu"), button[type="submit"]');
await page.click('button:has-text("Xác nhận thao tác")');
```

---

## 2. Logic Chain

Based on the observations:
1. To satisfy **R1-F1 (Page Element Rendering)**, the new file `app/admin/settings/page.tsx` must be created. The page title must contain `"Cấu hình Hệ thống"`, inputs must have placeholders `"VD: 1.0.0"` (version) and `"Nhập link Google Drive..."` (download_url), the force update control must be a checkbox or switch, and the page must render a `"Lưu"` button and a `"Hủy"` button.
2. To satisfy **R1-F4 (Save Configuration Flow)**, when the submit/save button is clicked, changes must not be directly written. A confirmation modal/dialog must appear. Once the user clicks the button inside the modal containing the exact text `"Xác nhận thao tác"`, the Firestore write (`setDoc(doc(db, "settings", "general"), data)`) and audit logging (`logAdminAction`) are executed.
3. To satisfy **R1-F5 (Google Drive link Auto-Conversion)**, the helper function `convertGoogleDriveUrl` must be executed on the input download link before saving to the database.
4. To satisfy **R1-B4 (Cancel Modifications)**, the `"Hủy"` button must revert inputs to the values stored in `lastSavedData` state (fetched from the database).
5. To satisfy sidebar requirements, the file `app/admin/layout.tsx` must be updated to insert a new link to `/admin/settings` on both desktop and mobile layouts.

---

## 3. Caveats

- Playwright tests run with mocked firebase states injected on the client side (`page.addInitScript`). The component implementation must use client-side hooks (`useEffect`, `useState`, `useAuth`) and Firestore client functions (`getDoc`, `setDoc`, `doc`) in alignment with client-side data binding rather than Server Components, since the test mocks client-side calls.
- The other pages mentioned in the test suite (like `/download` or `products` updates) are out-of-scope for R1, so we assume they are handled by other tasks/Milestones.

---

## 4. Conclusion

The settings page should be implemented exactly as described in `analysis.md`. This setup covers the layout links, page fields, Google Drive URL conversion logic, save/cancel behavior, confirmation modal, and audit logs. Doing so will ensure full compliance with the Playwright test suite.

---

## 5. Verification Method

To verify the implementation:
1. Compile and build the project to verify TypeScript compiles correctly without errors:
   ```bash
   npm run build
   ```
2. Run Playwright end-to-end settings test suite:
   ```bash
   npx playwright test e2e/settings.spec.ts
   ```
   Or target settings page specific tests directly:
   ```bash
   npx playwright test -g "R1: System Settings Page"
   ```
