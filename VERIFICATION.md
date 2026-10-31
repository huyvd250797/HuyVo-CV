# Kiểm chứng Maison CV v1.1.0

Ngày: 31/10/2026. Môi trường Node.js 24.22.1 / npm 11.9.0. Source nâng từ ZIP v1.0.0 do Boss cung cấp.

## Đã chạy

| Kiểm tra | Kết quả / phạm vi |
| --- | --- |
| `npm ci` với lockfile thật | PASS, cài lại dependency thành công |
| `npm test` | PASS: 20 kiểm tra Node/Postgres, gồm các subtest RLS; 8 kiểm tra React UI. Tổng 28 |
| `npm run typecheck` | PASS |
| `npm run check` | PASS cấu trúc JSON nền; 17 thông tin nền còn thiếu/placeholder được báo PENDING theo dữ liệu đầu vào |
| `npm run build` | PASS production Next.js 16.4.3 / Webpack, gồm các route CV/admin/API/print/Portfolio/Auth callback |
| Renderer | Kiểm tra escape HTML, chặn URL nguy hiểm, không xuất hooks chỉnh sửa ra CV công khai, nút Portfolio cuối CV và link print hiện hành |
| PostgreSQL/PGlite | Chạy migration hai lần; không cấp owner cho user đăng nhập đầu; owner lưu nháp; version cũ bị chặn; khách không đọc nháp; tài khoản khác không sửa; snapshot tách khỏi nháp; ảnh nháp private; chỉ ảnh được publication hiện hành tham chiếu đọc công khai |
| React UI/jsdom | Mock ranh giới Auth/API: chỉnh form, inline editing, lưu, xác nhận publish, nạp lại phiên, xử lý conflict không mất nội dung, thêm/xóa mục, preview chỉ đọc và thông báo đăng nhập lỗi và đăng xuất riêng thiết bị |
| Browser QA | Trang công khai chờ và hướng dẫn cấu hình `/admin`; kiểm tra hình thức editor desktop và khung 390 px từ DOM của component test. Bản render QA dùng dữ liệu giả và được loại khỏi ZIP |

Log test đầy đủ ở `TEST-RESULTS.txt`.

## Chưa xác minh trên tài khoản thật

- Chưa có URL/key Supabase và owner của Boss để kiểm tra Auth/Storage/PostgREST production thực tế.
- Auth/API trong component test được mock. PGlite dùng schema Auth/Storage tối thiểu, không thay cho Supabase Auth/Storage service.
- Chưa chạy browser E2E đăng nhập/lưu/upload/publish trên Supabase thật hoặc trên hai thiết bị vật lý.
- Chưa kiểm tra email SMTP/khôi phục thực, PDF với nội dung cá nhân hoàn chỉnh, Safari/iPhone thật hoặc các giới hạn tài khoản hosting.
- Chưa chạy `check:release` vì cần project đã cấu hình và có bản xuất bản thật.
- Chưa push GitHub, chưa deploy Vercel production, chưa kết nối tự deploy vào repository của Boss.

Build thành công và test giả lập không có nghĩa database hoặc deployment cá nhân đã được cấu hình. README cung cấp các bước thiết lập một lần và danh sách nghiệm thu thực tế. Không có secret/tài khoản thật trong source.

## Tương thích build

Một lần build lại bằng Turbopack gặp lỗi panic nội bộ. Lệnh build cuối dùng `next build --webpack`, bỏ cache build cũ và kiểm tra lại. Dev cũng dùng Webpack. Không thay đổi cơ chế lưu dữ liệu hay quyền truy cập để xử lý lỗi này.
