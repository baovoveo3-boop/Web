# Handoff Report: Advanced CSV Export Design

## 1. Observation

- **Data Querying & Storage**: In `app/admin/page.tsx`, data from collections `users`, `orders`, and `transactions` is fetched via Firestore `getDocs` on mount:
  ```typescript
  // Fetch users
  const usersSnap = await getDocs(collection(db, "users"));
  // Fetch orders
  const ordersSnap = await getDocs(collection(db, "orders"));
  // Fetch transactions (deposits)
  const txSnap = await getDocs(collection(db, "transactions"));
  ```
  And saved into the `rawData` state:
  ```typescript
  const [rawData, setRawData] = useState<RawData>({
    users: [],
    orders: [],
    transactions: []
  });
  ```
- **In-Memory Filtering**: Date filtering is done in-memory via `parseFirestoreDate` helper mapping firestore Timestamp formats to JS `Date` objects.
- **Dependencies**: The `package.json` file contains:
  ```json
  "papaparse": "^5.5.4"
  ```
  in dependencies and:
  ```json
  "@types/papaparse": "^5.5.2"
  ```
  in devDependencies.
- **Missing Collections**: The `products` collection is not currently fetched in `app/admin/page.tsx` but is available in Firestore (queried in `app/admin/products/page.tsx`).

---

## 2. Logic Chain

1. **Feature Expansion**:
   - The user requires the ability to aggregate data based on product categories (for free resource usage) and resource types (for ranking).
   - *Result*: The dashboard fetching logic must be expanded to query the `products` collection on mount and store it in the state.
2. **UI Integration**:
   - To keep the dashboard clean, we recommend a floating Modal that overlays when a new "Xuất báo cáo CSV" button next to existing filter controls is clicked.
3. **Date Filters Design**:
   - The user requests custom date filters: day/month/year selectors and custom date range from/to inputs.
   - *Result*: Two distinct modes are designed:
     - **Selector Mode**: A grid of `Year`, `Month` (dependent on Year), and `Day` (dependent on Month/Year) HTML select dropdowns.
     - **Range Mode**: Two date input fields (`Từ ngày` and `Đến ngày`).
     - A state-driven toggle shifts between these two modes.
4. **Data Aggregation**:
   - **Monthly Revenue**: Formed by grouping COMPLETED orders and SUCCESS transactions by month (`YYYY-MM`).
   - **Product Revenue**: Formed by aggregating price values from order `items` where order status is COMPLETED.
   - **Top Spending Users**: Formed by grouping COMPLETED orders by `userId` and joining user metadata (email, displayName) from the `users` collection.
   - **Top Free Resource Users**: Filters order items where price is 0 or product category is `"free"`, then groups by `userId`.
   - **Ranking of Tools/Courses**: Ranks product items by frequency inside completed orders, joined with product metadata (name, type, category).
5. **Formatting and Excel Compatibility**:
   - Papaparse's `Papa.unparse` converts objects to raw CSV strings.
   - Microsoft Excel on Windows reads UTF-8 with accents correctly only when prefixed with the UTF-8 Byte Order Mark (BOM) `\uFEFF`.
   - *Result*: A Client-side Blob creation adds `\uFEFF` before download.

---

## 3. Caveats

- **Firestore Scale**: This approach fetches full collections from Firestore and filters them in-memory. For extremely large datasets, this might cause high read usage and slow page loading. If the database scales beyond tens of thousands of records, Firestore queries should be refactored to use server-side limits and filters (e.g., querying by `createdAt` bounds).
- **Product Matching**: Orders store an array of items with IDs and names. We assume item IDs correspond directly to the slugs used in the `products` collection for metadata matching.

---

## 4. Conclusion

The Advanced CSV Export feature can be implemented inside `app/admin/page.tsx` as a read-only extension using the existing UI layout structure. Integrating a Modal with state-driven date selectors and client-side Papaparse parsing (prefixed with BOM) offers a robust, user-friendly method for generating all 5 required reports.

---

## 5. Verification Method

To verify the design once implemented:
1. Run the local build command to ensure no typescript issues:
   ```bash
   npm run build
   ```
2. Run Next.js linting tool:
   ```bash
   npm run lint
   ```
3. **Execution Invalidation Conditions**:
   - If downloading a report yields broken characters for accents (e.g., `Doanh thu hàng tháng` looks like `Doanh thu hÃ ng thÃ¡ng`), verify that the BOM `\uFEFF` is correctly added at the very beginning of the Blob content.
   - If the free user report or product ranking shows empty or "N/A" category/type fields, verify that `products` collection is correctly fetched on mount and product IDs in orders match product IDs in the `products` collection.
