# Project Plan: Auto Update Configuration in Admin Dashboard

## Milestones and Steps

### Milestone 1: Exploration
- **Objectives**: Identify the product form implementation, database save logic, and validation pipeline. Check how category selection (e.g. `tool`) is managed.
- **Assigned to**: `teamwork_preview_explorer`
- **Output**: Investigation report detailing file paths, lines to edit, and implementation strategy.

### Milestone 2: Implementation
- **Objectives**: 
  - Add form section "Cấu hình Desktop App" containing inputs `exec_file`, `version`, `download_url`, `force_update` (toggle).
  - Show/enable this section only when the product category is `tool`.
  - Implement Google Drive link parsing and conversion to direct download link: `https://drive.google.com/uc?export=download&id=ID`.
  - Update saving function to include these fields in the `products` document in Firestore, with correct types.
- **Assigned to**: `teamwork_preview_worker`
- **Output**: Implementation of UI form changes, link conversion logic, database update, and passing local verification tests.

### Milestone 3: Review and Challenge
- **Objectives**: Review code quality, check responsiveness, look for layout breakages, and verify database integrity.
- **Assigned to**: `teamwork_preview_reviewer` and `teamwork_preview_challenger`
- **Output**: Code review reports, and execution of automated verification tests.

### Milestone 4: Forensic Audit & Victory Report
- **Objectives**: Run integrity forensics to guarantee no cheating, facades, or bypassed logic. Report results.
- **Assigned to**: `teamwork_preview_auditor`
- **Output**: Final audit verdict.
