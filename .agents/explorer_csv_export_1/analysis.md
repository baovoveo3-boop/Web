# Phân tích & Thiết kế tính năng Xuất CSV Nâng cao (Admin Dashboard)

Tài liệu này trình bày chi tiết phân tích hiện trạng dữ liệu và thiết kế kiến trúc/giao diện cho tính năng **Xuất dữ liệu CSV nâng cao** trong trang quản trị Admin (`app/admin/page.tsx`).

---

## 1. Phân tích Cấu trúc Dữ liệu Hiện tại

Hiện tại, trang `app/admin/page.tsx` sử dụng Firestore để tải 3 tập dữ liệu lớn về Client thông qua `useEffect` và lưu trữ vào state `rawData`:

```typescript
interface RawData {
  users: any[];
  orders: any[];
  transactions: any[];
}
```

### Chi tiết cấu trúc từng bản ghi (dựa trên schema thực tế):
1. **User (Thành viên - `rawData.users`)**:
   - `uid` / `id`: Chuỗi định danh duy nhất của tài khoản.
   - `email`: Email đăng ký.
   - `displayName`: Tên hiển thị của người dùng.
   - `walletBalance`: Số dư ví hiện tại (đơn vị VND).
   - `currentTier`: Gói thành viên hiện tại (ví dụ: `free`, `ultimate`, `standard`,...).
   - `createdAt`: Timestamp thời điểm tạo tài khoản.
   - `purchasedProducts`: Mảng chứa các sản phẩm lẻ đã mua `{ id: string, expiresAt: string | null }`.

2. **Order (Đơn hàng - `rawData.orders`)**:
   - `id`: Mã đơn hàng.
   - `userId`: ID người mua hàng (tham chiếu đến `users.uid`).
   - `items`: Danh sách các mặt hàng đã mua dưới dạng `{ id: string, name: string, price: number | string }`.
   - `totalAmount`: Tổng tiền của đơn hàng (VND).
   - `status`: Trạng thái đơn hàng (`COMPLETED`, `PENDING`, `FAILED`,...).
   - `createdAt`: Timestamp tạo đơn hàng.

3. **Transaction (Giao dịch nạp tiền - `rawData.transactions`)**:
   - `id`: Mã giao dịch trên hệ thống.
   - `orderCode`: Mã code thanh toán số (PayOS).
   - `userId`: ID người nạp tiền.
   - `userEmail`: Email của người nạp tiền.
   - `amount`: Số tiền nạp (VND).
   - `description`: Nội dung chuyển khoản nạp tiền.
   - `status`: Trạng thái nạp tiền (`SUCCESS`, `PENDING`, `FAILED`,...).
   - `createdAt`: Timestamp tạo giao dịch.

---

## 2. Thiết kế Giao diện Xuất CSV (UI Recommendation)

Để giữ giao diện trang dashboard gọn gàng và không làm loãng thông số thống kê trực quan, chúng tôi đề xuất thêm một nút **"Xuất CSV"** bên cạnh bộ lọc thời gian hiện tại ở đầu trang `app/admin/page.tsx`. Khi nhấp vào nút này, một **Modal (Hộp thoại nổi)** sẽ hiện lên để người quản trị tùy chọn xuất báo cáo.

### Vị trí đặt nút kích hoạt (app/admin/page.tsx):
Đặt bên cạnh bộ lọc thời gian (khoảng dòng 343):

```tsx
<div className="flex items-center gap-2">
  {/* Bộ lọc thời gian hiện tại */}
  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
    {filterOptions.map((opt) => ( ... ))}
  </div>

  {/* Nút Xuất Báo cáo CSV Mới */}
  <button
    onClick={() => setIsExportModalOpen(true)}
    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md transition"
  >
    <TrendingUp className="h-4 w-4" /> Xuất Báo Cáo CSV
  </button>
</div>
```

### Giao diện Modal Xuất Dữ liệu (`CSVExportModal`):
Modal được thiết kế với giao diện tối (Dark mode) đồng bộ với hệ thống:
- **Tiêu đề**: "Xuất dữ liệu báo cáo nâng cao"
- **Chọn Loại Báo Cáo (Report Type)**: Dropdown select gồm 5 báo cáo nghiệp vụ + 3 bảng dữ liệu gốc (Raw).
- **Cấu hình Bộ Lọc Thời Gian (Filter Options)**:
  - **Kiểu lọc**: Chọn lọc theo "Bộ lọc nhanh", "Theo ngày/tháng/năm cụ thể" hoặc "Khoảng ngày tự do".
  - **Dữ liệu lọc động**:
    - Nếu chọn theo ngày/tháng/năm: Hiển thị 3 trường nhập liệu số (Ngày, Tháng, Năm).
    - Nếu chọn khoảng ngày: Hiển thị 2 trường nhập ngày `type="date"` (Từ ngày - Đến ngày).
