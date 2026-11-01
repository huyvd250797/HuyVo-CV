# Nâng cấp v1.7.0 — App Showcase

Source nền: ZIP **v1.6.0 — Bilingual CV** Boss gửi trong lượt này. Bản này giữ quy tắc VI có nội dung thì EN phải hoàn thiện mục tương ứng khi xuất bản EN; không áp dụng thay đổi cho phép thiếu mô tả triển khai.

## 1. Nâng cấp Database và source

1. Trước khi nâng cấp: xuất JSON từ Lịch sử và sao lưu Database + file Storage bằng công cụ của project. JSON chỉ giữ nội dung/đường dẫn, không kèm file ảnh.
2. Giữ nguyên project Supabase, owner, bucket `cv-assets` private và hai biến `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trên Vercel. Không thêm service-role key hoặc mật khẩu vào source.
3. Supabase → SQL Editor → New query. Mở file **`supabase/migrations/202610310007_app_showcase.sql`** trong ZIP, sao chép toàn bộ nội dung và chạy một lần. Đã có 001–006 thì chỉ chạy 007. Project cũ hơn phải chạy các migration còn thiếu theo thứ tự. Project mới chạy 001→007 rồi setup-owner.sql.
4. Migration 007 không sửa những dòng nháp, publication hoặc lịch sử cũ, không chuyển owner. Nó cập nhật các hàm lưu/xuất bản/media, bổ sung kiểm tra bản dịch trong transaction, capability 7 và schema nội dung mới 6. Chạy lại 007 không tạo dữ liệu mẫu hoặc xóa CV.
5. Giải nén **v1.7.0 — App Showcase.zip**, mở thư mục `Maison-CV-v1.7.0` có package.json. Tích hợp vào repository hiện tại, giữ cấu hình cá nhân. `npm ci` → `npm run typecheck` → `npm test` → `npm run build`; push/deploy Vercel như README. Bản bàn giao chưa tự push hoặc deploy vào tài khoản Boss.
6. Sau deploy: đóng/tải lại mọi tab `/admin`. Các editor cũ bị từ chối qua capability check để tránh ghi dữ liệu mới bằng cấu trúc cũ.

Không chạy migration 006 hoặc bản cũ sau 007. Nếu cần quay lại, giữ nguyên database và sửa bằng bản vá tương thích capability 7; không hạ capability để cho editor cũ lưu. Quay lại cả database chỉ thực hiện từ backup nhất quán có đủ snapshot, lịch sử và Storage. CV đang công khai được giữ nguyên trong quá trình nâng cấp.

## 2. Nhập ứng dụng và ảnh

1. Trong editor chọn **Ứng dụng đã xây dựng**, chính là block **Sản phẩm nổi bật** trước đây. Tiêu đề tùy chỉnh cũ vẫn được giữ; không nhân đôi dữ liệu.
2. Thêm tên, bài toán/giá trị, vai trò, năm, nền tảng, công nghệ và trạng thái. Chỉ khai báo công nghệ/thành tích có thật; source không tự thêm Finzaro/Captovix/Zipverra hoặc ảnh minh họa giả vào CV cloud.
3. Bấm **Ảnh bìa** hoặc **Thay / cắt ảnh bìa** → chọn JPG/PNG/WebP tối đa 3 MB, 25 triệu điểm ảnh → chỉnh thu phóng/vị trí → **Dùng ảnh này**. Trình duyệt tạo WebP 1280×800 theo tỷ lệ 16:10 trước khi tải lên.
4. Nhập **Mô tả ảnh bìa**. Thư viện tối đa **8 ảnh/app**, mỗi ảnh có mô tả. Có thể kéo/nút ↑↓ để đổi thứ tự, chọn Làm ảnh bìa hoặc Bỏ ảnh khỏi nháp.
5. **Ứng dụng nổi bật** thêm nhãn và viền, không tự đảo thứ tự. **Ẩn ứng dụng trên CV** giữ app trong nháp nhưng bỏ app/media khỏi snapshot lần xuất bản tới. Sắp xếp năm và thứ tự tay hoạt động như trước; không đổi thứ tự chỉ vì đánh dấu nổi bật.
6. Bấm + cuối block hoặc Thêm sản phẩm để bổ sung app. Thêm mới vẫn cuộn/focus đúng mục cuối trong bảng bên phải.
7. Chọn Xem trước và khung Mobile để kiểm tra. Web có gallery đóng/mở và mở ảnh lớn ở tab mới; PDF có bìa/tóm tắt/liên kết, không in toàn bộ gallery.

## 3. VI/EN và thông báo lỗi

- Nội dung mô tả, vai trò, mô tả ảnh, tiêu đề/bố cục, trạng thái/nổi bật/ẩn giữ riêng theo ngôn ngữ. Ảnh bìa, danh sách/thứ tự file ảnh và demo/source dùng chung theo ID app/ảnh; sửa EN không ghi đè văn bản VI.
- Nếu VI thêm app sau khi đã tạo EN: chọn EN → Ứng dụng đã xây dựng → **Bổ sung app từ VI**. Chỉ thêm ID thiếu, giữ bản dịch EN đã nhập và đồng bộ ảnh/liên kết. Các danh sách khác có **Bổ sung mục từ VI**. Không cần xóa EN để tạo lại.
- Lưu nháp cho phép bản dịch đang làm dở. **Xuất bản EN** kiểm tra các trường có nội dung ở mục VI tương ứng; mục EN thiếu hoàn toàn hoặc danh sách Trách nhiệm/Kết quả mới dịch một phần cũng báo lỗi. Các block/app được chủ động ẩn ở EN không đi vào bản công khai.
- Ví dụ lỗi: **Tiếng Anh → Kinh nghiệm triển khai → EPU – Electric Power University → Thiếu “Vai trò / Phạm vi triển khai”. Bản tiếng Việt đã có nội dung; hãy bổ sung bản tiếng Anh.**
- Bấm **Sửa** ngay tại lỗi: hệ thống chọn đúng ngôn ngữ, mở block, cuộn đến dòng và focus trường cần bổ sung. Nếu cả mục còn thiếu, dùng Bổ sung mục/app từ VI trong block vừa mở.
- Quy tắc này kiểm tra sự đầy đủ, không phải dịch tự động hoặc chứng nhận chất lượng bản dịch. Boss vẫn duyệt thuật ngữ và nội dung thực tế.
- Xuất bản VI chỉ đổi VI; EN chỉ đổi EN. Tất cả là transaction: một bản chưa hợp lệ thì không cập nhật bản nào. Ảnh/link đã chia sẻ trong nháp chỉ lên cả hai website sau khi xuất bản cả hai ngôn ngữ.
- Mô tả ảnh cần có trước khi xuất bản để gallery dùng được với trình đọc màn hình.

## 4. Ảnh riêng tư, lịch sử và nhập JSON

Media mới được tính trong draft, publication VI/EN, history và kiểm tra chủ sở hữu. Ảnh chỉ ở nháp hoặc app ẩn chưa từng xuất bản không cho khách tải. Ảnh đã được một ngôn ngữ công khai tham chiếu vẫn công khai dù ngôn ngữ kia chưa cập nhật; cần cập nhật cả hai publication nếu muốn gỡ ảnh khỏi quyền đọc hiện tại.

Gỡ ảnh không tự xóa file. Snapshot cũ/mốc lịch sử được giữ; các file còn được tham chiếu bị chặn xóa thông thường. Xuất/nhập JSON chứa đường dẫn và alt text, không chứa file ảnh; nhập project khác hoặc thiếu file sẽ có cảnh báo và bỏ đường dẫn không dùng được trước khi áp dụng. Khôi phục lịch sử chỉ đổi nháp, không tự xuất bản.

## 5. Checklist nghiệm thu trên project thật

- [ ] Đăng nhập đúng owner; nháp/app và các mốc cũ còn nguyên.
- [ ] Tải/cắt ảnh bìa và hai ảnh gallery; sửa alt, đổi thứ tự, chọn ảnh làm bìa, lưu rồi tải lại.
- [ ] Đổi VI/EN: ảnh/link dùng chung, mô tả/alt mỗi ngôn ngữ không bị ghi đè.
- [ ] Thêm app mới ở VI, bổ sung từ VI vào EN; nội dung EN cũ giữ nguyên.
- [ ] Bỏ mô tả EPU ở EN rồi xuất bản EN: thấy đúng tên/trường; Sửa focus đúng ô; không cập nhật snapshot nào khi lỗi.
- [ ] Hoàn thiện EN, lưu, xuất bản EN; snapshot VI vẫn giữ nguyên.
- [ ] Ẩn một app, xuất bản, kiểm tra cửa sổ khách không thấy app và không đọc được ảnh chỉ thuộc app đó.
- [ ] PDF VI/EN có ảnh bìa/tóm tắt/link, bỏ app ẩn; web desktop/mobile không tràn ngang.
- [ ] JSON/lịch sử giữ app và ảnh, restore chỉ đổi nháp; Auto Save và chống ghi đè thiết bị khác vẫn hoạt động.

**Tiếp theo: v1.8.0 — CV Presentation & PDF**, hoàn thiện mẫu A4/ATS, bố cục và ngắt trang theo VI/EN.
