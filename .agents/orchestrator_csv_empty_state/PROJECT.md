# Project: Advanced CSV Export & Homepage Coming Soon Fallback

## Architecture
- **Tech Stack**: Next.js 14, React, Tailwind CSS, Lucide icons, Firebase Firestore, Papaparse.
- **Components involved**:
  - `app/page.tsx`: Homepage which fetches courses and tools. If empty, displays Coming Soon cards with Glassmorphism, glow borders, and star animations.
  - `app/admin/page.tsx`: Admin dashboard. Adds Advanced CSV Export modal/buttons, custom date filtering, and grouping/aggregating data for the five requested reports.
- **Database Collections**:
  - `users`: Registered users. Used for user profile/email resolution and user-based queries.
  - `orders`: Log of all paid and free product orders. Includes items details, price, userId, totalAmount, status, and createdAt.
  - `transactions`: Log of all wallet top-ups. Includes userId, userEmail, amount, status, and createdAt.
  - `products`: Product catalog. Used to match name/category if needed.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Homepage Empty State | Restore sparkling glow "Coming Soon" cards in `app/page.tsx` when courses or tools from Firestore are empty | None | PLANNED |
| 2 | Advanced CSV Export | Implement custom filters (date range, product, user) and 5 report types using `papaparse` with UTF-8/BOM in `app/admin/page.tsx` | None | PLANNED |
| 3 | Verification & Auditing | Write Playwright tests for empty state and CSV export, run test suite, and run Forensic Auditor | M1, M2 | PLANNED |

## Code Layout
- `app/page.tsx` - Homepage empty state logic and render.
- `app/admin/page.tsx` - CSV export controls and data formatting.
- `e2e/admin.spec.ts` - Admin dashboard Playwright E2E tests.
- `e2e/app.spec.ts` - Homepage empty state Playwright E2E tests.

## Interface Contracts
- **CSV Format**:
  - Comma-separated values, header row matching report fields.
  - Prepended with UTF-8 BOM (`\uFEFF`) to prevent Excel encoding issues with Vietnamese accents.
- **Empty State Condition**:
  - `COURSES.length === 0` or `TOOLS.length === 0` (or both) when `loading` is false.
