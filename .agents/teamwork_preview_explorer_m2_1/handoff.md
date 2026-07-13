# Handoff Report — Milestone 2: Admin System Settings (R1)

## 1. Observation
We observed the following exact file paths and segments in the codebase:
- **`app/admin/layout.tsx`** contains the layout routing check at lines 14-22:
  ```tsx
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (userData && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/");
      }
    }
  }, [user, userData, loading, router]);
  ```
  And navigation menus at lines 51-63 (Sidebar) and lines 76-89 (Mobile).
- **`app/admin/products/page.tsx`** contains Google Drive conversion logic at lines 71-83:
  ```tsx
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
  And confirmation modal pattern at lines 1250-1276.
- **`e2e/settings.spec.ts`** contains settings page E2E test suite expecting elements such as:
  - Heading containing "Cấu hình Hệ thống"
  - `input[placeholder="VD: 1.0.0"]`
  - `input[placeholder="Nhập link Google Drive..."]`
  - `button[role="switch"], input[type="checkbox"]`
  - `button:has-text("Lưu"), button[type="submit"]`
  - `button:has-text("Hủy")`
  - Modal action confirmation `button:has-text("Xác nhận thao tác")`
  - Redirect checks expecting `login?redirect=%2Fadmin%2Fsettings`

---

## 2. Logic Chain
- **Layout Redirect Update**: Line 17 of `app/admin/layout.tsx` currently hardcodes the redirect URL: `router.push("/login?redirect=/admin")`. Changing this to dynamic encoding of the current path (retrieved via `usePathname()`) satisfies the E2E requirement for `R1-B1` which redirects unauthenticated users going to `/admin/settings` directly to `/login?redirect=%2Fadmin%2Fsettings`.
- **UI Elements Matching**: To satisfy E2E rendering and functional requirements, we must create `app/admin/settings/page.tsx` containing the specific placeholders, switches, and submission/cancellation buttons tested in `e2e/settings.spec.ts`.
- **Google Drive Conversion**: Reusing the URL regex matching logic from `app/admin/products/page.tsx` on save satisfies the requirement to convert Google Drive sharing/view links into direct download links before Firestore database write.
- **Confirmation Step**: Because `e2e/settings.spec.ts` explicitly clicks a button with the text `"Xác nhận thao tác"`, we must display a confirmation dialog upon form submission and perform the actual database write inside its confirmation callback.

---

## 3. Caveats
- No other configuration settings documents are checked besides the `settings` collection and `general` document.
- Fallbacks for a missing `settings/general` document are required so the page doesn't crash on load if Firestore has not been initialized.
- No direct source file modifications were made, as this is a read-only investigation.

---

## 4. Conclusion
To implement R1: System Settings Page, the next developer must:
1. Update `app/admin/layout.tsx` to handle dynamic login redirection using `usePathname()`.
2. Add navigation links for `/admin/settings` (label "Cài đặt Hệ thống" / "Cài đặt") to the layout sidebar and mobile nav list.
3. Create `app/admin/settings/page.tsx` to load/save settings from/to Firestore document `settings/general` (fields: `version`, `download_url`, `force_update`), incorporating Google Drive URL conversion and a confirmation modal with the label "Xác nhận thao tác".

---

## 5. Verification Method
Verify the final implementation by running:
```powershell
npx playwright test e2e/settings.spec.ts -g "R1:"
```
All ten tests matching the system settings tag must pass.
