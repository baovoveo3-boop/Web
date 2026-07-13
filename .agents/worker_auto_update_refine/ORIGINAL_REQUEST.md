## 2026-06-25T09:30:03Z

Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_auto_update_refine
Your task is to refine the product admin configuration implementation and fix all identified E2E test failures and alignment gaps.

Please make the following changes:

1. **In `app/admin/products/page.tsx`**:
   - Update the price validation check inside `handleSave` from `price <= 0` to `price < 0` so that free products (price = 0) can be created and edited.
   - Update the CSV Export (`handleExportCSV`):
     - Add 4 columns to `fields`: `"File thực thi (exec_file)"`, `"Phiên bản (version)"`, `"Đường dẫn tải xuống (download_url)"`, `"Yêu cầu cập nhật (force_update)"`.
     - In the data rows, append the values: `p.exec_file || ""`, `p.version || ""`, `p.download_url || ""`, and `p.force_update ? "TRUE" : "FALSE"`.
   - Update the CSV Import (`handleImportCSV`):
     - Read the new columns from `row`: `exec_file: row["File thực thi (exec_file)"] || ""`, `version: row["Phiên bản (version)"] || ""`, `download_url: row["Đường dẫn tải xuống (download_url)"] || ""`, and `force_update: row["Yêu cầu cập nhật (force_update)"]?.toString().toUpperCase() === "TRUE"`.
     - Save these fields to Firestore database payload.

2. **In `e2e/admin.spec.ts`**:
   - In the mock setup (`setupMocks`):
     - Mock the `window.fetch` API call so that if the URL contains `'api.imgbb.com'`, it intercepts the call and returns a mock response with a dummy image URL:
       ```typescript
       const originalFetch = window.fetch;
       window.fetch = async function(input, init) {
         const url = typeof input === 'string' ? input : input.url;
         if (url.includes('api.imgbb.com')) {
           return new Response(JSON.stringify({
             success: true,
             data: { url: 'https://example.com/mock-uploaded-image.png' }
           }), { status: 200, headers: { 'Content-Type': 'application/json' } });
         }
         return originalFetch.apply(this, arguments);
       };
       ```
   - In all product creation tests that fill the form modal and click save (like `Supports adding a new product` and `Supports adding a tool product with Desktop App...`):
     - Add code to select/mock the main product thumbnail file before submitting the form:
       ```typescript
       await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
         name: 'test.png',
         mimeType: 'image/png',
         buffer: Buffer.from('mock-image-content'),
       });
       ```
   - In the user promotion test (`Renders user registrations and promotes normal member to admin`):
     - Update the promotion button selector from `"Cấp quyền Admin"` to `"Lên Admin"`.
     - Remove the native `dialog` listener (`page.on('dialog', ...)`) and instead click the custom confirmation modal button after clicking promote:
       ```typescript
       await promoteBtn.click();
       await page.click('button:has-text("Xác nhận thao tác")');
       ```

3. **Verify locally**:
   - Check if you can build successfully: `npm run build`
   - Run E2E tests: `npx playwright test` and verify that they pass (or note if they fail due to permission/interactive issues).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your findings in a handoff.md report and send a message back to 3f39558a-8d9e-4dcd-8d2f-3fd25723d9a1 when completed.
