# Kiểm chứng Maison CV v1.3.0 — History & Recovery

Ngày: 31/10/2026. Nền nâng cấp: ZIP v1.2.0 Boss cung cấp (`Maison-CV_v1.2.0(1).zip`), SHA-256 `27032e5064c11df9bf132825563f89525853d629451b2043a3d6c212e320ccef`. Runtime Node.js 24.22.1, Next.js 16.4.3 / Webpack. Dependency giữ nguyên; package và lockfile nâng cùng 1.3.0.

## Kết quả

| Hạng mục | Kết quả |
| --- | --- |
| Cài dependency | PASS `npm ci`; lockfile đồng bộ; không cần thêm dependency hoặc biến môi trường |
| `npm test` | PASS 41 kiểm tra Node gồm subtest + 34 kiểm tra Vitest = 75; 0 fail |
| `npm run typecheck` | PASS |
| `npm run check` | PASS cấu trúc JSON nền; 17 PENDING là placeholder vốn có, không phải dữ liệu Supabase đang dùng |
| `npm run build` | PASS production build Webpack, TypeScript và tạo các route lịch sử/import |
| Migration 003 | Chạy sau 001/002 trên PGlite; baseline nháp/public một lần; chạy lại không nhân đôi hoặc dựng baseline sau lần nâng cấp đầu; capability 3 |
| Lịch sử / quyền | Owner đọc, khách và user khác không đọc; trình duyệt không được INSERT/UPDATE/DELETE revision trực tiếp; RPC chặn user không phải owner |
| Checkpoint/publish | Mốc thủ công giữ đầy đủ nháp và không đổi version; publish giữ nội dung ẩn trong revision riêng tư, public vẫn bị loại phần ẩn; dedup mốc publish cùng version |
| Khôi phục/import | Giữ trước/sau trong transaction; version nháp tăng, public không đổi; conflict/đầu vào lỗi không thêm mốc hoặc ghi đè |
| Storage | Ảnh được revision tham chiếu không xóa được bằng quyền owner thông thường; file không tham chiếu vẫn xóa được; anonymous chỉ đọc ảnh public hiện hành |
| JSON / so sánh | Roundtrip nội dung/layout, không xuất credential; từ chối file lỗi/tương lai/quá byte/link không an toàn; NFC và hidden set không tạo khác biệt giả; thứ tự có thay đổi được phát hiện |
| API | Test route thật với owner/Storage được mock: preview trước apply, fingerprint, ảnh khác owner/ảnh biến mất, pagination metadata-only/cursor, label và restore 409/404 |
| UI | Tạo mốc, xem/so sánh, chặn khi dirty, xác nhận restore/import, lỗi JSON không gọi API, conflict giữ nội dung; Editor nhận version mới sau restore mà không tự PUT/publish |
| Browser QA | Xem DOM render từ component test bằng Chrome ở desktop và iframe mobile 390×844; kiểm tra cuộn đến phần so sánh/nút khôi phục, dấu tiếng Việt và không tràn ngang. Trang QA tạm đã bỏ khỏi source bàn giao |
| Font / preview | Giữ 6 WOFF2 Noto Serif và giấy phép OFL; tạo lại preview offline từ renderer/CSS v1.3, footer đúng version |

Log lệnh ở `TEST-RESULTS.txt`. Bộ 75 kiểm tra tính cả kiểm tra nền v1.2 để giữ hành vi autosave, khôi phục cục bộ, layout, private/public và renderer. Dữ liệu kiểm thử không ghi vào tài khoản của Boss.

## Phạm vi chưa xác minh

- Chưa có project Supabase thật, repository GitHub hoặc Vercel đích trong yêu cầu lần này; chưa chạy migration trên database thật, chưa push hoặc deploy production.
- PGlite dùng Auth/Storage schema tối thiểu. Test API/React mock Auth và Storage, không thay thế nghiệm thu Supabase thật. Browser QA xác minh bố cục render bằng dữ liệu kiểm thử, không xác nhận hoạt động cloud.
- Chưa kiểm tra SMTP khôi phục, iPhone/Safari và cảm ứng trên thiết bị vật lý, PDF với hồ sơ thật hoặc tải file JSON qua các trình duyệt thật.
- Chưa chạy `check:release` và smoke test trên deployment thật. Làm bảng nghiệm thu trong `UPGRADE-v1.3.0.md` sau migration/deploy.
- Lịch sử chỉ có mốc được giữ kể từ nâng cấp, cùng baseline còn tồn tại lúc nâng cấp; không thể phục dựng các lần lưu cũ đã bị ghi đè. Chưa có UI dọn/xóa lịch sử.

Giữ nguyên owner/database/ảnh/env. Source không chứa secret thật; `.env.example` chỉ có placeholder. PDF tự động và Portfolio đầy đủ vẫn thuộc các phiên bản kế tiếp trong ROADMAP.md.
