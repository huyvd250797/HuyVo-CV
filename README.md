# Maison CV v1.3.0 — History & Recovery

CV online theo thiết kế Maison Espresso, dành cho một chủ sở hữu. Có trình chỉnh sửa trên website, lưu nháp vào Supabase, xuất bản riêng và xem trên nhiều thiết bị. Vercel chạy website; Supabase lưu nội dung, tài khoản và ảnh.

**Dùng website production hoàn toàn online, không cần mở localhost hay giữ PC chạy.** Trước lần dùng đầu cần cấu hình Supabase và Vercel theo phần dưới. ZIP không chứa database đang chạy, tài khoản thật hoặc secret của Boss.


## Nâng cấp nhanh từ v1.2.0

1. Giữ database, owner, ảnh và hai biến môi trường Vercel hiện tại. Không reset hoặc chạy setup-owner lại.
2. Mở Supabase SQL Editor, chạy toàn bộ **`supabase/migrations/202610310003_history_recovery.sql`**. Migration giữ lại nháp và bản công khai hiện có làm mốc ban đầu; chạy lại không nhân đôi các mốc này.
3. Đưa source v1.3.0 vào đúng Root Directory của repository, deploy Vercel rồi tải lại các tab `/admin` cũ.
4. Mở **Lịch sử ↶**, tạo mốc thủ công, thử so sánh và khôi phục vào nháp. CV công khai chỉ thay đổi sau khi Boss chủ động xuất bản.

Project mới: chạy **001 → 002 → 003 → setup-owner.sql**. Đang ở v1.1: chạy **002 → 003**. Không chạy migration cũ sau migration mới. Không cần thêm biến môi trường. Xem **`UPGRADE-v1.3.0.md`** để nâng cấp và nghiệm thu.

## 1. Chức năng của phiên bản này

- Đăng nhập tài khoản chủ sở hữu, đăng xuất riêng thiết bị hiện tại; hiện/ẩn mật khẩu và khôi phục qua email.
- Gõ trực tiếp vào họ tên, chức danh, giới thiệu và mục tiêu trên CV. Bấm vào các phần khác để mở bảng chỉnh sửa tương ứng.
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

Autosave chỉ lưu **nháp**, không xuất bản. Lịch sử cloud là các mốc quan trọng, không ghi lại từng lần gõ/tự lưu. Hoàn tác 50 mốc vẫn chỉ trong phiên. Thiết bị khác cần mở/tải lại trang để đọc bản mới; chưa có cộng tác realtime.

## 2. Công nghệ và yêu cầu

| Thành phần | Phiên bản đã khóa |
| --- | --- |
| Node.js | 24.x; môi trường kiểm tra 24.22.1. Dùng bản vá 24.x hiện hành; bộ test UI cần ít nhất 24.15 |
| Next.js | 16.4.3, App Router |
| React / React DOM | 19.3.1 |
| Supabase JS | 2.118.0 |
| TypeScript | 5.9.3 |
| Font tiêu đề | Noto Serif / Fontsource 5.3.0, asset tự phục vụ |
| Database / Auth / Files | Supabase Postgres, Supabase Auth, private Storage |
| Hosting đích | Vercel, Node.js 24.x |

`package-lock.json` được tạo bằng npm thật. Dùng `npm ci` để cài lại đúng dependency đã kiểm tra. Không cần Python hoặc cài SQL Server.

