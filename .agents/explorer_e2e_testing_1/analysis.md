# E2E Test Suite Analysis & Test Plan for R1, R2, and R3

This report analyzes the existing Playwright E2E test suite in the `e2e/` folder of the Ban Content Web project and proposes a detailed 4-tier E2E test plan for the upcoming requirements (R1: Settings Page, R2: Product Form Upgrade, R3: Public Download Page & Navbar Link).

---

## 1. Admin Authentication & Session Management in E2E Tests

Admin authentication in the Playwright E2E suite is handled entirely through **client-side mocking** using a page initialization script (`page.addInitScript`). The application does not connect to a real Firebase Auth instance, nor does it spin up a Firebase Local Emulator.

### Key Mechanisms:
1. **Webpack Chunk Interception**:
   Since Next.js builds bundle external modules, the tests register a webpack chunk hook override that runs in the browser context before the React application mounts. It overrides `window.webpackChunk_N_E.push` to inspect loaded modules and monkey-patch exports from `@firebase/auth`, `@firebase/firestore`, and `@firebase/storage`:
   ```javascript
   window.webpackChunk_N_E = window.webpackChunk_N_E || [];
   const originalPush = window.webpackChunk_N_E.push;
   window.webpackChunk_N_E.push = function(...args) {
     const modules = args[0][1];
     if (modules) {
       for (const key of Object.keys(modules)) {
         const originalFunc = modules[key];
         modules[key] = function(module, exports, require) {
           originalFunc(module, exports, require);
           if (exports && (exports.getFirestore || exports.getAuth || exports.getStorage)) {
             Object.keys(exports).forEach(prop => {
               if (typeof exports[prop] === 'function') {
                 const orig = exports[prop];
                 exports[prop] = function(...args) {
                   const mockName = 'mock_' + prop;
                   if (window[mockName]) return window[mockName](...args);
                   return orig(...args);
                 };
               }
             });
           }
         };
       }
     }
     return originalPush.apply(this, args);
   };
   ```
2. **Auth Mock Implementations**:
   The script seeds global mocks on the `window` object:
   - `mock_getAuth()`: Returns `{ mock: true }`.
   - `mock_onAuthStateChanged(auth, callback)`: Stores the callback in `window.mockAuthCallbacks` and triggers it with the current `window.mockUser` (using `setTimeout` to match asynchronous behavior).
   - `mock_signOut(auth)`: Sets `window.mockUser = null` and triggers all registered auth state callbacks.
   - `window.setMockUser(user)`: An external helper function used in tests to hot-swap the authenticated user (e.g. promoting roles or logging out) at runtime.
3. **Route Guards & LocalStorage Bypass**:
   The application uses a Next.js client-side guard checking `localStorage.getItem('isLoggedIn')` to determine login status before auth loads. The setup script manually overrides this:
   - If `user` is provided: `localStorage.setItem('isLoggedIn', 'true')`.
   - If `user` is null: `localStorage.removeItem('isLoggedIn')`.

---

## 2. Firebase Firestore & Storage Operations in E2E Tests

Similar to Authentication, Firestore and Storage operations are completely mocked inside the browser context, backed by an in-memory database representation (`window.mockDbState`).

### Key Mock Implementations:
1. **Firestore DB State Seeding**:
   An initial database state (`mockDbData`) is defined in the test file and passed to the setup script. The setup script deep-clones this state into `window.mockDbState`.
2. **Firestore Read Operations**:
   - `mock_doc()` and `mock_collection()`: Return reference objects containing properties like `collectionName` and `id`.
   - `mock_getDoc(docRef)`: Looks up `window.mockDbState[collectionName][id]` and returns a document snapshot wrapping the data.
   - `mock_getDocs(collectionRef)`: Evaluates all items under `window.mockDbState[collectionName]`. It implements client-side filtering matching the filters returned by `mock_query` / `mock_where` (e.g. strict string matching).
   - `mock_query(collectionRef, ...constraints)`: Returns a reference query object with accumulated constraints.
   - `mock_where(field, op, value)`: Returns a simple filter definition object.
3. **Firestore Write Operations**:
   - `mock_addDoc(collectionRef, data)`: Generates a random ID, writes the data to `window.mockDbState[collectionName][id]`, and resolves the reference.
   - `mock_updateDoc(docRef, data)` / `mock_setDoc(docRef, data)`: Deeply merges or replaces the document data in `window.mockDbState` memory.
   - `mock_deleteDoc(docRef)`: Deletes the key from `window.mockDbState[collectionName]`.
   - `mock_serverTimestamp()`: Returns `new Date().toISOString()`.
4. **Firebase Storage Mocks**:
   - `mock_ref(storage, path)`: Returns `{ path }`.
   - `mock_uploadBytes(storageRef, file)`: Resolves successfully with `{ ref: storageRef }`.
   - `mock_getDownloadURL(storageRef)`: Resolves with `https://example.com/mock-image.png`.
