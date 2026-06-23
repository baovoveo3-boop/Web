# Plan - Advanced Reporting Dashboard

## Execution Strategy
The implementation will be completed in 3 main steps, spawning specialized agents to ensure robust design, precise implementation, and strict integrity checks:

### Step 1: Install Dependencies & Setup (Milestone 1)
- **Objective**: Add `recharts` package, run next build to check compatibility.
- **Agent**: `teamwork_preview_worker` (Worker)
- **Verification**: Run `npm install recharts` and check Next.js build compilation.

### Step 2: Implement UI & Filters & Queries (Milestone 2)
- **Objective**: Complete implementation of the Advanced Reporting Dashboard inside `app/admin/page.tsx`.
- **Features**:
  - Time filter bar (Hôm nay, Tuần này, Tháng này, Năm nay).
  - Overall stats cards (preserving selectors for E2E tests).
  - 4 core charts:
    1. Revenue over time (completed orders + successful deposits).
    2. New user growth.
    3. Product sales ranking.
    4. Transaction success vs failure rates.
  - Safe Firestore Timestamp / Date parsing logic.
- **Agent**: `teamwork_preview_worker` (Worker)
- **Verification**: Local Next.js build compilation, manual check of charts.

### Step 3: Adversarial and E2E Verification & Auditing (Milestone 3)
- **Objective**: Verify features with E2E tests and forensic auditor check.
- **Agent**: `teamwork_preview_challenger` (Challenger) and `teamwork_preview_auditor` (Auditor)
- **Verification**: E2E test results, Forensic Auditor CLEAN verdict.
