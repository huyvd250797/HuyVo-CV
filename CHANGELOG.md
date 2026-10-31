# Changelog

## v1.5.0 — Visual Layout Studio · 31/10/2026

- Thêm tay nắm kéo block trực tiếp trên CV, di chuyển giữa vùng Maison hoặc thứ tự grid; hỗ trợ lên/xuống, pointer capture, tự cuộn và hủy kéo.
- Chỉ hiện toolbar ＋/kéo/lên/xuống và mũi tên từng dòng khi chọn block; preview/public không chứa thao tác quản trị.
- Đổi tiêu đề 8 block, đồng bộ menu, CV, JSON/history và tiêu đề PDF; tiêu đề rỗng quay về mặc định.
- Thêm mới nối cuối danh sách, giữ thanh bên và focus đúng mục mới với preventScroll; không nhảy về đầu.
- Sắp xếp thời gian tăng/giảm theo năm/giai đoạn, lựa chọn bắt đầu/kết thúc, giữ mục chưa có ngày hợp lệ cuối danh sách. Bổ sung thời gian triển khai tùy chọn; kỹ năng vẫn sắp xếp tay.
- Maison nguyên bản và Lưới linh hoạt 12 phần giữ cấu hình riêng. Grid theo thứ tự trái sang phải/xuống hàng, 6+6 cùng hàng, 12 trọn hàng; mobile một cột. Menu editor theo thứ tự block.
- Schema nội dung 4/capability 5, migration 005 không rewrite dữ liệu cũ. Publish loại cả tiêu đề của block ẩn; revision riêng tư giữ đầy đủ.
- Giữ autosave/undo/CAS/khôi phục/PDF/QR. PDF tự động giữ thứ tự/tiêu đề theo layout, tiếp tục mẫu A4 một cột. Không thêm biến môi trường hoặc dependency.

Đang v1.4: chạy `202610310005_visual_layout.sql`, deploy và tải lại tab admin. Xem `UPGRADE-v1.5.0.md`.


## v1.4.0 — PDF & Professional Sharing · 31/10/2026

- Tải PDF A4 tự động từ snapshot public, không từ nháp. Font TTF nội bộ hỗ trợ tiếng Việt có thể chọn chữ; ngắt nhiều trang, footer/số trang, liên kết và QR cuối hồ sơ.
- Mẫu A4 sáng một cột riêng cho ứng tuyển; cùng toàn bộ nội dung/thứ tự/ẩn mục của bản công khai. Không ép CV dài thành một trang hoặc chụp web thành ảnh.
- Bộ chia sẻ: copy URL, Web Share có fallback, tải QR PNG; metadata OG/Twitter/canonical và ảnh PNG 1200×630 từ nội dung công khai.
- Thêm Mã đơn vị (`implementations[].code`, tùy chọn, tối đa 80 ký tự); mã trên/tên đầy đủ dưới. Hỗ trợ editor/autosave, JSON, diff/history và PDF; dữ liệu cũ giữ tên cũ, mã mặc định rỗng. Không tự suy đoán tên của các đơn vị đang lưu.
- Schema nội dung nâng 3; đọc được JSON schema 1/2 và các mốc cũ. Migration 004 nâng capability 4 và hàm lưu schema 3 để chặn editor cũ làm mất mã mới; không sửa nội dung hoặc lịch sử trong DB.
- Tối ưu chân dung WebP responsive sau Storage RLS; resize ảnh PDF/OG, không tải URL ảnh tùy ý từ người dùng.
- Các endpoint public không cache CDN/client. Cache PDF tiến trình theo hash/version tối đa 4 bản; giới hạn response và fallback in trình duyệt.
- Khóa renderer/layout/render PDF đã kiểm tra và đóng gói font/license; Node.js runtime, không Chromium hay dịch vụ PDF ngoài. Không thêm env.

Nâng cấp: chạy `202610310004_professional_sharing.sql` sau 003 rồi deploy source/tải lại tab cũ. Khai báo URL website CV, điền mã/tên đơn vị, lưu và xuất bản để áp dụng lên public/QR/PDF. Xem `UPGRADE-v1.4.0.md`.


