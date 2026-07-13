## 2026-06-26T02:33:19Z

You are a Worker agent for Milestone 2: Admin System Settings (R1).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m2

Task: Implement R1: System Settings Page and update the layout navigation.
Specifically:
1. Modify `app/admin/layout.tsx`:
   - Import `usePathname` from `next/navigation`.
   - Update the redirect guard logic: replace `/login?redirect=/admin` with `/login?redirect=${encodeURIComponent(pathname)}`.
   - Add a navigation link to `/admin/settings` ("⚙️ Cấu hình Hệ thống") in the desktop sidebar layout (e.g. after Quản lý Người dùng).
   - Add a navigation link to `/admin/settings` ("⚙️ Cấu hình") in the mobile navigation bar layout (e.g. after Người dùng).
2. Create `app/admin/settings/page.tsx`:
   - Admin settings page handling `version`, `download_url`, and `force_update`.
   - Use standard Google Drive URL conversion logic on save:
     ```typescript
     const convertGoogleDriveUrl = (url: string): string => {
       if (!url) return "";
       const trimmed = url.trim();
       const fileMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
       if (fileMatch && fileMatch[1]) {
         return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
       }
       const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
       if (trimmed.includes("drive.google.com/open") && openMatch && openMatch[1]) {
         return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
       }
       return trimmed;
     };
     ```
   - Make sure inputs bind correctly, with placeholders "VD: 1.0.0" and "Nhập link Google Drive...", and that required constraints are set.
   - For saving settings, implement a confirmation modal that shows a button with text "Xác nhận thao tác". On click, perform the Firestore write to document `settings/general` and write an audit log entry using `logAdminAction`.
   - Implement "Hủy" button to revert to the last saved data from Firestore.
   - Handle fallback gracefully if the `settings/general` document does not exist yet.
3. Build the application (`npm run build`) and run E2E tests for R1 to verify success:
   `npx playwright test e2e/settings.spec.ts -g "R1:"`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m2\handoff.md and report to your parent when done.
