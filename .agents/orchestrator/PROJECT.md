# Project: Ban Content Tool Detail Page Integration

## Architecture
- **Tech Stack**: Next.js 14 (App Router), Tailwind CSS, GSAP, Lucide React (icons), Playwright.
- **Routing**:
  - `/` -> Landing page with Hero Carousel and Hot Tools grid.
  - `/tools/[id]` -> Dynamic tool detail page showing images, features list, price, and CTA.
- **Data Flow**:
  - Shared data store `data/tools.ts` containing schema and array of tool details.
  - Landing page import `tools` to link to detail pages.
  - Dynamic page `app/tools/[id]/page.tsx` reads matching tool from data store based on `params.id`.
- **Styling Guidelines**:
  - Glassmorphism dark mode parity: background `bg-zinc-950`, text `text-zinc-100`/`text-zinc-400`.
  - Neon purple highlights (`text-purple-500`, `bg-purple-500`, border glows).
  - High-fidelity responsiveness (Mobile + Desktop).

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | E2E Testing Suite Extension | Extend Playwright tests with detail page selector contracts, navigation flows, and dynamic route validations | None | DONE | 0dd31f0f-9223-4212-8553-229319963b66, 4b2924c8-1ad7-4e5b-a47d-65cd9255d022, 7605a408-eced-42d6-b162-ecca37eeb280 |
| 2 | Shared Data Store | Implement `data/tools.ts` with structured definitions for at least 2 tools (Ban Content and Healing Bird) | None | DONE | 6f0c7612-6883-47ab-92d4-dea9c1f94f0f |
| 3 | Dynamic Route and Detail UI | Implement `app/tools/[id]/page.tsx` with high-fidelity Glassmorphism layout (Header, breadcrumb, features table, price, CTA) | M2 | DONE | 6f0c7612-6883-47ab-92d4-dea9c1f94f0f |
| 4 | Homepage Navigation Integration | Integrate "Xem Chi Tiết" Carousel buttons and "Hot Tools" cards to link to dynamic tool paths | M3 | DONE | 6f0c7612-6883-47ab-92d4-dea9c1f94f0f |
| 5 | E2E Verification & Audit | Validate build, run test cases, perform Forensic Integrity Audit, resolve any remaining issues | M1, M3, M4 | DONE | 860fbf89-85c0-4ef5-8124-d4db9ad71f2c, e9f62a20-7731-43d9-b764-a7c704f3d473, f4fd1033-60a5-49c7-a3c6-c294bd414dfd, 01c97e5d-0481-4db2-be25-e55d8b36403a |

## Interface Contracts
### Data Store ↔ Tools Detail Component
- Data Type: `ToolData` structure:
  - `id`: string (slug, e.g. `ban-content`, `healing-bird`)
  - `name`: string
  - `tag`: string
  - `titlePrefix`: string
  - `titleHighlight`: string
  - `description`: string
  - `price`: string
  - `image`: string
  - `features`: Array of `{ bold: string; text: string }`
  - `theme`: string (Tailwind classes for text/background gradients)
  - `glow`: string (Tailwind glow classes)
  - `howToUse`: Array of strings
  - `faq`: Array of `{ question: string; answer: string }`

### Landing Page ↔ Tools Detail Routing
- Click action on "Xem Chi Tiết" or Card navigates to `/tools/[id]`.
- Navigation utilizes `next/link`.

## Code Layout
```
E:\Youtube\Ban Content\Web
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # Homepage containing links to details page
│   ├── tools/
│   │   └── [id]/
│   │       └── page.tsx  # Dynamic tool detail page
│   └── hub/
│       └── page.tsx      # App Hub page
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── data/
│   └── tools.ts          # Shared data store
├── e2e/
│   ├── app.spec.ts       # Existing E2E test cases
│   └── tools.spec.ts     # E2E test cases for dynamic detail routes
└── package.json
```