- **Nút hành động**: "Hủy" và "Tải File CSV".

---

## 3. Thiết kế Logic Bộ Lọc Ngày Tùy Chỉnh (Custom Date Filters)

Để chuẩn hóa việc lọc ngày theo các cấu hình linh hoạt (Ngày/Tháng/Năm cụ thể hoặc Từ ngày -> Đến ngày), chúng ta tạo một state quản lý bộ lọc xuất bản và hàm chuyển đổi ngày:

### React State cho Bộ lọc:
```typescript
type ExportDateMode = "quick" | "specific" | "range" | "all";

const [exportReport, setExportReport] = useState<string>("monthly-revenue");
const [dateMode, setDateMode] = useState<ExportDateMode>("quick");
const [quickFilter, setQuickFilter] = useState<string>("Tháng này");

// Cấu hình Ngày / Tháng / Năm cụ thể
const [specDay, setSpecDay] = useState<number>(new Date().getDate());
const [specMonth, setSpecMonth] = useState<number>(new Date().getMonth() + 1);
const [specYear, setSpecYear] = useState<number>(new Date().getFullYear());

// Cấu hình Khoảng ngày tự chọn (From - To)
const [dateFrom, setDateFrom] = useState<string>("");
const [dateTo, setDateTo] = useState<string>("");
```

### Hàm phân tích dải ngày lọc (Get date range):
Sử dụng hàm này để xác định thời điểm bắt đầu (`start`) và kết thúc (`end`) phục vụ cho việc truy vấn/lọc dữ liệu trong bộ nhớ:

```typescript
const getExportDateRange = (): { start: Date | null; end: Date | null } => {
  const now = new Date();
  
  if (dateMode === "all") {
    return { start: null, end: null };
  }

  if (dateMode === "quick") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (quickFilter === "Hôm nay") {
      // Giữ nguyên ngày hôm nay
    } else if (quickFilter === "Tuần này") {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
    } else if (quickFilter === "Tháng này") {
      start.setDate(1);
    } else if (quickFilter === "Năm nay") {
      start.setMonth(0, 1);
    }
    return { start, end: now };
  }

  if (dateMode === "specific") {
    // Ngày cụ thể
    const start = new Date(specYear, specMonth - 1, specDay, 0, 0, 0, 0);
    const end = new Date(specYear, specMonth - 1, specDay, 23, 59, 59, 999);
    return { start, end };
  }

  if (dateMode === "range") {
    const start = dateFrom ? new Date(dateFrom) : new Date(1970, 0, 1);
    start.setHours(0, 0, 0, 0);
    
    const end = dateTo ? new Date(dateTo) : new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return { start: null, end: null };
};
```

---

## 4. Thiết kế Logic Tổng hợp Dữ liệu cho 5 Báo cáo

Sau khi lọc được danh sách `users`, `orders`, và `transactions` thuộc khoảng thời gian mong muốn thông qua helper `parseFirestoreDate(item.createdAt)` (hàm xử lý Firestore Timestamp đã có sẵn trên trang), chúng ta áp dụng các giải thuật gom cụm (aggregation) dưới đây để tạo cấu trúc bảng CSV.

### 4.1 Báo cáo doanh thu hàng tháng (Monthly revenue)
*Ý tưởng*: Nhóm tất cả các đơn hàng thành công (`status === "COMPLETED"`) và các giao dịch nạp ví thành công (`status === "SUCCESS"`) theo từng tháng dạng `YYYY-MM`.

