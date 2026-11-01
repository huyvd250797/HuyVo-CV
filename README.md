# Maison CV v1.7.0 — App Showcase

CV online theo thiết kế Maison Espresso, dành cho một chủ sở hữu. Có trình chỉnh sửa trên website, lưu nháp vào Supabase, xuất bản riêng và xem trên nhiều thiết bị. Vercel chạy website; Supabase lưu nội dung, tài khoản và ảnh.

**Dùng website production hoàn toàn online, không cần mở localhost hay giữ PC chạy.** Trước lần dùng đầu cần cấu hình Supabase và Vercel theo phần dưới. ZIP không chứa database đang chạy, tài khoản thật hoặc secret của Boss.


## Nâng cấp nhanh từ v1.6.0

1. Sao lưu Database và Storage; giữ nguyên owner, các bản CV và hai biến Supabase trên Vercel. Không reset project.
2. Chạy **`supabase/migrations/202610310007_app_showcase.sql`** sau 006. Migration không sửa các dòng CV/lịch sử/public cũ; capability 7, schema nội dung 6.
3. Tích hợp source **v1.7.0**, deploy Vercel rồi tải lại mọi tab `/admin`. Không thêm biến môi trường hoặc dependency.
4. Mở **Ứng dụng đã xây dựng** (hoặc tiêu đề tùy chỉnh trước đây của block Sản phẩm nổi bật). Các app cũ vẫn còn. Thêm ảnh bìa/thư viện, mô tả ảnh, nền tảng và trạng thái; đánh dấu nổi bật hoặc ẩn từng app.
5. Chọn VI/EN để biên tập. Ảnh, thứ tự ảnh và liên kết dùng chung theo ID app; mô tả, vai trò, mô tả ảnh và lựa chọn hiển thị giữ riêng. EN có nút **Bổ sung app từ VI** để thêm app còn thiếu mà giữ bản dịch hiện có. Các danh sách khác có **Bổ sung mục từ VI**.
6. Lưu nháp → Xuất bản → chọn VI / EN / Tất cả. **Giữ nguyên quy tắc VI có nội dung thì mục EN tương ứng phải đầy đủ trước khi xuất bản EN.** Lỗi chỉ rõ ngôn ngữ → phần → tên đơn vị/app → trường cần điền, kèm nút **Sửa**. Có thể lưu nháp bản dịch đang làm dở.
7. Mở bản công khai, thử thư viện ảnh và PDF theo từng ngôn ngữ. PDF có ảnh bìa/tóm tắt app; ảnh gallery chỉ xem trên web để CV A4 gọn.

Project mới: **001 → 002 → 003 → 004 → 005 → 006 → 007 → setup-owner.sql**. Project cũ chỉ chạy migration còn thiếu theo thứ tự; không chạy lại migration cũ sau 007. Chi tiết và checklist nghiệm thu: **[UPGRADE-v1.7.0.md](UPGRADE-v1.7.0.md)**.

## 1. Chức năng của phiên bản này

### App Showcase trong v1.7.0

- Card app có ảnh bìa 16:10, tên, mô tả giá trị, vai trò, năm, nền tảng, công nghệ và trạng thái Đang hoạt động / Đang phát triển / Đã lưu trữ. Demo/GitHub là tùy chọn; không tự suy đoán công nghệ, thành tích hoặc ảnh app của Boss.
- Tải JPG/PNG/WebP tối đa 3 MB, tối đa 25 triệu điểm ảnh. Cắt bằng thu phóng/vị trí ngang/dọc trên trình duyệt, tạo ảnh WebP 1280×800 trước khi upload. File gốc không được tự tải lên. API kiểm tra chữ ký định dạng và khả năng giải mã ảnh.
- Mỗi app có ảnh bìa và tối đa 8 ảnh thư viện; kéo/nút lên xuống để sắp xếp, chọn ảnh thư viện làm bìa hoặc bỏ ảnh khỏi nháp. Điền mô tả ảnh riêng theo ngôn ngữ để hỗ trợ người dùng trình đọc màn hình. Web mở thư viện bằng bàn phím hoặc bấm; bấm ảnh để xem kích thước lớn trong tab mới.
- Nổi bật thêm nhãn/viền; không tự đổi thứ tự đã sắp xếp. Ẩn app chỉ ảnh hưởng ngôn ngữ đang sửa, giữ app trong nháp/lịch sử. Xem trước và bản công khai loại app ẩn. Giữ kéo thả, sắp xếp năm, nút + cuối block, hai layout và hoàn tác.
- Ảnh và liên kết đồng bộ hai chiều VI/EN theo ID app/ảnh, không dựa theo thứ tự dòng; thay mô tả EN không ghi đè VI. Nếu thiếu mục EN, bấm Bổ sung app từ VI; hệ thống giữ bản dịch có sẵn và thêm các mục thiếu với nội dung cần dịch để trống.
- Khi chỉ xuất bản VI, snapshot EN cũ (kể cả ảnh/link đã xuất bản ở đó) vẫn giữ nguyên. Muốn đồng bộ thay đổi trên website của cả hai ngôn ngữ, chọn Tất cả khi nội dung đã hợp lệ.
- Ảnh nháp/app ẩn chưa từng xuất bản không cho khách đọc. Ảnh đang được draft, publication, lịch sử hoặc branding tham chiếu được bảo vệ khỏi xóa file thông thường. Gỡ ảnh trong editor không tự xóa file Storage.
- Lỗi bản dịch dùng nhãn dễ hiểu, tên đơn vị/app, trường thiếu, nút Sửa mở đúng block/dòng/ô nhập. Bắt cả trường hợp mục EN thiếu hoàn toàn hoặc danh sách trách nhiệm/kết quả EN mới có một phần số dòng của VI. Việc kiểm tra sự đầy đủ không tự đánh giá chất lượng bản dịch.
- Bản PDF VI/EN có ảnh bìa, tóm tắt app và liên kết; tự bỏ app ẩn. Giữ mẫu A4 một cột hiện hành; PDF theo lưới web và mẫu ATS nằm trong roadmap v1.8.

### Chức năng hiện có

