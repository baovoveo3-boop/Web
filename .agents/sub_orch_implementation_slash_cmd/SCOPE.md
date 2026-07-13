# Scope: Slash Command Implementation

## Architecture
- Target file: `app/admin/products/page.tsx`
- Modify the admin products page component to add a floating absolute-positioned suggestions box.
- Triggered when `/` is typed inside:
  - "Cách sử dụng" (howToUse) input fields.
  - FAQ "Câu hỏi" (question) input fields.
  - FAQ "Câu trả lời" (answer) textarea fields.
- Suggestions lists:
  - `[Trang Download](/download)`
  - `[Khóa Học](/courses)`
  - `[Đăng Nhập](/login)`
  - `[Khám Phá Hub](/hub)`
- Behavior:
  - Replaces text from trigger `/` to the cursor/end of word with the selected markdown link.
  - Updates field state and cursor focus.
  - Closes on click of suggestion, blur, or deleting the trigger `/`.
  - Optimized rendering without lag.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Explore | Analyze code structure and inputs of `app/admin/products/page.tsx` | None | DONE |
| 2 | Implementation | Code changes via worker for Slash Command popup | M1 | DONE |
| 3 | Review | Code review, verify blur, click, value update and styling | M2 | DONE |
| 4 | Phase 1 E2E | Poll `TEST_READY.md` and pass 100% of E2E test suites (Tier 1-4) | M3 | DONE |
| 5 | Phase 2 Hardening | Adversarial tests generation and debugging with Challenger | M4 | DONE |
| 6 | Audit & Compile | Forensic Auditor checks for integrity and compile checks | M5 | DONE |

## Interface Contracts
- Suggestions text and formatting:
  - Trang Download: `[Trang Download](/download)`
  - Trang Khóa học: `[Khóa Học](/courses)`
  - Trang Đăng nhập: `[Đăng Nhập](/login)`
  - Khám phá Hub: `[Khám Phá Hub](/hub)`
- State syncing: ensure React states (e.g. `howToUse`, `faqs`) are fully updated with selected values.
