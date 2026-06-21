# Original User Request

## Initial Request — 2026-06-20T03:55:55Z

Xây dựng trang Chi tiết Sản phẩm (Tool Detail Page) cho website Next.js dựa trên yêu cầu cấu trúc của user (lấy cảm hứng từ marketmmoai.com), kết hợp với thiết kế giao diện Glassmorphism Dark Theme hiện tại của dự án. Trang này sẽ được tích hợp vào luồng điều hướng của trang chủ.

Working directory: E:\Youtube\Ban Content\Web
Integrity mode: development

## Requirements

### R1. Cấu trúc Layout & Giao diện (UI/UX)
- Tạo một UI trang chi tiết sản phẩm tuân theo thiết kế Glassmorphism Dark Theme hiện có của trang chủ (hiệu ứng bóng mờ kính, viền phát sáng neon, nền tối).
- Bố cục trang bao gồm:
  + Header & Breadcrumb điều hướng.
  + Khối thông tin chính: Hình ảnh/Video Demo nổi bật, Tên Tool, Đoạn mô tả chi tiết, Bảng Tính năng (Feature List), Giá tiền, và Nút Kêu gọi hành động (CTA).
  + (Tùy chọn thiết kế) Khối thông tin bổ sung: Hướng dẫn sử dụng (How to use), Câu hỏi thường gặp (FAQ).

### R2. Quản lý Dữ liệu (Data Store)
- Khởi tạo một tệp dữ liệu dùng chung, ví dụ `data/tools.ts` hoặc `data/tools.json` (tùy chọn theo chuẩn Next.js) để lưu trữ toàn bộ nội dung của các tools (BanContent Automation, Healing Bird Tool, v.v.).
- Dữ liệu cung cấp đủ các trường hiển thị lên giao diện chi tiết.

### R3. Dynamic Routing & Navigation
- Triển khai tính năng Dynamic Routing của Next.js (App Router) với route `app/tools/[id]/page.tsx`.
- Gắn link vào các nút "Xem Chi Tiết" (của khối Slider bên trái) và các Tool Card (ở cột phải) trên trang chủ để điều hướng tới route tương ứng.

## Acceptance Criteria

### UI & Chức năng
- [ ] Giao diện trang `/tools/[id]` đồng bộ 100% với phong cách Glassmorphism của dự án.
- [ ] Không có lỗi layout nghiêm trọng trên Mobile và Desktop.
- [ ] Có đầy đủ phần hiển thị Thông tin, Hình ảnh, Tính năng, Giá, Nút CTA.

### Routing & Dữ liệu
- [ ] File data chứa thông tin của ít nhất 2 sản phẩm (Ban Content và Healing Bird).
- [ ] Tại trang chủ, click "Xem Chi Tiết" ở sản phẩm Ban Content sẽ tự động chuyển hướng sang `/tools/ban-content` và hiển thị đúng dữ liệu tương ứng.
- [ ] Thử truy cập `/tools/healing-bird` hiển thị đúng dữ liệu của Healing Bird.
- [ ] Truy cập `/tools/khong-ton-tai` sẽ hiển thị trang báo lỗi (Not Found) hoặc fallback an toàn.

## Follow-up — 2026-06-21T15:23:44Z

Xây dựng trang Admin Dashboard tích hợp trực tiếp vào website hiện tại (đường dẫn `/admin`). Admin sẽ đăng nhập bằng tài khoản thông thường, hệ thống tự nhận diện quyền (`role: "admin"`) để hiển thị giao diện quản trị.

Working directory: `E:\Youtube\Ban Content\Web`
Integrity mode: development

## Requirements

### R1. Phân quyền và Layout bảo vệ (Admin Guard)
Cập nhật `AuthContext` để lưu thêm `role` từ Firestore. Tạo một Layout riêng (`app/admin/layout.tsx`) để chặn những user không phải admin. Nếu user thường vào, tự động đẩy về trang chủ (`/`). Cập nhật `Header.tsx` để hiển thị nút "Admin Panel" nếu `role === 'admin'`.

### R2. Giao diện Admin & Module 1: Dashboard
Tạo Sidebar điều hướng cho trang Admin. Xây dựng trang tổng quan hiển thị thống kê tổng số User và tổng Doanh thu.

### R3. Module 2: Quản lý Sản phẩm (CRUD & Upload Ảnh)
Tạo trang `/admin/products`. Có khả năng thêm, sửa, xóa sản phẩm. Hình ảnh sản phẩm được upload lên Firebase Storage và lưu URL vào Firestore. Các trường cơ bản: Tên, Mô tả, Giá tiền, Hình ảnh.

### R4. Module 3 & 4: Quản lý Giao dịch và Người dùng
Tạo trang `/admin/orders` để xem lịch sử nạp tiền/mua hàng. Tạo trang `/admin/users` để liệt kê người dùng và cấp quyền admin cho user khác.

## Acceptance Criteria

### Security & Access
- [ ] Truy cập `/admin` bằng tài khoản user bình thường phải bị chuyển hướng về `/`.
- [ ] Bấm nút "Đăng xuất" trong Admin sẽ thoát hoàn toàn khỏi hệ thống.

### Product Management
- [ ] Thêm một sản phẩm mới thành công với hình ảnh thực tế được tải lên Firebase Storage.
- [ ] Sản phẩm vừa thêm xuất hiện ngay lập tức trong cơ sở dữ liệu Firestore ở collection `products`.

### User Management
- [ ] Có thể nhấn nút cấp quyền `admin` cho một user đang là `user` bình thường thông qua bảng quản lý người dùng.
