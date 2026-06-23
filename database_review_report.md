# BÁO CÁO ĐÁNH GIÁ VÀ TỐI ƯU HÓA CƠ SỞ DỮ LIỆU FIRESTORE
**Dự án**: Hệ thống Web B.T AI LABs (Ban Content / Healing Bird Automation)
**Tác giả**: Database Review Worker
**Ngày thực hiện**: 22/06/2026

---

## I. MỤC TIÊU ĐÁNH GIÁ
Đánh giá cấu trúc cơ sở dữ liệu NoSQL (Google Cloud Firestore) hiện tại của ứng dụng Next.js, phân tích sự tương thích giữa dữ liệu thực tế lưu trữ trong DB và các yêu cầu hiển thị/xử lý nghiệp vụ trên giao diện người dùng (UI/UX). Từ đó đề xuất các cải tiến về schema nhằm giải quyết các lỗi hiện tại, loại bỏ dữ liệu giả lập (mock), và hỗ trợ mở rộng các tính năng động trong tương lai.

---

## II. CẤU TRÚC DỮ LIỆU HIỆN TẠI (CURRENT SCHEMAS)
Do Firestore là cơ sở dữ liệu NoSQL dạng tài liệu (Document Database), cấu trúc dữ liệu được định nghĩa ngầm định qua các TypeScript interface và các payload ghi/đọc ở phía API/Client. Dưới đây là thông tin chi tiết của 4 collection chính được phát hiện trong codebase:

### 1. Collection `users`
Lưu trữ thông tin chi tiết của người dùng, phân quyền, số dư ví và các vật phẩm/công cụ đã mua.
* **Document ID**: `uid` (Trùng khớp với UID từ Firebase Authentication)
* **Location in Code**:
  * Định nghĩa Interface: `context/AuthContext.tsx` (Dòng 16-25)
  * Khởi tạo tài khoản: `context/AuthContext.tsx` (Dòng 53-65) khi người dùng Google đăng nhập lần đầu, hoặc qua trang `app/login/page.tsx`
  * Cập nhật số dư & vật phẩm: `/api/purchase/route.ts` và `/api/payment/webhook/route.ts`
* **Cấu trúc trường (Fields & Types)**:
  * `uid` (`string`): Mã định danh duy nhất của người dùng.
  * `email` (`string | null`): Địa chỉ email đăng ký.
  * `displayName` (`string | null`): Tên hiển thị của người dùng (mặc định là "User" hoặc tên từ Google).
  * `walletBalance` (`number`): Số dư tài khoản bằng VNĐ (mặc định là `0`).
  * `currentTier` (`"free" | "plus" | "premium"`): Cấp độ tài khoản (mặc định là `"free"`).
  * `tierExpiresAt` (`string | null`): Hạn sử dụng cấp độ tài khoản (định dạng ISO string hoặc `null`).
  * `role` (`"user" | "admin"`): Vai trò phân quyền trong hệ thống (mặc định là `"user"`).
  * `purchasedItems` (`string[]`): Mảng chứa danh sách ID các sản phẩm/công cụ người dùng đã mua.
  * `createdAt` (`Timestamp` / `serverTimestamp`): Thời gian khởi tạo tài khoản.
  * `updatedAt` (`string`): Thời gian cập nhật thông tin gần nhất (ISO String).

### 2. Collection `products`
Lưu trữ danh mục sản phẩm/dịch vụ cấu hình từ trang quản trị Admin.
* **Document ID**: Chuỗi ký tự ngẫu nhiên do Firestore tự động sinh ra.
* **Location in Code**:
  * Định nghĩa Interface: `app/admin/products/page.tsx` (Dòng 9-16)
  * Các thao tác CRUD: `app/admin/products/page.tsx` (Đọc danh sách dòng 37; Tạo mới/Cập nhật dòng 115-132; Xóa dòng 147)
* **Cấu trúc trường (Fields & Types)**:
  * `id` (`string`): Mã sản phẩm (Firestore Auto ID).
  * `name` (`string`): Tên sản phẩm/gói dịch vụ.
  * `description` (`string`): Mô tả chi tiết sản phẩm.
  * `price` (`number`): Đơn giá sản phẩm (đơn vị: VNĐ).
  * `imageUrl` (`string`): Đường dẫn ảnh minh họa (lưu trữ trên Firebase Storage).
  * `createdAt` (`Timestamp` / `serverTimestamp`): Ngày tạo sản phẩm.
  * `updatedAt` (`Timestamp` / `serverTimestamp` - Tùy chọn): Ngày cập nhật sản phẩm cuối cùng.

