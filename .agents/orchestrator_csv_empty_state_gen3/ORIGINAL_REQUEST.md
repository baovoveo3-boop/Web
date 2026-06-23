# Original User Request

## Follow-up — 2026-06-22T10:10:38Z

Xây dựng cụm tính năng quản lý nâng cao: Bao gồm hệ thống Xuất Báo Cáo (Export CSV) phục vụ việc kinh doanh trên Admin Dashboard, và khôi phục hiệu ứng "Sắp ra mắt" (Empty State) cho Trang chủ khi chưa có dữ liệu sản phẩm.

Working directory: E:\Youtube\Ban Content\Web
Integrity mode: benchmark

## Requirements

### R1. Tính năng Xuất Báo Cáo (Export CSV) cho Quản lý
Thêm chức năng xuất báo cáo dưới dạng file CSV (sử dụng thư viện `papaparse`) tại Admin Dashboard. Hệ thống báo cáo cần hỗ trợ bộ lọc tuỳ chỉnh (lọc theo ngày/tháng/năm, khoảng thời gian từ ngày đến ngày, theo sản phẩm, theo tài khoản) và bao gồm các loại dữ liệu sau:
- Báo cáo doanh thu hàng tháng.
- Báo cáo doanh thu theo từng sản phẩm.
- Top tài khoản chi tiêu mua hàng nhiều nhất.
- Top tài khoản sử dụng tài nguyên miễn phí nhiều nhất.
- Bảng xếp hạng các Tool/Khóa học được sử dụng nhiều nhất.

### R2. Trạng thái "Sắp ra mắt" (Empty State) trên Trang chủ
Khi dữ liệu Firebase trả về danh sách Khóa học (Courses) hoặc Công cụ (Tools) trống rỗng, trang chủ (`app/page.tsx`) không được phép bị lỗi hiển thị hay để trống. Thay vào đó, hệ thống phải tự động fallback về hiển thị các thẻ (cards) "Sắp ra mắt".
**Lưu ý quan trọng**: Các thẻ "Sắp ra mắt" này phải được phục dựng lại ĐÚNG HỆT như đoạn code cứng (hardcode) thiết kế ban đầu của dự án, bao gồm đầy đủ các hiệu ứng ánh sáng (glow, animation lấp lánh) và cấu hình giao diện.

## Acceptance Criteria

### Hệ thống Báo Cáo (Export)
- [ ] Giao diện Admin có Modal/Nút chức năng rõ ràng để người dùng chọn Bộ lọc (Thời gian, Loại báo cáo) và nhấn "Xuất CSV".
- [ ] File CSV tải xuống có cấu trúc cột rõ ràng, hiển thị đúng dữ liệu Doanh thu, Sản phẩm bán chạy và Xếp hạng Users. Tiếng Việt hiển thị tốt khi mở bằng Excel (hỗ trợ BOM/UTF-8).
- [ ] Bộ lọc mốc thời gian hoạt động chính xác khi query dữ liệu từ Firestore.

### Giao diện Trang chủ (Empty State)
- [ ] Khi xoá sạch dữ liệu thử nghiệm trong Firestore, trang chủ vẫn load thành công.
- [ ] Khối Khóa học và Công cụ hiển thị dải 3-4 hộp "Sắp ra mắt" với thiết kế nguyên bản (có viền lấp lánh, ngôi sao lấp lánh).
- [ ] Không làm phá vỡ cấu trúc Responsive của giao diện hiện tại.

## Follow-up — 2026-06-22T17:59:06+07:00

You are the Project Orchestrator. Read E:\Youtube\Ban Content\Web\.agents\orchestrator_csv_empty_state_gen3\progress.md. Complete Milestone 3 (verification, testing, auditing). Write E:\Youtube\Ban Content\Web\.agents\orchestrator_csv_empty_state_gen3\handoff.md. Send message to parent claiming completion.

## 2026-06-22T11:12:55Z

You are the Project Orchestrator (successor).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\orchestrator_csv_empty_state_gen3
Your identity: teamwork_preview_orchestrator
The workspace directory is: E:\Youtube\Ban Content\Web
The Integrity Mode is: benchmark

The previous instance of the orchestrator crashed. Read progress.md, plan.md, context.md, and BRIEFING.md in your working directory.
Milestones 0, 1, and 2 are complete. Milestone 3 (verification, testing, auditing) is in progress. The active subagent is worker_run_2 (ID: 31941cb1-dbd5-4a90-bb3a-c6e43a5f2937), which is currently running the build and E2E test commands.
Please monitor worker_run_2, collect its results, conduct the forensic audit, write handoff.md, and send a message to your parent Sentinel claiming completion.
