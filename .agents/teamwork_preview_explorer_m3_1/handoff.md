# Handoff Report: Product Form Upgrade (R2)

## 1. Observation

- **State declarations in `app/admin/products/page.tsx`**:
  - Line 124: `const [features, setFeatures] = useState<{bold: string, text: string}[]>([]);`
  - Line 125: `const [howToUse, setHowToUse] = useState<string[]>([]);`
  
- **JSX List rendering using index as key in `app/admin/products/page.tsx`**:
  - Line 1079: `{features.map((feature, idx) => (`
  - Line 1136: `{howToUse.map((step, idx) => (`

- **Add buttons text/title in `app/admin/products/page.tsx`**:
  - Line 1075: `Thêm tính năng`
  - Line 1132: `Thêm bước`

- **E2E Test Specifications in `e2e/settings.spec.ts`**:
  - Line 327: `await expect(page.locator('button[title="Di chuyển lên"], button:has-text("↑")').first()).toBeVisible();`
  - Line 339: `const featureInputs = page.locator('input[placeholder="Nhập tính năng..."]');`
  - Line 362: `const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');`
  - Line 364: `await page.click('button:has-text("Thêm hướng dẫn")');`
  - Line 389: `await expect(step1Input).toHaveValue('Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher123');`
  - Line 538: `test('R2-B2: Empty settings/general Doc Autofill', async ({ page }) => { ...`
  - Line 621: `await page.locator('button[title="Xóa bước"], button:has-text("Xóa")').nth(1).click();`

---

## 2. Logic Chain

1. **Focus/Character Drop Protection:**
   Because the original lists map React components with index keys (lines 1079 and 1136), swapping elements inside the list swaps the values but keeps the cursor focus locked to the DOM input at that index. Changing the array state to hold unique stable React keys (`id`) and binding them with `key={item.id}` ensures React physically moves the DOM nodes together with their values during a reorder, preserving focus and preventing character drop.
   
2. **E2E Alignment:**
   The Playwright tests query the features inputs using `input[placeholder="Nhập tính năng..."]` (Line 339) and the instructions steps using `input[placeholder="Nhập bước hướng dẫn..."]` (Line 362). The tests also add steps using `Thêm hướng dẫn` (Line 364) and delete steps using a button with title `Xóa bước` (Line 621). Thus, placeholders, button text, and button titles must be refactored to match these selectors exactly.

3. **Autofill Mechanism & Fallbacks:**
   When category becomes `"tool"` and the modal is in "creation" mode, we must prefill step 1 with the message containing the general settings download link. Fetching `settings/general` on component mount ensures the download url is ready. Using a state variable `hasPrefilled` ensures that the autofill only runs once on category change and does not repeatedly overwrite manual modifications. If the settings document is empty or missing, `launcherDownloadUrl` is empty, which falls back to an empty string `""` for the first step as required by test `R2-B2`.

---

## 3. Caveats

- We assume Firestore does not expect `id` fields in `features` or `howToUse`. Sanitization mapping back to database format must be performed during document save/update (lines 388-389).
- Other than `app/admin/products/page.tsx`, no other modules require refactoring for this milestone.

---

## 4. Conclusion

The implementation requires:
1. Adjusting features and instructions states to use array of objects with stable IDs.
2. Fetching general download URL on mount.
3. Hooking category change during product creation to trigger autofill.
4. Rewriting Features and instructions JSX rendering to output correct buttons, placeholders, and titles to satisfy E2E requirements.

---

## 5. Verification Method

To verify the changes, run:
```powershell
npx playwright test e2e/settings.spec.ts -g "R2:"
```

Verify that the following tests pass:
- `R2-F1: Reorder Buttons Render`
- `R2-F2: Reorder Features List (Up/Down)`
- `R2-F3: Reorder How to Use List (Up/Down)`
- `R2-F4: Product Creation Step 1 Autofill`
- `R2-F5: Array Boundary Controls`
- `R2-B1: Reordering Array of Size 1`
- `R2-B2: Empty settings/general Doc Autofill`
- `R2-B3: Post-Autofill Editability`
- `R2-B4: Empty Fields Reordering`
- `R2-B5: Duplicate Array Deletion Re-indexing`