### 3. Collection `orders`
Lưu trữ lịch sử mua sắm sản phẩm/dịch vụ của người dùng thanh toán qua số dư ví điện tử.
* **Document ID**: Chuỗi ký tự ngẫu nhiên do Firestore tự động sinh ra.
* **Location in Code**:
  * Định nghĩa Interface: `app/admin/orders/page.tsx` (Dòng 8-15)
  * Khởi tạo đơn hàng: `app/api/purchase/route.ts` (Dòng 41-48) khi gọi API thanh toán giỏ hàng.
  * Truy vấn danh sách Admin: `app/admin/orders/page.tsx` (Dòng 75-87)
* **Cấu trúc trường (Fields & Types)**:
  * `id` (`string`): Mã đơn hàng (Firestore Auto ID).
  * `userId` (`string`): ID người mua hàng (`users.uid`).
  * `items` (`Array`): Danh sách sản phẩm mua, mỗi phần tử gồm:
    * `id` (`string`): Mã sản phẩm gốc.
    * `name` (`string`): Tên sản phẩm tại thời điểm mua.
    * `price` (`string` / `number`): Giá bán sản phẩm (lưu dạng `priceText`).
  * `totalAmount` (`number`): Tổng số tiền thanh toán thực tế (đơn vị: VNĐ).
  * `status` (`string`): Trạng thái đơn hàng (mặc định luôn ghi nhận là `'COMPLETED'`).
  * `createdAt` (`string`): Thời gian thanh toán đơn hàng (ISO String).

### 4. Collection `transactions`
Lưu trữ yêu cầu nạp tiền vào ví điện tử và theo dõi trạng thái đối soát từ cổng PayOS.
* **Document ID**: Chuỗi ký tự biểu diễn của số `orderCode` (Ví dụ: `"171900224"`).
* **Location in Code**:
  * Định nghĩa Interface: `app/admin/orders/page.tsx` (Dòng 17-26)
  * Tạo giao dịch nạp tiền: `app/api/payment/create-link/route.ts` (Dòng 34-42)
  * Xử lý Webhook cổng PayOS: `app/api/payment/webhook/route.ts` (Dòng 29-41)
* **Cấu trúc trường (Fields & Types)**:
  * `id` (`string`): Mã Document (chuyển đổi từ `orderCode`).
  * `orderCode` (`number`): Mã đơn giao dịch dạng số nguyên độc nhất gửi sang PayOS (được sinh từ phần đuôi của Timestamp `Date.now()`).
  * `userId` (`string`): ID người nạp tiền (`users.uid`).
  * `userEmail` (`string`): Email của người nạp tiền để đối chiếu.
  * `amount` (`number`): Số tiền yêu cầu nạp (đơn vị: VNĐ).
  * `description` (`string`): Nội dung mô tả giao dịch (mặc định: `'Nạp tiền vào ví'`).
  * `status` (`"PENDING" | "SUCCESS" | "FAILED"`): Trạng thái giao dịch.
  * `createdAt` (`string`): Thời gian khởi tạo yêu cầu nạp tiền (ISO String).
  * `updatedAt` (`string` - Tùy chọn): Thời gian nhận webhook cập nhật trạng thái thành công (ISO String).

---

## III. CÁC ĐIỂM HẠN CHẾ VÀ BẤT CẬP HIỆN TẠI (SCHEMA & UI GAPS)

Qua đối chiếu chi tiết giữa mã nguồn xử lý giao diện (Frontend UI) và cấu trúc cơ sở dữ liệu hiện tại, chúng tôi phát hiện ra các vấn đề nghiêm trọng ảnh hưởng trực tiếp tới tính toàn vẹn của dữ liệu và trải nghiệm người dùng:

### 1. Lỗi hiển thị `NaNđ` trong Trang quản trị Đơn hàng (Admin Orders)
* **Nguyên nhân**: Trong API mua hàng `/api/purchase/route.ts`, thông tin đơn hàng được lưu vào DB với trường giá của từng sản phẩm là chuỗi văn bản (`price: item.priceText`, ví dụ: `"990,000đ/tháng"` hoặc `"450,000đ/tháng"`). Tuy nhiên, trên giao diện quản trị Admin (`app/admin/orders/page.tsx` dòng 219), hệ thống lại ép kiểu trường này sang kiểu số `Number(item.price)` để định dạng `.toLocaleString()`. Việc ép kiểu một chuỗi chứa chữ và ký tự đặc biệt (`"990,000đ/tháng"`) sang Number sẽ trả về giá trị `NaN`, dẫn tới việc admin thấy giá trị sản phẩm hiển thị lỗi là `NaNđ`.
* **Ảnh hưởng**: Admin không thể kiểm tra chính xác đơn giá riêng lẻ của từng sản phẩm trong hóa đơn mua hàng cũ.