- Đăng nhập tài khoản chủ sở hữu, đăng xuất riêng thiết bị hiện tại; hiện/ẩn mật khẩu và khôi phục qua email.
- Double click vào nội dung, tiêu đề và trường từng dòng trên CV để mở công cụ nhập trực tiếp, đồng bộ bảng bên phải. Bấm ra ngoài cập nhật nháp hoặc ✓ để lưu cloud; Escape hủy lần sửa trực tiếp.
- Thêm, sửa, xóa học vấn, kỹ năng, chứng chỉ, kinh nghiệm, đơn vị triển khai và sản phẩm nổi bật.
- Đổi ảnh JPG/PNG/WebP, tối đa 3 MB; ảnh được lưu vào Storage riêng tư.
- Tự lưu nháp sau khoảng 1,2 giây ngừng nhập; vẫn có nút Lưu nháp. Trạng thái đã lưu chỉ xuất hiện sau khi server xác nhận. Khi đang lưu, Boss vẫn có thể tiếp tục gõ; phần mới sẽ được lưu bằng lượt kế tiếp.
- Xem trước, kiểm tra nội dung và xác nhận xuất bản. Khách chỉ đọc snapshot đã xuất bản.
- Kiểm tra version khi lưu/xuất bản để tránh ghi đè từ thiết bị khác.
- Cảnh báo khi rời trang còn thay đổi chưa lưu. Nếu xung đột, có thể tải bản đang soạn dạng JSON để đối chiếu rồi chủ động tải lại dữ liệu cloud.
- In/lưu PDF qua hộp thoại trình duyệt từ CV hiện hành; không dùng lại PDF preview tĩnh của v1.0.0.
- Nút **Mở Portfolio** ở cuối CV dẫn đến `/portfolio`; trang Portfolio đầy đủ để v2.0.0.
- Có giao diện editor cho desktop, bảng chỉnh sửa trượt lên trên mobile và chọn xem trước Desktop/Mobile 390px.
- Bố cục CV: kéo đổi thứ tự các phần trong khối đầu/cột trái/cột phải; ẩn/hiện từng phần. Sắp xếp được các mục trong từng danh sách bằng tay nắm kéo hoặc nút lên/xuống.
- Hoàn tác/làm lại trong phiên, tối đa 50 mốc; các lần gõ liên tiếp cùng trường được gom nhóm. Version online không bị quay lùi khi hoàn tác.
- Giữ bản chưa lưu trên thiết bị theo từng project và tài khoản; khi mở lại, cho phép chọn khôi phục. Bản cũ hơn cloud sẽ bị chặn tự lưu để tránh ghi đè.
- Dùng font Noto Serif có bộ ký tự tiếng Việt, tự phục vụ từ `/fonts`; chuẩn hóa NFC khi nhập/lưu/render để sửa dấu tiếng Việt bị tách. Không tải font từ dịch vụ bên ngoài lúc dùng app.

- Lịch sử riêng tư trên cloud: tự giữ mốc khi xuất bản, tạo mốc thủ công có tên/ghi chú; tải thêm các mốc cũ theo trang.
- Xem CV của mốc và so sánh theo nhóm thông tin với nháp hiện tại hoặc một mốc đã tải khác, bao gồm thứ tự và phần ẩn/hiện.
- Khôi phục vào nháp có xác nhận; tự giữ nháp trước thay đổi và tăng version mới. Không quay lùi version hoặc tự xuất bản.
- Xuất nháp đã lưu/mốc lưu thành JSON; nhập JSON có kiểm tra cấu trúc, xem khác biệt, xử lý ảnh và xác nhận trước khi áp dụng. File lỗi không ghi đè dữ liệu.
- Bảo vệ ảnh được lịch sử tham chiếu khỏi thao tác xóa thông thường; lịch sử chỉ chủ sở hữu đọc được.

- PDF A4 tự động từ bản công khai, chữ tiếng Việt có thể chọn/sao chép, nhúng font nội bộ, tự ngắt trang và đánh số trang. Tên file theo họ tên/version.
- Bộ chia sẻ ở cuối trang CV: tải PDF, copy link, Web Share nếu trình duyệt hỗ trợ và QR PNG có thể tải xuống.
- Metadata Open Graph/Twitter, canonical và ảnh chia sẻ 1200×630 đọc snapshot công khai. URL ảnh có version khi xuất bản lại.
- Trường Mã đơn vị riêng, hiển thị mã phía trên/tên đầy đủ phía dưới; theo cùng autosave, lịch sử, JSON và PDF.
- Ảnh chân dung công khai có srcset và resize WebP sau kiểm tra quyền Storage; ảnh nhúng PDF/OG được giảm kích thước trên server.

- Kéo thả block ngay trên CV bằng tay nắm, có nút lên/xuống thay thế; thao tác chỉ hiện khi chọn block và không xuất hiện trên CV công khai.
- Đổi tiêu đề 8 block, tối đa 100 ký tự; đồng bộ menu chỉnh sửa, CV, history/JSON và tiêu đề PDF.
- Thêm dữ liệu ngay bằng ＋ tại block, di chuyển từng dòng trực tiếp; mở đúng mục mới cuối bảng chỉnh sửa, không cuộn về đầu.
- Tự sắp xếp theo thời gian tăng/giảm, theo bắt đầu/kết thúc cho giai đoạn; hỗ trợ năm, tháng/năm, ngày/tháng/năm, ISO, tháng tiếng Anh và hiện tại. Mục thiếu/ngày sai nằm cuối, thứ tự hòa được giữ ổn định.
- Hai chế độ Maison nguyên bản và Lưới linh hoạt 12 phần, giữ cấu hình riêng. Grid đi theo thứ tự DOM từ trái sang phải/xuống hàng, mobile một cột. Độ rộng 1–12 cho từng block, 12 chiếm cả hàng.

Autosave chỉ lưu **nháp**, không xuất bản. Lịch sử cloud là các mốc quan trọng, không ghi lại từng lần gõ/tự lưu. Hoàn tác 50 mốc vẫn chỉ trong phiên. Thiết bị khác cần mở/tải lại trang để đọc bản mới; chưa có cộng tác realtime.

