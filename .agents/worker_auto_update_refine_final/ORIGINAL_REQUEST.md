## 2026-06-25T09:37:13Z
You are a teamwork_preview_worker.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_auto_update_refine_final
Your task is to fix the final two CSV issues identified by the quality reviewers:

1. **CSV Sample Data Mismatch in `app/admin/products/page.tsx`**:
   In `handleExportCSV` inside `app/admin/products/page.tsx`, look at the `data` array when `products.length === 0` (around line 496).
   Currently, it has only 21 items, while `fields` header array has 23 items. This mismatch shifts columns.
   Update the sample row data array to have exactly 23 items matching the header columns:
   - ID (1)
   - Tên (2)
   - Phân loại (3)
   - Kiểu (4)
   - Mô tả (5)
   - Giá Gốc (6)
   - Giá Bán (7)
   - Nhãn dán (8)
   - Nổi bật (9)
   - Link Ảnh (10)
   - Link Slide (11)
   - "[]" for Tính Năng (JSON) (12)
   - "[]" for Cách Dùng (JSON) (13)
   - Q1 (14)
   - A1 (15)
   - Q2 (16)
   - A2 (17)
   - Q3 (18)
   - A3 (19)
   - exec_file (20)
   - version (21)
   - download_url (22)
   - force_update (23)
   Ensure that the array lists exactly 23 string elements in the correct order!

2. **Google Drive link conversion on CSV Import in `app/admin/products/page.tsx`**:
   In `handleImportCSV`, where productData is mapped:
   Ensure that `download_url` is wrapped with the conversion function:
   `download_url: convertGoogleDriveUrl(row["Đường dẫn tải xuống (download_url)"] || ""),`

3. **Verify compile**:
   Verify compilation with `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please write your progress and update progress.md. When done, write a handoff.md report and send a message back to 3f39558a-8d9e-4dcd-8d2f-3fd25723d9a1.

## 2026-06-25T09:37:41Z
Hi CSV Refinement Specialist,

Please include the following additional E2E test fixes in your current implementation of `e2e/admin.spec.ts` under the user promotion test (`Renders user registrations and promotes normal member to admin`):

1. Override `'admin1'`'s role to `'super_admin'` in the test setup so that the logged-in admin has permissions to promote users:
   ```typescript
   const adminUser = {
     uid: 'admin1',
     email: 'admin@test.com'
   };
   const customDbData = JSON.parse(JSON.stringify(mockDbData));
   customDbData.users['admin1'].role = 'super_admin';
   await setupMocks(page, adminUser, customDbData);
   ```
2. Correct the final assertion in the promotion test. Since the string `"Đã là Admin"` is not rendered in `app/admin/users/page.tsx` (only the `"Admin"` badge is shown and the promote button disappears), change the assertions to:
   ```typescript
   // Verify Normal User row has updated to Admin
   await expect(userRow.locator('text=Admin')).toBeVisible();
   await expect(userRow.locator('button:has-text("Lên Admin")')).not.toBeVisible();
   ```

Please let me know when all changes (CSV and E2E) are complete and handoff is ready.