### 2. Sự cô lập giữa Danh mục sản phẩm động (Firestore `products`) và Cửa hàng tĩnh (Storefront)
* **Nguyên nhân**: Hiện tại, toàn bộ giao diện Landing Page hiển thị sản phẩm mua (`app/page.tsx`) đều import cứng danh mục từ file cấu hình tĩnh `data/store.ts` (các mảng `COMBOS`, `TOOLS`, `COURSES`, `FREE_RESOURCES`). Firestore có collection `products` và có trang Admin quản lý sản phẩm động (`app/admin/products/page.tsx`), nhưng các dữ liệu này không hề được hiển thị ngoài trang chủ.
* **Nguyên nhân sâu xa**: Schema của `products` trong Firestore quá đơn giản (chỉ có `name`, `description`, `price`, `imageUrl`) trong khi giao diện người dùng yêu cầu cấu trúc dữ liệu hiển thị cực kỳ phức tạp (phải có `priceText` phân biệt đơn vị thời gian nạp, `originalPriceText` để tính phần trăm giảm giá, `badge` & `badgeColor` hiển thị nhãn nổi bật, `themeClasses` để định hình phong cách màu sắc/khung viền cyber-punk của UI, Lucide `icon` component, và `actionText`). Nếu chuyển thẳng storefront sang dùng collection `products` hiện tại, toàn bộ giao diện UI/UX tuyệt đẹp hiện tại sẽ bị phá vỡ hoàn toàn do thiếu các trường metadata giao diện.

### 3. Trang Trung tâm người dùng (Hub Page) sử dụng Dữ liệu giả lập hoàn toàn (Mock Data)
* **Nguyên nhân**: Khi truy cập vào trang Hub quản lý tài khoản (`app/hub/page.tsx`), người dùng sẽ nhìn thấy danh sách các ứng dụng đã mua gần đây (ví dụ: *Ban Content Automation*, *Khóa học Master Automation*, *Healing Bird Tool*), lịch sử giao dịch ví và trạng thái bản quyền hoạt động/hết hạn. Tuy nhiên, toàn bộ các danh sách này đều đang được viết mã cứng (hardcoded) trong giao diện. 
* **Ảnh hưởng**: Việc ghi nhận mua hàng thành công trong API `/api/purchase` (trừ số dư ví, thêm ID vào mảng `purchasedItems` trong doc `users`) thực tế không hề được phản ánh lên giao diện Hub. Người dùng mua xong vẫn thấy giao diện mock hiển thị các sản phẩm cũ hoặc không thay đổi trạng thái thực tế. Hơn nữa, trường `purchasedItems` trong schema `users` chỉ là một mảng chuỗi phẳng các ID (`string[]`), hoàn toàn không lưu trữ ngày kích hoạt, ngày hết hạn, hoặc trạng thái gia hạn, khiến hệ thống không thể tự động hóa việc tính toán thời gian hết hạn bản quyền của các tool (như proxy, gói tháng) để hiển thị nhãn "Active/Expired" động.

### 4. Thiếu hụt nhật ký đối soát Webhook và kiểm tra giao dịch PayOS
* **Nguyên nhân**: API webhook PayOS (`/api/payment/webhook/route.ts`) chỉ thực hiện cập nhật trạng thái giao dịch trong collection `transactions` thành `'SUCCESS'` và cộng tiền vào ví người dùng. Hệ thống không hề lưu trữ lịch sử phản hồi webhook (Webhook payload logs) hoặc các mã tham chiếu ngân hàng (Bank Transaction ID, Bank Code, Payment Link ID) trả về từ PayOS.
* **Ảnh hưởng**: Nếu có lỗi xảy ra trong quá trình truyền nhận dữ liệu (ví dụ: lỗi mạng giữa chừng, mất chữ ký, người dùng chuyển khoản sai số tiền hoặc nội dung, trùng lặp webhook), hệ thống không có bằng chứng dữ liệu thô (raw JSON payload) trong cơ sở dữ liệu để đối soát tự động hoặc hỗ trợ khách hàng thủ công.

---

