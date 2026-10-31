# Maison CV — Roadmap

Cập nhật 31/10/2026. v1.1.0 đã xây dựng source và kiểm tra trong môi trường phát triển. Chưa kết nối Supabase/Vercel thật của Boss, chưa push GitHub hoặc deploy production.

| Phiên bản | Mục tiêu | Chức năng chính | Kỹ thuật và dữ liệu | Điều kiện hoàn thành | Trạng thái / phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| v1.0.0 — Maison Espresso | Nền CV | CV, JSON nền, Portfolio chờ | Next.js + TypeScript + renderer | Có source làm nền nâng cấp | Đã có source đầu vào |
| **v1.1.0 — Online Editor & Cloud Save** | **Chỉnh sửa, lưu online và công khai đa thiết bị** | Đăng nhập owner, inline editor, danh sách mục, ảnh, nháp, preview, publish, in/PDF qua trình duyệt, nút Portfolio | Auth, Database, Storage private, RLS, optimistic version, API kiểm tra quyền, public snapshot động | Kiểm tra source/UI/RLS/typecheck/build; nghiệm thu trên tài khoản thật sau cấu hình | **Đã xây dựng và kiểm tra source. Cần cấu hình và nghiệm thu cloud thật trước khi dùng production** |
| v1.2.0 — Flexible Editing & Autosave | Chỉnh nhanh, giảm thao tác lưu | Tự lưu nháp, trạng thái lưu, kéo sắp xếp, ẩn/hiện từng phần, hoàn tác trong phiên, preview desktop/mobile | Debounce, thứ tự/visibility, bản khôi phục cục bộ khi mất mạng; giữ chống ghi đè | Autosave không tự publish; di chuyển/ẩn mục không mất dữ liệu; nội dung dài không vỡ mobile | Dự kiến tiếp theo, trên nền v1.1.0 |
| v1.3.0 — History & Recovery | Khôi phục dữ liệu | Lịch sử publish, mốc lưu thủ công, xem/khôi phục, xuất/nhập JSON | Bảng revisions riêng tư, schema version, bảo toàn ảnh được mốc lưu tham chiếu | Khôi phục vào nháp, kiểm tra trước khi publish; import lỗi không ghi đè | Sau v1.2.0 |
| v1.4.0 — PDF & Professional Sharing | Gửi ứng tuyển thuận tiện | Tải PDF tự động, A4/ngắt trang, tên file theo hồ sơ, QR, metadata/ảnh chia sẻ, tối ưu ảnh/accessibility | Kiểm chứng engine PDF trên Vercel, cache theo published version | PDF tiếng Việt có thể chọn chữ, không cắt nội dung, khớp snapshot công khai; kiểm tra thiết bị thật | Sau v1.3.0 |
| v2.0.0 — Portfolio | Giới thiệu năng lực chuyên sâu | Danh sách/chi tiết dự án, ảnh/video, bài toán/vai trò/giải pháp/kết quả, demo/GitHub, quản trị online | Schema dự án, media, nháp/publish, `/portfolio/[slug]` | Nút cuối CV mở Portfolio hoàn chỉnh; dự án cập nhật online | Xây sau CV và sau khi Boss xác nhận nội dung dự án |

## v1.1.0: kiểm tra thực tế sau cấu hình

1. Chạy migration và chỉ định owner; bật Email Auth, tắt public signup.
2. Deploy Next.js trên Vercel với Node.js 24.x và hai biến Supabase.
3. Đăng nhập PC, sửa và lưu nháp; điện thoại đăng nhập thấy đúng nội dung.
4. Khách không đọc được nháp/ảnh nháp, tài khoản khác không có quyền sửa.
5. Preview và publish; khách tải lại thấy đúng snapshot mới mà không phải redeploy.
6. Thử hai thiết bị cùng sửa; phiên lưu sau bị chặn nếu dùng version cũ.
7. Kiểm tra upload ảnh thật, email khôi phục, in/PDF và nút Portfolio.

Không có AI viết CV, nhiều người dùng đăng ký, marketplace mẫu hoặc thanh toán trong phạm vi đã chốt. Phiên bản kế tiếp được đề xuất là **v1.2.0 — Flexible Editing & Autosave**.
