## 2026-06-21T15:26:59Z

Implement the Admin Dashboard features for the Next.js workspace at E:\Youtube\Ban Content\Web.

Please read E:\Youtube\Ban Content\Web\.agents\explorer_admin_dashboard\analysis.md for details of the proposed designs and code snippets.

Your tasks are:
1. Modify lib/firebase.ts to initialize and export Firebase Storage.
2. Create app/admin/layout.tsx to implement the Admin Guard (protecting all subroutes under /admin, checking userData?.role === 'admin', handling loading states, and displaying a sidebar navigation).
3. Modify components/Header.tsx to display an "Admin Panel" link for users who are logged in and have role === 'admin'. Show it in both desktop and mobile views.
4. Create app/admin/page.tsx to show Dashboard stats (total users, total revenue, orders count, transactions count).
5. Create app/admin/products/page.tsx to manage products. Implement product creation, editing, deleting, image upload to Firebase Storage, and list presentation.
6. Create app/admin/orders/page.tsx to list completed purchases from 'orders' collection and successful deposits from 'transactions' collection.
7. Create app/admin/users/page.tsx to list users and allow promoting users to admin.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

After implementation, run `npm run build` and `npm run lint` to verify that everything builds cleanly without compilation or linter errors.
Provide the build/linter output and results in your handoff report (handoff.md) in your working directory E:\Youtube\Ban Content\Web\.agents\worker_admin_dashboard.

Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_admin_dashboard.
Please send a message to me (the orchestrator) when you are done.
