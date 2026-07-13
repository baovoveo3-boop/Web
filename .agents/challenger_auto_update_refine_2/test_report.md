# Test & Verification Report

**Status**: WARNING (Build/test commands timed out due to environmental permission constraints; completed via static verification and code audit)
**Date**: 2026-06-25T16:37:00+07:00
**Agent**: teamwork_preview_challenger (critic/specialist)

---

## 1. Command Execution Attempts & Environment Constraints
We attempted to execute the standard test and compilation commands in the workspace `E:\Youtube\Ban Content\Web`:
1. `npm run build`
2. `npx playwright test`

### Result:
Both command execution attempts triggered the system permission prompts which timed out waiting for user approval:
```
Encountered error in step execution: Permission prompt for action 'command' on target 'npm run build' timed out waiting for user response. The user was not able to provide permission on time. You should proceed as much as possible without access to this resource.
```
As a result of this environmental boundary, runtime verification could not be executed directly. Instead, we performed a thorough **Static Verification and Code Audit** of the changes and spec suites.

---

## 2. Static Code Verification

We verified the worker's changes to resolve previous test suite failures:

### A. Free Products Price Validation Check
- **Location**: `app/admin/products/page.tsx` (Line 320)
- **Code Audit**:
  ```typescript
  if (!slug || !name || !description || price < 0) {
  ```
  - **Verdict**: **PASS**. Changing the validation from `price <= 0` to `price < 0` permits free products (where `price === 0`) to be created and updated, matching the functional requirements of the `"free"` product category.

### B. CSV Auto-Update Fields Integration
- **Location**: `app/admin/products/page.tsx` (Lines 487-490, 540-543, 611-614)
- **Code Audit**:
  - The CSV header fields array was updated to include:
    - `"File thực thi (exec_file)"`
    - `"Phiên bản (version)"`
    - `"Đường dẫn tải xuống (download_url)"`
    - `"Yêu cầu cập nhật (force_update)"`
  - In `handleExportCSV` (lines 540-543), these properties from the `Product` objects are now mapped into the output rows.
  - In `handleImportCSV` (lines 611-614), these fields are successfully extracted from each parsed CSV row:
    ```typescript
    exec_file: row["File thực thi (exec_file)"] || "",
    version: row["Phiên bản (version)"] || "",
    download_url: row["Đường dẫn tải xuống (download_url)"] || "",
    force_update: row["Yêu cầu cập nhật (force_update)"]?.toString().toUpperCase() === "TRUE",
    ```
  - **Verdict**: **PASS**. The desktop app configuration is now fully preserved on CSV Export and Import.

### C. Playwright E2E Mocks & Selectors
- **Location**: `e2e/admin.spec.ts`
- **Code Audit**:
  - **ImgBB Upload Interception**: Intercepted fetch calls matching `api.imgbb.com` and returned a mocked successful URL response (lines 96-106).
  - **Thumbnail Image Upload Selection**: `setInputFiles` was added to standard product creation tests to satisfy the frontend's image presence validation:
    ```typescript
    await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock-image-content'),
    });
    ```
  - **User Promotion Selector and Confirmation Modal**: The button text was correctly updated from `"Cấp quyền Admin"` to `"Lên Admin"`, and the test clicked the custom React modal button `"Xác nhận thao tác"` instead of setting up a listener for a native browser confirm dialog.
  - **Verdict**: **PASS**. The changes match the actual React code selectors and modal workflows.

---

## 3. Discovered Vulnerabilities & Layout Bugs

During our audit, we identified a critical data layout bug and several security challenges:

### Bug 1: Empty-State CSV Export Row Field Misalignment (Data Shift)
- **Location**: `app/admin/products/page.tsx` (Lines 495-518)
- **Description**: 
  When the product database is empty (`products.length === 0`), `handleExportCSV` exports a single mock template row. However, this mock array has only **21 values**, whereas the headers array (`fields`) has **23 fields**. 
  Furthermore, the fields are shifted starting from index 11:
  - `"Tính Năng (JSON)"` is mapped to a raw FAQ question string: `"Khóa học này học trong bao lâu?"`.
  - `"Cách Dùng (JSON)"` is mapped to a raw FAQ answer: `"Học trọn đời,..."`.
  - The final columns `"Đường dẫn tải xuống (download_url)"` and `"Yêu cầu cập nhật (force_update)"` are omitted completely.
