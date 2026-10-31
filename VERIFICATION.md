# Kiểm chứng Maison CV v1.2.0

Ngày: 31/10/2026. Nền nâng cấp: source v1.1.0 đã bàn giao trong cuộc trò chuyện. Runtime kiểm tra Node.js 24.22.1, Next.js 16.4.3 / Webpack; dependency nền được giữ nguyên, bổ sung Fontsource Noto Serif 5.3.0 để lấy asset font.

## Đã xác minh

| Hạng mục | Kết quả |
| --- | --- |
| Cài dependency và package-lock.json | PASS; version app và lockfile cùng 1.2.0, dependency khớp; không có env thật trong ZIP |
| `npm test` | PASS: 27 kiểm tra Node/renderer/validation/Postgres, gồm subtest; 18 kiểm tra React/editor/autosave. Tổng 45 |
| `npm run typecheck` | PASS |
| `npm run check` | PASS cấu trúc dữ liệu nền; 17 mục PENDING là placeholder của source cũ, không phải dữ liệu Supabase của Boss |
| `npm run build` | PASS build production bằng Webpack |
| Migration | Chạy 001, chạy 002 và lặp lại 002 trên Postgres nhúng PGlite; giữ RLS/owner, CAS, ảnh private, snapshot tách riêng; metadata layout được giữ; nội dung bị ẩn chỉ gỡ ở public snapshot, không gỡ khỏi nháp |
| Autosave | Debounce; không gọi publish; vẫn giữ chữ gõ khi request trước đang chạy; lượt kế tiếp dùng version mới; tạm dừng trong IME; offline/online và cache theo owner |
| Xung đột/khôi phục | Không tự ghi đè; giữ bản cục bộ; bản khôi phục có base version cũ tiếp tục bị chặn cả sau khi mở lại, không tự đổi base version để vượt kiểm tra |
| Editor | Inline, form, thêm/xóa/sắp xếp mục bằng nút, ẩn/hiện, đổi thứ tự cột, hoàn tác/làm lại, preview mobile, đăng nhập lỗi/đăng xuất phạm vi local |
| Font | Kiểm tra file WOFF2, Unicode ranges Vietnamese/Latin/Latin mở rộng, giấy phép kèm; chuẩn hóa NFC; font được phục vụ từ public/fonts, không dùng Google Fonts runtime |
| Browser QA | Xem bản render component với dữ liệu kiểm thử trên desktop và khung mobile 390px; kiểm tra các cụm “Hồ sơ của bạn”, “Chăm chút từng chi tiết”, “Chưa xuất bản” đã liền dấu. Không lưu các trang/screenshot QA vào ZIP |
| Offline preview | Tạo lại từ renderer/CSS hiện hành; đường dẫn font tương đối và MIME font/woff2 đã kiểm tra |

Log ở `TEST-RESULTS.txt`; quá trình build cũng chạy TypeScript. Browser QA dùng DOM từ component test, không phải xác nhận kết nối Supabase thật.

## Giới hạn xác minh và trạng thái triển khai

- Lần này chưa có URL/key/owner của Supabase thật hoặc repository/Vercel đích để thực hiện nghiệm thu cloud, push hay deploy bản v1.2.0.
- Auth/API trong React test được mock; PGlite dùng schema Auth/Storage tối thiểu, không thay thế service Supabase thật.
- Chưa kiểm tra kéo bằng cảm ứng trên thiết bị vật lý, Windows/iPhone/Safari thật, SMTP khôi phục hoặc PDF với CV cá nhân đầy đủ. Các nút lên/xuống là cách sắp xếp thay thế dùng được bằng bàn phím.
- Chưa chạy `check:release` trên project thật. Sau khi chạy migration 002 và deploy, cần kiểm tra autosave, hai thiết bị cùng sửa, quyền đọc nháp, xuất bản, upload và in theo `UPGRADE-v1.2.0.md`.
- Giữ nguyên dữ liệu/owner/ảnh và hai biến Vercel hiện tại; không reset DB. Mục đã ẩn chỉ biến mất khỏi bản công khai sau khi xuất bản lại.

Bản này có hoàn tác tạm trong phiên và khôi phục cục bộ, chưa có lịch sử phiên bản trên cloud của v1.3.0.
