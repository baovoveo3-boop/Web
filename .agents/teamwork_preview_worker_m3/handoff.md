# Handoff Report

## 1. Observation
- Modified file: `E:\Youtube\Ban Content\Web\app\admin\products\page.tsx`
- State definitions updated:
  - `features` state: updated from `{bold: string, text: string}[]` to `{ id: string; bold: string; text: string }[]` at line 124.
  - `howToUse` state: updated from `string[]` to `{ id: string; value: string }[]` at line 125.
  - Added `generalDownloadUrl` state: `const [generalDownloadUrl, setGeneralDownloadUrl] = useState<string>("");` at line 126.
- Mount `useEffect` updated:
  - Fetches settings from Firestore: `const docSnap = await getDoc(doc(db, "settings", "general"));` (line 183-195).
- Autofill `useEffect` added:
  - Automatically prefills step 1 when category is `"tool"` and is in creation mode: `if (isModalOpen && !editingProduct && category === "tool")` (line 197-213).
- Edit modal loading updated:
  - Mapped features and howToUse steps to unique IDs (line 228-254).
- Save sanitization added:
  - Sanitized features (removed IDs) and howToUse (mapped back to raw `string[]`) to ensure schema compatibility (line 373-379).
- UI Elements updated:
  - Reorder buttons for features (line 1096-1132) and steps (line 1149-1185) with disabled rules based on indexes.
  - Input placeholders changed to `"Nhập tính năng..."` and `"Nhập bước hướng dẫn..."` as expected by Playwright E2E tests.
  - Delete step button has title `"Xóa bước"`.
- Execution: Command execution timed out because approval prompts was not answered in time.

## 2. Logic Chain
- By upgrading features and howToUse state structure to support unique IDs, we can uniquely identify rendered inputs and avoid indexing issues during deletion, re-ordering, and rendering.
- By fetching general settings on mount, we can store `download_url` inside `generalDownloadUrl`.
- By adding a `useEffect` that listens to `category`, `isModalOpen`, `editingProduct`, and `generalDownloadUrl`, we can automatically set step 1 of howToUse to the download guide when category transitions to `"tool"` during new product creation. If the general config is empty or missing, `generalDownloadUrl` remains `""`, which maps to `""` in step 1, satisfying the `R2-B2` fallback case.
- In `openEditModal`, since the database stores them as raw objects/strings without IDs, mapping them to include IDs on modal open ensures that the reordering and editing UI works correctly.
- In `handleSave`, stripping the unique IDs ensures that the data written to Firestore complies with the existing schema, preventing database corruption or schema mismatch.
- Up and Down reorder buttons change indices within the array, swapping two items at a time. The boundary conditions (disabling Up on index 0, Down on last index, and both if length is 1) prevent index out of bound errors.

## 3. Caveats
- Since Playwright tests and building could not be run due to command execution timeout, verification was done through careful code analysis.
- Assumption: The settings collection is seeded correctly in the real environment. If the Firestore settings collection is missing, the code gracefully falls back to prefilling `""` in step 1 rather than throwing a runtime exception.

## 4. Conclusion
- The requirements of "R2: Product Form Upgrade" have been fully implemented in `app/admin/products/page.tsx`. The code is ready for testing and deployment.

## 5. Verification Method
- Code inspect: Check the modifications in `app/admin/products/page.tsx` against the specifications.
- E2E Playwright test command:
  ```bash
  npx playwright test e2e/settings.spec.ts -g "R2:"
  ```
- Build command:
  ```bash
  npm run build
  ```
