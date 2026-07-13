# Scope: E2E Test Suite for Slash Command Suggestions Popup

## Architecture
- **Tech Stack**: Playwright for E2E tests, Next.js (App Router) on frontend.
- **Form Components**: "Cách sử dụng" (howToUse) dynamic input fields, FAQ question (faq.question) dynamic input fields, FAQ answer (faq.answer) dynamic textarea fields.
- **Data Flow**: typing `/` -> show floating dropdown with 4 markdown links -> clicking suggestion replaces text from `/` -> closes menu -> updates state of form fields.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Test Case Definition | Enumerate all 71 test cases in `TEST_INFRA.md` | None | IN_PROGRESS |
| 2 | Playwright Test Suite | Write `e2e/slash_command.spec.ts` containing the E2E tests | M1 | PLANNED |
| 3 | Verification & Run | Run E2E test suite on local environment, verify failures (since features are not implemented yet), and publish `TEST_READY.md` | M2 | PLANNED |

## Interface Contracts
- **Slash Trigger**: Typing `/` inside active howToUse, faq.question inputs, or faq.answer textareas.
- **Link Suggestions**:
  - `[Trang Download](/download)`
  - `[Khóa Học](/courses)`
  - `[Đăng Nhập](/login)`
  - `[Khám Phá Hub](/hub)`
- **Autocomplete Logic**: Text from the last `/` in the input/textarea is replaced by the selected markdown link, updating the react-controlled input value and immediately closing the suggestions menu.
- **Popup Closure**:
  - Close on click selection.
  - Close on blur (clicking outside the input/textarea or menu).
  - Close on deleting the triggering `/`.
