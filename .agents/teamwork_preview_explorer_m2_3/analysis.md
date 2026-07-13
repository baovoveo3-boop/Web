# Analysis Report: Admin System Settings Page (R1)

## Executive Summary
This report analyzes the codebase requirements for implementing **R1: System Settings Page**. The implementation involves creating a new admin settings page (`app/admin/settings/page.tsx`) to manage the App Launcher configuration (`Version`, `Download Link`, `Force Update`) saved in Firestore under `settings/general`, updating the navigation sidebar in `app/admin/layout.tsx`, and implementing Google Drive direct URL conversion and save confirmation dialogs that conform to the existing e2e test suite (`e2e/settings.spec.ts`).

---

## 1. Current Architecture Analysis

### 1.1 Role-based Guards & Redirect Routing
* **File path**: `app/admin/layout.tsx`
* **Current mechanism**: The layout checks the authenticated user's role on mount. If the user is not logged in, it redirects them to `/login?redirect=/admin`. If the user is logged in but not an admin or super_admin, it redirects to `/`.
* **Important Gap discovered**: The Playwright test case `R1-B1: Unauthenticated Redirect` (in `e2e/settings.spec.ts:468-472`) requires that a guest user visiting `/admin/settings` must be redirected specifically to `/login?redirect=/admin/settings` (URI-encoded). The current layout has `/admin` hardcoded. Therefore, the layout must be modified to use `usePathname()` from `next/navigation` to dynamically construct the redirect parameter: `/login?redirect=${encodeURIComponent(pathname)}`.

### 1.2 Google Drive Direct Link Conversion
* **File path**: `app/admin/products/page.tsx` (Lines 71-83)
* **Code snippet**:
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
* **Proposal**: Re-use this exact parsing logic in the Settings page to extract Google Drive file IDs and transform them into direct download endpoints (`/uc?export=download&id=...`).

### 1.3 Database & Logging Operations
* **Firestore reference**: `lib/firebase.ts` exports `db` (obtained via client-side `getFirestore`).
* **Audit log utility**: `lib/adminLogger.ts` exports `logAdminAction`. This function should be called upon successfully saving the settings to record `UPDATE_SYSTEM_SETTINGS` with details of version/url for logging accountability.

---

## 2. Proposed Implementation Plan

### 2.1 File Creation: `app/admin/settings/page.tsx`
Create a React Client Page with form fields that map exactly to the e2e test spec expectations:
* **Version Input**: `input[placeholder="VD: 1.0.0"]`, marked as `required`.
* **Download Link Input**: `input[placeholder="Nhập link Google Drive..."]`, marked as `required`.
* **Force Update Switch**: `button[role="switch"]` containing an underlying visually hidden `input[type="checkbox"]` to satisfy alternative selectors.
* **Hủy Button**: Resets current form states to the originally-fetched settings state (`originalSettings`).
* **Lưu Button**: Submits the form and opens a confirmation dialog.
* **Confirmation Dialog**: Contains a button with the text `"Xác nhận thao tác"`. Once clicked, it saves data to `settings/general` in Firestore, triggers `logAdminAction`, updates `originalSettings`, and alerts success.

The proposed file has been written to the working directory as `proposed_settings_page.tsx`.

### 2.2 File Modification: `app/admin/layout.tsx`
Apply changes outlined in `proposed_layout_changes.patch`:
1. Import `usePathname` from `next/navigation` to read the active path dynamically.
2. Replace hardcoded `/login?redirect=/admin` redirect with `/login?redirect=${encodeURIComponent(pathname)}`.
3. Add a link to `/admin/settings` ("⚙️ Cấu hình Hệ thống") in the desktop sidebar layout.
4. Add a link to `/admin/settings` ("⚙️ Cấu hình") in the mobile navigation bar layout.

---

## 3. Verification & Testing

The proposed changes will directly satisfy the following Playwright tests in `e2e/settings.spec.ts`:
* **R1-F1: Page Element Rendering** — Validates headers, placeholders (`VD: 1.0.0`, `Nhập link Google Drive...`), switches, and button text.
* **R1-F2: Role-based Guard Allowed** — Validates direct access for admin users.
* **R1-F3: Form Data Binding** — Validates updating input states.
* **R1-F4: Save Configuration Flow** — Validates state persistence in Firestore General settings document on save confirmation.
* **R1-F5: Google Drive Link Auto-Conversion on Save** — Validates conversion from `/file/d/.../view` to `/uc?export=download&id=...`.
* **R1-B1: Unauthenticated Redirect** — Validates redirection logic of the layout using the current settings subpath.
* **R1-B2: Standard User Access Guard** — Validates role checking.
* **R1-B3: Empty Fields Validation** — Validates HTML5 form validation constraints.
* **R1-B4: Cancel Modifications** — Validates reverting to original values when clicking Cancel.
* **R1-B5: Google Drive ID Extraction Edge Cases** — Validates query parameter ID extraction (`open?id=...`).

### Command for verification:
```bash
npx playwright test e2e/settings.spec.ts
```
