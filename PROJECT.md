# Project: Slash Command suggestions popup for Admin Products Form

## Architecture
- **Tech Stack**: Next.js (App Router), React 18, Tailwind CSS, Lucide icons.
- **Target File**: `app/admin/products/page.tsx`
- **Popup UI**: A floating suggestions box (dropdown menu) absolute-positioned right below the active input field. Styled in line with the site's dark mode (dark background, borders, hover states).
- **Trigger**: The menu shows up when typing `/` inside any "Cách sử dụng" (howToUse) input, "Câu hỏi" (faq.question) input, or "Câu trả lời" (faq.answer) textarea.
- **Link suggestions**:
  - Trang Download: `[Trang Download](/download)`
  - Trang Khóa học: `[Khóa Học](/courses)`
  - Trang Đăng nhập: `[Đăng Nhập](/login)`
  - Khám phá Hub: `[Khám Phá Hub](/hub)`
- **Auto-complete logic**:
  - Replacing the text from the last `/` in the input with the selected markdown link.
  - Hiding/closing the popup menu immediately.
  - Automatically closing the popup when focus is lost (onBlur) or when `/` is deleted.
- **State Management**:
  - Local state in `app/admin/products/page.tsx` to handle the active input's ID, position, visibility, suggestions list, and cursor details.
  - Ensure zero typescript strict mode compilation failures (`tsc --noEmit`).
  - Render optimized so that updates do not lag the dynamic fields.

## Milestones
| # | Name | Track | Scope | Dependencies | Status |
|---|---|---|---|---|---|
| 1 | E2E Test Suite Creation | Testing | Design and write comprehensive E2E tests in `e2e/slash_command.spec.ts` covering normal, boundary, cross-feature, and edge cases | None | DONE |
| 2 | Slash Command Implementation | Implementation | Implement the slash suggestions popup and auto-complete logic in `app/admin/products/page.tsx` | M1 | DONE |
| 3 | E2E Verification & Audit | Implementation | Run Playwright test suite, verify styling, typescript types, and run Forensic Integrity Auditor | M1, M2 | DONE |

## Code Layout
- `app/admin/products/page.tsx` - Products management dashboard page with form fields.
- `e2e/slash_command.spec.ts` - Playwright E2E verification test suite.

## Interface Contracts
- **Suggestions markdown links list**:
  - `[Trang Download](/download)`
  - `[Khóa Học](/courses)`
  - `[Đăng Nhập](/login)`
  - `[Khám Phá Hub](/hub)`
- **Popup Closure criteria**:
  - Selection of a suggestion link.
  - Clicking outside the input or dropdown.
  - Deleting the trigger `/`.
