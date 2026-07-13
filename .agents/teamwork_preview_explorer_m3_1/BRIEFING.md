# BRIEFING — 2026-06-26T09:40:00+07:00

## Mission
Analyze the implementation of R2: Product Form Upgrade in `app/admin/products/page.tsx`

## 🔒 My Identity
- Archetype: Explorer
- Roles: Teamwork explorer
- Working directory: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m3_1
- Original parent: dbfc8a46-5283-45c4-9ff3-c49fd5c6f867
- Milestone: Milestone 3: Product Form Upgrade (R2)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Run in CODE_ONLY network mode: no external HTTP/HTTPS clients

## Current Parent
- Conversation ID: dbfc8a46-5283-45c4-9ff3-c49fd5c6f867
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `app/admin/products/page.tsx`
  - `e2e/settings.spec.ts`
- **Key findings**:
  - `features` and `howToUse` state variables must use array-of-objects structure with unique `id` keys to ensure reactiveness and prevent focus/character loss during swap.
  - UI inputs/buttons must match E2E spec selectors (e.g., placeholder "Nhập tính năng...", "Nhập bước hướng dẫn...", button text "Thêm hướng dẫn", title "Xóa bước").
  - `settings/general` should be fetched on mount to obtain the `download_url`, prefilling the first step of `howToUse` when category becomes `"tool"` during new product creation.
- **Unexplored areas**: None.

## Key Decisions Made
- Use a component-mount useEffect to fetch settings.
- Use a session-based state `hasPrefilled` to ensure pre-fill runs exactly once.
- Refactor array lists to map database models to object keys with stable IDs.

## Artifact Index
- E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m3_1\ORIGINAL_REQUEST.md — Original request