5. **ImgBB API Call Mocking**:
   The setup script overrides `window.fetch` to intercept HTTP POST requests targeting `api.imgbb.com` and resolves with a JSON containing `https://example.com/mock-uploaded-image.png`.

---

## 3. UI Interaction, Saving, and Assertion Patterns

Reviewing `e2e/admin.spec.ts`, `e2e/tools.spec.ts`, and `e2e/csv-export.spec.ts` yields several key patterns for form controls, file uploads, saving, and CSV handling:

### A. Form Inputs & Modal Triggers
- **Opening Modals**: Modals are triggered by locating simple text actions, e.g., `page.click('button:has-text("Thêm sản phẩm")')`.
- **Text & Number Fields**: Standard text fields are filled via `page.fill(selector, text)`. Number fields also use `page.fill` but pass string values (e.g., `page.fill('input[placeholder="Ví dụ: 150000"]', '500000')`).
- **Select dropdowns**: Handled with `page.selectOption(selector, value)`.
- **File Uploads**: Mocked files are uploaded using `page.setInputFiles(selector, filePayload)`:
  ```typescript
  await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('mock-image-content'),
  });
  ```
- **Toggles**: Toggle buttons are selected using relative layouts, e.g. clicking spans within button containers: `await page.click('button:has(span.bg-white)')`.

### B. Dialogs & Action Confirmation
- **Confirmation Modals**: The application uses a secondary Confirmation Modal ("Xác nhận thao tác") for critical writes (Create, Update, Delete). The test pattern is:
  1. Trigger form save: `await page.click('button[type="submit"]')`.
  2. Click confirm: `await page.click('button:has-text("Xác nhận thao tác")')`.
- **Native JS Dialogs**: Native confirmation alerts (e.g. `confirm()` or `alert()`) are handled by registering event listeners *before* the action:
  ```typescript
  page.on('dialog', async dialog => {
    await dialog.accept(); // or dialog.dismiss()
  });
  ```

### C. Assertions & Deletions
- **Listing & Count Assertions**: To verify lists, tests look up elements by text or count card containers:
  ```typescript
  await expect(page.locator('h3:has-text("Gói Bạch Kim")')).toBeVisible();
  ```
- **Asynchronous Deletion Verification**: Since deletions update state asynchronously, tests wrap counts in a `toPass()` loop:
  ```typescript
  await expect(async () => {
    const countAfter = await page.locator('.rounded-xl:has(h3)').count();
    expect(countAfter).toBe(countBefore - 1);
  }).toPass();
  ```

### D. Advanced CSV Download Assertions
The test intercepts downloads, saves the file locally, reads the file content, and asserts layout compatibility:
```typescript
const downloadPromise = page.waitForEvent('download');
await page.click('button:has-text("Xuất file CSV")');
const download = await downloadPromise;

// Assert filename conventions
expect(download.suggestedFilename()).toContain('.csv');

// Read file content
const path = await download.path();
const content = fs.readFileSync(path, 'utf8');

// Assert UTF-8 BOM compatibility (required for Excel layout)
expect(content.startsWith('\uFEFF')).toBe(true);

// Assert row content values
expect(content).toContain('Tháng');
expect(content).toContain('150000');
```

---

## 4. Recommended Detailed Test Plan (R1, R2, R3)

This 4-tier E2E testing strategy is recommended for verification of **M1 (E2E Test Suite Creation)**. The new tests should be housed in a new file `e2e/settings.spec.ts`.

### Tier 1: Feature Coverage (>= 5 tests per feature)

#### Feature R1: System Settings Page (`/admin/settings`)
1. **R1-F1: Page Element Rendering**: Access `/admin/settings` as Admin and verify version input, download URL input, force update switch, save button, and cancel button are visible.
2. **R1-F2: Role-based Guard Allowed**: Log in with an admin account (`role: 'admin'`), navigate to `/admin/settings`, and verify the URL is not redirected and page displays heading "Cấu hình Hệ thống".
3. **R1-F3: Form Data Binding**: Enter mock values in version (`1.2.5`), download URL (`https://example.com/mock.exe`), toggle force update to true, and assert the inputs retain these values.
4. **R1-F4: Save Configuration Flow**: Submit the form, click "Xác nhận thao tác" in the confirmation modal, and verify that the mocked database `window.mockDbState['settings']['general']` contains the new values.
5. **R1-F5: Google Drive Link Auto-Conversion on Save**: Enter a Google Drive sharing URL `https://drive.google.com/file/d/abc123xyz/view` into the URL field, click save & confirm, and verify the Firestore database state contains the converted URL `https://drive.google.com/uc?export=download&id=abc123xyz`.

