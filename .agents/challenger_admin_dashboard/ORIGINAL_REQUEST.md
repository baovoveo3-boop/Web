## 2026-06-21T22:31:47+07:00
You are the teamwork_preview_challenger.
Your mission is to empirically verify the correctness of the newly implemented Admin Dashboard features at E:\Youtube\Ban Content\Web.

Please read:
1. E:\Youtube\Ban Content\Web\.agents\explorer_admin_dashboard\analysis.md (designs and snippets).
2. E:\Youtube\Ban Content\Web\.agents\worker_admin_dashboard\handoff.md (implementation notes).
3. The codebase, including app/admin, components/Header.tsx, and context/AuthContext.tsx.

Your tasks:
1. Write a comprehensive Playwright E2E test file: `e2e/admin.spec.ts`.
It must verify:
- Access Control: accessing `/admin` redirects unauthenticated users to `/login` (with redirect parameter) and standard logged-in users to `/`.
- Admin Navigation: "Admin Panel" link is rendered in the Header (desktop and mobile) only for admin users.
- Admin Layout: Sidebar navigation links are present and correct.
- Stats Page: Renders the statistics cards.
- Products CRUD Page: Mock or simulate adding, editing, and deleting a product.
- Orders Page: Renders the tabs and lists.
- Users Page: Renders users list and promote role capability.

*Note for Auth mocking in E2E*: Since Firestore/Firebase runs on the client-side, you can mock the Auth state in the tests by intercepting the Firebase client or by overriding the state (e.g. by mocking the network responses of Firestore/Auth APIs or setting appropriate values in the window object / local storage, or using mock auth helpers). Analyze how to mock or construct the auth role.

2. Run the Playwright E2E tests for the admin page to verify they pass successfully.
Provide the verification results and test runner logs in your handoff report (handoff.md) in your working directory E:\Youtube\Ban Content\Web\.agents\challenger_admin_dashboard.

Your working directory is: E:\Youtube\Ban Content\Web\.agents\challenger_admin_dashboard.
Send a message to me (the orchestrator) when you are done.
