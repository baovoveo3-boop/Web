# Handoff Report: Milestone 2 - Admin System Settings Page (R1)

## 1. Observation
- **`app/admin/layout.tsx`** currently has a hardcoded redirect on lines 16-17:
  ```typescript
  if (!user) {
    router.push("/login?redirect=/admin");
  }
  ```
- **`app/admin/products/page.tsx`** defines `convertGoogleDriveUrl` on lines 71-83:
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
- **`e2e/settings.spec.ts`** expects:
  - Header containing `"Cấu hình Hệ thống"` (lines 249, 263)
  - Inputs with placeholders `"VD: 1.0.0"` (line 250) and `"Nhập link Google Drive..."` (line 251)
  - Save button click, followed by clicking a button with text `"Xác nhận thao tác"` in a confirmation dialog (lines 293-294)
  - Cancel button text `"Hủy"` (line 254) which leaves the database unchanged (lines 505-509)
  - Redirection of guest users visiting `/admin/settings` to `/login?redirect=%2Fadmin%2Fsettings` (line 471)

---

## 2. Logic Chain
1. To satisfy `R1-B1: Unauthenticated Redirect` (Observation 5), when a guest hits `/admin/settings`, the app must redirect them to `/login?redirect=/admin/settings`.
2. The current `app/admin/layout.tsx` hardcodes the redirect value to `/login?redirect=/admin` (Observation 1).
3. Therefore, `app/admin/layout.tsx` must be modified to use `usePathname()` from `next/navigation` to dynamically fetch the active URL path and append it as `redirect=${encodeURIComponent(pathname)}`.
4. The page `app/admin/settings/page.tsx` must render input elements containing the exact placeholders `"VD: 1.0.0"` and `"Nhập link Google Drive..."` to pass selector tests (Observation 3).
5. The page must implement a confirmation modal containing a button with the text `"Xác nhận thao tác"`. The save logic should only write to Firestore (`settings/general`) after this confirmation button is clicked, satisfying `R1-F4` and `R1-F5` (Observation 3).
6. To satisfy the Cancel modifications test `R1-B4` (Observation 4), the form must hold a copy of the originally loaded database state. Clicking the `"Hủy"` button resets the current state fields back to those initial values.

---

## 3. Caveats
- No caveats. The requirements are fully investigated and matched with the existing E2E test file (`e2e/settings.spec.ts`).

---

## 4. Conclusion
We have a concrete, complete, and e2e-compliant plan to implement R1: System Settings Page. Implementing `app/admin/settings/page.tsx` exactly as described in `proposed_settings_page.tsx`, and modifying `app/admin/layout.tsx` as shown in `proposed_layout_changes.patch`, will fully implement the settings page and satisfy all 10 settings-related tests in Playwright.

---

## 5. Verification Method
1. Inspect `E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m2_3\proposed_settings_page.tsx` and `proposed_layout_changes.patch`.
2. Once implemented by the Implementer agent, execute the Playwright test command:
   ```bash
   npx playwright test e2e/settings.spec.ts
   ```
   All R1 tests (`R1-F1`, `R1-F2`, `R1-F3`, `R1-F4`, `R1-F5`, `R1-B1`, `R1-B2`, `R1-B3`, `R1-B4`, `R1-B5`) should pass.
