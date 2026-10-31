# Kiểm chứng Maison CV v1.4.0

Ngày 31/10/2026 (Asia/Bangkok). Nâng cấp trực tiếp ZIP v1.3.0 Boss cung cấp: SHA-256 `b388a5f42e9cfb0e32e25ceccd31327e4cc2059978791c35e6c07fa0ef32fb07`. Node.js 24.22.1, Next.js 16.4.3 / Webpack, React 19.3.1. Không đổi stack hoặc dữ liệu cá nhân từ nguồn khác.

## Kết quả

| Hạng mục | Kết quả |
| --- | --- |
| Dependency / lockfile | PASS; package/lock 1.4.0; PDF 4.3.1, layout 4.4.3/render 4.3.1 overrides; pdf-lib 1.17.1, QR 1.5.4, sharp 0.35.5 |
| `npm test` | PASS 47 kiểm tra Node gồm subtest + 48 Vitest = 95, không fail |
| `npm run test:cloud` sau khi hoàn thiện 004 | PASS; kiểm tra thêm save/restore/publish giữ code, schema 3 và capability 4 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS production Webpack/TypeScript, BUILD_ID và tracing các endpoint được tạo |
| Server bundle fonts | PASS: NFT của PDF/OG có đủ ba TTF; external packages được khai báo cho Node.js |
| `npm run check` | PASS cấu trúc nền; 17 PENDING là placeholder cũ, không phải nội dung cloud |
| Migration 004 | Chạy 001→002→003→004 trên PGlite; rerun 004; nháp hiện có giữ nguyên trước lần ghi mới; owner vẫn có capability 4, người khác 0/khách không được execute. Lưu/restore/publish mới dùng schema 3 và giữ Mã đơn vị |
| Mã đơn vị | Test trường mã/tên độc lập, lưu cloud mock, render hai dòng, legacy mã rỗng, NFC, giới hạn 80 ký tự, escape HTML; JSON và diff/history giữ code |
| PDF API | Attachment/tên file/version/no-store, đọc publication, đổi nội dung ở cùng version đổi cache key, unpublished không render, lỗi/tệp quá lớn trả thông báo phù hợp |
| PDF engine thật | Render fixture 2 trang và fixture dài 8 trang; tự ngắt A4; file khoảng 48/64 KB. PDF font nhúng, trích xuất đúng tiếng Việt, đủ 10 mốc cuối các công việc, không có chuỗi ở phần ẩn |
| PDF visual QA | Render PNG tất cả 2/8 trang; xem từng trang ngắn và contact sheet dài. Tiêu đề không đứng riêng cuối trang, footer đánh số đúng; pdfplumber kiểm tra toàn bộ word bounding boxes nằm trong trang, không có chữ tràn |
| Social image thật | ImageResponse tạo PNG 1200×630 có tên/chức danh/giới thiệu tiếng Việt; xem ảnh render; chưa publish trả 404 |
| QR | Tạo PNG thật 480×480, metadata kích thước đúng, helper URL loại path/query/hash và credentials; chưa có URL không tạo QR. Chưa quét bằng điện thoại thật |
| Chia sẻ UI | Copy/Web Share đúng URL public, thiếu URL dùng origin copy dự phòng; PDF lỗi không báo thành công, nút thử lại; QR có alt/download, trạng thái aria-live |
| Browser QA | Chrome xem component DOM từ test: chia sẻ ở iframe 390×844; editor desktop mở thẻ EPU và trường mã/tên. Kiểm tra responsive một cột cho vùng triển khai hẹp, hai dòng mã/tên rõ ràng. Trang/screenshot QA không đưa vào ZIP |
| Hành vi nền | Các kiểm tra autosave, local recovery, CAS, history/import/restore, private/public và Storage RLS của v1.3 tiếp tục đạt |
| Preview offline | Tạo lại renderer/CSS/footer v1.4.0; không có Auth/PDF cloud trong preview offline |

Log lệnh ở `TEST-RESULTS.txt`. Dependency PDF được khóa theo bộ đã kiểm tra vì phiên bản dàn trang mới đã bộc lộ lỗi footer/orphan heading trong QA; không bỏ overrides hoặc nâng đồng loạt mà chưa chạy lại kiểm tra PDF.

## Giới hạn xác minh

- Chưa có URL/key/project owner Supabase thật, repository hoặc Vercel đích cho lần nâng cấp này. Chưa push GitHub, deploy, chạy migration hoặc đo cold start trên tài khoản thật của Boss.
- React/API test dùng mock Auth/Storage/publication; PGlite dùng schema Auth/Storage tối thiểu. Test engine PDF/OG/QR là thực, nhưng dữ liệu là fixture kiểm thử.
- Browser QA xác minh bố cục component; chưa nghiệm thu luồng tải file trên iPhone, Web Share thực, quét QR từ thiết bị thứ hai hoặc preview Zalo/Facebook thật. Cache preview ngoài app phụ thuộc nền tảng.
- PDF là mẫu A4 sáng một cột, nội dung tương ứng public, không sao chép pixel giao diện web. Chưa có gắn thẻ PDF/UA đầy đủ, tùy chọn nhiều template PDF hoặc mật khẩu.
- Ảnh responsive được xử lý sau Storage RLS; chưa có tài khoản cloud thật để thử tải ảnh qua Function đã deploy. Các policy cũ đã có test PGlite.
- PDF tự động chỉ xuất bản công khai; In bản nháp vẫn dùng trình duyệt. Nội dung dài hơn fixture cần Boss kiểm tra với hồ sơ thật sau deploy theo UPGRADE-v1.4.0.md.

Giữ hai biến Supabase hiện tại, không thêm secret vào source. Portfolio vẫn là trang chờ; phiên bản kế tiếp là v2.0.0 theo ROADMAP.md.