## IV. ĐỀ XUẤT TỐI ƯU HÓA CHI TIẾT (PROPOSED SCHEMAS & OPTIMIZATION POINTS)

Nhằm tối ưu hóa cơ sở dữ liệu, sửa lỗi hiển thị và chuẩn bị cho việc đồng bộ hóa hoàn toàn hệ thống thực tế với giao diện người dùng, chúng tôi đề xuất cải tiến thiết kế cơ sở dữ liệu Firestore theo các collection chi tiết như sau:

```
                  ┌──────────────────────────────────────────┐
                  │            users (Collection)            │
                  │  - uid, email, displayName, role, etc.   │
                  │  - walletBalance (Số dư thực tế)         │
                  └────────────┬─────────────────────────────┘
                               │
                               ├──────────────────────────────────────┐
                               ▼                                      ▼
                  ┌──────────────────────────┐           ┌──────────────────────────┐
                  │   licenses (Sub-coll)    │           │   orders (Collection)    │
                  │  - itemId, status        │           │  - userId, totalAmount   │
                  │  - activatedAt, expiresAt│           │  - items: [{id, price}]  │
                  └──────────────────────────┘           └────────────▲─────────────┘
                                                                      │ (Liên kết đối chiếu)
                                                                      │
                  ┌──────────────────────────┐           ┌────────────┴─────────────┐
                  │  products (Collection)   │           │transactions (Collection) │
                  │  - name, price, desc     │           │  - orderCode, userId     │
                  │  - priceText, theme, icon│           │  - amount, status        │
                  └──────────────────────────┘           └────────────▲─────────────┘
                                                                      │
                                                                      │ (Ghi nhật ký)
                                                         ┌────────────┴─────────────┐
                                                         │ webhook_logs (Collection)│
                                                         │  - payload, status, signature│
                                                         └──────────────────────────┘
```

### 1. Phân nhóm Gói sản phẩm (Collection: `products`)
Bổ sung các trường metadata hiển thị vào schema `products` trong Firestore để hỗ trợ kết xuất Landing Page hoàn toàn động mà không làm vỡ cấu trúc giao diện CSS.

* **Các trường đề xuất bổ sung/thay đổi**:
  * `price` (`number` - Bắt buộc): Lưu số tiền dạng số nguyên để tính toán giỏ hàng (ví dụ: `990000`).
  * `originalPrice` (`number` - Tùy chọn): Giá gốc chưa giảm (ví dụ: `1500000`) để hệ thống tự động tính toán phần trăm giảm giá hiển thị.
  * `billingCycle` (`"monthly" | "yearly" | "lifetime" | "free"`): Đơn vị chu kỳ tính phí (thay thế cho việc viết cứng đơn vị vào chuỗi).
  * `productType` (`"combo" | "tool" | "course" | "free"`): Phân loại sản phẩm để tự động phân luồng hiển thị vào đúng các grid tương ứng trên UI (thay thế cho việc chia file store tĩnh).
  * `badgeText` (`string` - Tùy chọn): Nhãn nổi bật (Ví dụ: `"BEST SELLER"`, `"HOT"`, `"-30%"`).
  * `badgeStyle` (`"red" | "green" | "purple" | "blue"`): Định hình màu sắc nhãn nổi bật tương ứng trên UI.
  * `iconKey` (`string`): Tên định danh của Icon (Ví dụ: `"Settings"`, `"Users"`, `"Star"`) để frontend map động với thư viện `lucide-react`.
  * `themeName` (`"purple" | "green" | "blue" | "pink" | "amber" | "cyan"`): Tên chủ đề giao diện, giúp frontend tải các lớp CSS cấu hình viền hover/gradient tương ứng (`themeClasses`).
  * `actionText` (`string`): Văn bản hiển thị trên nút hành động (Ví dụ: `"Mua ngay"`, `"Thêm vào giỏ"`, `"Tải xuống"`).
  * `rating` (`number` - Tùy chọn): Số điểm đánh giá (Ví dụ: `5.0`).

* **Bảng so sánh schema cũ vs schema tối ưu**:

