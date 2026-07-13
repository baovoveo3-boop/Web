# Analysis of Product Form, Firestore Operations, Categories, and Testing Environment

## 1. Product Form in the Admin Panel
* **File Location**: `app/admin/products/page.tsx`
* **Form UI & State**:
  * Rendered as an absolute overlay modal when `isModalOpen` is `true`. It handles both creating a new product and editing an existing product.
  * Form inputs use standard React states:
    * `slug`: Product ID / slug in Firestore (disabled when editing).
    * `category`: Category string.
    * `type`: Type string.
    * `name`: Product title.
    * `description`: Product detail description.
    * `price` & `originalPrice`: Numbers representing pricing.
    * `badgeText`: Label/badge displayed on the product (e.g. `HOT`, `BEST SELLER`, `MỚI`, `FLASH SALE`).
    * `isFeatured`: Boolean checkbox marking features.
    * `features`: List of `{ bold, text }` tuples.
    * `howToUse`: Array of strings for step-by-step guides.
    * `faqs`: Array of `{ question, answer }` tuples.
    * `imageFile` / `imagePreview`: Main thumbnail image.
    * `galleryItems`: Array of detail slide image items.
* **Image Upload & Manipulation**:
  * Images are compressed client-side using `browser-image-compression` via `compressImage` (line 32).
  * Uploaded directly to ImgBB using `uploadToImgBB` (line 46) and `process.env.NEXT_PUBLIC_IMGBB_API_KEY`.
  * Detail gallery items are reorderable using HTML5 drag-and-drop actions mapped via `handleDragStart`, `handleDragOver`, and `handleDrop` (lines 230-253).

## 2. Adding and Editing Products (Firestore Operations)
* **Firestore Hookups**:
  * Direct collection writes via Web SDK inside client code (no intermediate server-side actions).
  * Uses collections `products` and `admin_logs`.
* **Insert/Edit Save Handler (`handleSave` in lines 281-395)**:
  * Triggers confirmation dialog `requestConfirm`.
  * Checks for unique slugs (line 301): If not editing, it loops while document with `finalSlug` exists, appending a sequential integer (`-1`, `-2`, etc.) to prevent overwrite.
  * Uploads any modified files to ImgBB.
  * Construct a payload `productData`. Undefined fields are stripped by executing `JSON.parse(JSON.stringify(productData))` to conform to Firestore limits.
  * **Update Operations**: Writes to `doc(db, "products", editingProduct.id)` using `updateDoc()` and logs action `UPDATE_PRODUCT` (line 357).
  * **Insert Operations**: Writes to `doc(db, "products", finalSlug)` using `setDoc()` and logs action `CREATE_PRODUCT` (line 369).
* **Delete Product (`handleDelete` in lines 397-419)**:
  * Deletes document using `deleteDoc(doc(db, "products", id))`.
* **CSV Import (`handleImportCSV` in lines 504-594)**:
  * Uses `Papa.parse` to read uploaded CSV.
  * Iterates rows: parses JSON for `features` and `howToUse` arrays.
  * Resolves ID/slug generation: checks for existing documents using `getDoc` to determine whether to call `updateDoc` (if exists) or `setDoc` (if new).

## 3. Product Categories Handling
* **Category Field**:
  * Rendered as a free-text input with suggested values from a `<datalist id="categories-list">` (lines 718-734).
  * **Not** a strict select field; admins can type any new category they desire.
  * Default options suggested by the datalist:
    * `tool` (Công Cụ)
    * `course` (Khóa Học)
    * `combo` (Combo)
    * `free` (Miễn Phí)
    * Any custom categories populated dynamically from active products in local state (`uniqueCategories`).

## 4. Inserting Direct Link Conversion / Field Parsing
* **Conversion Need**:
  * Currently, the product object lacks a download link property. A `downloadUrl` (or `execUrl`/`driveUrl`) is required so that users with permission can download tools or resources.
* **Suggested Utility (`lib/linkConverter.ts`)**:
  * Create a utility to parse Google Drive sharing URLs (converting `/file/d/[ID]/view` or `?id=[ID]` to `/uc?export=download&id=[ID]`), Dropbox (`dl=0` to `dl=1`), and other hosts.
* **Insertion Points**:
  * **React Form State**: Add `downloadUrl` state and render an input field in the product form modal.
  * **Form Submission (`handleSave`)**: 
    ```typescript
    const convertedLink = convertToDirectLink(downloadUrl);
    const productData = {
       ...
       downloadUrl: convertedLink
    }
    ```
  * **CSV Import/Export**: Add columns mapping the `downloadUrl` field.
  * **Product Details View (`components/ToolDetailClient.tsx`)**: Replace the placeholder `alert("Bắt đầu tải công cụ... (Tính năng đang phát triển)")` with a window redirection to the direct download link (`window.open(tool.downloadUrl, '_blank')`).

## 5. Testing Environment
* **Testing Framework**: Playwright (E2E testing).
* **Configuration**: `playwright.config.ts` in the project root. Tests are located in `./e2e` and are run against a local static web server serving the `out` directory (`npx http-server out -p 3000`).
* **Test Files**:
  * `e2e/admin.spec.ts`: Tests Admin Panel login redirection, layout, stats, products CRUD, order logs, user promotions, and CSV exports.
  * `e2e/tools.spec.ts`: E2E tests for the Tool Details page layout, breadcrumbs, pricing, FAQs, and exploration funnel.
* **How to Run Tests**:
  * Run all tests: `npm run test:e2e` or `npx playwright test`
  * Run specific spec: `npx playwright test e2e/tools.spec.ts`