```typescript
const generateMonthlyRevenueReport = (filteredOrders: any[], filteredTransactions: any[]) => {
  const monthlyData: Record<string, {
    month: string;
    orderRevenue: number;
    depositRevenue: number;
    totalRevenue: number;
    ordersCount: number;
    transactionsCount: number;
  }> = {};

  // Gom nhóm đơn hàng mua trực tiếp
  filteredOrders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0, totalRevenue: 0, ordersCount: 0, transactionsCount: 0 };
        }
        monthlyData[monthKey].orderRevenue += Number(order.totalAmount || 0);
        monthlyData[monthKey].ordersCount += 1;
      }
    }
  });

  // Gom nhóm giao dịch nạp tiền vào ví
  filteredTransactions.forEach(tx => {
    if ((tx.status || "").toUpperCase() === "SUCCESS") {
      const date = parseFirestoreDate(tx.createdAt);
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0, totalRevenue: 0, ordersCount: 0, transactionsCount: 0 };
        }
        monthlyData[monthKey].depositRevenue += Number(tx.amount || 0);
        monthlyData[monthKey].transactionsCount += 1;
      }
    }
  });

  // Tính tổng cộng doanh thu và xuất ra mảng
  return Object.values(monthlyData).map(row => {
    const totalRevenue = row.orderRevenue + row.depositRevenue;
    return {
      "Tháng": row.month,
      "Doanh thu đơn hàng (VND)": row.orderRevenue,
      "Doanh thu nạp ví (VND)": row.depositRevenue,
      "Tổng doanh thu (VND)": totalRevenue,
      "Số đơn hàng mua": row.ordersCount,
      "Số giao dịch nạp ví": row.transactionsCount
    };
  }).sort((a, b) => b["Tháng"].localeCompare(a["Tháng"])); // Sắp xếp tháng mới nhất lên đầu
};
```

---

### 4.2 Báo cáo doanh thu theo từng sản phẩm (Product revenue)
*Ý tưởng*: Duyệt qua các đơn hàng thành công, tìm kiếm các phần tử nằm trong mảng `items`, cộng dồn số lượng và doanh thu của sản phẩm tương ứng.

```typescript
const generateProductRevenueReport = (filteredOrders: any[]) => {
  const productData: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {};

  filteredOrders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const productId = item.id || "unknown";
        const productName = item.name || "Sản phẩm ẩn";
        const price = Number(item.price || 0);

        if (!productData[productId]) {
          productData[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
        }
        productData[productId].quantity += 1;
        productData[productId].revenue += price;
      });
    }
  });

  return Object.values(productData).map(row => ({
    "Mã sản phẩm": row.id,
    "Tên sản phẩm/gói dịch vụ": row.name,
    "Số lượng bán ra": row.quantity,
    "Tổng doanh thu phát sinh (VND)": row.revenue
  })).sort((a, b) => b["Tổng doanh thu phát sinh (VND)"] - a["Tổng doanh thu phát sinh (VND)"]);
};
```

---

### 4.3 Top tài khoản chi tiêu mua hàng nhiều nhất (Top spending users)
*Ý tưởng*: Tổng hợp chi tiêu từ các đơn hàng thành công theo `userId`, sau đó ánh xạ với danh sách `users` để hiển thị thêm email và tên hiển thị đầy đủ của khách hàng.

```typescript
const generateTopSpendingUsersReport = (filteredOrders: any[], allUsers: any[]) => {
  const userSpending: Record<string, { userId: string; amount: number; count: number }> = {};

  filteredOrders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const uId = order.userId;
      if (uId) {
        if (!userSpending[uId]) {
          userSpending[uId] = { userId: uId, amount: 0, count: 0 };
        }
        userSpending[uId].amount += Number(order.totalAmount || 0);
        userSpending[uId].count += 1;
      }
    }
  });

  // Ánh xạ thông tin User Profile
  return Object.values(userSpending).map(item => {
    const userProfile = allUsers.find(u => u.uid === item.userId || u.id === item.userId);
    return {
      "Mã khách hàng (UID)": item.userId,
      "Tên khách hàng": userProfile?.displayName || "Khách vãng lai",
      "Email": userProfile?.email || "Chưa có email",
      "Tổng số tiền đã chi tiêu (VND)": item.amount,
      "Số lượng đơn hàng đã hoàn tất": item.count
    };
  }).sort((a, b) => b["Tổng số tiền đã chi tiêu (VND)"] - a["Tổng số tiền đã chi tiêu (VND)"]);
};
```

---

### 4.4 Top tài khoản sử dụng tài nguyên miễn phí nhiều nhất (Top free resource users)
*Ý tưởng*: Gom các đơn hàng thành công có giá trị đơn hàng bằng 0 (`totalAmount === 0` hoặc các mặt hàng có giá 0), hoặc tài khoản đang sử dụng gói `free` và có phát sinh truy cập/tải học liệu.

