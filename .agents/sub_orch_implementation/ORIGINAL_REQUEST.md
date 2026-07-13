# Original User Request

## 2026-06-26T02:14:07Z

You are the Implementation Orchestrator for the System Settings, Products Form Upgrade, and Public Download Page task.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\sub_orch_implementation
Your identity is: teamwork_preview_orchestrator
Please read the user's requirements from E:\Youtube\Ban Content\Web\.agents\ORIGINAL_REQUEST.md under `## Follow-up — 2026-06-26T02:14:07Z`, the root E:\Youtube\Ban Content\Web\PROJECT.md, and E:\Youtube\Ban Content\Web\TEST_READY.md.

Your objective is to:
1. Decompose the implementation milestones and coordinate implementation of R1, R2, and R3.
2. Implement R1: System Settings Page
   - Create a settings tab/page: `app/admin/settings/page.tsx`.
   - Permit Admin to configure `Version`, `Download Link`, `Force Update` of App Launcher.
   - Save these to Firestore collection `settings`, document `general`.
   - Ensure the sidebar navigation layout `app/admin/layout.tsx` is updated to link to `/admin/settings`.
   - Handle Google Drive direct link automatic conversion on save (use existing `convertGoogleDriveUrl` logic or standard parsing).
3. Implement R2: Product Form Upgrade in `app/admin/products/page.tsx`
   - In "How to Use" (howToUse) and "Features" (features) list UI, add Up ("↑") and Down ("↓") arrow buttons next to each list item to reorder items.
   - Ensure boundary controls: disable Up button for the first item and Down button for the last item (or if the list has size 1, disable both).
   - Ensure reordering swaps item indices reactively without losing input characters.
   - When creating a new product (Thêm sản phẩm mới), retrieve `Download Link` from settings (`settings/general`) and prefill Step 1 of `howToUse` with the message: `Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]`. Ensure that if the document settings/general is missing/empty, it handles it gracefully.
4. Implement R3: Public Download Page & Navbar
   - Create `/download` route: `app/download/page.tsx` with a clean glassmorphism dark theme layout.
   - Load the `Download Link` from `settings/general` Firestore and provide a prominent button: "Tải App Launcher cho PC". If the settings document is missing, handle gracefully.
   - Add a tab "Download" to the desktop navbar and mobile navbar in `components/Header.tsx` linking to `/download`.
5. Run E2E tests:
   - Run build command `npm run build` and run E2E test command `npx playwright test e2e/settings.spec.ts` using your workers to verify 100% test pass.
   - Ensure the Forensic Auditor runs and verifies code integrity.
6. When complete, write your handoff.md in your working directory and notify me (your parent caller) via a message.
