# Original User Request

## Initial Request — 2026-06-26T03:56:16Z

Xây dựng tính năng Slash Command (hiển thị Popup gợi ý chèn link nội bộ khi gõ phím `/`) cho các ô nhập liệu Hướng dẫn sử dụng và FAQ trong trang Admin.

Working directory: E:\Youtube\Ban Content\Web
Integrity mode: development

## Requirements

### R1. Triển khai Popup Gợi Ý Link
Thêm một dropdown menu nổi (absolute/relative) xuất hiện ngay bên dưới ô `input` của phần "Cách sử dụng" (`howToUse`) và "Câu hỏi thường gặp" (`faq`) trong file `app/admin/products/page.tsx`. Menu này chỉ hiện ra khi người dùng gõ ký tự `/`.

### R2. Danh sách Link Nội Bộ
Menu cần cung cấp các lựa chọn liên kết chuẩn Markdown, tối thiểu bao gồm:
- Trang Download: `[Trang Download](/download)`
- Trang Khóa học: `[Khóa Học](/courses)`
- Trang Đăng nhập: `[Đăng Nhập](/login)`
- Khám phá Hub: `[Khám Phá Hub](/hub)`

### R3. Xử lý Logic Auto-complete
Khi người dùng click vào một lựa chọn trong Menu:
1. Chuỗi ký tự từ dấu `/` cuối cùng sẽ bị xóa và thay thế bằng chuỗi Markdown đã chọn.
2. Menu gợi ý phải đóng lại ngay lập tức.
3. Menu cũng phải tự đóng nếu người dùng xóa dấu `/` hoặc click ra ngoài vùng nhập liệu (onBlur).

## Acceptance Criteria

### Giao diện và Tương tác (UI/UX)
- [ ] Gõ `/` vào ô input (Cách sử dụng hoặc FAQ), menu gợi ý sẽ xuất hiện ngay lập tức bên dưới ô input đó.
- [ ] Menu có thiết kế đồng nhất với Dark Mode của hệ thống (nền tối, viền mờ).
- [ ] Click vào 1 mục trong menu, nội dung input tự động cập nhật đúng cú pháp `[Tên](/link)`.
- [ ] Click ra ngoài hoặc xóa dấu `/`, menu biến mất.

### Kỹ thuật và Build (Technical)
- [ ] Không gây lỗi Strict Mode TypeScript khi kiểm tra bằng lệnh `npx tsc --noEmit`.
- [ ] Quản lý state gọn gàng, không làm re-render toàn bộ list inputs gây giật lag.
