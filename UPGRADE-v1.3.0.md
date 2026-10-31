# Nâng cấp v1.3.0 — History & Recovery

## Đang dùng v1.2.0 trên Vercel/Supabase

1. Giữ nguyên project Supabase, Auth User UID, database, bucket `cv-assets` và hai biến Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Không điền giá trị thật vào source hoặc commit `.env.local`.
2. Trước khi nâng cấp, dùng chức năng backup/export của project nếu cần bản sao độc lập. Mốc lịch sử và JSON nội dung không bao gồm backup toàn bộ Storage/Auth.
3. Đề nghị đóng các tab editor cũ để tránh sửa trong lúc chuyển phiên bản. Trong Supabase SQL Editor, chạy toàn bộ `supabase/migrations/202610310003_history_recovery.sql`. Script chạy trong transaction; nếu lỗi, xử lý lỗi trước khi tiếp tục, không chạy từng đoạn để bỏ qua.
4. Kết quả mong đợi: bảng `cv_revisions`, `cv_migration_log`, hàm tạo mốc/khôi phục, publish cập nhật và capability 3. Nháp/public đang có được giữ làm baseline một lần. Không reset dữ liệu, không thay owner hoặc chạy setup-owner lại. Có thể chạy lại 003; không nhân đôi baseline và không dựng lịch sử từ các dữ liệu sinh ra sau lần chạy đầu.
5. Tích hợp source v1.3.0 vào repository hiện tại, giữ `.git` và Root Directory đúng thư mục có package.json. Commit/push và để Vercel deploy với Node.js 24.x, `npm ci`, `npm run build`; không đặt static export hoặc Output Directory `out`.
6. Sau deployment Ready, tải lại `/admin` trên các thiết bị. Nháp/ảnh/public vẫn giữ dữ liệu trước đó. API báo cần migration 003 nếu database chưa cập nhật; không tắt RLS để bỏ qua lỗi.
7. Làm danh sách nghiệm thu dưới đây trước khi tiếp tục sửa CV thật.

Đang v1.1.0: chạy 002 rồi 003. Project mới: chạy 001 → 002 → 003 → setup-owner.sql và làm các bước Auth/Vercel trong README. Không chạy 001 hoặc 002 sau 003 vì các hàm có thể bị hạ phiên bản.

## Cách dùng

- Lưu nháp xong → **Lịch sử ↶** → tên/ghi chú → **Tạo mốc từ nháp đã lưu**. Mốc thủ công không đổi version nháp.
- Chọn mốc → **Khác biệt** hoặc **Xem CV**. So sánh với nháp hoặc mốc khác đã tải; dùng **Tải thêm mốc** để đọc lịch sử cũ.
- **Khôi phục mốc vào nháp** → đọc thông tin → xác nhận. Nháp trước thay đổi được giữ trong lịch sử; nội dung khôi phục có version mới, không quay lùi version. Kiểm tra nháp rồi tự xuất bản khi cần.
- **Xuất nháp / Xuất mốc · JSON** tạo bản sao toàn bộ nội dung, cả phần ẩn. File không có token/mật khẩu/khóa kết nối hoặc file ảnh.
- **Nhập JSON** → chọn file tối đa 256 KB → đọc cảnh báo/khác biệt → **Áp dụng file vào nháp** → xác nhận. Nhập vào nháp, giữ mốc trước/sau; bản công khai không đổi.
- Chỉ nhận envelope Maison formatVersion 1 hoặc JSON hồ sơ cũ hợp lệ. Cấu trúc CV sau chuẩn hóa vẫn là schemaVersion 2; capability database là 3, đây là hai số khác nhau.
- Ảnh không nhúng trong JSON. Đường dẫn ảnh từ owner/project khác hoặc không còn sẽ bị bỏ kèm cảnh báo để chọn lại. Nếu ảnh thay đổi sau preview, ứng dụng chặn áp dụng và yêu cầu chọn file lại.
- Khi còn nội dung chưa lưu, chọn **Lưu nháp hiện tại** trước khi tạo/áp dụng mốc. Nếu có xung đột hoặc bản khôi phục cục bộ chưa xử lý, trở về editor để giải quyết trước. Hệ thống không tự ghi đè bản của thiết bị khác.

## Nghiệm thu trên project thật

