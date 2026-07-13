## 2026-06-26T02:41:32Z
You are an Explorer agent for Milestone 4: Public Download Page & Navbar (R3).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m4_3
Your task is to analyze how to implement R3: Public Download Page & Navbar:
- Create `/download` route: `app/download/page.tsx` with a clean glassmorphism dark theme layout.
- Load the `Download Link` from `settings/general` Firestore and provide a prominent button: "Tải App Launcher cho PC". If the settings document is missing/empty, handle gracefully (e.g. show warning message: "Không tìm thấy phiên bản ứng dụng" and disable the download button, as expected by test `R3-B1`).
- Add a tab "Download" to the desktop navbar and mobile navbar in `components/Header.tsx` linking to `/download`. Ensure active class styling if needed (the test case `R3-B4: Navbar Active Styling` expects that the header link for Download gets marked with active styling class like `text-neonPurple` or `active` when visiting `/download`).

Analyze the codebase, specifically `components/Header.tsx` and how styles are written, and propose a concrete implementation plan. Do not edit any files. Write your analysis report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m4_3\analysis.md. Send a message to your parent when done.