#### Feature R2: Product Form Upgrade (`/admin/products` Up/Down & Autofill)
1. **R2-F1: Reorder Buttons Render**: Open the "Thêm sản phẩm" or edit modal, add 3 steps to the "How to Use" list, and verify that Up/Down arrow buttons render alongside each item.
2. **R2-F2: Reorder Features List (Up/Down)**: Create 3 features (A, B, C). Click "Down" on feature A (index 0). Verify that the visual order becomes B, A, C. Click "Up" on feature C. Verify visual order becomes B, C, A. Save and verify database state order matches.
3. **R2-F3: Reorder How to Use List (Up/Down)**: Create 3 steps (1, 2, 3). Click "Down" on Step 1 (index 0). Verify visual order becomes 2, 1, 3. Save product and verify database state order matches.
4. **R2-F4: Product Creation Step 1 Autofill**: Seed Firestore `settings/general` with `download_url: "https://drive.google.com/uc?export=download&id=launcher123"`. Open the "Thêm sản phẩm" modal. Verify that the first step of the "How to Use" array is automatically prefilled with:
   `Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher123`
5. **R2-F5: Array Boundary Controls**: For an array of 3 elements, verify that the "Up" button is disabled or hidden for the first element (index 0) and the "Down" button is disabled or hidden for the last element (index 2).

#### Feature R3: Public Download Page & Navbar Link (`/download`)
1. **R3-F1: Public Access**: Navigate to `/download` without authentication (guest user). Verify that the page loads successfully (returns HTTP 200) without redirecting to `/login`.
2. **R3-F2: Display Version & URL Binding**: Seed `settings/general` with version `1.9.9` and `download_url: "https://example.com/launcher.exe"`. Verify that the page displays text "Phiên bản: 1.9.9" and the download button has `href="https://example.com/launcher.exe"`.
3. **R3-F3: Download Action Redirection**: Click the "Tải App Launcher" CTA button and verify that it opens the correct download link in a new browser tab/window (`target="_blank"`).
4. **R3-F4: Header Navbar Link presence**: Go to the homepage `/` as a guest and verify that the Header navbar includes a link pointing to `/download` with the label "Tải App".
5. **R3-F5: Mobile Menu Link presence**: Resize the viewport to `375x667`, click the toggle menu drawer button, and verify that the "Tải App" navigation link is visible in the mobile drawer.

---

### Tier 2: Boundary & Corner Cases (>= 5 tests per feature)

#### Feature R1: System Settings Page (`/admin/settings`)
1. **R1-B1: Unauthenticated Redirect**: Access `/admin/settings` as a guest. Verify automatic redirect to `/login?redirect=%2Fadmin%2Fsettings`.
2. **R1-B2: Standard User Access Guard**: Access `/admin/settings` logged in as a normal user (`role: 'user'`). Verify automatic redirect to `/`.
3. **R1-B3: Empty Fields Validation**: Try saving the settings form with empty Version or URL fields. Verify that standard HTML5 validation triggers and blocks submission.
4. **R1-B4: Cancel Modifications**: Fill in modifications, click "Hủy" (Cancel) or reject the confirmation dialog, and verify that the modifications are discarded and `window.mockDbState` remains unchanged.
5. **R1-B5: Google Drive ID Extraction Edge Cases**: Input edge-case Google Drive formats (e.g. `https://drive.google.com/open?id=1234567890abcdef-XYZ` or links with extra query arguments). Verify that URL conversion accurately extracts the ID and outputs the direct link `https://drive.google.com/uc?export=download&id=1234567890abcdef-XYZ`.

#### Feature R2: Product Form Upgrade (`/admin/products` Up/Down & Autofill)
1. **R2-B1: Reordering Array of Size 1**: Create a product with only 1 feature or 1 guide step. Verify that both Up and Down buttons are hidden or disabled.
2. **R2-B2: Empty settings/general Doc Autofill**: Delete or omit the `settings/general` document from the seed DB. Open the product creation modal. Verify that the form loads successfully without crashing, leaving Step 1 empty or using a fallback text.
3. **R2-B3: Post-Autofill Editability**: Verify that the admin can delete or edit the autofilled Step 1 string in the product modal, and the updated value saves correctly in Firestore.
4. **R2-B4: Empty Fields Reordering**: Add multiple steps, leaving some steps blank. Reorder the blank and filled steps, and verify that values are swapped correctly without losing input focus.
5. **R2-B5: Duplicate Array Deletion Re-indexing**: Add 3 steps, move Step 3 to Step 2, and delete the new Step 2. Verify that indices recalculate correctly and that boundary buttons (Up/Down) adjust their enabled/disabled states.

