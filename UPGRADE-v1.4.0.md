# Nâng cấp v1.4.0 — PDF & Professional Sharing

## 1. Đang dùng v1.3.0

1. Giữ project Supabase, owner, các bảng CV, lịch sử và bucket `cv-assets`. Giữ nguyên hai biến Vercel `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Không đưa giá trị thật vào source.
2. Đóng/tạm dừng các tab editor cũ. Nếu cần backup độc lập, sao lưu database và file Storage bằng công cụ của project; JSON app không bao gồm file ảnh.
3. Supabase SQL Editor → chạy toàn bộ `supabase/migrations/202610310004_professional_sharing.sql`. Script chạy trong transaction; nâng capability, cập nhật hàm lưu schema 3 cho lần ghi mới và ghi log migration; không update nháp/public/revision hiện có. Chạy lại không nhân đôi log.
4. Tích hợp source v1.4.0 vào đúng thư mục repository hiện tại, giữ `.git` và Root Directory đang dùng. Commit/push rồi Vercel deploy: Node.js **24.x**, Install `npm ci`, Build `npm run build`, Output Directory mặc định Next.js. Không static export, không deploy riêng thư mục preview.
5. Đợi Ready rồi tải lại `/admin` trên tất cả thiết bị. Không cần setup-owner lại hoặc tạo bucket mới.
6. Trong Thông tin cá nhân, khai báo URL website CV bằng tên miền production gốc thực tế. Lưu nháp rồi xuất bản lại. QR/canonical/metadata lấy từ bản đã xuất bản, không lấy bản đang soạn.
7. Điền mã và tên đầy đủ trong Kinh nghiệm triển khai, lưu và xuất bản như phần 2.

Project mới chạy **001 → 002 → 003 → 004 → setup-owner.sql**. Đang v1.2 chạy **003 → 004**; v1.1 chạy **002 → 003 → 004**. Không chạy migration cũ sau migration mới, không hạ `cv_schema_version` để dùng editor cũ.

## 2. Mã đơn vị và tên đầy đủ

Trong `/admin` → Kinh nghiệm triển khai, điền hai trường riêng:

| Trường | Ví dụ |
| --- | --- |
| Mã đơn vị | EPU |
| Tên đơn vị đầy đủ | Trường Đại học Điện lực |
| Vai trò / Phạm vi triển khai | Giữ/mô tả phạm vi Boss đã thực hiện |

Thẻ CV hiển thị mã phía trên, tên đầy đủ ngay dưới. Vùng hẹp chuyển một thẻ mỗi hàng để tên dễ đọc; nội dung rất dài vẫn xuống dòng tự nhiên. Bấm thẻ để mở phạm vi triển khai. PDF luôn hiển thị cả phạm vi, không cần bấm mở.

Mã là tùy chọn, tối đa 80 ký tự. Dữ liệu cũ chỉ có `name: EPU` vẫn hiện EPU cho tới khi Boss cập nhật hai trường; không tự biến đổi nội dung cloud hoặc tự đoán tên các đơn vị. Dữ liệu nền cho project mới có sẵn ví dụ EPU đúng hai trường, không seed/ghi đè hồ sơ đã lưu.

Schema nội dung mới là **3**, capability database là **4**. JSON schema 1/2 và lịch sử cũ vẫn đọc/nhập/khôi phục được, mã chưa có chuyển thành rỗng. Khôi phục mốc cũ sẽ khôi phục đúng nội dung cũ, không tự bổ sung tên đầy đủ. JSON schema 3 chứa mã mới; app cũ sẽ từ chối nhập thay vì làm mất trường. Khi export, envelope vẫn là formatVersion 1 và appVersion 1.4.0.

## 3. PDF và chia sẻ

- CV công khai có Tải CV PDF ở đầu trang và bộ nút chia sẻ phía cuối. Trong editor có liên kết PDF & Chia sẻ CV khi đã có publication; liên kết này mở **bản công khai**, không xuất nháp.
- PDF tự động từ `/api/cv/pdf`: A4 sáng một cột, cùng toàn bộ nội dung/thứ tự public, ẩn đúng các mục đã ẩn. Font tiếng Việt có thể chọn chữ, liên kết, ảnh chân dung, đánh số trang và QR cuối hồ sơ nếu đã có URL CV.
- PDF một cột là mẫu ứng tuyển riêng; không chụp giao diện web tối thành ảnh. Nội dung dài tự sang trang, không tự cắt bớt để ép một trang.
- Tên file có tên hồ sơ và version nội dung đã xuất bản. Tải PDF không ghi dữ liệu, không tự lưu/xuất bản nháp. Lỗi tải có thông báo/thử lại; `/print` và In bản nháp vẫn dùng hộp thoại trình duyệt.
- Sao chép link và Web Share chỉ chia sẻ URL CV gốc. QR PNG cũng chỉ mã hóa URL đó; tải QR để đặt vào chữ ký/hồ sơ nếu cần.
- Metadata OG/Twitter/canonical và `/api/share/image` đọc bản công khai. Họ tên/chức danh/giới thiệu/ảnh trong bản nháp chưa xuất bản không đi vào ảnh chia sẻ.
- Nếu chưa đặt URL CV, QR/canonical/OG image không được thêm bằng tên miền đoán. Copy link dùng origin hiện tại của trình duyệt làm phương án dự phòng. Hãy khai báo đúng URL và xuất bản trước khi gửi ứng tuyển.
- Nền tảng mạng xã hội có thể cache preview; URL ảnh có version mới khi xuất bản để hỗ trợ làm mới, nhưng không đảm bảo cache ngoài app cập nhật ngay. QR/tải file trên iOS có thể mở sheet xem trước, Boss dùng nút Lưu vào Tệp/Chia sẻ của thiết bị.

## 4. Triển khai PDF trên Vercel

- Không cần Chromium, Python, API PDF bên ngoài hay biến môi trường mới. App dùng Node.js Function, @react-pdf/renderer và pdf-lib, font TTF đi kèm source.
- `next.config.ts` khai báo external server packages và tracing fonts; giữ cấu hình này khi tích hợp repository. Dùng lockfile và overrides PDF đã kiểm chứng; không bỏ overrides hoặc chạy nâng dependency đồng loạt trước khi kiểm tra lại hồ sơ dài/số trang.
- API PDF có `maxDuration=60`; PDF trả về dưới 4.000.000 byte. Chân dung được resize trước khi nhúng; hỗ trợ ảnh JPG/PNG/WebP đang dùng. Thời gian thực tế phụ thuộc nội dung, ảnh và cold start trên project thật.
- Mỗi request đọc publication hiện hành; cache tiến trình giới hạn 4 bản theo content hash/version. Không đặt CDN cache dài trên PDF, OG, QR hoặc ảnh riêng tư để tránh tiếp tục trả dữ liệu vừa bị ẩn/thay.
- Ảnh luôn được tải qua Supabase với quyền anonymous của snapshot công khai. Không dùng service_role và không fetch URL tùy ý. Nếu ảnh chưa đọc được hoặc PDF lỗi, dùng thông báo thử lại/in trình duyệt; không tự thay bằng ảnh nháp.

## 5. Nghiệm thu sau deploy

| Thao tác | Kết quả cần thấy |
| --- | --- |
| Nâng cấp và đăng nhập PC/điện thoại | Nháp, public, ảnh, owner và lịch sử còn nguyên |
| Điền EPU và tên đầy đủ, lưu | Hai trường độc lập, thẻ hiển thị mã/tên; mở lại thiết bị khác giữ giá trị |
| Xuất/nhập JSON, tạo mốc và restore | Mã đi cùng tên/phạm vi; mốc trước nâng cấp không bị update theo nháp |
| Sửa nháp chưa publish rồi tải PDF/share image | Vẫn là bản công khai cũ, không rò nháp |
| Ẩn một phần rồi publish | Phần đó vắng cả CV, PDF; JSON/mốc riêng tư vẫn giữ |
| Tải PDF ngắn/dài có dấu | Khổ A4, chọn/sao chép chữ được, tên file có version, trang nối đủ, footer không chồng chữ |
| Ảnh JPG/PNG/WebP | Chân dung trên PDF/OG đúng public; srcset web resize sau kiểm tra quyền |
| QR + quét trên thiết bị khác | Mở URL production gốc, không `/admin`, không token; tải PNG dùng được |
| Copy/Web Share | Copy thành công hoặc có ô link dự phòng; thiết bị hỗ trợ mở share sheet, hủy không báo lỗi |
| Gửi link qua mạng xã hội | Title/description/ảnh công khai, kiểm tra lại cache bằng công cụ của nền tảng nếu còn ảnh cũ |
| Chưa có publication / lỗi kết nối | PDF/OG/QR không xuất dữ liệu mẫu hoặc nháp; trả 404/503 phù hợp |
| Hai thiết bị cùng sửa | CAS tiếp tục chặn phiên cũ; autosave/history/publication giữ hành vi v1.3 |

## 6. Phục hồi và giới hạn

Migration không rewrite hồ sơ, nên lỗi deploy không cần xóa bảng. Nếu source gặp lỗi, sửa/deploy bản vá v1.4 tương thích capability 4. API source v1.3 yêu cầu capability 3 nên không dùng lại editor cũ để lưu; không hạ capability. Với nội dung nhập/sửa sai, dùng History & Recovery để khôi phục vào nháp rồi xem lại trước khi xuất bản.

Bản bàn giao đã test local/embedded DB và build production; chưa deploy, chạy migration hoặc đo cold start trên Supabase/Vercel thật của Boss. PDF không phải PDF/UA được gắn thẻ hoàn chỉnh. Chưa có tùy chỉnh mẫu PDF nhiều kiểu, bảo vệ PDF bằng mật khẩu, watermark hoặc gửi mail tự động. Portfolio vẫn là trang chờ.

Phiên bản kế tiếp: **v2.0.0 — Portfolio**. Gửi ZIP v1.4.0 mới nhất để phát triển tiếp.
