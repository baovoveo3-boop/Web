## 2026-06-25T09:39:40Z
<USER_REQUEST>
You are a teamwork_preview_reviewer.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\reviewer_auto_update_final
Your task is to perform a final review of the CSV fixes and E2E test alignment changes:
1. Verify that the sample data array in `handleExportCSV` inside `app/admin/products/page.tsx` has exactly 23 elements matching the 23 header fields.
2. Verify that `handleImportCSV` wraps `download_url` with `convertGoogleDriveUrl`.
3. Verify that `e2e/admin.spec.ts` user promotion test overrides the mock role to `super_admin` and uses correct assertions (`Admin` text visible, `Lên Admin` button not visible).
Please write your findings in `E:\Youtube\Ba Content\Web\.agents\reviewer_auto_update_final\review_report.md` and handoff.md.
Send a message back to 3f39558a-8d9e-4dcd-8d2f-3fd25723d9a1 when done.
</USER_REQUEST>