#### Feature R3: Public Download Page & Navbar Link (`/download`)
1. **R3-B1: DB Offline/Missing Document Fallback**: Mock a Firestore read failure or missing `settings/general` document. Navigating to `/download` must display a clean fallback state (e.g. disabling the button and showing "Không tìm thấy phiên bản ứng dụng") rather than rendering a blank page or throwing a Javascript console error.
2. **R3-B2: Long Version Styling Layout**: Seed the version field with an extremely long string (e.g., `2.0.1-beta-build-9999-final-release-critical-patch`). Verify that the text wraps nicely on the public page without breaking container widths or causing horizontal scroll on mobile.
3. **R3-B3: Stale Cache Validation**: Modify the version in Firestore settings and hard reload the `/download` page. Verify that it immediately shows the updated version without rendering stale cached data.
4. **R3-B4: Navbar Active Styling**: Access `/download`. Verify that the "Tải App" navigation item in the header has CSS classes designating active status (e.g., color indicators).
5. **R3-B5: Non-converted URL direct route**: Seed Firestore with a non-Google Drive direct link. Verify that the download button links directly to it without attempting Drive conversion.

---

### Tier 3: Cross-Feature Combinations

1. **XF-1: Admin Settings update propagates to Public Download**:
   - **Sequence**: Log in as admin -> Update settings version to `2.3.4` and url to a new Drive link -> Save -> Navigate to `/download` as guest -> Verify page immediately renders Version `2.3.4` and direct CTA download url.
2. **XF-2: Admin Settings update propagates to Product Creation Autofill**:
   - **Sequence**: Log in as admin -> Update settings download url to `https://drive.google.com/file/d/newDoc123/view` -> Save -> Navigate to `/admin/products` -> Click "Thêm sản phẩm" -> Verify Step 1 auto-fills using the new converted link.
3. **XF-3: Products array reordering matches Public Tool Details Guide**:
   - **Sequence**: Log in as admin -> Edit product `prod1` -> Reorder "How to Use" steps to [Step B, Step A] -> Save -> Navigate to public route `/tools/prod1` -> Verify the "How to Use" guide displays Step B followed by Step A in order.
4. **XF-4: Auth State toggles Header visibility**:
   - **Sequence**: Guest lands on `/download` (visible header download link, no admin link) -> User logs in as admin -> Navbar displays "Admin Panel" and "Tải App" -> Admin logs out -> Navbar reverts to guest state.
5. **XF-5: Google Drive Conversion Consistency**:
   - **Sequence**: Verify that URLs inputted on the settings page (`settings/general`) and on the product page (`products/prod1/download_url`) use the exact same Google Drive conversion utilities, producing consistent outputs on both `/download` and `/admin/products`.

---

### Tier 4: Real-world User Flows

#### Flow 1: Admin System Update & Product Creation Journey (Admin Persona)
1. **Login**: Admin logs in (`admin@test.com`).
2. **System Config**: Admin navigates to `/admin/settings`, enters version `3.0.0`, download URL `https://drive.google.com/file/d/launcher300/view`, force update `true`, and clicks Save. Confirms action on modal.
3. **Check Propagation in Forms**: Admin navigates to `/admin/products` and clicks "Thêm sản phẩm".
4. **Autofill Verification**: Admin verifies that Step 1 of "How to Use" is autofilled with:
   `Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher300`
5. **Input Steps & Reorder**: Admin inputs Step 2 ("Chạy app.exe") and Step 3 ("Cấp quyền admin"). Click "Up" on Step 3 to make it Step 2.
6. **Input features & Reorder**: Admin inputs Feature 1 ("Nhanh"), Feature 2 ("Mạnh"), Feature 3 ("Rẻ"). Click "Down" on Feature 1 to move it to index 1.
7. **Complete Product Details**: Admin fills Name ("Tool Youtube V3"), Category ("tool"), Price (`299000`), uploads dummy thumbnail.
8. **Save Product**: Admin clicks submit, confirms, and logs out.

#### Flow 2: End-User Download & Guide Verification (User Persona)
1. **Public Land**: Guest accesses `/` (homepage) and clicks "Tải App" link in the Navbar.
2. **Download page validation**: Verify the URL is `/download`, version text reads `3.0.0`, and clicking the download button triggers download targeting `https://drive.google.com/uc?export=download&id=launcher300`.
3. **Inspect Tool Guide**: User navigates to the newly created tool detail page `/tools/tool-youtube-v3`.
4. **Verify Guide Sequence**: User scrolls to "How to Use" guide and asserts:
   - Step 1: Autofilled Launcher setup text pointing to `launcher300` link.
   - Step 2: "Cấp quyền admin" (Reordered).
   - Step 3: "Chạy app.exe" (Reordered).
5. **Verify Features Sequence**: User asserts features list:
   - Feature 1: "Mạnh" (Reordered).
   - Feature 2: "Nhanh" (Reordered).
   - Feature 3: "Rẻ".
