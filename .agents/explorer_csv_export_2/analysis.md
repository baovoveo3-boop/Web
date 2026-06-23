# Technical Analysis: Advanced CSV Export in Admin Dashboard

This document provides the architectural and user interface design for implementing the **Advanced CSV Export** feature within the Admin Dashboard of the B.T AI LABs platform.

---

## 1. Data Schema & Query Analysis

Currently, the admin dashboard (`app/admin/page.tsx`) queries and stores data as follows:

- **Fetching Mechanism**: Firebase Firestore queries are run inside a single `useEffect` on mount.
- **Collections**:
  - `users`: Registered users list.
  - `orders`: Purchase orders containing item names, prices, and status.
  - `transactions`: Wallet deposits with amounts, statuses, and order codes.
- **State Storage**: Raw data is stored in the `rawData` state:
  ```typescript
  interface RawData {
    users: any[];
    orders: any[];
    transactions: any[];
  }
  ```
- **In-Memory Filtering**: Date filtering is done in-memory via `parseFirestoreDate(item.createdAt)` and matching against preset intervals ("Hôm nay", "Tuần này", "Tháng này", "Năm nay").

### Recommended Schema Expansion
To calculate rankings of tools/courses and identify free resource downloads properly, the export function needs access to the `products` collection. We recommend expanding `RawData` and fetching products on mount:

```typescript
// Add to RawData interface:
interface RawData {
  users: any[];
  orders: any[];
  transactions: any[];
  products: any[]; // Added for product metadata (category, type)
}

// Inside useEffect of app/admin/page.tsx:
const productsSnap = await getDocs(collection(db, "products"));
const allProducts: any[] = [];
productsSnap.forEach((doc) => {
  allProducts.push({ id: doc.id, ...doc.data() });
});
```

---

## 2. Recommended CSV Export UI

We propose a clean **Modal Overlay** triggerable by an **"Advanced Export"** button in the header.

### Trigger Button Placement
Place the button next to the time filter controls at the top right of `app/admin/page.tsx` (lines 334-358):
```tsx
<button
  onClick={() => setIsExportModalOpen(true)}
  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-md shadow-purple-600/20"
>
  <Download className="h-4 w-4" /> Xuất báo cáo CSV
</button>
```

### Export Modal Layout
The modal will contain:
1. **Report Selector**: Dropdown to choose one of the 5 reports.
2. **Filter Mode Switcher**: Tabs to choose between **"Chọn theo Ngày/Tháng/Năm" (Selector Mode)** and **"Khoảng thời gian Tùy chỉnh" (Range Mode)**.
3. **Date Filters Panel**: Inputs changing dynamically based on the selected mode.
4. **Action Buttons**: "Tải xuống CSV" (with a download icon) and "Hủy" (Close).

---

## 3. Custom Date Filters Design

### React State Setup
```typescript
type FilterMode = "selector" | "range";

// Modal states
const [isExportModalOpen, setIsExportModalOpen] = useState(false);
const [selectedReport, setSelectedReport] = useState<string>("monthly_revenue");
const [filterMode, setFilterMode] = useState<FilterMode>("selector");

// Selector Mode states
const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
const [selectedMonth, setSelectedMonth] = useState<string>(""); // empty = All months
const [selectedDay, setSelectedDay] = useState<string>(""); // empty = All days

// Range Mode states
const [customFromDate, setCustomFromDate] = useState<string>("");
const [customToDate, setCustomToDate] = useState<string>("");
```