```typescript
const generateTopFreeResourceUsersReport = (filteredOrders: any[], allUsers: any[]) => {
  const freeUsers: Record<string, { userId: string; freeOrderCount: number; freeItemNames: Set<string> }> = {};

  filteredOrders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const isFreeOrder = Number(order.totalAmount || 0) === 0;
      let hasFreeItems = false;
      const freeItemsInOrder: string[] = [];

      if (order.items) {
        order.items.forEach((item: any) => {
          const price = Number(item.price || 0);
          if (price === 0) {
            hasFreeItems = true;
            freeItemsInOrder.push(item.name || item.id);
          }
        });
      }

      if (isFreeOrder || hasFreeItems) {
        const uId = order.userId;
        if (uId) {
          if (!freeUsers[uId]) {
            freeUsers[uId] = { userId: uId, freeOrderCount: 0, freeItemNames: new Set() };
          }
          freeUsers[uId].freeOrderCount += 1;
          freeItemsInOrder.forEach(name => freeUsers[uId].freeItemNames.add(name));
        }
      }
    }
  });

  return Object.values(freeUsers).map(item => {
    const userProfile = allUsers.find(u => u.uid === item.userId || u.id === item.userId);
    return {
      "Mã khách hàng (UID)": item.userId,
      "Tên khách hàng": userProfile?.displayName || "Thành viên",
      "Email": userProfile?.email || "Chưa có email",
      "Gói hiện tại": userProfile?.currentTier || "free",
      "Số lượt tải tài nguyên miễn phí": item.freeOrderCount,
      "Tên các tài nguyên miễn phí đã dùng": Array.from(item.freeItemNames).join(", ")
    };
  }).sort((a, b) => b["Số lượt tải tài nguyên miễn phí"] - a["Số lượt tải tài nguyên miễn phí"]);
};
```

---

### 4.5 Bảng xếp hạng các Tool/Khóa học được sử dụng nhiều nhất (Ranking of tools/courses)
*Ý tưởng*: Bảng xếp hạng mức độ phổ biến của các Tool và Khóa học dựa trên số lượng lượt mua/kích hoạt của người dùng (trong danh sách `items` của đơn hàng thành công).

```typescript
const generateToolCourseRankingReport = (filteredOrders: any[]) => {
  const rankingData: Record<string, { id: string; name: string; purchaseCount: number; revenue: number }> = {};

  filteredOrders.forEach(order => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const itemId = item.id || "unknown";
        const itemName = item.name || "Sản phẩm ẩn";
        const price = Number(item.price || 0);

        if (!rankingData[itemId]) {
          rankingData[itemId] = { id: itemId, name: itemName, purchaseCount: 0, revenue: 0 };
        }
        rankingData[itemId].purchaseCount += 1;
        rankingData[itemId].revenue += price;
      });
    }
  });

  return Object.values(rankingData)
    .map((row, idx) => ({
      "Xếp hạng": 0, // Sẽ điền sau khi sắp xếp
      "Mã tài nguyên (ID)": row.id,
      "Tên Tool / Khóa học": row.name,
      "Số lượt đăng ký/mua": row.purchaseCount,
      "Doanh thu tạo ra (VND)": row.revenue
    }))
    .sort((a, b) => b["Số lượt đăng ký/mua"] - a["Số lượt đăng ký/mua"])
    .map((item, idx) => {
      item["Xếp hạng"] = idx + 1;
      return item;
    });
};
```

---

## 5. Định dạng dữ liệu với Papaparse & Xuất file mã hóa UTF-8 BOM

Để chuyển dữ liệu mảng đối tượng JSON đã tổng hợp thành định dạng văn bản CSV tiêu chuẩn, thư viện `papaparse` (đã được cài đặt sẵn bản `5.5.4` trong dự án) cung cấp hàm `Papa.unparse()`. 

Để giải quyết triệt để lỗi hiển thị font tiếng Việt (có dấu) khi mở file CSV trực tiếp bằng Microsoft Excel trên Windows, chúng ta bắt buộc phải chèn ký tự đặc biệt **Byte Order Mark (BOM - `\uFEFF`)** vào vị trí đầu tiên của tệp văn bản.