| Tên trường | Schema Cũ (NoSQL) | Schema Tối Ưu Đề Xuất | Ý nghĩa & Vai trò UI/UX |
| :--- | :--- | :--- | :--- |
| `price` | `number` (VNĐ) | `number` (Đơn giá thực) | Dùng để tính toán giỏ hàng, trừ tiền ví |
| `originalPrice` | *Không có* | `number` | Hiển thị giá gốc gạch ngang (`originalPriceText`) |
| `billingCycle` | *Không có* | `string` (`"monthly"`, etc.) | Sinh ra hậu tố giá động (Ví dụ: `/tháng`, `/năm`) |
| `productType` | *Không có* | `string` (`"tool"`, etc.) | Gom nhóm sản phẩm vào đúng vị trí hiển thị trên UI |
| `badgeText` | *Không có* | `string` | Nội dung nhãn (Ví dụ: `"-30%"`, `"NEW"`) |
| `iconKey` | *Không có* | `string` | Tên Icon bản đồ hóa sang React Component Icon |
| `themeName` | *Không có* | `string` | Quyết định các class CSS styling cho giao diện cyberpunk |

---

### 2. Quản lý Đơn hàng chi tiết (Collection: `orders`)
Khắc phục triệt để lỗi ép kiểu hiển thị `NaNđ` và nâng cao tính minh bạch thông tin giao dịch cho Quản trị viên.

* **Các trường đề xuất tối ưu**:
  * Thay đổi cấu trúc trường `items` bên trong `orders`:
    * `items` (`Array`): Lưu dạng cấu trúc chuẩn hóa kiểu số:
      * `id` (`string`): ID của sản phẩm.
      * `name` (`string`): Tên sản phẩm.
      * `price` (`number` - Thay vì priceText): Giá số nguyên thực tế tại thời điểm mua (Ví dụ: `990000`).
      * `billingCycle` (`string`): Đơn vị chu kỳ (Ví dụ: `"monthly"`).
  * `userEmail` (`string`): Lưu email của người mua trực tiếp vào đơn hàng. 
    * *Lý do*: Giúp Admin khi xem danh sách đơn hàng có thể nhận dạng tức thì khách hàng là ai mà không cần phải copy `userId` đi tìm kiếm thủ công trong collection `users`.
  * `paymentMethod` (`"wallet"`): Hình thức thanh toán đơn hàng (hỗ trợ mở rộng khi tích hợp cổng thanh toán trực tiếp không qua ví).
  * `transactionId` (`string` - Tùy chọn): Mã liên kết chéo sang giao dịch nạp tiền nếu có.

* **Sửa lỗi UI hiển thị**:
  Khi chuyển đổi trường `items[i].price` sang kiểu số (`number`), dòng code xử lý hiển thị tại `app/admin/orders/page.tsx` dòng 219:
  `Number(item.price).toLocaleString()`
  Sẽ thực thi thành công mà không gây ra lỗi `NaN`, hiển thị chuẩn hóa dạng `990,000đ` cực kỳ chuyên nghiệp.

---

### 3. Quản lý Bản quyền Ứng dụng & Người dùng (Collection: `users`)
Chuyển đổi quản lý phân quyền và ứng dụng sở hữu từ trạng thái tĩnh, giả lập sang động, có hạn dùng rõ ràng.

* **Các trường đề xuất tối ưu**:
  * Thay thế mảng phẳng `purchasedItems: string[]` bằng một subcollection nằm dưới Document User có tên là `licenses` (đường dẫn: `users/{uid}/licenses/{licenseId}`). Việc sử dụng subcollection giúp quản lý thời hạn của từng sản phẩm độc lập, dễ truy vấn và tối ưu hiệu năng đọc ghi của Document User chính.
  * **Cấu trúc Subcollection `licenses`**:
    * `itemId` (`string`): ID sản phẩm tương ứng trong collection `products`.
    * `itemName` (`string`): Tên sản phẩm lưu vết.
    * `status` (`"active" | "expired" | "suspended"`): Trạng thái hoạt động của giấy phép/bản quyền.
    * `activatedAt` (`Timestamp`): Ngày bắt đầu kích hoạt gói dịch vụ.
    * `expiresAt` (`Timestamp | null`): Ngày hết hạn dịch vụ. Nếu là sản phẩm mua trọn đời (lifetime) hoặc tài nguyên miễn phí, giá trị này sẽ lưu là `null`.
    * `licenseKey` (`string` - Tùy chọn): Khóa bản quyền kích hoạt sinh ra cho các phần mềm desktop tool nếu cần.
  * **Đồng bộ hóa UI Hub (`app/hub/page.tsx`)**:
    * Cần sửa đổi logic lấy dữ liệu trong Tab "Quản lý Ứng dụng" (`license`) và "Đã mua gần đây" trên Hub: Thay thế dữ liệu mock cứng bằng truy vấn lấy danh sách tài liệu từ subcollection `licenses` của user hiện tại (`users/{auth.uid}/licenses`).
    * Nhãn hạn sử dụng (HSD) sẽ được tính toán động bằng cách so sánh thời gian hiện tại với trường `expiresAt` trong DB (thay vì hiển thị chữ cứng "HSD: Vĩnh viễn" hay "HSD: 30/12/2026").