### Date Selector Component (TSX)
```tsx
{/* Filter Mode Selector */}
<div className="flex bg-zinc-800 p-1 rounded-lg mb-4 text-xs font-bold">
  <button
    type="button"
    className={`flex-1 py-1.5 rounded-md transition ${filterMode === "selector" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
    onClick={() => setFilterMode("selector")}
  >
    Chọn Ngày/Tháng/Năm
  </button>
  <button
    type="button"
    className={`flex-1 py-1.5 rounded-md transition ${filterMode === "range" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
    onClick={() => setFilterMode("range")}
  >
    Khoảng ngày Từ/Đến
  </button>
</div>

{/* Dynamic Input Panel */}
{filterMode === "selector" ? (
  <div className="grid grid-cols-3 gap-2">
    <div>
      <label className="text-[10px] text-zinc-400 uppercase font-bold">Năm</label>
      <select
        value={selectedYear}
        onChange={(e) => {
          setSelectedYear(e.target.value);
          setSelectedMonth("");
          setSelectedDay("");
        }}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white"
      >
        {["2024", "2025", "2026", "2027"].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="text-[10px] text-zinc-400 uppercase font-bold">Tháng</label>
      <select
        value={selectedMonth}
        onChange={(e) => {
          setSelectedMonth(e.target.value);
          setSelectedDay("");
        }}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white"
      >
        <option value="">Tất cả</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <option key={m} value={m}>Tháng {m}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="text-[10px] text-zinc-400 uppercase font-bold">Ngày</label>
      <select
        value={selectedDay}
        disabled={!selectedMonth}
        onChange={(e) => setSelectedDay(e.target.value)}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white disabled:opacity-50"
      >
        <option value="">Tất cả</option>
        {selectedMonth && Array.from(
          { length: new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate() },
          (_, i) => i + 1
        ).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  </div>
) : (
  <div className="grid grid-cols-2 gap-2">
    <div>
      <label className="text-[10px] text-zinc-400 uppercase font-bold">Từ ngày</label>
      <input
        type="date"
        value={customFromDate}
        onChange={(e) => setCustomFromDate(e.target.value)}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white"
      />
    </div>
    <div>
      <label className="text-[10px] text-zinc-400 uppercase font-bold">Đến ngày</label>
      <input
        type="date"
        value={customToDate}
        onChange={(e) => setCustomToDate(e.target.value)}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white"
      />
    </div>
  </div>
)}
```

### Date Range Calculation Function
This function converts the UI inputs into actual JavaScript `start` and `end` timestamps for data filtering.
```typescript
const getExportFilterRange = (): { start: Date | null; end: Date | null } => {
  let start: Date | null = null;
  let end: Date | null = null;

  if (filterMode === "selector") {
    const year = selectedYear ? parseInt(selectedYear) : null;
    const month = selectedMonth ? parseInt(selectedMonth) - 1 : null; // 0-indexed
    const day = selectedDay ? parseInt(selectedDay) : null;

    if (year !== null) {
      if (month !== null) {
        if (day !== null) {
          // Specific Day
          start = new Date(year, month, day, 0, 0, 0, 0);
          end = new Date(year, month, day, 23, 59, 59, 999);
        } else {
          // Specific Month
          start = new Date(year, month, 1, 0, 0, 0, 0);
          end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month
        }
      } else {
        // Entire Year
        start = new Date(year, 0, 1, 0, 0, 0, 0);
        end = new Date(year, 11, 31, 23, 59, 59, 999);
      }
    }
  } else {
    // Custom Date Range
    if (customFromDate) {
      start = new Date(customFromDate);
      start.setHours(0, 0, 0, 0);
    }
    if (customToDate) {
      end = new Date(customToDate);
      end.setHours(23, 59, 59, 999);
    }
  }
  return { start, end };
};
```

---

## 4. Report Aggregation Logic

The following script filters the in-memory collections and groups data accordingly.

### Filtering Helper
```typescript
const getFilteredCollections = () => {
  const { start, end } = getExportFilterRange();
  
  const filterFn = <T extends { createdAt?: any }>(list: T[]): T[] => {
    return list.filter((item) => {
      const date = parseFirestoreDate(item.createdAt);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };

  return {
    users: filterFn(rawData.users),
    orders: filterFn(rawData.orders),
    transactions: filterFn(rawData.transactions),
  };
};
```

### 1. Báo cáo doanh thu hàng tháng (Monthly revenue)
Combines completed orders (direct revenue) and successful transactions (wallet deposits), grouping by Month (`YYYY-MM`).
```typescript
const generateMonthlyRevenueReport = (orders: any[], transactions: any[]) => {
  const monthlyData: Record<string, {
    "Tháng": string;
    "Doanh thu Đơn hàng (VND)": number;
    "Doanh thu Nạp ví (VND)": number;
    "Tổng Doanh thu (VND)": number;
  }> = {};

  orders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (date) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { "Tháng": key, "Doanh thu Đơn hàng (VND)": 0, "Doanh thu Nạp ví (VND)": 0, "Tổng Doanh thu (VND)": 0 };
        }
        monthlyData[key]["Doanh thu Đơn hàng (VND)"] += Number(order.totalAmount || 0);
        monthlyData[key]["Tổng Doanh thu (VND)"] += Number(order.totalAmount || 0);
      }
    }
  });

  transactions.forEach(tx => {
    if ((tx.status || "").toUpperCase() === "SUCCESS") {
      const date = parseFirestoreDate(tx.createdAt);
      if (date) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { "Tháng": key, "Doanh thu Đơn hàng (VND)": 0, "Doanh thu Nạp ví (VND)": 0, "Tổng Doanh thu (VND)": 0 };
        }
        monthlyData[key]["Doanh thu Nạp ví (VND)"] += Number(tx.amount || 0);
        monthlyData[key]["Tổng Doanh thu (VND)"] += Number(tx.amount || 0);
      }
    }
  });

  return Object.values(monthlyData).sort((a, b) => a["Tháng"].localeCompare(b["Tháng"]));
};
```

### 2. Báo cáo doanh thu theo từng sản phẩm (Product revenue)
Aggregates sales volume and total revenue generated per item in successful orders.
```typescript
const generateProductRevenueReport = (orders: any[]) => {
  const productData: Record<string, {
    "Mã sản phẩm (ID)": string;
    "Tên sản phẩm": string;
    "Số lượng bán": number;
    "Doanh thu (VND)": number;
  }> = {};

  orders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const pId = item.id || "unknown";
        const pName = item.name || "Sản phẩm ẩn";
        const pPrice = Number(item.price || 0);

        if (!productData[pId]) {
          productData[pId] = {
            "Mã sản phẩm (ID)": pId,
            "Tên sản phẩm": pName,
            "Số lượng bán": 0,
            "Doanh thu (VND)": 0
          };
        }
        productData[pId]["Số lượng bán"] += 1;
        productData[pId]["Doanh thu (VND)"] += pPrice;
      });
    }
  });

  return Object.values(productData).sort((a, b) => b["Doanh thu (VND)"] - a["Doanh thu (VND)"]);
};
```

### 3. Top tài khoản chi tiêu mua hàng nhiều nhất (Top spending users)
Aggregates and ranks users based on their total expenditures in successful orders.
```typescript
const generateTopSpendingUsersReport = (orders: any[], users: any[]) => {
  const userMap: Record<string, { email: string; displayName: string }> = {};
  users.forEach(u => {
    const id = u.id || u.uid;
    if (id) userMap[id] = { email: u.email || "", displayName: u.displayName || "" };
  });

  const spendingData: Record<string, {
    "Mã tài khoản (User ID)": string;
    "Email": string;
    "Tên hiển thị": string;
    "Tổng chi tiêu (VND)": number;
    "Số đơn hàng thành công": number;
  }> = {};

  orders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const uId = order.userId;
      if (uId) {
        if (!spendingData[uId]) {
          const info = userMap[uId] || { email: "Không rõ", displayName: "Không rõ" };
          spendingData[uId] = {
            "Mã tài khoản (User ID)": uId,
            "Email": info.email,
            "Tên hiển thị": info.displayName,
            "Tổng chi tiêu (VND)": 0,
            "Số đơn hàng thành công": 0
          };
        }
        spendingData[uId]["Tổng chi tiêu (VND)"] += Number(order.totalAmount || 0);
        spendingData[uId]["Số đơn hàng thành công"] += 1;
      }
    }
  });

  return Object.values(spendingData)
    .sort((a, b) => b["Tổng chi tiêu (VND)"] - a["Tổng chi tiêu (VND)"])
    .map((item, index) => ({ "Hạng": index + 1, ...item }));
};
```

### 4. Top tài khoản sử dụng tài nguyên miễn phí nhiều nhất (Top free resource users)
Tracks free downloads (where item price is 0 OR product category is marked "free").
```typescript
const generateTopFreeResourceUsersReport = (orders: any[], users: any[], products: any[]) => {
  const userMap: Record<string, { email: string; displayName: string }> = {};
  users.forEach(u => {
    const id = u.id || u.uid;
    if (id) userMap[id] = { email: u.email || "", displayName: u.displayName || "" };
  });

  const freeProductMap: Record<string, boolean> = {};
  products.forEach(p => {
    if (p.id) freeProductMap[p.id] = (p.category || "").toLowerCase() === "free";
  });

  const freeUsageData: Record<string, {
    "Mã tài khoản (User ID)": string;
    "Email": string;
    "Tên hiển thị": string;
    "Số lượng tải miễn phí": number;
  }> = {};

  orders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const isPriceFree = Number(item.price || 0) === 0;
        const isCatFree = !!freeProductMap[item.id];
        
        if (isPriceFree || isCatFree) {
          const uId = order.userId;
          if (uId) {
            if (!freeUsageData[uId]) {
              const info = userMap[uId] || { email: "Không rõ", displayName: "Không rõ" };
              freeUsageData[uId] = {
                "Mã tài khoản (User ID)": uId,
                "Email": info.email,
                "Tên hiển thị": info.displayName,
                "Số lượng tải miễn phí": 0
              };
            }
            freeUsageData[uId]["Số lượng tải miễn phí"] += 1;
          }
        }
      });
    }
  });

  return Object.values(freeUsageData)
    .sort((a, b) => b["Số lượng tải miễn phí"] - a["Số lượng tải miễn phí"])
    .map((item, index) => ({ "Hạng": index + 1, ...item }));
};
```

### 5. Bảng xếp hạng các Tool/Khóa học được sử dụng nhiều nhất (Ranking of tools/courses)
Ranks products according to purchase quantity, enriched with product category & type.
```typescript
const generateToolCourseRankingReport = (orders: any[], products: any[]) => {
  const productInfoMap: Record<string, { name: string; type: string; category: string }> = {};
  products.forEach(p => {
    if (p.id) {
      productInfoMap[p.id] = {
        name: p.name || "",
        type: p.type || "Không rõ",
        category: p.category || "Không rõ"
      };
    }
  });

  const rankingData: Record<string, {
    "Mã sản phẩm (ID)": string;
    "Tên sản phẩm": string;
    "Loại tài nguyên": string;
    "Danh mục": string;
    "Số lượt mua/sử dụng": number;
  }> = {};

  orders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const pId = item.id;
        if (pId) {
          if (!rankingData[pId]) {
            const info = productInfoMap[pId] || { name: item.name || "Sản phẩm ẩn", type: "N/A", category: "N/A" };
            rankingData[pId] = {
              "Mã sản phẩm (ID)": pId,
              "Tên sản phẩm": info.name,
              "Loại tài nguyên": info.type,
              "Danh mục": info.category,
              "Số lượt mua/sử dụng": 0
            };
          }
          rankingData[pId]["Số lượt mua/sử dụng"] += 1;
        }
      });
    }
  });

  return Object.values(rankingData)
    .sort((a, b) => b["Số lượt mua/sử dụng"] - a["Số lượt mua/sử dụng"])
    .map((item, index) => ({ "Hạng": index + 1, ...item }));
};
```

---

## 5. CSV Formatting & UTF-8 BOM Integration

To ensure the exported CSV file is fully compatible with Microsoft Excel on Windows (preventing Vietnamese accents from rendering as broken gibberish), we must:
1. Parse the JSON arrays using **Papaparse** (`Papa.unparse`).
2. Add the **UTF-8 Byte Order Mark (BOM)**: `\uFEFF` before the CSV payload.
3. Download via a client-side Blob object.

### Implementation Function
This handles formatting, file names, and trigger logic in the UI:

```typescript
import Papa from "papaparse";

const handleExportCSV = () => {
  const { users, orders, transactions } = getFilteredCollections();
  let dataToExport: any[] = [];
  let fileName = "bao_cao";

  switch (selectedReport) {
    case "monthly_revenue":
      dataToExport = generateMonthlyRevenueReport(orders, transactions);
      fileName = `doanh_thu_hang_thang`;
      break;
    case "product_revenue":
      dataToExport = generateProductRevenueReport(orders);
      fileName = `doanh_thu_theo_san_pham`;
      break;
    case "top_spending_users":
      dataToExport = generateTopSpendingUsersReport(orders, users);
      fileName = `top_khach_hang_chi_tieu`;
      break;
    case "top_free_resource_users":
      dataToExport = generateTopFreeResourceUsersReport(orders, users, rawData.products || []);
      fileName = `top_tai_khoan_dung_mien_phi`;
      break;
    case "tool_course_ranking":
      dataToExport = generateToolCourseRankingReport(orders, rawData.products || []);
      fileName = `xep_hang_tool_khoa_hoc`;
      break;
    default:
      alert("Loại báo cáo không hợp lệ");
      return;
  }

  if (dataToExport.length === 0) {
    alert("Không tìm thấy dữ liệu phù hợp trong khoảng thời gian đã chọn!");
    return;
  }

  // 1. Generate CSV String with Papaparse
  const csvString = Papa.unparse(dataToExport);

  // 2. Prep BOM (\uFEFF) + Blob
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  // 3. Create download link
  const link = document.createElement("a");
  
  // Dynamic suffix based on filter details
  let suffix = "";
  if (filterMode === "selector") {
    suffix = `_${selectedYear}${selectedMonth ? `_T${selectedMonth}` : ""}${selectedDay ? `_N${selectedDay}` : ""}`;
  } else {
    suffix = `_tu_${customFromDate || "dau"}_den_${customToDate || "cuoi"}`;
  }

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}${suffix}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```
