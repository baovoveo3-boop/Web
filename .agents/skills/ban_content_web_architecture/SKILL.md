---
name: ban_content_web_architecture
description: Tổng hợp toàn bộ kiến thức, kiến trúc, luồng nghiệp vụ (Web, UI/UX, Payment, SSO, Database) của dự án B.T AI Labs Web (BanContent Automation).
---

# B.T AI Labs Web Architecture & Workflows

Tài liệu này lưu trữ toàn bộ bối cảnh dự án để AI hoặc team mới có thể tiếp quản và tiếp tục phát triển mà không bị đứt đoạn.

## 1. Công nghệ & Nền tảng (Tech Stack)
- **Frontend/Backend:** Next.js 14 (App Router), React, TypeScript.
- **Styling:** TailwindCSS (với triết lý thiết kế Neon, Dark mode, Glassmorphism, phong cách tương lai Cyberpunk/Hacker).
- **Cơ sở dữ liệu (Database):** Firebase Firestore (Single Source of Truth) kết hợp với Firebase Realtime Database (để tương thích ngược với App cũ).
- **Authentication:** Firebase Auth (Session Cookie) + API cấp `custom_token` (SSO cho App Desktop).
- **Payment Gateway:** PayOS (Thanh toán chuyển khoản tự động qua Webhook).
- **Hosting:** Vercel (Auto Deploy từ nhánh `main` qua GitHub).

## 2. Tiêu chuẩn Thiết kế Giao diện (UI/UX Guidelines)
Mục tiêu là mang lại trải nghiệm WOW, siêu mượt, chuẩn "Tập đoàn công nghệ":
- **Theme:** Tối (Dark) kết hợp ánh sáng Neon (Xanh lá `neonGreen`, Tím `neonPurple`, Cyan, Cam) phát sáng xung quanh viền.
- **Micro-animations:** Mọi nút bấm, thẻ (card) đều phải có hiệu ứng Hover mềm mại, trượt dốc (Gradient), bóng đổ (Shadow) thay đổi màu sắc.
- **Responsive:** Mobile-first, hiển thị chuẩn trên mọi kích thước màn hình.
- **Layout chính:**
  - **Trang chủ (`/page.tsx`):** Landing page bán hàng. Nút Action phải là "Mua Ngay" và "Xem Chi Tiết".
  - **Workspace (`/hub`):** Khu vực dành cho khách đã đăng nhập. Quản lý trạng thái gói tài khoản (Tier), quản lý License các Tool đã mua.
  - **Admin Panel (`/admin`):** Quản trị viên quản lý Sản phẩm, Người dùng, Lịch sử Order, Lỗi (Logs). Giao tiếp 100% với Firestore.

## 3. Luồng Nghiệp vụ Thanh Toán (Payment Workflow)
Hệ thống KHÔNG hardcode. Giá cả và thông tin sản phẩm lấy trực tiếp từ bảng `products` trên Firestore.
1. Khách bấm Mua Ngay -> Chọn Thanh Toán.
2. Web gọi API `/api/payment/create-link` -> Tạo link PayOS.
3. Khi khách quét mã QR chuyển tiền thành công -> PayOS gọi webhook `/api/payment/webhook`.
4. **Xử lý Webhook:**
   - Đọc giá trị giao dịch và Tool khách vừa mua.
   - Quét đơn giá từ bảng `products` (Database) để lấy chính xác mức giá và chu kỳ gia hạn (tháng/năm).
   - Tự động cộng tiền vào ví (nếu có) và **Gia hạn/Kích hoạt Tool** bằng cách:
     - Lưu thông tin mua vào `users/{uid}/licenses/{itemId}` với trường `expiresAt` chính xác.
     - Đồng bộ qua Realtime Database cho các App Desktop bản cũ.
   - Ghi lại Log Order vào bảng `orders`.

## 4. Luồng Xác thực 1 Chạm (SSO Desktop Auth)
Giúp khách không cần gõ lại Mật khẩu trên phần mềm Desktop sau khi đã mua hàng trên Web.
1. App Desktop mở trình duyệt trỏ vào `https://domain.com/login?clientId=...`
2. Khách đăng nhập trên Web.
3. Web gọi API `/api/desktop-auth` -> Sinh ra mã `custom_token` siêu bảo mật (chỉ hiệu lực 1 lần và giới hạn thời gian).
4. Web gọi ngược về Localhost của App Desktop (Vd: `http://localhost:35421/auth?token=...`).
5. App Desktop nhận token -> Gọi Firebase SDK `signInWithCustomToken` -> Đăng nhập thành công và đọc cấu trúc `licenses` để mở khóa Tool tương ứng.

## 5. Cấu trúc Database (Firestore)
Nguyên tắc: Database là Chân lý duy nhất. Không dùng File mảng tĩnh (Static Arrays) ở Frontend.
- **Collection `products`:** Danh sách Tool, Khóa học, Combo (Có trường `category` để lọc).
- **Collection `users`:** Thông tin khách (`email`, `currentTier`, `tierExpiresAt`).
  - **Subcollection `licenses`:** Giấy phép mua lẻ của từng Tool. Có trường `status` và `expiresAt`. App Desktop ĐỌC bảng này để khóa Tool nếu hết hạn.
- **Collection `orders`:** Lưu lịch sử giao dịch (Hóa đơn).
