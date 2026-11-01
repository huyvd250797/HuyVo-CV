# Kiểm chứng Maison CV v1.7.0 — App Showcase

Ngày 31/10/2026. Nền nâng cấp là ZIP `v1.6.0 — Bilingual CV.zip` Boss đính kèm, SHA-256 `19f6256efef0e9ad78b11a4e1479ad5fe2c1710a2e965824d856e14d3c3c9a0d`. Source nâng cấp trực tiếp từ ZIP này, giữ chuẩn thiếu bản dịch EN bị chặn xuất bản. Node 24.22.1, Next 16.4.3 Webpack, React 19.3.1; không thêm hoặc nâng dependency.

| Hạng mục | Bằng chứng / phạm vi |
| --- | --- |
| Test tự động | 150 PASS, 0 FAIL: 69 Node tests (gồm subtests Postgres) + 81 Vitest UI/API/PDF. Kết quả chạy cuối trong TEST-RESULTS.txt. |
| Migration 007 | Chạy 001→007 trên Postgres nhúng PGlite; chạy lại 007 giữ nguyên nháp/public cũ/owner; capability 7, schema nội dung 6 khi lưu. Không kết nối project Supabase thật. |
| Snapshot / RLS | Khách không đọc ảnh bìa/gallery nháp hoặc ảnh của app ẩn; đúng media trong publication trở nên công khai; gỡ app khỏi cả publication thu hồi quyền đọc hiện tại; history giữ file khỏi xóa thông thường. |
| Bản dịch / transaction | Mô tả triển khai EN vẫn bắt buộc khi VI có; lỗi nêu rõ EPU/tên đơn vị/trường, nhận diện theo ID dù đổi thứ tự. Thiếu toàn bộ mục EN hoặc thiếu dòng kết quả đều bị chặn. EN lỗi khi publish All không đổi publication nào; publish EN giữ snapshot VI; CAS chặn version cũ. |
| Editor | Nút Sửa mở ngôn ngữ/block/dòng và focus đúng trường, kể cả block đó đang được chọn. Ảnh/link đồng bộ theo ID; alt/mô tả riêng. Bổ sung app từ VI chỉ thêm ID thiếu, không ghi đè mô tả EN. Nổi bật/ẩn, reorder gallery, làm ảnh bìa và xóa ảnh được kiểm tra qua UI. |
| Upload API | Kiểm tra một WebP thật; từ chối file hỏng/chữ ký ảnh giả trước khi gọi Storage. UI nhận lỗi rõ và giữ nháp. Auth/API/Storage của UI/API tests được mock. |
| Trình duyệt thật | Chromium 153 chạy component Editor qua harness React, API/Auth fixture: chọn file → zoom/vị trí → canvas WebP 1280×800 → upload → sửa alt → lưu nháp thủ công. Desktop 1600×1000/mobile 390×844 không lỗi JavaScript hoặc tràn ngang. Không phải đăng nhập Supabase thật. |
| Render web | HTML từ cùng renderer: desktop 1440px, mobile 390px; card/bìa/gallery/caption rõ, mở gallery bằng native details. Đã xem PNG và kiểm tra không tràn ngang. Điều chỉnh tương phản khu hướng dẫn/ảnh trong panel sáng của editor. |
| PDF VI/EN | Render PDF thật với ảnh bìa app và nội dung tóm tắt, trạng thái/nền tảng/link. Xem PNG trang chứa app và trích xuất text; không có app ẩn, tiêu đề/thời gian/đường link theo ngôn ngữ, glyph đầy đủ. Giữ các test PDF dài và cách ly font khi render liên tiếp/đồng thời. Gallery không in toàn bộ; mẫu A4 một cột, không mô tả là đã khớp Grid. |
| JSON / history | Schema cũ được chuẩn hóa về 6; media, ID, flag, caption được giữ qua backup/import; diff hiện đường dẫn và alt, không chỉ [object Object]; media sai owner/không còn file bị loại có cảnh báo khi nhập. |
| Build / nội dung | TypeScript, Next production build, content structure và tạo lại preview đạt. PENDING trong content check là dữ liệu mẫu chưa điền của profile.json, không phải CV cloud bị lỗi. |

Không có secret/tài khoản sản xuất trong ZIP. Không đóng gói node_modules, .next, cache, bản harness, ảnh kiểm thử trình duyệt hoặc file .env.local. Source gồm lockfile, 7 migration, README/CHANGELOG/ROADMAP, UPGRADE-v1.7.0.md và tests.

Chưa push GitHub, deploy Vercel, chạy migration vào Supabase thật, nghiệm thu thiết bị vật lý hoặc link PDF/QR thật của Boss. Checklist nghiệm thu ở UPGRADE-v1.7.0.md. Bản kế tiếp: **v1.8.0 — CV Presentation & PDF**.
