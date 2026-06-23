# Analysis Report: Advanced CSV Export Feature Design

This report outlines the technical design, data aggregation logic, user interface layout, and implementation guidelines for the **Advanced CSV Export** feature in the Admin Dashboard of the B.T AI LABs platform.

---

## I. Codebase Inspection & Data Schema Mapping

Currently, in `app/admin/page.tsx`, the dashboard queries three primary collections from Google Cloud Firestore:

1. **`users`**: Details user accounts, tiers, wallet balances, role, and registration date.
2. **`orders`**: Tracks completed or pending purchases of tools/courses via wallet balances.
3. **`transactions`**: Tracks wallet deposits/top-ups from PayOS.

### 1. Data Retrieval Method
Detections are queried client-side on mount in a `useEffect` hook:
```typescript
const usersSnap = await getDocs(collection(db, "users"));
const ordersSnap = await getDocs(collection(db, "orders"));
const txSnap = await getDocs(collection(db, "transactions"));
```
These snapshots are loaded into a React state named `rawData`:
```typescript
interface RawData {
  users: any[];
  orders: any[];
  transactions: any[];
}
```

### 2. Relevant Fields & Data Gaps Identified
To aggregate accurate financial and usage reports, we must traverse the following fields:

*   **`orders` schema fields**:
    *   `id`: Firestore auto-generated document ID (string).
    *   `userId`: The UID of the buyer (string, relates to `users.uid`).
    *   `items`: Array of objects, each containing:
        *   `id`: The unique product identifier.
        *   `name`: The display name of the purchased item.
        *   `price`: Can be a number (e.g. `990000`) or a string representation (e.g. `"990,000đ/tháng"`).
    *   `totalAmount`: Numerical order total (number).
    *   `status`: Order status (e.g., `"COMPLETED"`).
    *   `createdAt`: Timestamp of purchase (Firestore Timestamp, ISO string, or Date).
*   **`users` schema fields**:
    *   `uid` (string): Document ID linking to the user authentication record.
    *   `email` (string | null): The user's email address.
    *   `displayName` (string | null): User's full name.
    *   `walletBalance` (number): Active cash balance.
    *   `role` (string): User authorization tier (`"user" | "admin" | "super_admin"`).
    *   `createdAt` (any): Account registration timestamp.
*   **`transactions` schema fields**:
    *   `id` (string): Document ID.
    *   `userId` (string): UID of the depositor.
    *   `amount` (number): Amount deposited in VND.
    *   `status` (string): `"PENDING" | "SUCCESS" | "FAILED"`.
    *   `createdAt` (any): Time of deposit initiation.

---

## II. CSV Export UI Design (Modal-based)

To avoid cluttering the overview charts, we recommend implementing the CSV Export interface as a **Modal Dialog** triggered by a new button in the header of the Admin Page.

### 1. Visual Mockup & UX Controls
The modal contains the following interactive components:
*   **Report Selector Dropdown**: Selects one of the 5 pre-configured reports.
*   **Date Range Toggle**: Radio buttons/Tabs to choose:
    *   *Pre-defined ranges*: "Tất cả thời gian", "Hôm nay", "Tuần này", "Tháng này", "Năm nay".
    *   *Custom Period*: Opens custom day/month/year selectors and input fields.
*   **Custom Date Pickers**:
    *   *From Date* (`input type="date"`) and *To Date* (`input type="date"`) calendar inputs.
    *   *Quick Selectors*: Dropdowns for Year (e.g., `2024`, `2025`, `2026`) and Month (`1` to `12`) to automatically populate the "From/To" dates.
*   **Action Row**: Cancel and Export CSV buttons.

### 2. UI Code Structure (React + Tailwind CSS)
Below is the suggested JSX template for the export modal component:

```tsx
import React, { useState } from "react";
import { Download, X, Calendar, FileSpreadsheet } from "lucide-react";

interface CSVExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawData: {
    users: any[];
    orders: any[];
    transactions: any[];
  };
}

type ReportType = 'monthly_revenue' | 'product_revenue' | 'top_spenders' | 'top_free_users' | 'ranking_tools_courses';

export default function CSVExportModal({ isOpen, onClose, rawData }: CSVExportModalProps) {
  if (!isOpen) return null;

  const [reportType, setReportType] = useState<ReportType>("monthly_revenue");
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [quickFilter, setQuickFilter] = useState("Tháng này");
  
  // Custom Date States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  // Handles quick month/year preset population
  const handleQuickMonthYear = (month: string, year: string) => {
    const y = parseInt(year);
    const m = parseInt(month) - 1;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0); // Last day of month
    
    setFromDate(start.toISOString().split("T")[0]);
    setToDate(end.toISOString().split("T")[0]);
  };

  const handleExport = () => {
    // Aggregation and formatting trigger logic goes here
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-purple-500" />
            Xuất Báo cáo CSV Nâng cao
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          {/* Report Type Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-450 block mb-1">LOẠI BÁO CÁO</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-355 text-sm p-2 rounded-lg focus:outline-none focus:border-purple-600 font-medium"
            >
              <option value="monthly_revenue">Báo cáo doanh thu hàng tháng</option>
              <option value="product_revenue">Báo cáo doanh thu theo sản phẩm</option>
              <option value="top_spenders">Top tài khoản chi tiêu nhiều nhất</option>
              <option value="top_free_users">Top tài khoản nhận tài nguyên miễn phí</option>
              <option value="ranking_tools_courses">Bảng xếp hạng Tool/Khóa học</option>
            </select>
          </div>

          {/* Time Filter Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-450 block mb-2">THỜI GIAN LỌC</label>
            <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs mb-3">
              <button
                type="button"
                onClick={() => setUseCustomRange(false)}
                className={`flex-1 py-1.5 rounded-md font-bold transition ${!useCustomRange ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Mốc cố định
              </button>
              <button
                type="button"
                onClick={() => setUseCustomRange(true)}
                className={`flex-1 py-1.5 rounded-md font-bold transition ${useCustomRange ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Tùy chọn khoảng ngày
              </button>
            </div>

            {/* Standard Filters */}
            {!useCustomRange ? (
              <select
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm p-2 rounded-lg focus:outline-none focus:border-purple-600 font-medium"
              >
                <option value="Tất cả thời gian">Tất cả thời gian</option>
                <option value="Hôm nay">Hôm nay</option>
                <option value="Tuần này">Tuần này</option>
                <option value="Tháng này">Tháng này</option>
                <option value="Năm nay">Năm nay</option>
              </select>
            ) : (
              /* Custom Range Fields */
              <div className="space-y-3">
                {/* Day/Month/Year Selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Tháng</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        handleQuickMonthYear(e.target.value, selectedYear);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Năm</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        handleQuickMonthYear(selectedMonth, e.target.value);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded"
                    >
                      {["2024", "2025", "2026", "2027"].map(y => (
                        <option key={y} value={y}>Năm {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calendar Date Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Từ ngày</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs p-1.5 rounded focus:outline-none focus:border-purple-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Đến ngày</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs p-1.5 rounded focus:outline-none focus:border-purple-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white py-2 text-sm rounded-lg font-bold transition"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 text-sm rounded-lg font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Xuất file CSV
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## III. Custom Date Filtering Logic

Date structures in Firestore might store time stamps in varying formats (e.g. Firestore Timestamp objects, ISO-8601 strings, or millisecond integers). We must guarantee a clean Date parsing and boundary filter implementation.

### 1. Date Range Builder
Depending on the user selections, we construct boundary dates:

```typescript
const getExportDateRange = (
  useCustomRange: boolean,
  quickFilter: string,
  fromDateStr: string,
  toDateStr: string
): { start: Date | null; end: Date | null } => {
  if (useCustomRange) {
    const start = fromDateStr ? new Date(fromDateStr + "T00:00:00") : null;
    const end = toDateStr ? new Date(toDateStr + "T23:59:59.999") : null;
    return { start, end };
  }

  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (quickFilter) {
    case "Hôm nay":
      return { start, end: now };
    case "Tuần này": {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1; // Adjust Monday as start
      start.setDate(start.getDate() - diff);
      return { start, end: now };
    }
    case "Tháng này":
      start.setDate(1);
      return { start, end: now };
    case "Năm nay":
      start.setMonth(0, 1);
      return { start, end: now };
    case "Tất cả thời gian":
    default:
      return { start: null, end: null };
  }
};
```

### 2. Validation & Filter Execution
We perform check boundaries relative to parsed Firestore timestamps:
```typescript
const parseFirestoreDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "object") {
    if (typeof timestamp.seconds === "number") {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds ? Math.floor(timestamp.nanoseconds / 1000000) : 0));
    }
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
  }
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const parsed = new Date(timestamp);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const filterByRange = (itemDate: Date | null, start: Date | null, end: Date | null): boolean => {
  if (!itemDate) return false;
  if (start && itemDate < start) return false;
  if (end && itemDate > end) return false;
  return true;
};
```

---

## IV. Aggregation Logic for the 5 Reports

Before aggregating, we define a helper function to sanitize product prices. Since they can be represented as strings (like `"450,000đ/tháng"`), this helper strips currency labels and parses decimals.

```typescript
const cleanPrice = (priceVal: any): number => {
  if (typeof priceVal === "number") return priceVal;
  if (typeof priceVal === "string") {
    // Discard any periods/units after division symbol "/", remove commas and dots
    const baseValue = priceVal.split("/")[0];
    const cleaned = baseValue.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};
```

Here is the data accumulation logic for each of the 5 requested reports:

### 1. Monthly Revenue Report (Báo cáo doanh thu hàng tháng)
*   **Goal**: Combines direct order sales and wallet deposits, grouped by month (`YYYY-MM`).
*   **Auditing Precaution**: This report lists Order Revenue and Deposit Revenue in separate columns to prevent double-counting. If a user tops up their wallet (transaction success) and then purchases tools (order completed), summing them directly double-counts cash flow.
*   **Code Implementation**:
```typescript
const aggregateMonthlyRevenue = (orders: any[], transactions: any[], start: Date | null, end: Date | null) => {
  const map: Record<string, { month: string; orderRevenue: number; depositRevenue: number; total: number }> = {};

  orders.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (filterByRange(date, start, end)) {
        const monthKey = `${date!.getFullYear()}-${String(date!.getMonth() + 1).padStart(2, "0")}`;
        if (!map[monthKey]) {
          map[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0, total: 0 };
        }
        map[monthKey].orderRevenue += Number(order.totalAmount || 0);
      }
    }
  });

  transactions.forEach(tx => {
    if (tx.status?.toUpperCase() === "SUCCESS") {
      const date = parseFirestoreDate(tx.createdAt);
      if (filterByRange(date, start, end)) {
        const monthKey = `${date!.getFullYear()}-${String(date!.getMonth() + 1).padStart(2, "0")}`;
        if (!map[monthKey]) {
          map[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0, total: 0 };
        }
        map[monthKey].depositRevenue += Number(tx.amount || 0);
      }
    }
  });

  return Object.values(map)
    .map(item => ({
      "Tháng": item.month,
      "Doanh thu đơn hàng trực tiếp (VND)": item.orderRevenue,
      "Doanh thu nạp ví (VND)": item.depositRevenue,
      "Tổng cộng (VND)": item.orderRevenue + item.depositRevenue
    }))
    .sort((a, b) => a["Tháng"].localeCompare(b["Tháng"]));
};
```

### 2. Product Revenue Report (Báo cáo doanh thu theo từng sản phẩm)
*   **Goal**: Aggregate quantity and revenue per item.
*   **Code Implementation**:
```typescript
const aggregateProductRevenue = (orders: any[], start: Date | null, end: Date | null) => {
  const map: Record<string, { id: string; name: string; qty: number; revenue: number }> = {};

  orders.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (filterByRange(date, start, end)) {
        order.items?.forEach((item: any) => {
          const id = item.id || "N/A";
          const name = item.name || "Sản phẩm ẩn";
          const price = cleanPrice(item.price);
          
          if (!map[id]) {
            map[id] = { id, name, qty: 0, revenue: 0 };
          }
          map[id].qty += 1;
          map[id].revenue += price;
        });
      }
    }
  });

  return Object.values(map)
    .map(item => ({
      "Mã sản phẩm": item.id,
      "Tên sản phẩm": item.name,
      "Số lượng bán": item.qty,
      "Doanh thu tích lũy (VND)": item.revenue
    }))
    .sort((a, b) => b["Doanh thu tích lũy (VND)"] - a["Doanh thu tích lũy (VND)"]);
};
```

### 3. Top Spending Users (Top tài khoản chi tiêu nhiều nhất)
*   **Goal**: Rank users by total completed order value. Map UIDs to actual user profiles to fetch emails and display names.
*   **Code Implementation**:
```typescript
const aggregateTopSpenders = (users: any[], orders: any[], start: Date | null, end: Date | null) => {
  const userMap: Record<string, { email: string; name: string }> = {};
  users.forEach(u => {
    userMap[u.uid] = {
      email: u.email || "—",
      name: u.displayName || "Thành viên hệ thống"
    };
  });

  const spenderMap: Record<string, { uid: string; email: string; name: string; count: number; totalSpent: number }> = {};

  orders.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (filterByRange(date, start, end)) {
        const uid = order.userId;
        const info = userMap[uid] || { email: "—", name: "Tài khoản không tồn tại" };

        if (!spenderMap[uid]) {
          spenderMap[uid] = { uid, email: info.email, name: info.name, count: 0, totalSpent: 0 };
        }
        spenderMap[uid].count += 1;
        spenderMap[uid].totalSpent += Number(order.totalAmount || 0);
      }
    }
  });

  return Object.values(spenderMap)
    .map(item => ({
      "UID Người dùng": item.uid,
      "Email": item.email,
      "Tên hiển thị": item.name,
      "Số lượng đơn mua": item.count,
      "Tổng chi tiêu (VND)": item.totalSpent
    }))
    .sort((a, b) => b["Tổng chi tiêu (VND)"] - a["Tổng chi tiêu (VND)"]);
};
```

### 4. Top Free Resource Users (Top tài khoản dùng tài nguyên miễn phí nhiều nhất)
*   **Goal**: Find users downloading/subscribing to items where price resolves to `0` or name contains "miễn phí" / "free".
*   **Code Implementation**:
```typescript
const aggregateTopFreeUsers = (users: any[], orders: any[], start: Date | null, end: Date | null) => {
  const userMap: Record<string, { email: string; name: string }> = {};
  users.forEach(u => {
    userMap[u.uid] = {
      email: u.email || "—",
      name: u.displayName || "Thành viên hệ thống"
    };
  });

  const freeUserMap: Record<string, { uid: string; email: string; name: string; count: number; itemsList: Set<string> }> = {};

  orders.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (filterByRange(date, start, end)) {
        const uid = order.userId;
        const info = userMap[uid] || { email: "—", name: "Tài khoản không tồn tại" };

        // Identify items with price 0 or labeled free
        const freeItems = order.items?.filter((item: any) => {
          const price = cleanPrice(item.price);
          const name = (item.name || "").toLowerCase();
          return price === 0 || name.includes("free") || name.includes("miễn phí");
        }) || [];

        const hasFreeResource = order.totalAmount === 0 || freeItems.length > 0;

        if (hasFreeResource) {
          if (!freeUserMap[uid]) {
            freeUserMap[uid] = { uid, email: info.email, name: info.name, count: 0, itemsList: new Set() };
          }
          freeUserMap[uid].count += 1;
          
          if (freeItems.length > 0) {
            freeItems.forEach((it: any) => freeUserMap[uid].itemsList.add(it.name || "Tài nguyên"));
          } else if (order.totalAmount === 0) {
            order.items?.forEach((it: any) => freeUserMap[uid].itemsList.add(it.name || "Gói 0đ"));
          }
        }
      }
    }
  });

  return Object.values(freeUserMap)
    .map(item => ({
      "UID Người dùng": item.uid,
      "Email": item.email,
      "Tên hiển thị": item.name,
      "Số lần nhận miễn phí": item.count,
      "Tài nguyên đã tải": Array.from(item.itemsList).join("; ")
    }))
    .sort((a, b) => b["Số lần nhận miễn phí"] - a["Số lần nhận miễn phí"]);
};
```

### 5. Ranking of Tools/Courses Used (Bảng xếp hạng Tool/Khóa học được sử dụng nhiều nhất)
*   **Goal**: Rank tools/courses by usage count and user reach.
*   **Code Implementation**:
```typescript
const aggregateProductRanking = (orders: any[], start: Date | null, end: Date | null) => {
  const map: Record<string, { id: string; name: string; type: string; usageCount: number; buyers: Set<string> }> = {};

  orders.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (filterByRange(date, start, end)) {
        order.items?.forEach((item: any) => {
          const id = item.id || "N/A";
          const name = item.name || "Sản phẩm ẩn";
          const lowerName = name.toLowerCase();

          let type = "Khác";
          if (lowerName.includes("tool") || lowerName.includes("bypass") || lowerName.includes("automation")) {
            type = "Phần mềm/Tool";
          } else if (lowerName.includes("khóa học") || lowerName.includes("course") || lowerName.includes("master")) {
            type = "Khóa học";
          } else if (lowerName.includes("combo")) {
            type = "Gói Combo";
          }

          if (!map[id]) {
            map[id] = { id, name, type, usageCount: 0, buyers: new Set() };
          }
          map[id].usageCount += 1;
          map[id].buyers.add(order.userId);
        });
      }
    }
  });

  return Object.values(map)
    .map(item => ({
      "Mã sản phẩm": item.id,
      "Tên sản phẩm": item.name,
      "Phân loại": item.type,
      "Tổng lượt sử dụng (Đơn hàng)": item.usageCount,
      "Số tài khoản duy nhất đã sở hữu": item.buyers.size
    }))
    .sort((a, b) => b["Tổng lượt sử dụng (Đơn hàng)"] - a["Tổng lượt sử dụng (Đơn hàng)"]);
};
```

---

## V. Export Formatting & Compatibility (PapaParse + UTF-8 BOM)

To ensure the CSV files open flawlessly in applications like **Microsoft Excel** on Windows (which usually displays Vietnamese accents and diacritics as broken characters if the file is missing a BOM), the CSV data must be structured correctly and prefixed with the UTF-8 Byte Order Mark (BOM).

### 1. The Role of the Byte Order Mark (BOM)
The UTF-8 BOM is the 3-byte sequence `\uFEFF` (hex: `EF BB BF`). Prepending this specific character at the very beginning of the CSV payload forces Excel to read the subsequent content using the UTF-8 encoding standard rather than the local ANSI code page, preserving all Vietnamese diacritics.

### 2. Implementation with PapaParse
Using `papaparse` client-side, we parse the JSON data to CSV format and construct a downloadable file attachment link:

```typescript
import Papa from "papaparse";

export const downloadCSVReport = (data: any[], reportName: string) => {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu trong khoảng thời gian đã chọn.");
    return;
  }

  // 1. Convert JSON to CSV structure using papaparse
  const csvString = Papa.unparse(data, {
    quotes: true,       // Force quotes to handle commas inside text fields (like names/lists)
    header: true,       // Output columns header labels
    skipEmptyLines: true
  });

  // 2. Prepend the UTF-8 BOM (\uFEFF)
  const bomCSV = "\uFEFF" + csvString;

  // 3. Create a Blob with UTF-8 encoding
  const blob = new Blob([bomCSV], { type: "text/csv;charset=utf-8;" });
  
  // 4. Generate download trigger
  const link = document.createElement("a");
  const filename = `${reportName}_${new Date().toISOString().split("T")[0]}.csv`;
  
  if (navigator.msSaveBlob) { // IE 10+ Compatibility
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up memory and DOM elements
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
```

---
*Report completed by teamwork_preview_explorer. Ready for implementation.*
