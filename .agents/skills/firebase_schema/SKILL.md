---
name: firebase_schema
description: The single source of truth for the Firestore Database Schema for Web, Desktop App, and Tool teams. Details all collections, fields, and access patterns.
---

# Firestore Database Schema

Đây là bản thiết kế chuẩn (Single Source of Truth) để các đội Web, App Desktop và Tools căn cứ vào khi đọc/ghi dữ liệu.

## 1. Collection `users` (Thông tin tài khoản & Phân quyền)
Quản lý thông tin chung của người dùng.
- **Document ID**: `uid` (được sinh ra từ Firebase Authentication).
- **Các trường dữ liệu (Fields)**:
  - `email` (string): Địa chỉ email đăng nhập.
  - `role` (string): Quyền hạn. (Ví dụ: "user", "admin").
  - `walletBalance` (number): Số dư ví (Dùng cho hệ thống nạp tiền tương lai).
  - `currentTier` (string): Gói tài khoản hiện tại ("free", "vip", "ultimate"). Được cấp khi mua Combo.
  - `tierExpiresAt` (string | null): Hạn sử dụng của gói Tier. Định dạng chuẩn ISO 8601 (VD: `2026-07-25T00:00:00.000Z`). Null nếu là gói vĩnh viễn hoặc "free".

---

## 2. Subcollection `licenses` (Bản quyền Tool Mua Lẻ)
Nằm bên trong từng Document của `users`. Ví dụ: `users/{uid}/licenses/{licenseId}`.
Được sử dụng khi khách hàng mua LẺ từng Tool, giúp App Desktop kiểm tra xem khách có quyền mở Tool đó hay không.
- **Document ID**: Sử dụng chung `itemId` của sản phẩm để dễ truy vấn (VD: `ban-content`, `healing-bird`).
- **Các trường dữ liệu (Fields)**:
  - `itemId` (string): Mã ID của Tool đã mua (Khớp với `id` trong bảng `products`).
  - `status` (string): Trạng thái bản quyền. Nhận 2 giá trị "active" (đang kích hoạt) hoặc "expired" (đã hết hạn).
  - `expiresAt` (string | null): Thời hạn của bản quyền. Định dạng ISO 8601. Nếu null là mua vĩnh viễn.
  - `updatedAt` (string): Thời gian cập nhật trạng thái gần nhất (ISO 8601).

***Quy trình App Desktop đọc License:***
1. Trích xuất `uid` đang đăng nhập.
2. Quét Subcollection `users/{uid}/licenses` để lấy danh sách Tool.
3. Nếu `expiresAt` < Thời gian hiện tại -> Cập nhật `status = expired` và khóa Tool.

---

## 3. Collection `products` (Danh mục Sản phẩm)
Lưu trữ toàn bộ danh sách sản phẩm hiển thị trên Website (Combo, Tool, Course). Web sẽ fetch trực tiếp từ đây để render.
- **Document ID**: Mã sản phẩm (VD: `ban-content`, `combo-vip`).
- **Các trường dữ liệu (Fields)**:
  - `name` (string): Tên hiển thị (VD: "BanContent Automation").
  - `description` (string): Mô tả ngắn về sản phẩm.
  - `price` (number): Giá trị bằng số để tính toán thanh toán (VD: 499000).
  - `priceText` (string): Giá trị hiển thị trên Web (VD: "499,000đ/tháng" hoặc "Miễn phí").
  - `category` (string): Loại sản phẩm. Rất quan trọng để phân loại. Nhận các giá trị: `tool`, `combo`, `course`, `free`.
  - `imageUrl` (string): Đường dẫn ảnh thumbnail.
  - `originalPrice` (number): Giá gốc (để hiển thị gạch ngang giảm giá).
  - `req_tier` (number): BẮT BUỘC cho `category: "tool"`. Để biết Gói Combo (Tier) nào được phép mở khóa tool này. (Vd: `1` là VIP, `2` là Ultimate).
  - `exec_file` (string): BẮT BUỘC cho `category: "tool"`. Tên file script Python để thực thi khi bấm nút (VD: `BanContent_Tool.py`).

***Quy trình Đội Tool lọc danh sách:***
1. Truy vấn `products` với điều kiện `where("category", "==", "tool")`.
2. Lấy ra danh sách các Tool hợp lệ để hiển thị trên Launcher, đồng thời lấy `req_tier` và `exec_file` để biết Tool này dành cho gói nào và chạy lệnh gì.

---

## 4. Collection `orders` (Lịch sử Đơn hàng)
Lưu vết mọi giao dịch mua bán để xuất hóa đơn và tra cứu.
- **Document ID**: Auto-generated (Tự sinh).
- **Các trường dữ liệu (Fields)**:
  - `userId` (string): Khớp với `uid` của người mua.
  - `items` (array): Mảng chứa các object của sản phẩm đã mua `[{id: "...", name: "...", price: "..."}]`.
  - `totalAmount` (number): Tổng tiền đơn hàng.
  - `status` (string): Trạng thái đơn ("COMPLETED", "PENDING", "FAILED").
  - `createdAt` (string): Thời gian mua (ISO 8601).

---

## 5. Realtime Database (Tương thích ngược)
Đây là kiến trúc cũ đang được duy trì để tương thích với các phiên bản App Desktop cũ chưa kịp update lên Firestore.
- **Đường dẫn**: `users/{uid}/purchased_tools/{rtdb_tool_id}`
- **Quy tắc chuyển đổi ID**: Thay dấu `-` bằng dấu `_`. (VD: `ban-content` thành `ban_content`).
- **Dữ liệu**: `true` hoặc `false`.
