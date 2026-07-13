# Execution Plan: System Settings, Products Form Upgrade, and Public Download Page

## Objectives
1. Build the System Settings page in the Admin Dashboard (`/admin/settings`) to manage App Launcher config (`version`, `download_url`, `force_update`) in Firestore `settings/general`.
2. Upgrade the Admin Product Form (`/admin/products` / `app/admin/products/page.tsx`):
   - Add Up/Down buttons to reorder Steps ("How to Use") and Features list.
   - Autofill Step 1 of "How to Use" on product creation with the App Launcher download URL.
3. Build the Public Download page (`/download`) to fetch the download URL and provide a download link. Add "Download" to the Header navigation.
4. Verify correctness and completeness using Playwright E2E tests and Forensic Auditor.

## Decomposed Milestones & Tracks

### Track 1: E2E Testing Track (Sub-orchestrator: `teamwork_preview_orchestrator`)
- **Objective**: Design and build the E2E test suite in `e2e/settings.spec.ts`.
- **Requirements**:
  - Test Admin Settings: updating launcher config in settings page, checking it persists on page reload.
  - Test Product Form: clicking Up/Down arrows to reorder items, verifying text remains correct. Creating a new product and checking that Step 1 is pre-filled with the settings' download URL.
  - Test Download Page: displaying download button with direct link, and checking Navbar has "Download" link.
- **Output**: `e2e/settings.spec.ts` and `TEST_READY.md`.

### Track 2: Implementation Track (Sub-orchestrator: `teamwork_preview_orchestrator`)
- **Objective**: Implement all R1, R2, R3 changes, make sure build succeeds and all tests pass.
- **Requirements**:
  - Phase 1: Build Admin settings layout and Firestore integration.
  - Phase 2: Add reordering buttons to features & how-to-use lists, handle direct download URL converting, and autofill Step 1.
  - Phase 3: Create `/download` route, display beautiful UI, add Navbar link.
  - Phase 4: Run E2E test suite against the built application, solve failures, verify with Forensic Auditor.

## Parallel Track Coordination Workflow
1. Spawn E2E Testing Track Sub-orchestrator to design/write test suite.
2. Wait for `TEST_READY.md` from E2E Testing Track.
3. Spawn Implementation Track Sub-orchestrator to carry out implementation.
4. Once E2E tests pass 100% and Forensic Auditor approves, conclude task.
