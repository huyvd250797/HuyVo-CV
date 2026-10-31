# Maison CV — Roadmap

Cập nhật 31/10/2026. v1.5.0 đã xây dựng source và kiểm tra trong môi trường phát triển. Chưa kết nối Supabase/Vercel thật của Boss, chưa push GitHub hoặc deploy production.

| Phiên bản | Mục tiêu | Chức năng chính | Kỹ thuật và dữ liệu | Điều kiện hoàn thành | Trạng thái / phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| v1.0.0 — Maison Espresso | Nền CV | CV, JSON nền, Portfolio chờ | Next.js + TypeScript + renderer | Có source làm nền nâng cấp | Đã có source đầu vào |
| **v1.1.0 — Online Editor & Cloud Save** | **Chỉnh sửa, lưu online và công khai đa thiết bị** | Đăng nhập owner, inline editor, danh sách mục, ảnh, nháp, preview, publish, in/PDF qua trình duyệt, nút Portfolio | Auth, Database, Storage private, RLS, optimistic version, API kiểm tra quyền, public snapshot động | Kiểm tra source/UI/RLS/typecheck/build; nghiệm thu trên tài khoản thật sau cấu hình | **Đã xây dựng và kiểm tra source. Cần cấu hình và nghiệm thu cloud thật trước khi dùng production** |
| v1.2.0 — Flexible Editing & Autosave | Chỉnh nhanh, giảm thao tác lưu | Tự lưu nháp, trạng thái lưu, kéo sắp xếp, ẩn/hiện từng phần, hoàn tác trong phiên, preview desktop/mobile | Debounce, thứ tự/visibility, bản khôi phục cục bộ khi mất mạng; giữ chống ghi đè | Autosave không tự publish; di chuyển/ẩn mục không mất dữ liệu; nội dung dài không vỡ mobile | **Đã xây dựng và kiểm tra source; cần migration 002 và nghiệm thu cloud thật** |
| v1.3.0 — History & Recovery | Khôi phục dữ liệu | Lịch sử publish, mốc lưu thủ công, xem/khôi phục, xuất/nhập JSON | Bảng revisions riêng tư, schema version, bảo toàn ảnh được mốc lưu tham chiếu | Khôi phục vào nháp, kiểm tra trước khi publish; import lỗi không ghi đè | **Đã xây dựng và kiểm tra source; cần migration 003 và nghiệm thu cloud thật** |
| v1.4.0 — PDF & Professional Sharing | Gửi ứng tuyển thuận tiện | Tải PDF tự động, A4/ngắt trang, tên file theo hồ sơ, QR, metadata/ảnh chia sẻ, tối ưu ảnh/accessibility | Kiểm chứng engine PDF trên Vercel, cache theo published version | PDF tiếng Việt có thể chọn chữ, không cắt nội dung, khớp snapshot công khai; kiểm tra thiết bị thật | **Đã xây dựng và kiểm tra source; cần migration 004 và nghiệm thu Vercel/Supabase thật** |
| v1.5.0 — Visual Layout Studio | Chỉnh trực tiếp & chủ động bố cục | Kéo block/dòng, thêm tại chỗ, tiêu đề riêng, xếp thời gian, Maison & Lưới linh hoạt 12 phần | Schema nội dung 4, capability 5, migration 005, DOM theo thứ tự; giữ history/undo/CAS | 6+6/12 đúng hàng; thêm không nhảy; phần ẩn không lộ tiêu đề; public chỉ đổi khi publish | **Đã xây dựng và kiểm tra source; cần migration 005 và nghiệm thu cloud thật** |
| v2.0.0 — Portfolio | Giới thiệu năng lực chuyên sâu | Danh sách/chi tiết dự án, ảnh/video, bài toán/vai trò/giải pháp/kết quả, demo/GitHub, quản trị online | Schema dự án, media, nháp/publish, `/portfolio/[slug]` | Nút cuối CV mở Portfolio hoàn chỉnh; dự án cập nhật online | Xây sau CV và sau khi Boss xác nhận nội dung dự án |

## v1.1.0: kiểm tra thực tế sau cấu hình

1. Chạy migration và chỉ định owner; bật Email Auth, tắt public signup.
2. Deploy Next.js trên Vercel với Node.js 24.x và hai biến Supabase.
3. Đăng nhập PC, sửa và lưu nháp; điện thoại đăng nhập thấy đúng nội dung.
4. Khách không đọc được nháp/ảnh nháp, tài khoản khác không có quyền sửa.
5. Preview và publish; khách tải lại thấy đúng snapshot mới mà không phải redeploy.
6. Thử hai thiết bị cùng sửa; phiên lưu sau bị chặn nếu dùng version cũ.
7. Kiểm tra upload ảnh thật, email khôi phục, in/PDF và nút Portfolio.

