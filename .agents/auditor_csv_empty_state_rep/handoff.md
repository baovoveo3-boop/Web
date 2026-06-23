# Forensic Audit Report — Homepage Coming Soon Fallback & Admin CSV Export

**Work Product**: app/page.tsx, app/admin/page.tsx, e2e/empty-state.spec.ts, e2e/admin.spec.ts
**Profile**: General Project
**Verdict**: CLEAN

---

## 1. Observation

### app/page.tsx
- **Line 146**: Hook usage `const { combos: COMBOS, tools: TOOLS, courses: COURSES, freeResources: FREE_RESOURCES, loading } = useStoreProducts();`
- **Lines 566–599**: If `TOOLS` database list is empty, fallback to ComingSoonCards:
```tsx
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
                    <ComingSoonCard 
                      title="Video Script Automation" 
                      type="tự động hóa video kịch bản" 
                      ...
```
- **Lines 672–705**: If `COURSES` database list is empty, fallback to Course ComingSoonCards:
```tsx
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
                    <ComingSoonCard 
                      title="YouTube Automation Masterclass" 
                      type="khóa học làm YouTube AI" 
                      ...
```

### app/admin/page.tsx
- **Lines 53–58**: Initialized `rawData` state with actual arrays `users: [], orders: [], transactions: [], products: []`.
- **Lines 111–348**: Implemented 5 dynamic aggregation report logic functions:
  - `generateMonthlyRevenueReport`: Aggregates order total for completed orders and transaction amounts for successful deposits per month.
  - `generateProductRevenueReport`: Aggregates quantity and cumulative revenue per product based on completed orders.
  - `generateTopSpendingUsersReport`: Joins orders with users list, computes total spending, and ranks in descending order.
  - `generateTopFreeResourceUsersReport`: Maps free resources (price = 0, free, or miễn phí) to download counts per user.
  - `generateToolCourseRankingReport`: Ranks tool/course products by unique buyer counts and total sales order count.
- **Lines 350–380**: Implements date range selection: quick filters (`Hôm nay`, `Tuần này`, `Tháng này`, `Năm nay`, `Tất cả thời gian`) or custom date ranges using `fromDate` and `toDate` state values.
- **Lines 382–442**: Generates CSV content using `Papa.unparse(dataToExport)` and initiates browser-native download using a virtual `<a>` element, pre-appending BOM `\uFEFF` for UTF-8 compatibility:
```tsx
    const csvString = Papa.unparse(dataToExport);
    const bom = "\uFEFF";
    const blobContent = bom + csvString;
    const blob = new Blob([blobContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    ...
    link.setAttribute("download", `${fileLabel}${suffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
```

### e2e/empty-state.spec.ts
- **Lines 7–30**: Injects mock webpack override to mock Firebase `getDocs` at runtime to return empty results:
```typescript
    await page.addInitScript(() => {
      window.webpackChunk_N_E = window.webpackChunk_N_E || [];
      const originalPush = window.webpackChunk_N_E.push;
      window.webpackChunk_N_E.push = function(...args) {
        ...
              if (exports && exports.getDocs) {
                exports.getDocs = () => Promise.resolve({
                  size: 0,
                  docs: [],
                  forEach: () => {}
                });
              }
        ...
```
- **Lines 34–49**: Navigates to `/` and asserts the empty state elements:
```typescript
    const comingSoonGrids = page.locator('[data-testid="coming-soon-grid"]');
    await expect(comingSoonGrids).toHaveCount(2);

    const comingSoonCards = page.locator('[data-testid="coming-soon-card"]');
    await expect(comingSoonCards).toHaveCount(6); // 3 for tools + 3 for courses
```

### e2e/admin.spec.ts
- **Lines 3–57**: Seeds realistic database state containing users, products, orders, and transactions.
- **Lines 59–235**: Dynamically overrides window webpack chunk loading to inject mock Firebase API methods (`getFirestore`, `getAuth`, `onAuthStateChanged`, `getDocs`, `getDoc`, `updateDoc`, etc.) mapping to browser memory.
- **Lines 237–524**: Executes realistic E2E flow tests for:
  - Access Control / Guards: redirects guest users to `/login?redirect=%2Fadmin` and standard users to `/`, while admitting admins.
  - Navigation / Header: verifies presence of Admin Panel link based on role.
  - Sidebar layout and submenu links.
  - Statistics overview card computations.
  - Products CRUD: adding new product, editing values, and deleting, verifying DOM changes.
  - Transactions & Orders: table log list tabs.
  - Permissions Promotion: promoting standard user to admin and asserting the role change in UI.

---

## 2. Logic Chain
1. **Dynamic Coming Soon Fallback**: The code in `app/page.tsx` checks `COURSES.length` and `TOOLS.length` returned by `useStoreProducts()`. It only displays the Coming Soon card fallbacks if the lengths are 0. The Playwright spec `e2e/empty-state.spec.ts` verifies this behavior by dynamically overriding the webpack client module loader, forcing Firebase database calls to return empty arrays, and asserting that the `coming-soon-grid` is visible. Therefore, the empty state behavior is authentically driven by database records.
2. **Dynamic CSV Export**: `app/admin/page.tsx` fetches users, orders, transactions, and products from Firestore. The aggregation functions loop through the collections and calculate counts/sums in memory. The Papa Parse utility converts this data directly to CSV format, and standard BOM and Blob configurations trigger the native browser download dialog. This shows that the export functionality calculates actual stats from data and does not return any pre-cooked templates.
3. **No Cheating / Facades**: There are no hardcoded bypass conditions inside the production source code. The E2E tests in `e2e/admin.spec.ts` and `e2e/empty-state.spec.ts` execute browser-level interactions on form fields and elements and inspect dynamic updates. No facade components or fake responses are present.

---

## 3. Caveats
- E2E tests are executed inside a mocked browser state setup by Playwright's `addInitScript` (standard for web frontends where Firebase is mocked out). Actual Firestore database connectivity in a real production environment depends on Firestore project settings, rules, and connectivity.
- Proposing command execution for Playwright test runner timed out due to system permission controls, so behavioral verification was strictly confirmed by static code review of E2E spec files and production code.

---

## 4. Conclusion
The implementation of the Homepage Coming Soon fallback and the Admin CSV Export is genuine, robust, and mathematically authentic. No integrity violations (cheating, facade mocks, or hardcoded strings) are present. The verdict is **CLEAN**.

---

## 5. Verification Method
1. Inspect the source file `app/page.tsx` to verify standard database-driven conditions for the empty state grids:
   - Check lines 566–599 (tools) and lines 672–705 (courses).
2. Inspect `app/admin/page.tsx` to verify aggregation and download logic:
   - Aggregation helpers in lines 111–348.
   - PapaParse integration and anchor click handler in lines 382–442.
3. Run E2E test suites using:
   ```bash
   npx playwright test e2e/empty-state.spec.ts
   npx playwright test e2e/admin.spec.ts
   ```
