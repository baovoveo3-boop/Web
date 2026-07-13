# Handoff Report — 2026-06-25T16:21:00+07:00

## 1. Observation
I have inspected the following key files and configurations in the codebase:

### Admin Panel Product Form
* **Path**: `app/admin/products/page.tsx`
* **Observation**:
  * Line 13-30: Defines `interface Product` with fields: `id`, `category`, `type`, `name`, `description`, `price`, `originalPrice`, `badgeText`, `isFeatured`, `imageUrl`, `gallery`, `features`, `howToUse`, `faqs`, `createdAt`, and `updatedAt`.
  * Lines 718-734: Shows that the `category` is handled via a text `<input>` backed by `<datalist id="categories-list">` allowing free-form input with suggestions: `"tool"`, `"course"`, `"combo"`, `"free"`.
  * Lines 281-395: `handleSave` performs image uploads, wraps values in a `productData` object, strips undefined fields via `JSON.parse(JSON.stringify(productData))`, and writes directly to Firestore via `updateDoc` (for edits) or `setDoc` (for new products).

### Product Download Logic
* **Path**: `components/ToolDetailClient.tsx`
* **Observation**:
  * Lines 37-60: `handleDownloadTool` performs authorization checks, then issues a placeholder alert:
    ```typescript
    // 2. Tải Tool
    alert("Bắt đầu tải công cụ... (Tính năng đang phát triển)");
    ```

### Testing Environment
* **Paths**: `package.json`, `playwright.config.ts`, `e2e/admin.spec.ts`
* **Observation**:
  * `package.json` line 10: `test:e2e` is mapped to `"playwright test"`.
  * `playwright.config.ts` line 4: `testDir` is set to `'./e2e'`.
  * `playwright.config.ts` line 21: `webServer` builds and serves using `npx http-server out -p 3000`.
  * `e2e/admin.spec.ts` lines 384-458: Contains automated tests for Product CRUD panel actions (adding, editing, and deleting mock products) and mocks Firebase Storage/Firestore calls using browser script injection.

---

## 2. Logic Chain
1. **Firestore Writes**: The code utilizes Firebase Web SDK directly on the client. `handleSave` in `app/admin/products/page.tsx` constructs the JSON payload and writes it directly to `products` collection.
2. **Schema Extensibility**: Since Firestore is schemaless, adding a new database field like `downloadUrl` requires no database migrations; we only need to update the TypeScript interface `Product` and include the field in the payload inside `handleSave`.
3. **URL Conversion Hook**: We can safely intercept and convert link URLs (e.g. converting a Google Drive sharing URL to a direct-download link) in `handleSave` right before sanitizing and saving `productData`.
4. **Download Invocation**: Once `downloadUrl` is persisted in Firestore, we can map it to `StoreItem` inside `hooks/useStoreProducts.ts` and rewrite `handleDownloadTool` in `components/ToolDetailClient.tsx` to call `window.open(tool.downloadUrl, '_blank')`.
5. **Autocompletion**: The `category` select suggestions are defined as a `<datalist>` layout structure, meaning it already allows free-form category input.

---

## 3. Caveats
* **Static Export Build**: Playwright runs against the pre-built `out` folder (`npx http-server out -p 3000`). If source files are modified, a build step (e.g. `npm run build`) is required before running `npx playwright test` to see changes.
* **Firebase Mocks**: The Playwright tests intercept client-side modules to inject custom database states (`mockDbData` in `e2e/admin.spec.ts`). If a new required field is introduced, mock states in the tests must be updated accordingly to prevent test failures.
* **Types Compliance**: Updating TypeScript interfaces (`Product` in the admin page, `StoreItem` in `hooks/useStoreProducts.ts`, `ToolData` in `data/tools.ts`) is necessary to prevent Next.js compilation errors.

---

## 4. Conclusion
We recommend modifying the following files to support `downloadUrl` with direct link conversion:

1. **`lib/linkConverter.ts`** (New File):
   * Implement a utility function `convertToDirectLink(url: string): string` to convert Google Drive, OneDrive, and Dropbox links.
2. **`app/admin/products/page.tsx`**:
   * Add `downloadUrl: string` to `Product` interface.
   * Add a text field state `const [downloadUrl, setDownloadUrl] = useState("")`.
   * Bind the new text field to a text input in the product form modal.
   * Inside `handleSave`, convert the link: `downloadUrl: convertToDirectLink(downloadUrl)` before saving.
3. **`hooks/useStoreProducts.ts`**:
   * Map `downloadUrl: data.downloadUrl || ""` to the returned `StoreItem`.
4. **`components/ToolDetailClient.tsx`**:
   * Replace the placeholder alert inside `handleDownloadTool` with `window.open(tool.downloadUrl, '_blank')` if `tool.downloadUrl` exists.

---

## 5. Verification Method
1. Run local build to verify compilation:
   ```bash
   npm run build
   ```
2. Run Playwright E2E tests:
   ```bash
   npx playwright test
   ```
3. Run the specific admin/product tests:
   ```bash
   npx playwright test e2e/admin.spec.ts e2e/tools.spec.ts
   ```
4. Verify link conversion correctness:
   * Try adding a product with a Google Drive share link (e.g. `https://drive.google.com/file/d/1XyZ/view?usp=sharing`).
   * Confirm that in Firestore, it is saved converted to the direct download link format (`https://drive.google.com/uc?export=download&id=1XyZ`).