### VI / EN và cài đặt (giữ từ v1.6.0)

- Nháp gồm VI và EN độc lập, cùng version chống ghi đè. Sửa EN không đổi VI; layout/tiêu đề/thứ tự/ảnh cũng có thể chỉnh riêng. Tên người, email, công ty, URL và mã đơn vị được sao chép ban đầu; phần cần dịch để trống và cần Boss hoàn thiện. Không bịa nội dung hoặc tự dịch dữ liệu cloud chưa đọc.
- `/` là CV VI (nếu chỉ EN được xuất bản, trang gốc hiển thị EN); `/en` là CV EN; `/vi` là alias VI. Chọn ngôn ngữ khách chỉ dựa trên publication thật, không dựa trên sự tồn tại của nháp EN.
- PDF/QR/ảnh chia sẻ dùng `?lang=vi` hoặc `?lang=en`; canonical EN là `/en`. EN chưa xuất bản trả 404 ở API, không dùng bản VI thay thế. Link Portfolio giữ ngôn ngữ.
- Xuất bản **Tất cả** là một transaction; một bản chưa hợp lệ thì không cập nhật bản nào. Một snapshot không chứa bản dịch chưa xuất bản hoặc cài đặt riêng tư.
- **Auto Save** mặc định bật; tắt dừng lượt tự lưu đang chờ. Request đã gửi trước lúc tắt có thể hoàn thành. Nút Lưu nháp/✓ vẫn lưu thủ công. Bấm Lưu cài đặt để thiết bị khác nhận lựa chọn sau khi tải lại.
- Branding dùng chung VI/EN, gồm tên/logo thương hiệu và favicon JPG/PNG/WebP. Lưu cài đặt công khai logo ngay, không cần xuất bản lại CV. Khôi phục lịch sử không đổi cài đặt.
- Logo đơn vị không bắt buộc, đồng kích thước 44×44 trên CV, đặt trái mã/tên; PDF 28×28. Logo nháp chưa từng xuất bản chỉ owner đọc được.
- Xóa từng mốc hoặc Xóa tất cả với nhập `DELETE`. Không thể phục hồi mốc đã xóa trong app; nháp, hai snapshot và cài đặt giữ nguyên. File ảnh không bị tự xóa.
- Mốc lịch sử/JSON chứa cả VI và EN. Khôi phục toàn bộ hai bộ nội dung của mốc vào nháp mới; không xuất bản. Giới hạn mỗi ngôn ngữ 180 KB sau chuẩn hóa, backup 512 KB; JSON không kèm file ảnh.

## 2. Công nghệ và yêu cầu

| Thành phần | Phiên bản đã khóa |
| --- | --- |
| Node.js | 24.x; môi trường kiểm tra 24.22.1. Dùng bản vá 24.x hiện hành; bộ test UI cần ít nhất 24.15 |
| Next.js | 16.4.3, App Router |
| React / React DOM | 19.3.1 |
| Supabase JS | 2.118.0 |
| TypeScript | 5.9.3 |
| PDF | @react-pdf/renderer 4.3.1 + pdf-lib 1.17.1; layout 4.4.3 và render 4.3.1 được khóa bằng overrides |
| QR / ảnh | qrcode 1.5.4, sharp 0.35.5; next/og |
| Font tiêu đề | Noto Serif / Fontsource 5.3.0, asset tự phục vụ |
| Database / Auth / Files | Supabase Postgres, Supabase Auth, private Storage |
| Hosting đích | Vercel, Node.js 24.x |

`package-lock.json` được tạo bằng npm thật. Dùng `npm ci` để cài lại đúng dependency đã kiểm tra. Không cần Python hoặc cài SQL Server khi deploy/chạy app. PGlite chỉ là dependency phát triển để kiểm thử. Các overrides PDF giữ bộ ngắt trang đã kiểm tra; không bỏ hoặc nâng đồng loạt mà chưa kiểm tra lại PDF dài và footer.

