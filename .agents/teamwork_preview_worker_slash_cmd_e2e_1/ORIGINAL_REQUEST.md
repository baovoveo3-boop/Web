## 2026-06-26T11:01:08Z

<USER_REQUEST>
You are teamwork_preview_worker. Your working directory is E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_slash_cmd_e2e_1.

Your task is to implement the E2E test cases for the Slash Command feature in Next.js Admin Products Form.

Follow these steps exactly:
1. Look at `e2e/settings.spec.ts` or `e2e/admin.spec.ts` to see how the Firebase/Firestore database is mocked using `setupMocks` in Playwright.
2. Create `e2e/slash_command.spec.ts` and implement at least 71 E2E tests (6 features * 5 tests/feature = 30 for Tier 1, 30 for Tier 2, 6 for Tier 3, 5 for Tier 4). Use structured and parameterized tests where appropriate, or write them out. Ensure each test is uniquely named and targets the elements described in our plan (suggestions popup menu `.slash-suggestions-menu` or `[data-testid="slash-suggestions-menu"]`).
   Specifically, cover:
   - Tier 1: 5 tests each for HowToUse trigger, FAQ Question trigger, FAQ Answer trigger, Suggestions Rendering, Autocomplete & Selection, and Popup Dismissal.
   - Tier 2: 5 tests each for HowToUse boundary, FAQ Question boundary, FAQ Answer boundary, Suggestions rendering boundary, Autocomplete boundary, and Dismissal boundary.
   - Tier 3: 6 tests for cross-feature combinations (multiple fields, focus shifts, delete/add, type and replace `/down` -> `[Trang Download](/download)`).
   - Tier 4: 5 tests for real-world user workflows (product creation, editing, copy-paste mix, validation error, IME keyboard).
3. Investigate the Playwright build/export setup:
   - Check if Next.js build fails with static HTML export (`output: 'export'`) because of dynamic API routes.
   - If it does, edit `playwright.config.ts` to run a dev server (e.g. `npm run dev` or `npx next dev -p 3000`) or standard start (`npm run start` after `npm run build`) in `webServer.command` instead of serving `out`.
4. Run the E2E tests:
   - Propose and run the command: `npx playwright test e2e/slash_command.spec.ts`.
   - Verify that all tests run and fail on the un-implemented code (this is expected as the feature is not implemented yet).
5. Update `TEST_INFRA.md` at project root to append the Slash Command test plan and features.
6. Create `TEST_READY.md` at project root, using the format of the previous `TEST_READY.md`, explaining how to run the slash command tests (`npx playwright test e2e/slash_command.spec.ts`), listing all 71 tests, and summarizing coverage.
7. Write your handoff report to `handoff.md` in your working directory and notify me when complete.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
