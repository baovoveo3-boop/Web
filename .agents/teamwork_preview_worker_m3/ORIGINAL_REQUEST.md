## 2026-06-26T02:37:56Z
You are a Worker agent for Milestone 3: Product Form Upgrade (R2).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m3

Task: Implement R2: Product Form Upgrade in `app/admin/products/page.tsx`
Specifically:
1. Update component states for features and howToUse to support unique IDs:
   - `features` state: `{ id: string; bold: string; text: string }[]`
   - `howToUse` state: `{ id: string; value: string }[]`
2. Fetch the general configuration from Firestore collection `settings`, document `general` when the component mounts. Preserve `download_url` in a local state.
3. In `openAddModal`:
   - Reset feature and howToUse states.
   - If category is "tool" or when category becomes "tool" during creation, autofill Step 1 of `howToUse` with the message: `Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]` (where `[LINK]` is the fetched download URL).
   - If the `settings/general` document is missing or empty, handle it gracefully by prefilling Step 1 with empty string `""` rather than crashing (as required by test case `R2-B2`).
4. In `openEditModal`:
   - Map existing product features and howToUse to their unique ID state representations so they can be managed.
5. In UI lists rendering:
   - For `features` list: replace key with `feature.id`. Add Up ("↑") and Down ("↓") buttons next to each feature item. Set button titles: `title="Di chuyển lên"` and `title="Di chuyển xuống"`. Ensure Up is disabled for first item, Down is disabled for last item, and both are disabled if length is 1.
   - For `howToUse` list: replace key with `step.id`. Add the same Up/Down arrow buttons next to each step. Ensure Up is disabled for first item, Down is disabled for last item, and both are disabled if length is 1. Set button titles: `title="Di chuyển lên"` and `title="Di chuyển xuống"`.
   - Update input fields placeholders and buttons text as expected:
     - Features input placeholder: `"Nhập tính năng..."` (or keep existing placeholders if they match e2e tests expectations).
     - How to Use input placeholder: `"Nhập bước hướng dẫn..."` (as required by test).
     - How to Use add button text: `"Thêm hướng dẫn"`.
     - How to Use delete button title: `"Xóa bước"`.
6. In `handleSave`:
   - Sanitize product data before writing to Firestore: convert features back to `{ bold, text }[]` and howToUse back to `string[]` (i.e. strip the IDs) so the database schema is kept intact.
7. Run `npm run build` and run Playwright E2E tests:
   `npx playwright test e2e/settings.spec.ts -g "R2:"`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m3\handoff.md and report to your parent when done.