---

### 4. Đối soát & Nhật ký Webhook (Collection: `transactions` & `webhook_logs`)
Nâng cao tính bảo mật, khả năng phục hồi lỗi nạp tiền và cung cấp lịch sử đối soát giao dịch tự động.

* **Đề xuất tối ưu hóa Collection `transactions`**:
  Bổ sung các trường chi tiết trả về từ PayOS Webhook khi nạp tiền thành công nhằm mục đích đối soát tài chính:
  * `payosPaymentLinkId` (`string`): ID liên kết thanh toán do PayOS trả về khi tạo link.
  * `bankTransactionId` (`string`): Mã giao dịch của ngân hàng (Ví dụ: FT26... hoặc mã tham chiếu chuyển khoản ngân hàng). Giúp kiểm tra chéo với lịch sử sao kê ngân hàng của chủ shop khi xảy ra tranh chấp.
  * `bankCode` (`string`): Mã ngân hàng người dùng sử dụng chuyển tiền (Ví dụ: `MB`, `VCB`, `VietinBank`).
  * `currency` (`string`): Tiền tệ thanh toán (mặc định là `"VND"`).
  * `payosSignature` (`string`): Chữ ký kiểm tra tính toàn vẹn của webhook dữ liệu.

* **Xây dựng Collection Mới `webhook_logs` (Nhật ký Webhook)**:
  Mỗi khi cổng thanh toán PayOS gửi request callback về endpoint `/api/payment/webhook/route.ts`, toàn bộ dữ liệu thô (raw payload) cần được ghi nhận lại vào một collection riêng để giám sát hệ thống.
  * **Document ID**: Tự động sinh.
  * **Cấu trúc trường**:
    * `orderCode` (`number`): Mã đơn hàng gửi trong payload webhook.
    * `rawPayload` (`string`): Chuỗi JSON thô của toàn bộ body request nhận được từ PayOS.
    * `verificationStatus` (`"verified" | "signature_mismatch" | "processing_failed" | "duplicate"`): Kết quả đối soát và xác thực chữ ký số bằng thuật toán checksum với `PAYOS_CHECKSUM_KEY`.
    * `errorMessage` (`string | null`): Chi tiết lỗi nếu xác thực thất bại hoặc gặp lỗi ghi DB.
    * `receivedAt` (`Timestamp`): Thời điểm nhận callback webhook từ PayOS.

---

## V. TỔNG KẾT VÀ LỘ TRÌNH TRIỂN KHAI KHUYẾN NGHỊ

### 1. Phân loại mức độ ưu tiên triển khai

| STT | Đề xuất tối ưu | Phân loại Collection | Mức độ ưu tiên | Rationale (Lý do cốt lõi) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Sửa lỗi ép kiểu đơn giá | `orders` | **Khẩn cấp (P0)** | Khắc phục ngay lỗi hiển thị giao diện `NaNđ` trong bảng quản lý đơn hàng của Admin. |
| 2 | Nhật ký Webhook & Audit PayOS | `transactions`, `webhook_logs` | **Cao (P1)** | Bảo vệ hệ thống nạp tiền ví tự động, lưu vết để đối soát khi khách chuyển khoản lỗi. |
| 3 | Chuyển đổi Hub User sang động | `users` (licenses) | **Trung bình (P2)** | Thay thế dữ liệu mock trong Hub, giúp người dùng theo dõi hạn dùng ứng dụng thực tế. |
| 4 | Chuyển đổi Storefront sang động | `products` | **Thấp (P3)** | Đưa danh mục Landing Page lên quản lý động bằng DB thay vì file store tĩnh. |

### 2. Cam kết toàn vẹn (Integrity Attestation)
Báo cáo này được thực hiện dựa trên phân tích thực tế mã nguồn tĩnh và logic tương tác dữ liệu hiện tại của hệ thống. Không có bất kỳ thay đổi trực tiếp nào được thực hiện trên mã nguồn ứng dụng để đảm bảo tính an toàn cho môi trường đang chạy. Mọi đề xuất tuân thủ nghiêm ngặt nguyên tắc thiết kế hệ thống NoSQL Firestore tối ưu hóa chi phí đọc/ghi và nâng cao trải nghiệm UI/UX.