- **Impact**: If an administrator exports an empty products collection to use as a template, the resulting CSV has mismatched headers and invalid JSON structures for features/guides. This will fail or cause corrupted data when imported.
- **Suggested Fix**: Update the empty-state mock row to contain all 23 elements, aligning them to the field schema:
  ```typescript
  data = [[
    "", // ID
    "Sản phẩm mẫu (Xóa dòng này đi nếu không cần)", // Tên
    "tool", // Phân loại
    "youtube", // Kiểu
    "Mô tả sản phẩm mẫu...", // Mô tả
    "1000000", // Giá Gốc
    "500000", // Giá Bán
    "Bán Chạy", // Nhãn dán
    "TRUE", // Nổi bật
    "", // Link Ảnh
    "", // Link Slide
    "[]", // Tính Năng (JSON)
    "[]", // Cách Dùng (JSON)
    "Khóa học này học trong bao lâu?", // Câu Hỏi 1
    "Học trọn đời, bạn có thể xem lại bất kỳ lúc nào.", // Trả Lời 1
    "Có hỗ trợ sau khi học không?", // Câu Hỏi 2
    "Có, bạn sẽ được thêm vào group Zalo kín để giảng viên hỗ trợ trực tiếp.", // Trả Lời 2
    "Hình thức thanh toán như thế nào?", // Câu Hỏi 3
    "Bạn có thể chuyển khoản ngân hàng hoặc thanh toán qua ví điện tử.", // Trả Lời 3
    "", // File thực thi (exec_file)
    "", // Phiên bản (version)
    "", // Đường dẫn tải xuống (download_url)
    "FALSE" // Yêu cầu cập nhật (force_update)
  ]];
  ```

### Bug 2: Playwright config.ts Web Server Incompatibility
- **Location**: `playwright.config.ts` (Line 21)
- **Description**: 
  The Playwright webServer is configured as:
  ```typescript
  command: 'npx http-server out -p 3000',
  ```
  However, `next.config.js` does not declare `output: 'export'`. Consequently, `npm run build` writes files to `.next`, and does *not* generate the static export folder `out`.
- **Impact**: When Playwright spins up the server, `http-server` will fail to find `out`, causing E2E tests to fail to reach the pages or run against empty/missing pages.
- **Suggested Fix**: Either add `output: 'export'` to `next.config.js` or change the Playwright `webServer` command to start the Next.js production server (`npm run start` after build).

---

## 4. Adversarial Review

### Challenge 1: Lack of Input Sanitization on CSV Uploads (Persistent XSS)
- **Attack Scenario**: CSV import parses values and writes them straight to Firestore:
  ```typescript
  const productData = { name, description, ... }
  ```
  An admin (or an attacker with compromised admin access/session) can upload a CSV containing malicious `<script>` or `<svg onload=...>` tags in `name` or `description`. These are then saved in Firestore and rendered unescaped in various parts of the client dashboard.
- **Mitigation**: Sanitize CSV fields prior to writing them to database collections (e.g., using `DOMPurify` on the client or server side).

### Challenge 2: Direct Client-Side Writes to Database (Bypassing Price & Role Guards)
- **Attack Scenario**: Since Firestore writes are initiated from the client browser, a malicious authenticated user can capture the Firebase client configuration and write a script to call `updateDoc` or `setDoc` directly on `products` (setting prices of paid tools to 0 or changing download URLs to point to malware) or on `users` (promoting themselves to `admin` or adding money to their wallet).
- **Mitigation**: Implement server-side checkouts (e.g., via Next.js API Routes) and configure highly strict Firebase Security Rules.