Không có AI viết CV, nhiều người dùng đăng ký, marketplace mẫu hoặc thanh toán trong phạm vi đã chốt. Phiên bản kế tiếp trong roadmap là **v2.0.0 — Portfolio**.

## v1.2.0 đã triển khai

- Autosave nháp theo debounce 1,2 giây; đang lưu vẫn tiếp tục nhập, lượt sau dùng version mới trả về.
- Giữ riêng các trạng thái đã lưu/chưa lưu/đang lưu/mất mạng/lỗi/xung đột. Chờ kết thúc IME trước khi tự lưu.
- Bản khôi phục cục bộ theo project/owner; chọn khôi phục hoặc dùng cloud. Nếu base version cũ hơn cloud thì dừng tự lưu.
- Sắp xếp các phần trong khối đầu/cột trái/cột phải; sắp xếp mục lặp; tay nắm kéo cho chuột/cảm ứng và nút lên/xuống.
- Ẩn/hiện không mất dữ liệu nháp; snapshot public loại nội dung ẩn khi xuất bản lại.
- Hoàn tác/làm lại trong phiên, tối đa 50 mốc. Chuyển preview desktop/mobile 390 px.
- Font tiếng Việt đóng gói nội bộ, đúng Unicode ranges và NFC; sửa dấu bị tách/khoảng cách bất thường.
- Nâng cấp DB bằng migration 002, giữ dữ liệu/owner/ảnh/env hiện tại. Không mở public signup hoặc tự xuất bản.

## v1.3.0 đã triển khai

- Lịch sử cloud riêng tư; mốc xuất bản đầy đủ, mốc thủ công, baseline có thật lúc nâng cấp; không ghi mọi lần autosave.
- So sánh với nháp hoặc mốc khác theo nhóm; xem CV/ảnh của mốc; phân trang lịch sử.
- Khôi phục vào nháp có xác nhận và CAS; giữ mốc trước/sau trong transaction, bản công khai không đổi.
- Xuất/nhập JSON có schema/giới hạn byte/kiểm tra ảnh, preview hash và xác nhận; không chứa file ảnh hoặc thông tin đăng nhập.
- RLS/privileges giữ lịch sử bất biến từ trình duyệt; ảnh được mốc tham chiếu không bị xóa bằng quyền owner thông thường.
- Migration 003 chạy tăng dần, rerun không thêm baseline giả; giữ owner, hai biến môi trường và backup cục bộ v1.2.

## v1.4.0 đã triển khai

- PDF A4 tự động, chữ tiếng Việt/selectable, toàn bộ nội dung public và thứ tự, không xuất phần ẩn/nháp. Mẫu sáng một cột có ngắt trang, footer/version, liên kết và QR.
- Copy URL/Web Share có fallback; tải QR PNG; ảnh chia sẻ 1200×630 và metadata OG/Twitter/canonical theo bản công khai.
- Mã đơn vị riêng với tên đầy đủ, tương thích autosave/history/JSON/PDF. Schema nội dung 3, capability 4; dữ liệu cũ không bị ghi lại bởi migration.
- Node PDF không Chromium, font nội bộ; xử lý ảnh và responsive portrait giữ RLS; cache tiến trình giới hạn theo content hash.
- Kiểm tra PDF thật 2/8 trang và OG PNG, test/API/UI/typecheck/build. Chưa deploy hoặc nghiệm thu cloud thật của Boss.

## v1.5.0 đã triển khai

Kéo block ngay trên CV và di chuyển từng dòng; chỉ hiện thao tác khi chọn block. Đổi tiêu đề, thêm mới vào đúng vị trí bên thanh phải, sắp xếp thời gian có tăng/giảm và bắt đầu/kết thúc. Bổ sung Maison nguyên bản và Lưới linh hoạt 12 phần với cấu hình độc lập; grid 6+6 chung hàng và 12 trọn hàng, mobile một cột. Layout/tiêu đề theo autosave, JSON và history; public loại tiêu đề phần ẩn. PDF giữ thứ tự/tiêu đề và tiếp tục A4 một cột. Migration 005, không reset hoặc thêm env.

## v2.0.0 — Portfolio (kế tiếp)

Xây dựng danh sách/chi tiết dự án, ảnh/video, bối cảnh–vai trò–giải pháp–kết quả, demo/GitHub và quản trị online có nháp/xuất bản. Tạo `/portfolio/[slug]`, kết nối từ nút cuối CV và PDF. Nội dung kết quả dự án cần Boss cung cấp/xác nhận; không tự tạo thành tích. Chưa triển khai trong v1.5.0.
