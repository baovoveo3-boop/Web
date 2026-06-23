# Handoff Report: Advanced CSV Export Feature Design

This handoff report summarizes the findings, reasoning, and technical specifications for implementing the Advanced CSV Export feature in the Admin Dashboard.

## 1. Observation
We observed the following regarding the admin page, project packages, and schemas:
*   **Firestore Collection Queries**: In `E:\Youtube\Ban Content\Web\app\admin\page.tsx` (lines 53-93), three Firestore collections are loaded on mount: `users`, `orders`, and `transactions`, and saved into state `rawData`:
    ```typescript
    // Fetch users (lines 59-64)
    const usersSnap = await getDocs(collection(db, "users"));
    // Fetch orders (lines 66-71)
    const ordersSnap = await getDocs(collection(db, "orders"));
    // Fetch transactions (lines 73-78)
    const txSnap = await getDocs(collection(db, "transactions"));
    ```
*   **Package Dependencies**: In `E:\Youtube\Ban Content\Web\package.json` (lines 18 and 26), `papaparse` (version `^5.5.4`) and `@types/papaparse` (version `^5.5.2`) are already installed as project dependencies:
    ```json
    "papaparse": "^5.5.4"
    "@types/papaparse": "^5.5.2"
    ```
*   **Data Fields & Formats**:
    *   `users` contains fields: `uid`, `email`, `displayName`, `walletBalance`, `role`, and `createdAt` (from `app/admin/users/page.tsx` lines 27-41).
    *   `orders` contains: `id`, `userId`, `items` (which stores items with `price` as a string or number, e.g. `"990,000đ/tháng"`), `totalAmount`, `status`, and `createdAt` (from `app/admin/orders/page.tsx` lines 8-15).
    *   `transactions` contains: `id`, `orderCode`, `userId`, `amount`, `status` (`"PENDING" | "SUCCESS" | "FAILED"`), and `createdAt` (from `app/admin/orders/page.tsx` lines 17-26).

## 2. Logic Chain
To design the Advanced CSV Export system, we applied the following reasoning step-by-step:
1.  **Client-Side Aggregation Feasibility**: Because `rawData` (all users, orders, and transactions) is already loaded into memory in `app/admin/page.tsx` on mount, we can build the aggregation logic entirely on the client side without needing new server-side endpoints.
2.  **Date Standardizing**: Timestamp parsing must handle multiple date structures (Firestore Timestamps, ISO strings, JS Dates) and localize boundary ranges to day starts (`00:00:00`) and ends (`23:59:59.999`) to prevent off-by-one errors due to timezones.
3.  **Sanitizing Numeric Gaps**: To calculate product revenue and filter free resources, we must clean string fields (like `item.price` = `"990,000đ/tháng"`) by stripping non-numeric characters before parsing them to floats/integers.
4.  **Double-Counting Resolution**: Monthly revenue reports must list Order Revenue and Deposit Revenue separately. Combining them directly in a single total column will misrepresent cash flow if users deposit into their wallets and subsequently purchase items.
5.  **UTF-8 BOM Compatibility**: Opening CSV files containing Vietnamese accents (e.g., "Thành công", "Năm nay") in Microsoft Excel on Windows defaults to ANSI decoding, causing text corruption. Prepending the Byte Order Mark (BOM) code point `\uFEFF` forces Excel to decode in UTF-8.

## 3. Caveats
*   **Data Volumes**: As Firestore collections grow, fetching all users, orders, and transactions client-side will slow down load times. In the future, paginated or server-side queries will be required. For the current dataset, client-side filtering is sufficient.
*   **Missing Fields**: In orders where the buyer details are missing, we gracefully fall back to "Tài khoản không tồn tại" or "Tài khoản đã xóa/Ẩn" using local user map resolution.

## 4. Conclusion
The Advanced CSV Export feature should be implemented via a client-side trigger Modal in `app/admin/page.tsx` using the pre-installed `papaparse` library. By aggregating `rawData.users`, `rawData.orders`, and `rawData.transactions` according to the formulas detailed in `analysis.md` and downloading them with the `\uFEFF` UTF-8 BOM, we fulfill all 5 requested reports with accurate date filtering and clean Vietnamese encoding support.

## 5. Verification Method
An implementer can verify the design using:
1.  **Inspection**: Open `analysis.md` in the agent folder to inspect the custom React modal design, date filters, aggregation algorithms, and BOM-download functions.
2.  **Compilation Check**: Implement the design in `app/admin/page.tsx` and run `npm run lint` or `npm run build` to verify there are no TypeScript or framework compilation errors.
3.  **Encoding Verification**: Export any report containing Vietnamese diacritics, open it in Microsoft Excel on Windows, and confirm that characters render correctly (e.g. "Doanh thu", "Thành công") without encoding corruption.
