# Context — Advanced CSV Export & Homepage Coming Soon Fallback

## System Understanding

### 1. Homepage (`app/page.tsx` & `hooks/useStoreProducts.ts`)
- The homepage loads products using the custom hook `useStoreProducts()`.
- The hook fetches all items from the Firestore collection `products`.
- It filters them into `combos`, `tools`, `courses`, and `freeResources` based on the `category` field.
- Currently, when `tools` and `courses` are empty, they render empty elements or broken lists.
- We need to detect if `tools` or `courses` are empty (length === 0) after fetching finishes (`loading` is false) and display Coming Soon cards.
- The original design of these cards featured high-fidelity Glassmorphism (glowing borders, sparkling stars/animations).

### 2. Admin Dashboard (`app/admin/page.tsx`)
- The dashboard is secure and accessible by users with the admin role.
- It displays stats (Revenue, Users, Orders, Transactions) fetched from Firestore.
- It already has a Date Parsing utility `parseFirestoreDate` to handle Timestamp and ISO string formats.
- It has Recharts visual components and filter options (Today, This Week, This Month, This Year).
- We need to add an Advanced CSV Export tool. This requires:
  - Adding UI elements (modal or control section) to select the report type, custom date ranges, product, and user filters.
  - Adding CSV generation logic using the `papaparse` library.
  - Outputting UTF-8 CSV with the Byte Order Mark (BOM) `\uFEFF` to support Vietnamese characters in Excel.

### 3. Firestore Schema
- `users`: `{ uid, email, displayName, walletBalance, currentTier, createdAt }`
- `orders`: `{ id, userId, items: [{ id, name, price }], totalAmount, status, createdAt }`
- `transactions`: `{ id, orderCode, userId, userEmail, amount, description, status, createdAt }`
- `products`: `{ id, name, description, price, originalPrice, badgeText, category, createdAt }`
- Note: Purchases of free resources have `totalAmount = 0` and are logged in `orders`.

## Target Code Files
- `app/page.tsx`: Homepage empty state fallback.
- `app/admin/page.tsx`: Admin CSV Export UI and data query/filtering logic.
- `e2e/admin.spec.ts`: Extend E2E tests for CSV Export.
- `e2e/app.spec.ts` / `e2e/tools.spec.ts`: Extend E2E tests for empty state.