Tài liệu: [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase RLS](https://supabase.com/docs/guides/database/secure-data), [Node.js trên Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## 3. Thiết lập Supabase một lần

### 3.1 Tạo project và chạy migration

1. Vào Supabase Dashboard, tạo project dùng cho CV.
2. Mở **SQL Editor → New query**.
3. Với project mới: chạy lần lượt 7 file trong `supabase/migrations/` theo số 001 → 007. Đang v1.6 chỉ chạy 007; bản cũ hơn chạy các migration còn thiếu, đúng thứ tự. Không reset Database.
4. Kết quả: tạo các bảng, hàm lưu/xuất bản, RLS và private bucket `cv-assets`. Có thể chạy lại migration này; nó không seed CV hoặc chuyển quyền chủ sở hữu.
5. Không đổi bucket thành public. Migration cho phép khách đọc đúng ảnh đang được snapshot công khai tham chiếu, còn ảnh nháp giữ riêng tư.

Migration 002 nâng cấp editor; 003 thêm lịch sử/khôi phục; 004 thêm khả năng lưu mã đơn vị; 005 thêm layout/title và bảo vệ tiêu đề ẩn; 006 thêm VI/EN, cài đặt, logo và xóa lịch sử có kiểm soát; 007 thêm media App Showcase, lọc app ẩn, kiểm tra bản dịch trong transaction và capability 7. Không xóa/reset nội dung và không đổi owner. Migration không đọc/sửa các bảng có sẵn của app khác. Nên dùng project riêng nếu Boss muốn quản lý CV độc lập.

### 3.2 Tạo và chỉ định tài khoản Boss

1. Mở **Authentication → Users → Add user → Create new user**.
2. Nhập email và mật khẩu của Boss; xác nhận email/Auto Confirm cho tài khoản do Boss chủ động tạo.
3. Sao chép **User UID** của user vừa tạo. Đây là UUID, không phải email.
4. Mở `supabase/setup-owner.sql`, thay đúng chuỗi `REPLACE_WITH_AUTH_USER_UUID` bằng UID vừa lấy, giữ nguyên dấu nháy đơn.
5. Chạy toàn bộ script đã thay trong SQL Editor.
6. Trong phần cấu hình Auth, giữ provider Email bật và tắt **Allow new users to sign up**. Tên menu có thể thay đổi theo Dashboard; tìm tùy chọn cho phép người dùng mới đăng ký.

Không có public signup trong app. Không sử dụng cơ chế “ai đăng ký đầu tiên sẽ là admin”. Một tài khoản đăng nhập khác vẫn không có quyền đọc nháp hoặc chỉnh sửa. Script setup-owner sẽ báo lỗi nếu CV đã thuộc UID khác để tránh chuyển quyền ngoài ý muốn.

### 3.3 Lấy hai thông số kết nối

Mở **Connect / API Keys** của project và lấy Project URL cùng Publishable key. Nếu project cũ chỉ có legacy `anon` key, có thể điền vào biến publishable-key bên dưới. **Không dùng `service_role`, secret key hoặc database password.**

| Biến | Giá trị | Nơi sử dụng |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project, ví dụ `https://YOUR_PROJECT.supabase.co` | Trình duyệt và server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key hoặc legacy anon key | Trình duyệt và server; quyền dữ liệu do JWT + RLS quyết định |

Hai biến này được phép có trong client bundle. Không có biến mật khẩu chủ sở hữu; Supabase Auth quản lý mật khẩu. App dùng access token qua Authorization header cho API; API xác minh user với Auth và kiểm tra quyền owner trước khi đọc/ghi nháp. Không dùng cookie session không xác minh để cấp quyền.

## 4. GitHub → Vercel: sử dụng online

### 4.1 Đưa source lên GitHub

Giải nén ZIP, mở thư mục `Maison-CV-v1.7.0` có `package.json`.

Với repository mới, mở Terminal/PowerShell ở chính thư mục đó:

```sh
git init
git add .
git commit -m "Maison CV v1.7.0 - App Showcase"
git branch -M main
git remote add origin https://github.com/YOUR_OWNER/YOUR_REPOSITORY.git
git push -u origin main
```

Thay URL bằng repository thật của Boss. Không chạy `git init`/`remote add` lần nữa trong repo đã tồn tại. `.gitignore` loại `.env`, `.next`, `node_modules`, log và cấu hình Vercel cục bộ.

Với repository đã có source trước đó: clone/fetch repo hiện tại, tích hợp source v1.7.0 vào đúng thư mục, giữ `.git` và `.env.local` cá nhân. Kiểm tra `git status`, commit rồi push. Nếu báo `fetch first`, chạy fetch/pull và xử lý khác biệt, không force push để ghi đè lịch sử.

```sh
git pull --rebase origin main
git status
git add .
git commit -m "Upgrade Maison CV to v1.7.0"
git push origin main
```

Nếu phát sinh conflict, giải quyết nội dung trước khi tiếp tục. Nếu branch không phải `main`, dùng branch thực tế.

### 4.2 Tạo project Vercel

1. Vercel → **Add New → Project → Import Git Repository**.
2. Chọn repository/branch đã push.
3. Framework: **Next.js**.
4. **Root Directory:** thư mục chứa `package.json`. Nếu đã push nội dung thư mục source vào root repo thì để mặc định. Nếu repo chứa nguyên thư mục `Maison-CV-v1.7.0`, chọn thư mục đó.
5. Node.js: **24.x**. `engines.node` trong package.json cũng đã đặt 24.x.
6. Install Command: `npm ci`.
7. Build Command: `npm run build`.
8. Output Directory: để mặc định của Next.js. Không đặt `out` và không bật static export.
9. Thêm hai biến môi trường ở bảng trên cho Production; thêm cho Preview nếu muốn thử trên deployment preview.
10. Bấm **Deploy** và đợi trạng thái Ready.

Không cần gói trả phí chỉ để cấu hình source. Kiểm tra điều kiện/gói dịch vụ và hạn mức thực tế trên tài khoản của Boss; bản này không tự mở gói trả phí.

Có thể kết nối Supabase bằng [Vercel Marketplace](https://supabase.com/docs/guides/integrations/vercel-marketplace) để hỗ trợ đồng bộ biến môi trường. Vẫn cần chạy migration, chỉ định owner và kiểm tra cấu hình Auth.

### 4.3 Khai báo tên miền cho Auth

Khi có URL deployment, ví dụ `https://YOUR_CV.vercel.app`:

1. Supabase → **Authentication → URL Configuration**.
2. Site URL: URL thật của CV.
3. Redirect URLs: thêm chính xác `https://YOUR_CV.vercel.app/auth/callback`.
4. Nếu dùng tên miền riêng, thêm callback tương ứng của tên miền đó.
5. Nếu thử khôi phục trên preview, thêm URL callback của preview được phép. Tránh wildcard rộng trên production.
6. Luồng khôi phục mật khẩu dùng PKCE: yêu cầu email và mở liên kết trên cùng trình duyệt/thiết bị. Callback đổi code lấy session rồi chuyển đến màn hình đặt mật khẩu mới.
7. Cấu hình kênh gửi email/SMTP phù hợp cho project khi cần gửi khôi phục production. Nếu gửi email lỗi, kiểm tra cấu hình Email/SMTP và hạn mức trong Supabase.

Nếu thay các biến `NEXT_PUBLIC_*` sau khi build, **Redeploy** để client bundle nhận giá trị mới. Cập nhật nội dung CV sau này không cần redeploy.

## 5. Nhập CV và sử dụng lần đầu

1. Mở `/admin`. Nếu chưa cấu hình, app hướng dẫn thiết lập; trang `/` không tự công khai JSON nguồn.
2. Đăng nhập tài khoản đã được chỉ định làm owner.
3. Nếu database chưa có CV, editor nạp dữ liệu nền từ `src/data/profile.json`. Đây là dữ liệu mẫu ban đầu của v1.0.0, chưa phải bản đã lưu cloud.
4. Thay các nội dung trong `[ ]` bằng thông tin thật hoặc xóa mục chưa dùng. Không tự thêm thành tích chưa xác nhận.
5. Nhập email/số điện thoại liên hệ; thay ảnh nếu muốn; trường site URL dùng URL deployment thật cho sitemap.
6. Bấm **Lưu nháp**. Chỉ sau thông báo thành công dữ liệu mới được giữ online.
7. Đăng nhập trên điện thoại, kiểm tra bản nháp giống trên PC.
8. **Xem trước → Xuất bản → Xuất bản CV**. App kiểm tra họ tên, chức danh, phương thức liên hệ, tên các mục và nội dung mẫu còn sót.
9. Mở `/` bằng trình duyệt chưa đăng nhập để kiểm tra khách thấy đúng CV.
10. Thử nút **Mở Portfolio**, trang chờ và nút quay lại CV; thử **In / Lưu PDF**.

Các lần tự lưu và lưu thủ công chỉ sửa bản nháp. Khi gõ tiếng Việt bằng bộ gõ tổ hợp, app đợi kết thúc tổ hợp ký tự rồi mới tự lưu. Muốn khách thấy thay đổi phải xuất bản. Build/deploy hoặc đăng nhập lại không seed lại và không ghi đè CV cloud.

**Khi có xung đột:** giữ bản đang soạn thành JSON nếu cần đối chiếu, sau đó chủ động tải bản mới nhất. Sau khi tải lại bản online mới nhất, mở Lịch sử → Nhập JSON để đối chiếu và chủ động nhập bản đã giữ nếu phù hợp. Không tự động ghi đè bản mới từ thiết bị khác.

**Bố cục và ẩn/hiện:** chọn Bố cục CV. Maison nguyên bản giữ phong cách khung đầu/hai cột, đồng thời cho chuyển block giữa vùng bằng tay nắm trên CV. Lưới linh hoạt có thứ tự riêng và độ rộng 1–12. Thứ tự danh sách cấu hình và menu trái trùng thứ tự đọc trái sang phải/xuống hàng của grid, không dùng backfill để nhét block sau vào khoảng trống phía trước. Ở mobile grid thành một cột; desktop giữ tỷ lệ đã khai báo. Tắt block chỉ ẩn; nội dung nháp/history được giữ. Khi xuất bản, cả nội dung lẫn tiêu đề tùy chỉnh của phần ẩn bị loại khỏi snapshot công khai.

**Thao tác trên block:** bấm vùng nội dung/tiêu đề của block; toolbar có ⋮⋮, ↑/↓ và ＋, các dòng có ↑/↓ riêng. Kéo bằng tay nắm để tránh xung đột với chọn chữ/nhập trực tiếp. Có tự cuộn khi kéo sát mép và hủy khi thả ngoài block; dùng các nút lên/xuống nếu thao tác cảm ứng chưa tiện. Bấm vùng trống trong CV hoặc Escape để ẩn thao tác. Xem trước và bản công khai không có toolbar. Với thông tin liên hệ/mục tiêu chỉ có một nội dung, ＋ mở bảng để bổ sung trường/văn bản; không tạo bản sao block.

**Tiêu đề và thời gian:** mỗi bảng nội dung có Tiêu đề block; để rỗng sẽ dùng lại tiêu đề mặc định. Sắp xếp thời gian áp dụng cho học vấn, kinh nghiệm, chứng chỉ, dự án và thời gian triển khai tùy chọn. Kỹ năng không có trường thời gian nên dùng sắp xếp thủ công. Chọn tăng/giảm và mốc bắt đầu/kết thúc rồi bấm Tự động sắp xếp; không tự thay thứ tự chỉ vì mở bảng. Mục thiếu/sai ngày nằm cuối, không đoán ngày từ mô tả. Thao tác đổi thứ tự có thể hoàn tác.

**Mất kết nối:** trạng thái phân biệt rõ chưa lưu online với bản được giữ trên thiết bị. Khi kết nối lại, app tiếp tục lưu nếu không có xung đột. Sau khi mở lại/đăng nhập, chọn Khôi phục bản trên thiết bị hoặc Dùng bản online. Nếu bản cục bộ dựa trên version cũ hơn cloud, app dừng tự lưu và yêu cầu đối chiếu. Bản cục bộ chỉ giữ dữ liệu CV dạng JSON, không giữ file upload chưa tải lên. Bản cục bộ nằm ở trình duyệt này, không tự đồng bộ sang thiết bị khác; được xóa khi đã lưu thành công hoặc đăng xuất chủ động bỏ thay đổi.

**Hoàn tác/làm lại:** hai nút ↶/↷ trên thanh công cụ, tối đa 50 mốc trong phiên. Nội dung sau hoàn tác vẫn được tự lưu nháp; không tự khôi phục bản công khai. Tải lại trang bắt đầu một phiên hoàn tác mới.

**Đổi/bỏ ảnh:** ảnh mới là file riêng. Bỏ ảnh chỉ gỡ khỏi nháp, không xóa file đang được nháp, bản công khai hoặc mốc lịch sử tham chiếu. Ảnh nháp mới chưa công khai cho đến khi xuất bản. Bản này chưa có công cụ dọn file không còn tham chiếu.

## Lịch sử, khôi phục và JSON

**Tạo và xem mốc:** lưu nháp xong, mở **Lịch sử ↶** trên thanh công cụ. Nhập tên/ghi chú rồi chọn **Tạo mốc từ nháp đã lưu**. Mốc giữ toàn bộ CV, cả phần ẩn; tạo mốc thủ công không tăng version nháp. Khi xuất bản, app tự lưu toàn bộ nháp thành mốc riêng tư, tối đa một mốc xuất bản cho mỗi version. Danh sách tải 20 mốc/lượt; dùng Tải thêm mốc để mở các mốc cũ.

**So sánh:** chọn mốc, xem tab Khác biệt hoặc Xem CV. Chọn So sánh với để đối chiếu với nháp hiện tại hoặc mốc khác đã tải trong danh sách. Khác biệt được nhóm theo thông tin đầu trang, liên hệ, mục tiêu, danh sách nội dung và bố cục; đây là so sánh nội dung, không phải đánh dấu từng ký tự.

**Khôi phục:** trước tiên xử lý bản khôi phục cục bộ/xung đột và lưu các thay đổi đang soạn. Chọn Khôi phục mốc vào nháp → đọc xác nhận → Xác nhận thay bản nháp. Trong cùng transaction, hệ thống giữ nháp cũ thành mốc Trước khôi phục, lưu nội dung đã chọn thành version mới và ghi mốc Đã khôi phục. Nếu thiết bị khác đã lưu trước, thao tác bị chặn, không thay nháp. Muốn quay lại, khôi phục mốc Trước khôi phục. CV công khai và nút Portfolio vẫn giữ bản đã xuất bản; Boss xem lại rồi chủ động xuất bản khi sẵn sàng.

**Xuất JSON:** xuất nháp đã lưu hoặc mốc đang xem. File chứa toàn bộ nội dung, bố cục, cả phần ẩn và đường dẫn ảnh; không chứa mật khẩu, token Auth, khóa kết nối hoặc file ảnh. JSON là bản sao nội dung, không phải bản backup toàn bộ project Supabase.

**Nhập JSON:** chọn Lịch sử → Nhập JSON → Chọn file, tối đa 512 KB. Hỗ trợ envelope Maison `formatVersion: 1` và JSON hồ sơ cũ hợp lệ; chuẩn hóa về schema CV 6. File lỗi, liên kết không an toàn hoặc schema tương lai bị từ chối. Xem cảnh báo và khác biệt trước khi xác nhận. App giữ mốc Trước nhập và Đã nhập trong cùng transaction. Không tự xuất bản. Ảnh có đường dẫn thuộc owner/project nguồn chỉ dùng lại khi tồn tại và được truy cập trong project hiện tại; ảnh khác owner hoặc không còn sẽ bỏ đường dẫn và hiện cảnh báo để Boss chọn lại. Nếu ảnh/nội dung thay đổi sau lúc xem trước, cần chọn file lại để xác nhận bản mới.

**Sau nâng cấp:** chỉ có thể giữ nháp và bản công khai còn tồn tại lúc chạy 003; không tái tạo các lần lưu trước đó. Mốc công khai trước nâng cấp chỉ có nội dung đã công khai, không thể phục dựng phần từng bị ẩn. Mốc nháp trước nâng cấp giữ riêng nội dung nháp đầy đủ. Lịch sử không có chức năng sửa/xóa mốc hoặc tự dọn dung lượng trong phiên bản này. Ảnh được mốc tham chiếu giữ riêng tư; khách vẫn chỉ được xem ảnh của bản công khai hiện hành.

Khi đang mở Lịch sử, editor nền và autosave tạm dừng; nút Lưu nháp hiện tại vẫn dùng được nếu chưa có xung đột. Khóa bản khôi phục cục bộ v1.2 được giữ nguyên để nhận diện bản chưa lưu cũ.

## 6. PDF A4 & Professional Sharing

### PDF tự động

- Ở CV công khai, chọn **Tải CV PDF**. Endpoint `/api/cv/pdf` chỉ đọc `cv_publications`, không đọc nháp và không nhận JSON profile từ khách. Có thể dùng trực tiếp liên kết này để tải. Nếu file lỗi, bộ nút chia sẻ phía cuối CV báo lỗi và cho thử lại; `/print` vẫn là phương án in dự phòng.
- PDF dùng bản A4 sáng riêng cho gửi ứng tuyển: toàn bộ nội dung đang công khai, theo thứ tự các khối/cột, chuyển sang luồng một cột để tự ngắt nhiều trang. PDF tự động giữ thứ tự/tiêu đề/nội dung của bố cục đã chọn; tỷ lệ 12 phần áp dụng cho web và bản in trình duyệt, không thay mẫu PDF A4 một cột đã có. Không phải ảnh chụp hoặc bản sao pixel của giao diện web màu tối. Nội dung mục triển khai được mở đầy đủ trong PDF; không ẩn dưới accordion.
- Font Noto Sans/Serif TTF được nhúng, chữ tiếng Việt có thể chọn/sao chép. Có liên kết email/điện thoại/website/dự án; nếu đã khai báo URL CV thì cuối PDF có QR, liên kết CV và Mở Portfolio.
- Tên file dạng `CV-Vo-duc-Huy-v17-VI.pdf` (hoặc `-EN.pdf`); `v17` là version nội dung đã xuất bản, khác version app v1.7.0. Số trang đánh sau khi dàn nội dung, tránh ảnh hưởng ngắt trang.
- Không tự tạo PDF nháp. Trong editor, **In bản nháp** vẫn in qua trình duyệt. **PDF & Chia sẻ CV** mở phần chia sẻ của bản đã xuất bản, không tự lưu/publish nháp.
- PDF được tạo trong Node.js Function, không cần Chromium. Cache trong bộ nhớ tiến trình tối đa 4 bản theo hash toàn bộ nội dung + version; mỗi request vẫn đọc snapshot hiện hành trước. Không cache response trên CDN/client để tránh tiếp tục phục vụ nội dung vừa bị ẩn. Cache không phải lưu trữ file lâu dài.
- File ảnh được resize trước khi nhúng; giới hạn PDF 4.000.000 byte để tránh trả file quá giới hạn response. Khi lỗi/tài nguyên quá lớn, thử lại hoặc dùng in trình duyệt. Không thêm dữ liệu vào Supabase khi tải PDF.

### Chia sẻ, QR và ảnh xem trước

- **Sao chép link** chỉ sao chép URL công khai gốc, không kèm `/admin`, query hoặc token. Nếu clipboard bị chặn, app hiện ô liên kết để sao chép thủ công.
- **Chia sẻ** mở Web Share trên trình duyệt có hỗ trợ; nơi không hỗ trợ dùng copy link. Việc gửi cuối cùng do Boss chọn trong hộp thoại của thiết bị. App không tự gửi cho người khác.
- QR PNG mã hóa URL website CV đã xuất bản; chưa khai báo URL thì ẩn QR và nhắc chủ sở hữu cập nhật. Link copy có thể dùng origin trình duyệt khi chưa khai báo, nhưng QR/canonical/OG image cần URL production đã lưu và xuất bản.
- `/api/share/image` tạo PNG 1200×630 từ họ tên/chức danh/giới thiệu/ảnh công khai, không dùng nội dung nháp. Metadata trang CV trỏ đến ảnh này kèm version. Không tự phát sinh ảnh từ AI.
- Các nền tảng mạng xã hội có thể cache ảnh/title cũ; xuất bản lại tạo URL ảnh version mới, nhưng thời gian cập nhật ở ứng dụng bên ngoài do nền tảng đó quyết định. Chưa xác minh preview Zalo/Facebook thật trong lần bàn giao.
- QR không chứa nội dung CV; khi Boss cập nhật CV và xuất bản, người quét vẫn mở địa chỉ cũ để xem phiên bản hiện hành. Đổi tên miền thì cần cập nhật URL, xuất bản lại và tải QR mới.

### In qua trình duyệt

`/print` có cả tải PDF tự động và nút In / Lưu PDF. Chọn A4; tắt Headers and footers nếu không muốn in URL/ngày giờ. Bản in trình duyệt có thể khác nhẹ giữa Chrome/Edge/Safari. `/print` luôn đọc bản đã xuất bản; preview offline không có cloud PDF.

## 7. Chạy local (tùy chọn cho phát triển)

Không bắt buộc bước này để dùng production. Cần Node.js 24.x và npm; mở terminal trong thư mục có `package.json`.

```sh
npm ci
```

Sao chép `.env.example` thành `.env.local`, điền hai giá trị thật. Trên PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Hoặc macOS/Linux:

```sh
cp .env.example .env.local
```

```sh
npm run dev
```

Mở `http://localhost:3000`, `/admin`. Nếu thử reset password local, thêm `http://localhost:3000/auth/callback` trong Redirect URLs. Dev script nhận cả cờ `--host`/`--port` cho môi trường preview. Dev và production build dùng Webpack để tránh lỗi nội bộ Turbopack gặp khi kiểm tra build lại.

Để chạy bản production local sau khi build:

```sh
npm run build
npm start
```

## 8. Kiểm tra

```sh
npm test
npm run typecheck
npm run check
npm run build
```

- `npm test`: test renderer/validation/preview; chạy migration thật trên Postgres nhúng PGlite với Auth/Storage schema tối thiểu; test React UI với Auth/API được mock. Test không truy cập tài khoản Supabase thật.
- `npm run test:cloud`: riêng phần migration, RLS, chống ghi đè và snapshot/ảnh công khai trên PGlite. Tên này không có nghĩa đã kiểm tra cloud của Boss.
- `npm run test:ui`: luồng React editor/autosave/lịch sử, xác nhận khôi phục/import và API route import/paging/409 với API/Auth/Storage được mock.
- `npm run check`: kiểm tra cấu trúc JSON nền. Các dòng PENDING nhắc nội dung chưa điền, không phải lỗi lưu cloud.
- `npm run check:release`: đọc Supabase được cấu hình, kiểm tra bản công khai và quyền khách đối với nháp; cần đã thiết lập và xuất bản CV. Không dùng JSON nguồn để kết luận CV online đã hoàn thiện.

Sau deploy, có thể chạy smoke check qua URL thật từ PowerShell:

```powershell
$env:SITE_URL="https://YOUR_CV.vercel.app"
node scripts/smoke.mjs
```

Hoặc macOS/Linux:

```sh
SITE_URL=https://YOUR_CV.vercel.app node scripts/smoke.mjs
```

Đây là kiểm tra HTTP; vẫn cần kiểm tra đăng nhập, ảnh, lưu nháp, publish, reset email, PDF và thiết bị thật. Không coi build local là deploy đã thành công. Xem `VERIFICATION.md` cho phạm vi đã xác minh ở lần bàn giao.

## 9. Dữ liệu và bảo vệ truy cập

| Thành phần | Vai trò |
| --- | --- |
| `cv_owner` | Một User UID chủ sở hữu, do SQL Editor chỉ định |
| `cv_documents` | Một CV nháp, version và thời gian lưu; không có quyền khách |
| `cv_publications` | Snapshot độc lập cho VI và EN, khóa `(id, language)` |
| `cv_revisions` | Mốc riêng tư chứa toàn bộ VI/EN; tạo/khôi phục/xóa qua RPC owner |
| `cv_preferences` | Auto Save và branding, version riêng; khách chỉ đọc branding qua RPC whitelist |
| `cv_migration_log` | Đánh dấu migration đã giữ baseline, không cấp quyền khách hoặc trình duyệt |
| `cv_assets` | Metadata file; chủ sở hữu được đọc/ghi metadata của mình |
| `cv-assets` Storage bucket | Private; owner xem file của mình; khách chỉ đọc đúng ảnh được bản công khai hiện hành tham chiếu |
| `save_cv_draft` | Lưu có kiểm tra expected version; khởi tạo chỉ khi chưa có document |
| `publish_cv` | Khóa/kiểm tra version rồi xuất bản snapshot, giữ mốc riêng tư đầy đủ rồi loại nội dung ẩn khỏi public snapshot trong cùng transaction |
| `create_cv_checkpoint` | Khóa nháp, kiểm tra version, tạo mốc thủ công bất biến |
| `apply_cv_recovery` | Giữ trước/sau khôi phục hoặc nhập JSON và lưu nháp mới atomically; không sửa publication |
| `cv_schema_version` | Trả capability 7 cho owner; API yêu cầu migration 007. Schema nội dung CV là 6 |

API owner xác thực token và gọi `cv_schema_version` (hàm này kiểm tra `is_cv_owner`). Quyền SELECT/INSERT/UPDATE/EXECUTE của database và Storage cũng được giới hạn, không dựa vào việc ẩn nút ở UI. Các hàm đặc quyền đặt search_path rỗng và tự kiểm tra owner. App không sử dụng service-role key ở runtime. Nội dung được kiểm tra và escape trước khi render; không nhận raw HTML để xuất bản.

Những ảnh đã từng công khai có thể đã được người xem tải xuống; việc thay ảnh chỉ thay quyền truy cập hiện tại của app. Trang quản trị không nằm trong sitemap và noindex, nhưng quyền dữ liệu vẫn do Auth/RLS quyết định.

## 10. Nâng cấp, sao lưu và quay lại

- Không reset database để cập nhật source. Giữ hai biến môi trường, owner và dữ liệu Supabase hiện có.
- Trước migration tương lai, sao lưu nội dung của `cv_documents`, `cv_publications`, metadata và file Storage qua công cụ export/backup phù hợp của project. Mốc lịch sử giữ nội dung trong cùng database, không thay thế backup độc lập của database và file Storage. JSON xuất ra không bao gồm file ảnh.
- Sau 007, API cũ không tương thích capability mới; không hạ capability hoặc dùng editor cũ. Cần sửa/deploy bản vá v1.7 tương thích. Public snapshots vẫn được giữ riêng. Xem UPGRADE-v1.7.0.md.
- Migration lần này chỉ thêm các đối tượng của Maison CV. Các bản sau cần migration tăng dần và hướng dẫn riêng, không thay SQL bằng thao tác xóa bảng.
- Khi đổi tên miền, cập nhật Auth callback, site URL trong editor và xuất bản lại.

## Font tiếng Việt

Font normal/italic được đóng gói ở `public/fonts/`, kèm giấy phép OFL. CSS khai báo đúng Unicode range Latin, Latin mở rộng và Vietnamese để dấu không rơi sang font dự phòng khác. Mã nguồn, dữ liệu nhập và renderer dùng UTF-8/NFC. Không sửa dấu bằng cách xóa khoảng trắng giữa các từ. Font cũng dùng trên CV công khai, editor, trang chờ và bản in. Fontsource là nguồn asset phát triển, không phải dịch vụ font phải kết nối lúc chạy.

## 11. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `/admin` hiển thị hướng dẫn kết nối | Thêm đúng hai biến môi trường, kiểm tra URL/key và redeploy |
| Đăng nhập đúng nhưng báo chưa có quyền owner | So sánh User UID trong Authentication với `cv_owner.user_id`, chạy setup-owner cho đúng user |
| Báo chưa hoàn tất schema/quyền database | Project mới chạy 001 → 002 → 003 → 004 → 005 → 006 → 007; đang v1.6 chỉ chạy 007; bản cũ chạy lần lượt migration còn thiếu. Kiểm tra error SQL; không tự tắt RLS |
| `/` vẫn là trang đang hoàn thiện | Lưu nháp chưa đủ; hoàn thiện dữ liệu và bấm Xuất bản |
| Không xuất bản được vì nội dung mẫu | Thay nội dung `[ ]`, điền tên mục đang trống hoặc xóa mục chưa dùng |
| Lưu báo thiết bị khác đã cập nhật | Giữ bản đang soạn để đối chiếu, tải bản mới nhất, chỉnh lại rồi lưu |
| Lỗi EN thiếu description hoặc mục tương ứng | Bấm Sửa để mở đúng ô; điền Vai trò / Phạm vi triển khai hoặc trường đang thiếu. Nếu chưa có mục EN, dùng Bổ sung mục/app từ VI. Lưu nháp rồi xuất bản EN hoặc Tất cả |
| Ảnh app chưa hiện ở EN công khai | Lưu ảnh chỉ cập nhật nháp; xuất bản riêng EN hoặc Tất cả sau khi hoàn thiện bản dịch |
| Thay ảnh thất bại | File đúng JPG/PNG/WebP, dưới 3 MB; kiểm tra bucket `cv-assets`, migration và owner |
| Ảnh nháp không mở được ở cửa sổ khách | Đây là quyền riêng tư dự kiến; xuất bản trước để khách xem |
| Đổi cấu hình env nhưng app vẫn dùng cấu hình cũ | Tạo deployment mới; biến client được nhúng lúc build |
| Không nhận email khôi phục | Kiểm tra Auth Email/SMTP, giới hạn gửi, hộp thư spam và Redirect URLs |
| Link khôi phục hết hạn/trình duyệt khác | Yêu cầu email mới và mở trên cùng trình duyệt đã yêu cầu |
| Build không tìm thấy package.json | Sửa Root Directory trên Vercel cho đúng thư mục source |
| `npm ci` báo lỗi Node engine | Dùng Node.js 24.x hiện hành và package-lock.json đi kèm |
| PDF bị ngắt trang chưa đẹp | Kiểm tra A4, tỷ lệ in và nội dung; Tải CV PDF tự động để dùng mẫu A4 có ngắt trang |

## 12. Cấu trúc và phát triển tiếp

- `src/app/`: CV công khai, admin, print, Portfolio chờ, callback và API.
- `src/components/HistoryPanel.tsx`: lịch sử, so sánh, xem CV, nhập/xuất JSON và xác nhận khôi phục.
- `src/components/Editor.tsx`: editor và luồng Auth phía trình duyệt; `SortHandle.tsx`: sắp xếp bằng chuột/cảm ứng và nút lên/xuống.
- `src/lib/layout.mjs`, `chronology.mjs`, `use-canvas-drag.ts`: hai bố cục, sắp xếp ngày và kéo block trực tiếp.
- `src/lib/pdf-document.tsx`, `share-assets.ts`, `sharing.mjs`: mẫu PDF, ảnh/QR và metadata/link chia sẻ.
- `src/lib/`: renderer Maison, layout, validation, hook autosave/khôi phục, client Supabase, API guard và đọc snapshot công khai.
- `src/data/profile.json`: dữ liệu nền một lần; không phải nguồn dữ liệu live sau khi lưu online.
- `supabase/`: migration và script chỉ định owner.
- `tests/`: kiểm tra nội dung, quyền dữ liệu và luồng UI.
- `preview/`: bản HTML/CSS offline để xem thiết kế, không có đăng nhập/lưu cloud. Tạo lại bằng `node scripts/export-preview.mjs`; không upload thư mục này thay cho toàn bộ app Next.js.

Phiên bản tiếp theo: **v1.8.0 — CV Presentation & PDF**: tinh chỉnh Maison/Grid, mẫu A4 chuyên nghiệp và bản đơn giản phù hợp ATS, kiểm soát ngắt trang/ảnh/nội dung dài theo VI/EN. Sau đó v1.9 hoàn thiện CV để chia sẻ, rồi **v2.0.0 — Portfolio**. Gửi ZIP mới nhất để nâng cấp tiếp; xem ROADMAP.md.