## v1.3.0 — History & Recovery · 31/10/2026

- Lịch sử cloud riêng tư theo thời gian; mốc khi xuất bản, mốc thủ công có tên và ghi chú; phân trang 20 mốc.
- So sánh theo nhóm thông tin, thứ tự và phần ẩn/hiện với nháp hoặc mốc khác; xem CV ở chế độ chỉ đọc cùng ảnh riêng tư.
- Khôi phục vào nháp sau xác nhận; giữ mốc trước/sau trong cùng transaction, tăng version và giữ CAS; không tự xuất bản.
- Xuất JSON nội dung/layout; nhập file tối đa 256 KB có kiểm tra schema, xem trước, xác nhận và giữ mốc trước/sau. Không đóng gói ảnh/token/secret trong JSON.
- Xác minh ảnh nhập, cảnh báo ảnh thiếu/khác owner; fingerprint nội dung xem trước chặn áp dụng nếu dữ liệu hoặc ảnh đã thay đổi.
- RLS chỉ owner đọc lịch sử; RPC kiểm tra quyền/version; chặn sửa/xóa mốc từ trình duyệt. Bảo vệ ảnh đang được lịch sử tham chiếu.
- Migration 003 giữ nháp/public hiện có làm baseline một lần, không tái tạo lịch sử chưa từng lưu; không reset DB/owner/ảnh/env.
- Giữ font tiếng Việt và autosave v1.2; tạm dừng editor nền khi mở lịch sử, giữ khóa backup cục bộ cũ để tương thích.
- App/package-lock/footer/backup cùng version 1.3.0; schema CV vẫn 2, capability database nâng thành 3.

### Nâng cấp

Đang v1.2 chỉ chạy `202610310003_history_recovery.sql`, deploy source mới và tải lại tab quản trị. Project mới chạy 001 → 002 → 003 → setup-owner. Xem `UPGRADE-v1.3.0.md`. Không thêm biến môi trường, không đổi bản công khai trước khi Boss xuất bản lại.


## v1.2.0 — Flexible Editing & Autosave · 31/10/2026

- Tự lưu nháp sau khoảng 1,2 giây ngừng nhập; gom yêu cầu và giữ nội dung gõ thêm trong lúc request trước đang chạy.
- Cập nhật inline editor ngay khi nhập, giữ con trỏ khi autosave; chờ kết thúc gõ tổ hợp IME trước khi lưu.
- Trạng thái lưu phân biệt online/offline/lỗi/xung đột; không tự publish; xung đột khóa tự lưu thay vì ghi đè.
- Giữ bản nháp chưa lưu cục bộ theo project và user, cho chọn khôi phục; dừng lưu khi bản khôi phục dựa trên version cloud cũ.
- Thêm Bố cục CV: sắp xếp trong từng khối/cột, ẩn/hiện các phần, tự đánh lại số thứ tự trên CV; sắp xếp từng mục lặp qua kéo chuột/cảm ứng hoặc nút lên/xuống.
- Hoàn tác/làm lại tối đa 50 mốc trong phiên; preview Desktop/Mobile 390 px.
- Thay font tiêu đề bằng Noto Serif tự phục vụ, đúng bộ Latin/Latin mở rộng/Vietnamese; đóng gói normal/italic cùng OFL. Chuẩn hóa NFC, giữ nguyên khoảng trắng giữa các từ.
- Ẩn mục không xóa nháp; hàm publish gỡ nội dung ẩn khỏi snapshot công khai trong transaction.
- Migration `202610310002_flexible_editor.sql` nâng cấp hàm, không reset/seed dữ liệu hoặc đổi owner; API kiểm tra migration trước khi cho chỉnh sửa.
- Giữ hai biến Supabase trên Vercel; không thêm secret vào source.

### Nâng cấp

Project đã v1.1.0 chỉ chạy migration 002 rồi deploy source mới; project mới chạy 001 → 002 → setup-owner. Xem `UPGRADE-v1.2.0.md`. Tải lại các tab quản trị cũ. Bản công khai tiếp tục giữ nguyên đến khi Boss xuất bản lại.

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
