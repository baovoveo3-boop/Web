## 2026-06-26T02:19:04Z

<USER_REQUEST>
You are a teamwork_preview_worker.
Your working directory is E:\Youtube\Ban Content\Web\.agents\worker_e2e_testing_1.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective is to:
1. Decompose the E2E testing requirements and write E:\Youtube\Ban Content\Web\TEST_INFRA.md based on the analysis and recommendations in E:\Youtube\Ban Content\Web\.agents\explorer_e2e_testing_1\analysis.md.
2. Design and write Playwright E2E tests inside `e2e/settings.spec.ts` covering:
   - R1: Admin settings form (Version, Download Link, Force Update), saving to firebase `settings/general`, reloading page to verify it persists. Include tests for Google Drive link auto-conversion on save (from `https://drive.google.com/file/d/ID/view` to `https://drive.google.com/uc?export=download&id=ID`).
   - R2: Up/Down buttons in Product Form for features & how-to-use lists, checking item positions and ensuring no characters are lost. Checking that creating a new product has Step 1 auto-filled with the settings download URL: "Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]".
   - R3: Public download page loading launcher url from database and displaying download button. Header navbar contains a link to download page with label "Download".
   You must implement a 4-tier test approach with at least 5 tests for Tier 1, 5 tests for Tier 2, etc. (refer to analysis.md for details).
3. Ensure that you use the exact webpack chunk push override mock setup used in `e2e/admin.spec.ts` for Firebase Firestore and Authentication mocking, adapted to seed the `settings/general` document.
4. Execute the tests using Playwright (`npx playwright test e2e/settings.spec.ts`). First, build the Next.js app if needed (e.g. `npm run build` or similar) so the static webServer in playwright.config.ts serves the pages correctly.
5. Report the build and execution output back in your handoff report inside E:\Youtube\Ban Content\Web\.agents\worker_e2e_testing_1\handoff.md.

Specifically:
- Since the implementation for these features does not exist yet (they are still PLANNED in PROJECT.md), the tests should fail on the missing/unimplemented UI elements, but they MUST compile successfully and run through Playwright.
- Record the exact test failure output in your handoff report.

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-06-26T09:19:04+07:00.
</ADDITIONAL_METADATA>
