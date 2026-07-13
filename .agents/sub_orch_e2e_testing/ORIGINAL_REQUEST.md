# Original User Request

## 2026-06-26T02:15:31Z

You are the E2E Testing Orchestrator for the System Settings, Products Form Upgrade, and Public Download Page task.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\sub_orch_e2e_testing
Your identity is: teamwork_preview_orchestrator
Please read the user's requirements from E:\Youtube\Ban Content\Web\.agents\ORIGINAL_REQUEST.md under `## Follow-up — 2026-06-26T02:14:07Z` and the root E:\Youtube\Ban Content\Web\PROJECT.md.

Your objective is to:
1. Decompose the E2E testing requirements and write E:\Youtube\Ban Content\Web\TEST_INFRA.md.
2. Design and write Playwright tests inside `e2e/settings.spec.ts` covering:
   - R1: Admin settings form (Version, Download Link, Force Update), saving to firebase `settings/general`, reloading page to verify it persists.
   - R2: Up/Down buttons in Product Form for features & how-to-use lists, checking item positions and ensuring no characters are lost. Checking that creating a new product has Step 1 auto-filled with the settings download URL: "Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]".
   - R3: Public download page loading launcher url from database and displaying download button. Header navbar contains a link to download page.
3. Test case design should follow a 4-tier approach:
   - Tier 1: Feature Coverage (>=5 per feature)
   - Tier 2: Boundary & Corner Cases (>=5 per feature)
   - Tier 3: Cross-Feature Combinations (pairwise coverage)
   - Tier 4: Real-world user flows
4. Run/execute these tests (or delegate to a worker to run them) to verify they compilation-pass and fail on the unimplemented logic.
5. When complete, publish TEST_READY.md at E:\Youtube\Ban Content\Web\TEST_READY.md and write your handoff.md in your working directory. Send a message to me (your parent caller) stating you have completed your milestone.
