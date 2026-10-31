# Changelog

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
