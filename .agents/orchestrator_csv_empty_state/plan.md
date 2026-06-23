# Execution Plan - Advanced CSV Export & Homepage Coming Soon Fallback

This plan outlines the milestones and steps required to implement the Advanced CSV Export feature in the Admin Dashboard and the Homepage Coming Soon fallback.

## Milestones

### Milestone 1: Homepage Coming Soon (Empty State) Fallback (R2)
- **Objective**: Restore the original sparkling glow cards on the homepage (`app/page.tsx`) when the courses or tools collections from Firestore are empty.
- **Decomposition**:
  1. Explore `app/page.tsx` and identify where `TOOLS` and `COURSES` arrays are rendered.
  2. Implement an Empty State render condition checking if `COURSES` or `TOOLS` arrays are empty (length === 0) after `loading` becomes false.
  3. Recreate the original Coming Soon cards layout, matching the styles, glow colors, and sparkling star animations.
  4. Ensure the layout remains responsive and fits the Glassmorphism theme.
- **Verification**: Seeding an empty products array in Playwright mock and ensuring the homepage renders the Coming Soon cards correctly.

### Milestone 2: Advanced CSV Export (R1)
- **Objective**: Implement a CSV Export feature in the Admin Dashboard using `papaparse` with filters.
- **Decomposition**:
  1. Install/Verify `papaparse` package (already in dependencies).
  2. Implement a CSV Export UI on the Admin Dashboard (`app/admin/page.tsx`), providing options for:
     - Date filters: custom start/end dates, day/month/year.
     - Product filter.
     - User account filter.
     - Report types: Monthly Revenue, Revenue by Product, Top Spending Users, Top Free Resource Users, Most Used Tools/Courses.
  3. Implement data fetching and calculations based on selected filters.
  4. Use `papaparse` to format the CSV with proper headers. Add BOM (\uFEFF) for UTF-8 Vietnamese Excel compatibility.
- **Verification**: Trigger CSV downloads with varying filters, checking output matches schema.

### Milestone 3: E2E Testing, Auditing & Final Handoff
- **Objective**: Ensure 100% test coverage and perform a forensic audit of the implementation.
- **Decomposition**:
  1. Write E2E test cases in Playwright covering the empty state display on the homepage, and CSV export functionality.
  2. Run the Playwright test suite to verify success.
  3. Perform Forensic Audit using the Forensic Auditor tool.
  4. Write final handoff and send completion message to Sentinel.
