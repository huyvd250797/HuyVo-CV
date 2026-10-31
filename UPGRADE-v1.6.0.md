# Nâng cấp v1.6.0 — Bilingual CV

Source được nâng từ ZIP v1.5.0 của Boss. Không kết nối, thay dữ liệu hoặc deploy vào Supabase/Vercel thật trong quá trình bàn giao này.

## 1. Chuẩn bị và deploy

1. Xuất JSON nháp đang lưu và sao lưu Database/Storage của project. JSON giữ nội dung nhưng không chứa file ảnh.
2. Giữ nguyên owner, project Supabase, URL website và hai biến Vercel hiện tại. Không tạo lại bảng, không reset Database.
3. Nếu đang v1.5, chạy toàn bộ `supabase/migrations/202610310006_bilingual_cv.sql` trong Supabase SQL Editor. Phiên bản cũ hơn chạy các migration còn thiếu đúng thứ tự 001 → 006. Project mới chạy cả 6 file rồi `supabase/setup-owner.sql`.
4. 006 chạy trong transaction, có thể chạy lại riêng 006. Không chạy lại 001–005 sau 006: các file cũ có thể thay hàm bằng phiên bản cũ. Kiểm tra SQL chạy hết, không bỏ qua lỗi.
5. Tích hợp thư mục source mới vào repository hiện tại, giữ `.git` và cấu hình riêng. `npm ci`, `npm run typecheck`, `npm test`, `npm run build`. Node 24.x.
6. Vercel Root Directory phải là thư mục có package.json; dùng Node 24.x. Giữ `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trong Environment Variables rồi redeploy.
7. Tải lại tất cả tab `/admin` cũ. Capability database mới là 6; nội dung schema 5. API cũ sẽ từ chối chỉnh sửa thay vì làm mất bản EN.

Hai biến NEXT_PUBLIC được nhúng vào bundle trình duyệt khi build; đặt trên Vercel giúp không ghi giá trị vào source nhưng không biến publishable key thành secret. RLS/Auth bảo vệ dữ liệu. Không đưa service-role/secret key vào NEXT_PUBLIC. Không cần thêm env hay dịch vụ dịch tự động.

## 2. Điều gì được giữ và thay đổi

| Thành phần | Sau migration 006 |
| --- | --- |
| Nháp VI và version | Giữ nguyên; khi lưu bằng app mới mới được chuẩn hóa schema 5 |
| Publication cũ | Giữ nguyên nội dung/version, bổ sung `language = vi` |
| EN | Chưa được xuất bản; tạo nháp độc lập lúc chọn EN lần đầu |
| Publication | Khóa `(id, language)`, mỗi ngôn ngữ một snapshot |
| Lịch sử | Giữ mốc cũ; mốc mới giữ toàn bộ bundle VI/EN |
| Owner, Auth, ảnh | Giữ nguyên; quyền ảnh bổ sung tham chiếu logo/EN/branding |
| Cài đặt | Thêm `cv_preferences`, Auto Save mặc định bật, brand mặc định maison. |

Chưa có dịch tự động. Lần đầu EN sao chép tên người, thông tin liên hệ, tên công ty/app, URL, mã đơn vị, ảnh và ID dữ liệu. Nội dung cần dịch để trống, tiêu đề mặc định tiếng Anh và thời gian được định dạng tiếng Anh. Boss điền nội dung EN từ kinh nghiệm thật. Không sao chép lại VI vào EN mỗi lần đổi ngôn ngữ.

Mỗi ngôn ngữ có bố cục, tiêu đề, thứ tự, nội dung và ảnh riêng. Cùng một version nháp giúp phát hiện hai thiết bị sửa đồng thời. Thiết bị khác cần tải lại để thấy bản mới; chưa có cộng tác realtime.

## 3. Luồng sử dụng

- Thanh trên **VI / EN** chọn ngôn ngữ đang sửa. Lưu nháp lưu toàn bộ bundle, không xuất bản.
- **Xuất bản → Tiếng Việt** chỉ thay snapshot VI; **Tiếng Anh** chỉ thay EN; **Tất cả** kiểm tra cả hai rồi cập nhật trong một transaction. Một bản lỗi thì không cập nhật bản nào.
- Khách `/` xem VI; nếu chỉ EN đã xuất bản thì root xem EN. `/en` xem EN, `/vi` xem VI. Khi chưa có EN, không có nút chuyển ngôn ngữ. Khi cả hai đã xuất bản, khách chọn Tiếng Việt/English. PDF/QR/ảnh chia sẻ EN chưa xuất bản trả 404, không lấy bản nháp hoặc fallback VI.
- PDF `/api/cv/pdf?lang=en`; in `/print?lang=en`; QR `/api/share/qr?lang=en`; ảnh OG `/api/share/image?lang=en`. URL chia sẻ EN là `/en`. Nút Portfolio giữ ngôn ngữ; Portfolio vẫn là trang chờ.
- **Cài đặt → Auto Save**: checkbox có tác dụng ngay trong phiên; bỏ chọn dừng timer tự lưu đang chờ. Request đã gửi vẫn có thể hoàn thành. Nút **Lưu nháp** hoặc ✓ của inline luôn lưu thủ công. **Lưu cài đặt** giữ lựa chọn trên cloud cho thiết bị khác.
- **Cài đặt → Logo thương hiệu / Biểu tượng tab**: JPG, PNG, WebP, tối đa 3 MB. Không dùng SVG/raw HTML. Branding dùng chung và công khai ngay khi lưu cài đặt; không cần publish CV. Dùng mặc định bỏ ảnh và dùng tên thương hiệu mặc định/hiện tại.
- Double click vào một trường chữ/tiêu đề: nhập text, bấm ngoài cập nhật nháp và sidebar, ✓ cập nhật rồi lưu cloud, Escape hủy. Các URL/ảnh vẫn quản lý ở sidebar/upload; không phải mọi vùng đồ họa đều là trường nhập.
- Chọn block để hiện thao tác; **＋ ở cuối block** nối item mới và mở/focus đúng cuối bảng phải. Lên/xuống đổi thứ tự dòng. Kéo block A lên B đổi chỗ A/B, có chuyển động theo đường cong ngẫu nhiên; giảm chuyển động theo cài đặt hệ điều hành.
- **Kinh nghiệm triển khai → Logo đơn vị** tùy chọn. Logo 44×44 trên CV, 28×28 PDF, giữ tỷ lệ và đứng trái mã/tên; các đơn vị không có logo vẫn hiển thị bình thường.
- **Lịch sử → Xóa mốc** hoặc **Xóa tất cả** (nhập DELETE). Xóa là vĩnh viễn trong app, không đổi nháp, hai bản công khai hay cài đặt; không tự xóa file ảnh. Mốc sau đó vẫn có thể được tạo mới.
- Khôi phục lịch sử khôi phục toàn bộ VI/EN của mốc vào nháp mới, có mốc trước/sau, không sửa public hoặc preferences. Mốc cũ chưa có EN sẽ khôi phục nháp chưa có EN; bản EN đã xuất bản vẫn giữ nguyên.
- Backup JSON 512 KB, mỗi CV chuẩn hóa tối đa 180 KB. Nội dung/đường dẫn ảnh được giữ; file ảnh cần nằm trong project nguồn. Không chứa token/khóa kết nối.

## 4. Nghiệm thu trên Supabase/Vercel thật

1. Mở nháp và CV public VI trước/sau nâng cấp, kiểm tra nội dung/ảnh/history vẫn còn.
2. Chọn EN, nhập bản dịch đầy đủ, đổi tiêu đề và thời gian; quay VI xác nhận nội dung VI giữ nguyên. Lưu và đăng nhập thiết bị khác kiểm tra cả hai bộ.
3. Publish VI khi chưa publish EN: không có nút chuyển ngôn ngữ; `/api/cv/pdf?lang=en` không trả nháp.
4. Publish EN: nút switch hiện; VI giữ nguyên version/nội dung công khai. Sửa VI rồi chỉ publish VI: EN cũ giữ nguyên. Thử Tất cả: cả hai cùng version. Thử EN thiếu nội dung: cả hai giữ nguyên khi Tất cả bị từ chối.
5. Mở PDF, print, QR và copy/share ở EN: nội dung, nhãn, tiêu đề, thời gian và link đều EN. Kiểm tra chữ có thể chọn, không mất dấu/tên người; logo không kéo méo. Mẫu PDF tiếp tục A4 một cột, cùng thứ tự/tiêu đề public.
6. Tắt Auto Save, sửa và đợi vài giây: không có PUT tự động; bấm Lưu nháp lưu được. Lưu cài đặt, tải lại thấy checkbox tắt. Bật lại rồi sửa để tự lưu.
7. Double click mục tiêu, tiêu đề và một field của dòng giữa danh sách. Bấm ngoài/✓/Escape, kiểm tra sidebar và nội dung đúng đối tượng; thử tương tự trên EN.
8. Thêm bằng ＋ cuối block dài: focus đúng item mới, không nhảy về đầu. Kéo block và dùng lên/xuống: thứ tự đúng, hai phần bay đổi chỗ; bật Reduced Motion để tắt chuyển động.
9. Upload logo đơn vị/brand/favicon. Logo EN chưa xuất bản không đọc được ở phiên khách; logo brand công khai sau Lưu cài đặt. Tất cả ảnh bị kiểm tra owner và Storage RLS.
10. Tạo ít nhất hai mốc, xóa một rồi refresh; xóa tất cả phải nhập DELETE. Kiểm tra nháp và hai publication không đổi. Tạo mốc mới, thử khôi phục cả VI/EN.
11. Thử hai thiết bị cùng sửa: bản sau dùng version cũ bị chặn và giữ bản đang soạn; không ghi đè im lặng. Kiểm tra desktop/mobile và đăng xuất.

## 5. Giới hạn và bước tiếp theo

Test tự động dùng PostgreSQL PGlite, API/UI có mock và PDF thật; không thay nghiệm thu Auth/email/Storage/hosting trên tài khoản của Boss. Không tự push GitHub/deploy vì chưa có repository hoặc quyền deployment được cung cấp trong phiên này.

**v1.7.0 — App Showcase**: app thật có ảnh chụp, mô tả/vai trò/công nghệ/demo, nội dung VI/EN. **v1.8** trình bày & PDF, **v1.9** nghiệm thu CV trước khi xây **v2 Portfolio**. Không tạo thành tích hoặc screenshot app giả thay cho nội dung Boss cung cấp.
