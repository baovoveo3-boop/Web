## 2026-06-26T02:30:49Z
You are an Explorer agent for Milestone 2: Admin System Settings (R1).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m2_3
Your task is to analyze how to implement R1: System Settings Page:
- Create settings tab/page: `app/admin/settings/page.tsx`.
- Permit Admin to configure `Version` (string), `Download Link` (string, saved as `download_url`), `Force Update` (boolean) of App Launcher.
- Save these to Firestore collection `settings`, document `general`.
- Ensure the sidebar navigation layout `app/admin/layout.tsx` is updated to link to `/admin/settings`.
- Handle Google Drive direct link automatic conversion on save (use existing `convertGoogleDriveUrl` logic or standard parsing).

Analyze the codebase and propose a concrete implementation plan. Do not edit any files. Write your analysis report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m2_3\analysis.md. Send a message to your parent when done.
