# E2E and Local Build Test Report

**Date**: 2026-06-25  
**Project**: Ban Content Web  
**Agent Role**: Empirical Challenger / Specialist / Critic  

---

## 1. Commands Executed and Environment Constraints

As part of the empirical verification, we attempted to execute the local build and Playwright E2E tests:

1. **Local Build Command**:
   ```bash
   npm run build
   ```
   *Result*: The permission prompt timed out waiting for user response (non-interactive environment constraint).
   
2. **Playwright E2E Test Command**:
   ```bash
   npx playwright test e2e/admin.spec.ts
   ```
   *Result*: The permission prompt timed out waiting for user response.

Since command execution requires manual approval from the user, and no approval was received during the execution window, we performed a thorough **Static & Logical Code Verification** to validate the correctness of the implementation.

---

## 2. Static Analysis of the "Cấu hình Desktop App" Section

In `app/admin/products/page.tsx`, the form fields for the Desktop App configuration are correctly declared and conditionally rendered:

* **Conditional Rendering Logic (Line 845)**:
  ```typescript
  {category === "tool" && (
    <div className="pt-4 border-t border-zinc-800 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-neonPurple">
        Cấu hình Desktop App
      </h3>
      ...
    </div>
  )}
  ```
  This ensures that only products classified as `tool` display the desktop app settings, preventing interface clutter for other categories (e.g., courses, combos).

* **Form Fields State Bindings**:
  - `execFile` (File thực thi - string) -> mapped to `exec_file` input.
  - `version` (Phiên bản - string) -> mapped to `version` input.
  - `downloadUrl` (Đường dẫn tải xuống - string) -> mapped to `download_url` input.
  - `forceUpdate` (Bắt buộc cập nhật - boolean toggle button) -> mapped to `force_update` input.

* **Database Save Logic (`handleSave` - Line 373-392)**:
  - If `category === "tool"`, it converts the Google Drive URL and saves the values:
    ```typescript
    const convertedDownloadUrl = category === "tool" ? convertGoogleDriveUrl(downloadUrl) : "";
    const productData = {
      category,
      type,
      name,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice),
      badgeText,
      isFeatured,
      imageUrl: finalImageUrl,
      gallery: finalGalleryUrls,
      features,
      howToUse,
      faqs,
      exec_file: category === "tool" ? execFile : "",
      version: category === "tool" ? version : "",
      download_url: convertedDownloadUrl,
      force_update: category === "tool" ? forceUpdate : false,
    };
    ```
  - This ensures that non-tool products do not pollute the database with empty desktop-specific fields.

---

## 3. Static Analysis of Google Drive URL Conversion Logic

The function `convertGoogleDriveUrl` is defined at line 70 in `app/admin/products/page.tsx`:

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

### Dry Run Verification Cases:

1. **Standard view link**: `https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing`
   - `fileMatch` successfully matches `\/file\/d\/([a-zA-Z0-9_-]+)`.
   - Captures `1A2B3C4D5E` in group 1.
   - Returns: `https://drive.google.com/uc?export=download&id=1A2B3C4D5E` (Direct link). **[PASS]**

2. **Authenticated view link**: `https://drive.google.com/file/u/1/d/1A2B3C4D5E/view`
   - `(?:u\/\d+\/)?` matches `u/1/`.
   - Captures `1A2B3C4D5E` in group 1.
   - Returns: `https://drive.google.com/uc?export=download&id=1A2B3C4D5E`. **[PASS]**

3. **Open URL link**: `https://drive.google.com/open?id=1A2B3C4D5E`
   - `trimmed.includes("drive.google.com/open")` evaluates to `true`.
   - `openMatch` successfully matches `?id=1A2B3C4D5E`.
   - Captures `1A2B3C4D5E` in group 1.
   - Returns: `https://drive.google.com/uc?export=download&id=1A2B3C4D5E`. **[PASS]**

4. **Non-Google Drive URL**: `https://example.com/software/app.zip`
   - None of the regexes match.
   - Returns unchanged URL: `https://example.com/software/app.zip`. **[PASS]**

The conversion logic is robust, covering standard sharing links, authenticated user subpath links, and legacy open parameters safely.

---

## 4. E2E Test Code Verification

The Playwright test `Supports adding a tool product with Desktop App configuration and Google Drive link conversion` (located in `e2e/admin.spec.ts` line 461) performs the following assertions:

1. **Modal Visibility**: Asserts `h2:has-text("Thêm sản phẩm mới")` is visible.
2. **Conditional Section Check**:
   - Asserts `text=Cấu hình Desktop App` is not visible.
   - Fills category with `tool`.
   - Asserts `text=Cấu hình Desktop App` is visible.
3. **Fields Filling**: Fills `autopost.exe`, `1.0.5`, `https://drive.google.com/file/d/12345abcde/view`.
4. **Action and Save**: Clicks `force_update` toggle, submits form, and accepts custom confirmation modal `Xác nhận thao tác`.
5. **Database Mock Assertion**:
   - Evaluates `window.mockDbState['products']` on the page.
   - Validates that `exec_file` is `'autopost.exe'`.
   - Validates that `version` is `'1.0.5'`.
   - Validates that `download_url` is converted to `'https://drive.google.com/uc?export=download&id=12345abcde'`.
   - Validates that `force_update` is the boolean `true`.

This is a comprehensive E2E test that validates UI rendering transitions, integration with the custom confirmation modal, and correct persistence mapping with data sanitization and conversions.