### Hàm Helper Thực hiện Xuất CSV:
```typescript
import Papa from "papaparse";

export const exportToCSV = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để xuất trong khoảng thời gian đã chọn!");
    return;
  }

  // 1. Chuyển đổi dữ liệu JSON thành chuỗi CSV thông qua Papaparse
  const csvString = Papa.unparse(data);

  // 2. Định nghĩa ký tự BOM (\uFEFF) cho UTF-8 để Excel hiển thị đúng dấu tiếng Việt
  const bom = "\uFEFF";
  const blobContent = bom + csvString;

  // 3. Khởi tạo đối tượng Blob chứa nội dung CSV với mã hóa UTF-8
  const blob = new Blob([blobContent], { type: "text/csv;charset=utf-8;" });

  // 4. Tạo URL tạm thời để tải tệp xuống
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  
  // 5. Kích hoạt sự kiện tải xuống và dọn dẹp bộ nhớ
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

---

## 6. Luồng Điều Khiển Kịch Bản Xuất (Export Handler)

Dưới đây là hàm tổng hợp chính xử lý sự kiện khi người quản trị click nút "Tải xuống CSV":

```typescript
const handleExportData = () => {
  // Lấy dải ngày lọc từ bộ lọc tùy chỉnh
  const { start, end } = getExportDateRange();

  // Hàm helper lọc danh sách theo ngày
  const filterListByDate = <T extends { createdAt?: any }>(list: T[]): T[] => {
    return list.filter((item) => {
      const date = parseFirestoreDate(item.createdAt);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };

  // Tiến hành lọc dữ liệu
  const filteredUsers = filterListByDate(rawData.users);
  const filteredOrders = filterListByDate(rawData.orders);
  const filteredTransactions = filterListByDate(rawData.transactions);

  let exportData: any[] = [];
  let fileLabel = "";

  switch (exportReport) {
    case "monthly-revenue":
      exportData = generateMonthlyRevenueReport(filteredOrders, filteredTransactions);
      fileLabel = "Bao_cao_doanh_thu_hang_thang";
      break;
    case "product-revenue":
      exportData = generateProductRevenueReport(filteredOrders);
      fileLabel = "Bao_cao_doanh_thu_theo_san_pham";
      break;
    case "top-spending":
      exportData = generateTopSpendingUsersReport(filteredOrders, rawData.users);
      fileLabel = "Top_khach_hang_chi_tieu_nhieu_nhat";
      break;
    case "top-free":
      exportData = generateTopFreeResourceUsersReport(filteredOrders, rawData.users);
      fileLabel = "Top_tai_khoan_tai_nguyen_mien_phi";
      break;
    case "tool-course-ranking":
      exportData = generateToolCourseRankingReport(filteredOrders);
      fileLabel = "Bang_xep_hang_tool_khoa_hoc";
      break;
    // Tùy chọn xuất bảng dữ liệu gốc (nếu có nhu cầu)
    case "raw-users":
      exportData = filteredUsers.map(u => ({
        UID: u.uid || u.id,
        "Tên hiển thị": u.displayName,
        Email: u.email,
        "Số dư ví (VND)": u.walletBalance,
        "Gói thành viên": u.currentTier,
        "Hạn gói": u.tierExpiresAt || "Vĩnh viễn",
        "Ngày tạo": parseFirestoreDate(u.createdAt)?.toLocaleString("vi-VN") || ""
      }));
      fileLabel = "Du_lieu_goc_nguoi_dung";
      break;
    case "raw-orders":
      exportData = filteredOrders.map(o => ({
        "Mã đơn hàng": o.id,
        "Mã khách hàng": o.userId,
        "Chi tiết sản phẩm": o.items?.map((i: any) => `${i.name}(${i.price})`).join(" | "),
        "Tổng tiền (VND)": o.totalAmount,
        "Trạng thái": o.status,
        "Thời gian tạo": parseFirestoreDate(o.createdAt)?.toLocaleString("vi-VN") || ""
      }));
      fileLabel = "Du_lieu_goc_don_hang";
      break;
    default:
      alert("Loại báo cáo không hợp lệ!");
      return;
  }

  // Thực hiện xuất file
  exportToCSV(exportData, fileLabel);
  setIsExportModalOpen(false); // Đóng modal
};
```

---
*Bản thiết kế này đáp ứng hoàn hảo 5 yêu cầu phân tích báo cáo đặc thù của hệ thống Admin Dashboard, đồng thời đảm bảo an toàn về mã hóa dữ liệu tiếng Việt tiếng Anh khi mở trên các phần mềm bảng tính phổ biến.*
