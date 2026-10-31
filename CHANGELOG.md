# Changelog

## v1.2.0 — Flexible Editing & Autosave · 31/10/2026

- Tự lưu nháp sau khoảng 1,2 giây ngừng nhập; gom yêu cầu và giữ nội dung gõ thêm trong lúc request trước đang chạy.
- Cập nhật inline editor ngay khi nhập, giữ con trỏ khi autosave; chờ kết thúc gõ tổ hợp IME trước khi lưu.
- Trạng thái lưu phân biệt online/offline/lỗi/xung đột; không tự publish; xung đột khóa tự lưu thay vì ghi đè.
- Giữ bản nháp chưa lưu cục bộ theo project và user, cho chọn khôi phục; dừng lưu khi bản khôi phục dựa trên version cloud cũ.
- Thêm Bố cục CV: sắp xếp trong từng khối/cột, ẩn/hiện các phần, tự đánh lại số thứ tự trên CV; sắp xếp từng mục lặp qua kéo chuột/cảm ứng hoặc nút lên/xuống.
- Hoàn tác/làm lại tối đa 50 mốc trong phiên; preview Desktop/Mobile 390 px.
- Thay font tiêu đề bằng Noto Serif tự phục vụ, đúng bộ Latin/Latin mở rộng/Vietnamese; đóng gói normal/italic cùng OFL. Chuẩn hóa NFC, giữ nguyên khoảng trắng giữa các từ.
- Ẩn mục không xóa nháp; hàm publish gỡ nội dung ẩn khỏi snapshot công khai trong transaction.
- Migration `202610310002_flexible_editor.sql` nâng cấp hàm, không reset/seed dữ liệu hoặc đổi owner; API kiểm tra migration trước khi cho chỉnh sửa.
- Giữ hai biến Supabase trên Vercel; không thêm secret vào source.

### Nâng cấp

Project đã v1.1.0 chỉ chạy migration 002 rồi deploy source mới; project mới chạy 001 → 002 → setup-owner. Xem `UPGRADE-v1.2.0.md`. Tải lại các tab quản trị cũ. Bản công khai tiếp tục giữ nguyên đến khi Boss xuất bản lại.

## v1.1.0 — Online Editor & Cloud Save · 31/10/2026

- Giữ thiết kế Maison Espresso; bổ sung CV Studio cho desktop và mobile.
- Đăng nhập chủ sở hữu bằng Supabase Auth, hiện/ẩn mật khẩu, đăng xuất và khôi phục PKCE qua email.
- Gõ trực tiếp họ tên, chức danh, giới thiệu, mục tiêu; chọn các phần để mở form chỉnh sửa.
- Thêm/sửa/xóa học vấn, kỹ năng, chứng chỉ, kinh nghiệm, đơn vị triển khai và sản phẩm nổi bật.
- Supabase Database: nháp, bản công khai và quyền owner tách riêng; lưu có version và phát hiện xung đột.
- Private Storage: upload ảnh có kiểm tra loại file/kích thước; chỉ công khai ảnh đang được bản xuất bản sử dụng.
- Xem trước, lưu nháp thủ công, kiểm tra nội dung rồi xác nhận xuất bản. Khách không nhìn thấy nháp mới.
- Cảnh báo rời trang còn thay đổi; tải bản đang soạn để đối chiếu khi xung đột.
- CV công khai đọc snapshot động, cập nhật nội dung không cần redeploy.
- Bỏ PDF preview tĩnh và script tạo PDF từ JSON cũ; thêm `/print` lấy dữ liệu hiện hành.
- Nút **Mở Portfolio** ở cuối CV giữ `/portfolio`, trang chờ có liên kết quay lại CV.
- Dùng Webpack cho dev/build để tránh lỗi Turbopack nội bộ phát hiện trong kiểm tra.
- Khóa dependency thật bằng package-lock.json; Node.js 24.x; thêm migration, hướng dẫn owner, README và bộ kiểm tra UI/RLS.
- Khi chưa cấu hình hoặc chưa xuất bản, website hiện trang chờ thay vì tự công khai dữ liệu JSON nền.

### Tác động nâng cấp

- v1.0.0 đọc `src/data/profile.json`; v1.1.0 dùng file này để khởi tạo editor khi database chưa có CV. Dữ liệu live lấy từ Supabase sau khi lưu.
- Thiết lập project Supabase, migration, owner và hai biến môi trường một lần. Không reset dữ liệu mỗi lần deploy.
- Node.js tăng từ mức nền 20.9 lên 24.x để đồng bộ dependency thực tế và môi trường Vercel đã chọn.
- Chưa bổ sung autosave, sắp xếp kéo thả, lịch sử khôi phục, nhập JSON, PDF tạo tự động hay Portfolio đầy đủ.

## v1.0.0 — Maison Espresso Source

Nền Next.js/TypeScript, CV đọc JSON, bản preview offline, Portfolio chờ và PDF preview tĩnh.