Tài liệu: [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase RLS](https://supabase.com/docs/guides/database/secure-data), [Node.js trên Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## 3. Thiết lập Supabase một lần

### 3.1 Tạo project và chạy migration

1. Vào Supabase Dashboard, tạo project dùng cho CV.
2. Mở **SQL Editor → New query**.
3. Với project mới: mở `supabase/migrations/202610310001_cv_cloud.sql` trong source, sao chép toàn bộ và chạy, sau đó chạy `supabase/migrations/202610310002_flexible_editor.sql`, cuối cùng `supabase/migrations/202610310003_history_recovery.sql`. Đã v1.2 chỉ chạy 003; đã v1.1 chạy 002 rồi 003.
4. Kết quả: tạo các bảng, hàm lưu/xuất bản, RLS và private bucket `cv-assets`. Có thể chạy lại migration này; nó không seed CV hoặc chuyển quyền chủ sở hữu.
5. Không đổi bucket thành public. Migration cho phép khách đọc đúng ảnh đang được snapshot công khai tham chiếu, còn ảnh nháp giữ riêng tư.

Migration 002 nâng cấp editor; 003 thêm bảng lịch sử, hàm tạo mốc/khôi phục, nâng quyền giữ ảnh và lưu mốc khi xuất bản. Không xóa/reset nội dung và không đổi owner. Migration không đọc/sửa các bảng có sẵn của app khác. Nên dùng project riêng nếu Boss muốn quản lý CV độc lập.

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

Giải nén ZIP, mở thư mục `Maison-CV-v1.3.0` có `package.json`.

Với repository mới, mở Terminal/PowerShell ở chính thư mục đó:

```sh
git init
git add .
git commit -m "Maison CV v1.3.0 - History and Recovery"
git branch -M main
git remote add origin https://github.com/YOUR_OWNER/YOUR_REPOSITORY.git
git push -u origin main
```

Thay URL bằng repository thật của Boss. Không chạy `git init`/`remote add` lần nữa trong repo đã tồn tại. `.gitignore` loại `.env`, `.next`, `node_modules`, log và cấu hình Vercel cục bộ.

Với repository đã có source trước đó: clone/fetch repo hiện tại, tích hợp source v1.3.0 vào đúng thư mục, giữ `.git` và `.env.local` cá nhân. Kiểm tra `git status`, commit rồi push. Nếu báo `fetch first`, chạy fetch/pull và xử lý khác biệt, không force push để ghi đè lịch sử.

```sh
git pull --rebase origin main
git status
git add .
git commit -m "Upgrade Maison CV to v1.3.0"
git push origin main
```

Nếu phát sinh conflict, giải quyết nội dung trước khi tiếp tục. Nếu branch không phải `main`, dùng branch thực tế.

### 4.2 Tạo project Vercel

1. Vercel → **Add New → Project → Import Git Repository**.
2. Chọn repository/branch đã push.
3. Framework: **Next.js**.
4. **Root Directory:** thư mục chứa `package.json`. Nếu đã push nội dung thư mục source vào root repo thì để mặc định. Nếu repo chứa nguyên thư mục `Maison-CV-v1.3.0`, chọn thư mục đó.
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

**Bố cục và ẩn/hiện:** chọn Bố cục CV. Kéo tay nắm ⋮⋮ hoặc dùng ↑/↓; giữ các nhóm khối đầu/cột trái/cột phải của Maison. Bỏ chọn một phần để ẩn; thông tin đầu trang và nút Mở Portfolio luôn giữ. Các mục lặp trong từng phần cũng có tay nắm và nút sắp xếp. Mục ẩn được giữ đầy đủ trong nháp; khi xuất bản lại, nội dung mục đó bị loại khỏi snapshot công khai, không chỉ ẩn bằng CSS. Trước khi xuất bản lại, khách vẫn thấy bản cũ.

**Mất kết nối:** trạng thái phân biệt rõ chưa lưu online với bản được giữ trên thiết bị. Khi kết nối lại, app tiếp tục lưu nếu không có xung đột. Sau khi mở lại/đăng nhập, chọn Khôi phục bản trên thiết bị hoặc Dùng bản online. Nếu bản cục bộ dựa trên version cũ hơn cloud, app dừng tự lưu và yêu cầu đối chiếu. Bản cục bộ chỉ giữ dữ liệu CV dạng JSON, không giữ file upload chưa tải lên. Bản cục bộ nằm ở trình duyệt này, không tự đồng bộ sang thiết bị khác; được xóa khi đã lưu thành công hoặc đăng xuất chủ động bỏ thay đổi.

**Hoàn tác/làm lại:** hai nút ↶/↷ trên thanh công cụ, tối đa 50 mốc trong phiên. Nội dung sau hoàn tác vẫn được tự lưu nháp; không tự khôi phục bản công khai. Tải lại trang bắt đầu một phiên hoàn tác mới.

**Đổi/bỏ ảnh:** ảnh mới là file riêng. Bỏ ảnh chỉ gỡ khỏi nháp, không xóa file đang được nháp, bản công khai hoặc mốc lịch sử tham chiếu. Ảnh nháp mới chưa công khai cho đến khi xuất bản. Bản này chưa có công cụ dọn file không còn tham chiếu.

## Lịch sử, khôi phục và JSON

**Tạo và xem mốc:** lưu nháp xong, mở **Lịch sử ↶** trên thanh công cụ. Nhập tên/ghi chú rồi chọn **Tạo mốc từ nháp đã lưu**. Mốc giữ toàn bộ CV, cả phần ẩn; tạo mốc thủ công không tăng version nháp. Khi xuất bản, app tự lưu toàn bộ nháp thành mốc riêng tư, tối đa một mốc xuất bản cho mỗi version. Danh sách tải 20 mốc/lượt; dùng Tải thêm mốc để mở các mốc cũ.

**So sánh:** chọn mốc, xem tab Khác biệt hoặc Xem CV. Chọn So sánh với để đối chiếu với nháp hiện tại hoặc mốc khác đã tải trong danh sách. Khác biệt được nhóm theo thông tin đầu trang, liên hệ, mục tiêu, danh sách nội dung và bố cục; đây là so sánh nội dung, không phải đánh dấu từng ký tự.

**Khôi phục:** trước tiên xử lý bản khôi phục cục bộ/xung đột và lưu các thay đổi đang soạn. Chọn Khôi phục mốc vào nháp → đọc xác nhận → Xác nhận thay bản nháp. Trong cùng transaction, hệ thống giữ nháp cũ thành mốc Trước khôi phục, lưu nội dung đã chọn thành version mới và ghi mốc Đã khôi phục. Nếu thiết bị khác đã lưu trước, thao tác bị chặn, không thay nháp. Muốn quay lại, khôi phục mốc Trước khôi phục. CV công khai và nút Portfolio vẫn giữ bản đã xuất bản; Boss xem lại rồi chủ động xuất bản khi sẵn sàng.

**Xuất JSON:** xuất nháp đã lưu hoặc mốc đang xem. File chứa toàn bộ nội dung, bố cục, cả phần ẩn và đường dẫn ảnh; không chứa mật khẩu, token Auth, khóa kết nối hoặc file ảnh. JSON là bản sao nội dung, không phải bản backup toàn bộ project Supabase.

**Nhập JSON:** chọn Lịch sử → Nhập JSON → Chọn file, tối đa 256 KB. Hỗ trợ envelope Maison `formatVersion: 1` và JSON hồ sơ cũ hợp lệ; chuẩn hóa về schema CV 2. File lỗi, liên kết không an toàn hoặc schema tương lai bị từ chối. Xem cảnh báo và khác biệt trước khi xác nhận. App giữ mốc Trước nhập và Đã nhập trong cùng transaction. Không tự xuất bản. Ảnh có đường dẫn thuộc owner/project nguồn chỉ dùng lại khi tồn tại và được truy cập trong project hiện tại; ảnh khác owner hoặc không còn sẽ bỏ đường dẫn và hiện cảnh báo để Boss chọn lại. Nếu ảnh/nội dung thay đổi sau lúc xem trước, cần chọn file lại để xác nhận bản mới.

**Sau nâng cấp:** chỉ có thể giữ nháp và bản công khai còn tồn tại lúc chạy 003; không tái tạo các lần lưu trước đó. Mốc công khai trước nâng cấp chỉ có nội dung đã công khai, không thể phục dựng phần từng bị ẩn. Mốc nháp trước nâng cấp giữ riêng nội dung nháp đầy đủ. Lịch sử không có chức năng sửa/xóa mốc hoặc tự dọn dung lượng trong phiên bản này. Ảnh được mốc tham chiếu giữ riêng tư; khách vẫn chỉ được xem ảnh của bản công khai hiện hành.

Khi đang mở Lịch sử, editor nền và autosave tạm dừng; nút Lưu nháp hiện tại vẫn dùng được nếu chưa có xung đột. Khóa bản khôi phục cục bộ v1.2 được giữ nguyên để nhận diện bản chưa lưu cũ.

## 6. In / lưu PDF

- Tại CV công khai, **In / Lưu PDF** mở `/print`, luôn đọc bản đã xuất bản hiện hành.
- Trong `/print`, bấm **In / Lưu PDF**, chọn máy in hoặc **Save as PDF**. Khổ A4; có thể tắt Headers and footers của trình duyệt nếu không muốn in URL/ngày giờ.
- Trong editor desktop, **In bản nháp** in nội dung đang chỉnh; nó không tự xuất bản.
- PDF qua trình duyệt có thể khác nhẹ giữa Chrome/Edge/Safari; kiểm tra ngắt trang với nội dung thật. Dịch vụ tải PDF tự động được lên kế hoạch ở v1.4.0.
- Đã bỏ `public/cv.pdf` preview cũ để tránh tải nhầm nội dung không còn khớp.

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
| `cv_publications` | Một snapshot công khai, tách khỏi nháp |
| `cv_revisions` | Lịch sử riêng tư, owner chỉ đọc; tạo mốc/khôi phục qua RPC có kiểm tra version |
| `cv_migration_log` | Đánh dấu migration đã giữ baseline, không cấp quyền khách hoặc trình duyệt |
| `cv_assets` | Metadata file; chủ sở hữu được đọc/ghi metadata của mình |
| `cv-assets` Storage bucket | Private; owner xem file của mình; khách chỉ đọc đúng ảnh được bản công khai hiện hành tham chiếu |
| `save_cv_draft` | Lưu có kiểm tra expected version; khởi tạo chỉ khi chưa có document |
| `publish_cv` | Khóa/kiểm tra version rồi xuất bản snapshot, giữ mốc riêng tư đầy đủ rồi loại nội dung ẩn khỏi public snapshot trong cùng transaction |
| `create_cv_checkpoint` | Khóa nháp, kiểm tra version, tạo mốc thủ công bất biến |
| `apply_cv_recovery` | Giữ trước/sau khôi phục hoặc nhập JSON và lưu nháp mới atomically; không sửa publication |
| `cv_schema_version` | Trả capability 3 cho owner; API yêu cầu migration 003. Schema nội dung CV vẫn là 2 |

API owner xác thực token và gọi `cv_schema_version` (hàm này kiểm tra `is_cv_owner`). Quyền SELECT/INSERT/UPDATE/EXECUTE của database và Storage cũng được giới hạn, không dựa vào việc ẩn nút ở UI. Các hàm đặc quyền đặt search_path rỗng và tự kiểm tra owner. App không sử dụng service-role key ở runtime. Nội dung được kiểm tra và escape trước khi render; không nhận raw HTML để xuất bản.

Những ảnh đã từng công khai có thể đã được người xem tải xuống; việc thay ảnh chỉ thay quyền truy cập hiện tại của app. Trang quản trị không nằm trong sitemap và noindex, nhưng quyền dữ liệu vẫn do Auth/RLS quyết định.

## 10. Nâng cấp, sao lưu và quay lại

- Không reset database để cập nhật source. Giữ hai biến môi trường, owner và dữ liệu Supabase hiện có.
- Trước migration tương lai, sao lưu nội dung của `cv_documents`, `cv_publications`, metadata và file Storage qua công cụ export/backup phù hợp của project. Mốc lịch sử giữ nội dung trong cùng database, không thay thế backup độc lập của database và file Storage. JSON xuất ra không bao gồm file ảnh.
- Sau migration 003, API editor v1.2 yêu cầu capability 2 nên sẽ chặn chỉnh sửa. Không hạ migration bằng cách xóa bảng hoặc đổi `cv_schema_version`. Nếu cần sửa deployment, dùng bản vá v1.3 tương thích; bản CV công khai vẫn nằm ở snapshot riêng. Xem hướng dẫn phục hồi trong UPGRADE-v1.3.0.md.
- Migration lần này chỉ thêm các đối tượng của Maison CV. Các bản sau cần migration tăng dần và hướng dẫn riêng, không thay SQL bằng thao tác xóa bảng.
- Khi đổi tên miền, cập nhật Auth callback, site URL trong editor và xuất bản lại.

## Font tiếng Việt

Font normal/italic được đóng gói ở `public/fonts/`, kèm giấy phép OFL. CSS khai báo đúng Unicode range Latin, Latin mở rộng và Vietnamese để dấu không rơi sang font dự phòng khác. Mã nguồn, dữ liệu nhập và renderer dùng UTF-8/NFC. Không sửa dấu bằng cách xóa khoảng trắng giữa các từ. Font cũng dùng trên CV công khai, editor, trang chờ và bản in. Fontsource là nguồn asset phát triển, không phải dịch vụ font phải kết nối lúc chạy.

## 11. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `/admin` hiển thị hướng dẫn kết nối | Thêm đúng hai biến môi trường, kiểm tra URL/key và redeploy |
| Đăng nhập đúng nhưng báo chưa có quyền owner | So sánh User UID trong Authentication với `cv_owner.user_id`, chạy setup-owner cho đúng user |
| Báo chưa hoàn tất schema/quyền database | Project mới chạy 001 → 002 → 003; đang v1.2 chỉ chạy 003; đang v1.1 chạy 002 → 003. Kiểm tra error SQL; không tự tắt RLS |
| `/` vẫn là trang đang hoàn thiện | Lưu nháp chưa đủ; hoàn thiện dữ liệu và bấm Xuất bản |
| Không xuất bản được vì nội dung mẫu | Thay nội dung `[ ]`, điền tên mục đang trống hoặc xóa mục chưa dùng |
| Lưu báo thiết bị khác đã cập nhật | Giữ bản đang soạn để đối chiếu, tải bản mới nhất, chỉnh lại rồi lưu |
| Thay ảnh thất bại | File đúng JPG/PNG/WebP, dưới 3 MB; kiểm tra bucket `cv-assets`, migration và owner |
| Ảnh nháp không mở được ở cửa sổ khách | Đây là quyền riêng tư dự kiến; xuất bản trước để khách xem |
| Đổi cấu hình env nhưng app vẫn dùng cấu hình cũ | Tạo deployment mới; biến client được nhúng lúc build |
| Không nhận email khôi phục | Kiểm tra Auth Email/SMTP, giới hạn gửi, hộp thư spam và Redirect URLs |
| Link khôi phục hết hạn/trình duyệt khác | Yêu cầu email mới và mở trên cùng trình duyệt đã yêu cầu |
| Build không tìm thấy package.json | Sửa Root Directory trên Vercel cho đúng thư mục source |
| `npm ci` báo lỗi Node engine | Dùng Node.js 24.x hiện hành và package-lock.json đi kèm |
| PDF bị ngắt trang chưa đẹp | Kiểm tra A4, tỷ lệ in và nội dung; PDF tự động nâng cao thuộc v1.4.0 |

## 12. Cấu trúc và phát triển tiếp

- `src/app/`: CV công khai, admin, print, Portfolio chờ, callback và API.
- `src/components/HistoryPanel.tsx`: lịch sử, so sánh, xem CV, nhập/xuất JSON và xác nhận khôi phục.
- `src/components/Editor.tsx`: editor và luồng Auth phía trình duyệt; `SortHandle.tsx`: sắp xếp bằng chuột/cảm ứng và nút lên/xuống.
- `src/lib/`: renderer Maison, layout, validation, hook autosave/khôi phục, client Supabase, API guard và đọc snapshot công khai.
- `src/data/profile.json`: dữ liệu nền một lần; không phải nguồn dữ liệu live sau khi lưu online.
- `supabase/`: migration và script chỉ định owner.
- `tests/`: kiểm tra nội dung, quyền dữ liệu và luồng UI.
- `preview/`: bản HTML/CSS offline để xem thiết kế, không có đăng nhập/lưu cloud. Tạo lại bằng `node scripts/export-preview.mjs`; không upload thư mục này thay cho toàn bộ app Next.js.

Phiên bản tiếp theo: **v1.4.0 — PDF & Professional Sharing**: PDF tự động, kiểm soát A4/ngắt trang, QR và metadata/ảnh chia sẻ; cần kiểm chứng engine PDF trên Vercel trước khi chọn giải pháp. Gửi ZIP mới nhất và yêu cầu xây dựng phiên bản tiếp theo để giữ đúng source và roadmap.
