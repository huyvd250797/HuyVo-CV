# Kiểm chứng Maison CV v1.5.0 — Visual Layout Studio

31/10/2026, Asia/Bangkok. Nền là ZIP v1.4.0 Boss gửi, SHA-256 `ebc84c1d6890ceaf5e2b1a3852f8ac580b2155ab7b8e9273eb85b967bcbf79b4`. Node.js 24.22.1, Next.js 16.4.3 / Webpack, React 19.3.1. Dependency giữ nguyên, package/lock nâng cùng 1.5.0.

| Hạng mục | Kết quả |
| --- | --- |
| `npm test` | PASS 54 kiểm tra Node gồm subtest + 55 Vitest = **109**, không fail |
| `npm run typecheck` | PASS |
| `npm run build` | PASS production, TypeScript và các route nền PDF/history/sharing giữ đầy đủ |
| Migration 005 | PASS PGlite: sau 001→002→003→004, rerun không rewrite document/history, capability 5 đúng owner; save schema 4; publish giữ grid/titles và gỡ tiêu đề của block ẩn khỏi public, revision giữ đầy đủ |
| Layout normalization | PASS 8 block đúng một lần, span 1–12, NFC/titles/unknown key, legacy Maison, cấu hình độc lập, cross vùng không trùng/mất |
| Renderer | PASS grid theo DOM đúng thứ tự 6/6/12, escape tiêu đề, không có action khi public hoặc chưa chọn, chỉ block active có thao tác |
| Editor UI | PASS chọn/ẩn thao tác, ＋ thêm cuối và focus ô mới, mock vị trí cuộn kiểm tra không về đầu, rename/menu/undo, grid/span/nav/save, toggle mode, sort thời gian và pointer drag/cancel |
| Chronology | PASS năm, range, ngày/tháng/ISO, tháng Anh/Việt, hiện tại; ngày sai không đoán; tăng/giảm ổn định, mục thiếu cuối, không mutate nguồn |
| JSON/history/privacy | PASS roundtrip schema 4, layout 2 chế độ/width/title/period; schema cũ đọc được; diff phát hiện thay đổi; public bỏ tiêu đề ẩn, nháp giữ nguyên |
| Hành vi nền | Các test autosave, CAS, local recovery, history/import/restore, Storage RLS, PDF/QR/OG đều tiếp tục đạt |
| Browser desktop | Chrome xem renderer thật với fixture: Học vấn 6 cạnh công việc 6; triển khai 12 toàn hàng; title tùy chỉnh đúng, các block sau xuống hàng |
| Browser mobile | Iframe 390×844; grid một cột, triển khai/timeline và chữ không tràn ngang sau sửa cấu hình track mobile. Browser QA dùng HTML render từ component/renderer, không phải kết nối Supabase thật |
| PDF | Render thật normal 2 trang, long 8 trang và grid-data 2 trang. pdfplumber kiểm tra A4, đủ text/mốc cuối, footer và bounding boxes; grid PDF đúng thứ tự/tiêu đề và không có chứng chỉ bị ẩn. Xem render PNG mẫu grid |
| Font / assets | Giữ WOFF2 tiếng Việt, TTF và OFL cho PDF; tracing fonts giữ cấu hình v1.4 |
| Preview | Tạo lại HTML/CSS từ source hiện hành, footer 1.5.0. Không đóng gói trang QA/temp hoặc env thật |

Log: TEST-RESULTS.txt. Test UI/API mock Auth/Storage/publication; PGlite có Auth/Storage schema tối thiểu. Pointer drag được xác minh bằng event/DOM trong test, chưa kiểm thử thao tác kéo cảm ứng trên iPhone thật. Browser QA xác minh bố cục renderer và HTML component; không coi là nghiệm thu cloud.

Chưa có project Supabase, repository hoặc Vercel đích trong lần nâng cấp này; chưa push/deploy, chạy migration trên database thật, thử nhiều thiết bị/QR/Web Share vật lý hoặc đo tốc độ trên production. PDF tự động vẫn là A4 một cột, giữ nội dung/thứ tự/title; grid nhiều cột áp dụng cho web và in trình duyệt. Tùy chọn span rất hẹp có thể xuống nhiều dòng; đề xuất 6/12 hoặc 12/12 cho block dài.

Sau deploy cần làm bảng nghiệm thu UPGRADE-v1.5.0.md. Không reset database hoặc thêm env; chưa triển khai Portfolio đầy đủ (v2.0.0).
