# Kiểm chứng Maison CV v1.6.0 — Bilingual CV

31/10/2026. Source nền: ZIP v1.5.0 Boss đính kèm; SHA-256 `423fe6e172ea095dc9e5af4300e0c7ec093676dc1d421566aeee2542b1f4ef66`. Node 24.22.1, Next 16.4.3 Webpack, React 19.3.1. Giữ dependencies và các font gốc; package/lock/backup/footer cùng v1.6.0.

| Hạng mục | Kiểm chứng |
| --- | --- |
| `npm test` | **132 PASS, 0 FAIL**: 60 Node (gồm PGlite subtest) + 72 Vitest. Test PDF với font gốc và editor sau chỉnh sửa cuối cũng PASS. |
| Unit / integration | PostgreSQL PGlite chạy migration 001→006, chạy lại 006; dữ liệu/owner/baseline cũ giữ nguyên; capability 6. VI publication loại translations; EN draft/logo không công khai; publish EN giữ VI, publish VI giữ EN; Tất cả cập nhật cùng transaction, EN lỗi rollback cả VI; private preferences/owner-only history delete; delete giữ nháp/public. |
| Bilingual data | Tạo bộ EN độc lập, giữ ID; sửa VI/EN không ghi đè; thiếu nội dung EN bị chặn trước publish; backup/diff có cả hai bộ; schema tương lai bị chặn; ngày/tháng/Present đúng EN. |
| Public / API | Không fallback EN chưa publish sang nháp/VI; switch chỉ có khi cả hai publication tồn tại; PDF/QR/print/canonical theo ngôn ngữ. Favicon dùng API branding với fallback asset nội bộ, tránh icon.svg file-based ghi đè. |
| Editor UI | Đổi VI/EN giữ nội dung chưa lưu; Auto Save tắt ngừng timer, Save thủ công hoạt động; double click, bấm ngoài, ✓, Escape; đúng field bên phải; bottom ＋ thêm item; kéo đổi chỗ và reduced motion; giữ grid/Maison, thời gian, undo/recovery/CAS. |
| History UI / API | Xóa một có xác nhận; Xóa tất cả bắt buộc DELETE; không gọi apply/recovery hoặc publish khi xóa. Kiểm tra quyền và UUID ở API, RPC kiểm tra owner. |
| PDF thật | VI thường 2 trang, VI dài 8 trang, EN đủ nhóm 2 trang, grid-data 2 trang. A4, logo bên trái mã/tên, QR/link EN, tiêu đề/thời gian EN. Xem PNG và trích xuất text kiểm tra đầy đủ tiêu đề và không có control glyph. |
| PDF font isolation | Phát hiện và sửa lỗi reuse fontkit giữa nhiều PDF gây mất glyph EN. Hàng đợi render và nạp font mới mỗi document; test nhiều bản và lời gọi đồng thời. Không thay đổi file TTF gốc. |
| Browser | Chrome xem HTML thực từ renderer/component: CV EN, switch, nhãn/date, tên tiếng Việt có dấu, settings/toolbar/branding controls. HTML fixture không phải session cloud thật. Các thao tác được kiểm tra bằng UI tests; không coi snapshot HTML là nghiệm thu lưu cloud. |
| TypeScript / build | Typecheck và Next production build; generated route types được kiểm tra trong build. Admin dynamic để logo mới xuất hiện sau Lưu cài đặt, không chờ redeploy. |
| Content / preview | Content check cấu trúc; dữ liệu nền vẫn draft/placeholder, không thay dữ liệu cloud thật. Preview HTML/CSS tạo lại, footer 1.6.0; không chứa tài khoản/secret hoặc trang QA. |

Log đầy đủ và kết quả cuối: `TEST-RESULTS.txt`. Auth/Storage/đăng nhập trong UI/API được mock; PGlite dùng schema Auth/Storage tối thiểu để kiểm tra quyền và RPC. Chưa có kết nối Supabase/Vercel/repository thật của Boss nên chưa chạy migration production, push hoặc deploy, kiểm tra email Auth, thiết bị vật lý, QR scan/Web Share trên điện thoại.

PDF tiếp tục mẫu A4 một cột, giữ thứ tự/tiêu đề của public theo ngôn ngữ. Lưới nhiều cột dùng trên web/in trình duyệt. EN cần Boss điền nội dung dịch từ hồ sơ thật; không tự dịch dữ liệu cloud chưa cung cấp. Thực hiện checklist `UPGRADE-v1.6.0.md` sau deploy. Bước tiếp theo là v1.7 App Showcase.