| Thao tác | Kết quả cần thấy |
| --- | --- |
| So sánh dữ liệu trước/sau migration | Nháp, public, owner, ảnh và hai biến Vercel còn nguyên |
| Mở Lịch sử ngay sau nâng cấp | Có baseline cho nháp/public nếu chúng tồn tại lúc chạy 003; không có lịch sử giả của các lần lưu trước đó |
| Lưu nháp, tạo mốc tên A; sửa nháp và tạo B | A/B giữ nội dung riêng, mốc không bị sửa theo nháp; tự lưu không tạo mốc mỗi lần gõ |
| So sánh A với nháp hoặc B | Thấy đúng nhóm thay đổi, thứ tự và trạng thái ẩn/hiện; font tiếng Việt đúng dấu |
| Khôi phục A | Có xác nhận, mốc Trước khôi phục và Đã khôi phục; version nháp tăng, public không đổi |
| Khôi phục mốc Trước khôi phục | Quay lại nội dung trước thao tác mà vẫn tăng version mới |
| Xuất bản nháp | Thêm một mốc xuất bản chứa toàn bộ nháp; public loại phần ẩn. Xuất bản lại cùng version không nhân đôi mốc xuất bản |
| Xuất JSON rồi nhập lại | Xem trước/so sánh trước xác nhận; nội dung và layout được giữ; public không đổi |
| Nhập JSON lỗi/schema tương lai | Báo lỗi, không thêm mốc/ghi đè nháp |
| Nhập JSON có ảnh thiếu/khác owner | Cảnh báo bỏ đường dẫn ảnh; chọn ảnh mới sau nhập |
| PC mở xác nhận, điện thoại lưu nháp trước; PC xác nhận | Báo xung đột, nháp cloud và lịch sử không bị ghi đè bởi thao tác cũ |
| Mở lịch sử bằng tài khoản khác/khách | Không đọc được mốc hoặc ảnh riêng tư; khách chỉ đọc snapshot và ảnh công khai hiện hành |
| Mở mobile | Danh sách, so sánh, xác nhận cuộn được; các nút dùng được |

Sau deploy có thể chạy `SITE_URL=https://YOUR_CV.vercel.app node scripts/smoke.mjs` để kiểm tra HTTP; test này không thay cho các thao tác đăng nhập/Storage thật.

## Giới hạn và phục hồi sự cố

- Chỉ giữ được nháp/public đang tồn tại lúc nâng cấp. Mốc public baseline không chứa những phần trước đó đã bị ẩn. Mốc nháp baseline giữ riêng dữ liệu đầy đủ nếu nháp tồn tại.
- Lịch sử riêng tư bất biến qua quyền trình duyệt; chưa có UI xóa mốc hoặc tự dọn dung lượng. Ảnh được nháp/public/lịch sử tham chiếu được giữ bằng policy Storage. Quản trị trực tiếp/service-role của project vẫn có thể thay dữ liệu ngoài app.
- JSON không gồm ảnh, database/Auth hoặc email tài khoản; không thay thế backup project độc lập. JSON chứa cả thông tin CV bị ẩn, nên lưu/chia sẻ file theo nhu cầu của Boss.
- Backup cục bộ v1.2 vẫn được nhận diện bằng khóa cache cũ. Hoàn tác 50 mốc vẫn chỉ trong phiên; lịch sử cloud là tính năng riêng.
- Nếu migration lỗi trong transaction, kiểm tra lỗi SQL và chạy lại toàn bộ sau khi sửa. Không reset bảng để thử lại.
- Nếu deployment lỗi sau migration, giữ database và public snapshot; sửa/deploy bản v1.3 tương thích. API v1.2 yêu cầu capability 2 nên sẽ chặn chỉnh sửa khi database đã lên 3; rollback source cũ không phải giải pháp cho editor. Không đổi hàm schema_version giả xuống 2 hoặc xóa bảng lịch sử.
- Để sửa nội dung sai, dùng mốc Trước khôi phục/Trước nhập; nếu chưa xác nhận thao tác thì đóng lịch sử, nháp chưa đổi. Nếu sự cố nằm ngoài app, phục hồi từ backup độc lập của project.

Kế tiếp: **v1.4.0 — PDF & Professional Sharing**. PDF tự động, QR và ảnh chia sẻ chưa nằm trong v1.3.0.
