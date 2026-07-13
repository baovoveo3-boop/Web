## 2026-06-26T02:42:52Z
You are a Worker agent for Milestone 4: Public Download Page & Navbar (R3).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m4

Task: Implement R3: Public Download Page & Navbar
Specifically:
1. Create `app/download/page.tsx`:
   - Design a clean, responsive glassmorphism dark theme layout for the App Launcher download page.
   - Fetch the settings document from Firestore collection `settings`, document `general` inside a client-side React `useEffect` hook.
   - Render the version number with exact prefix: `"Phiên bản: "` followed by the version value (e.g., `Phiên bản: 1.0.0`). Ensure that if the version string is extremely long, it wraps correctly (e.g. using `break-all`) to avoid causing horizontal scrollbars on the viewport.
   - If the settings document or the `download_url` is missing or empty, handle it gracefully by displaying the exact warning text `"Không tìm thấy phiên bản ứng dụng"` and rendering a disabled button element (`<button disabled>Tải App Launcher</button>` or similar text containing "Tải App Launcher").
   - If settings are found, render a prominent download button (`<a>` tag) with `href` pointing to the retrieved `download_url` and target `_blank`. The text should be "Tải App Launcher cho PC" or similar containing "Tải App Launcher".
2. Update `components/Header.tsx`:
   - Add a tab/link to `/download` in the desktop navbar with label `"Download"`.
   - Add a tab/link to `/download` in the mobile navigation menu with label `"Download"`.
   - Implement active styling class check using `pathname === '/download'`. Highlight the download link with either `active` or `text-neonPurple` class (e.g., `${pathname === '/download' ? 'text-neonPurple active' : 'text-zinc-300'}`).
3. Build the application (`npm run build`) and verify with E2E Playwright tests:
   `npx playwright test e2e/settings.spec.ts -g "R3"`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_worker_m4\handoff.md and report to your parent when done.
