# Nâng cấp v1.5.0 — Visual Layout Studio

## Nâng cấp từ v1.4.0

1. Giữ project Supabase, owner, nội dung CV, ảnh, lịch sử và hai biến Vercel hiện có. Không reset database, không tạo owner hoặc bucket lại.
2. Đóng các tab editor cũ trong lúc nâng cấp. Nếu cần backup độc lập, sao lưu database và Storage của project như trước.
3. Trong SQL Editor, chạy toàn bộ `supabase/migrations/202610310005_visual_layout.sql`. Script chạy trong transaction, nâng capability 5/hàm lưu schema 4 và cập nhật publish để loại tiêu đề phần ẩn. Nó không rewrite nháp, snapshot công khai hoặc revision hiện có. Có thể chạy lại.
4. Tích hợp source v1.5.0 vào repository đúng thư mục package.json; giữ `.git`, Root Directory và env hiện tại. Commit/push rồi Vercel deploy Node.js 24.x, `npm ci`, `npm run build`, Output Directory mặc định Next.js.
5. Sau Ready, tải lại `/admin` trên các thiết bị. Không dùng tab/source editor v1.4 để lưu cấu trúc mới; API cũ sẽ chặn khi capability đã nâng.
6. Thử thao tác theo phần dưới, lưu nháp và xem trước. Khách chỉ thấy thay đổi sau khi Boss xuất bản lại.

Project mới: **001 → 002 → 003 → 004 → 005 → setup-owner.sql**. Project cũ chạy các migration còn thiếu theo thứ tự; không chạy migration cũ sau mới. Không cần thêm biến môi trường hoặc dependency mới.

## Chỉnh trực tiếp trên CV

- Ban đầu CV không hiện thanh thao tác. Bấm block cần sửa để hiện ⋮⋮, ↑/↓, ＋ và mũi tên cạnh từng dòng.
- Giữ tay nắm ⋮⋮ rồi kéo đến block đích. Thả để đổi vị trí. Maison cho di chuyển trong hoặc giữa các vùng; Lưới linh hoạt thay thứ tự chung. Có tự cuộn gần mép vùng xem và hủy khi thả ngoài block. Có nút ↑/↓ thay thế cho kéo, dùng được bằng bàn phím.
- Mũi tên tại dòng đổi vị trí chính dòng đó; không đổi thứ tự block. Dòng đầu/cuối khóa hướng không còn vị trí.
- ＋ tại block có danh sách thêm một mục cuối danh sách, mở đúng bảng bên phải, cuộn tới mục mới và focus ô đầu; không reset thanh bên về đầu. Nút Thêm cuối bảng bên phải cũng dùng luồng này. Giới hạn vẫn 50 mục/danh sách.
- Thông tin liên hệ và mục tiêu là nội dung đơn: ＋ mở bảng để bổ sung trường hoặc văn bản, không nhân bản block. Muốn sửa ảnh/tên/chức danh vẫn dùng Thông tin cá nhân và inline như trước.
- Bấm vùng trống bên trong CV hoặc Escape để ẩn thanh thao tác. Xem trước và bản công khai không chứa nút quản trị.
- Tiêu đề block ở đầu bảng bên phải, tối đa 100 ký tự. Tiêu đề mới xuất hiện trên CV và menu. Xóa rỗng để trở về mặc định. Định danh block không đổi, nên link/ẩn mục/lịch sử vẫn giữ đúng phần.

## Tự sắp xếp thời gian

| Danh sách | Trường dùng |
| --- | --- |
| Học vấn | Thời gian |
| Kinh nghiệm làm việc | Thời gian |
| Chứng chỉ | Năm cấp |
| Sản phẩm | Năm thực hiện |
| Kinh nghiệm triển khai | Thời gian triển khai mới, tùy chọn |
| Kỹ năng | Không có thời gian; sắp xếp thủ công |

Chọn tăng **Cũ → Mới** hoặc giảm **Mới → Cũ**, với giai đoạn có thể chọn thời gian bắt đầu/kết thúc. Bấm Tự động sắp xếp mới áp dụng; không tự sắp mỗi lần nhập. Hỗ trợ `2019`, `09/2020`, `25/06/2024`, `2024-06-25`, `JUL 2019 - OCT 2019`, `Tháng 7 2024`, `2019 - Hiện tại`/`Present`. Khi xét kết thúc, hiện tại nằm sau ngày hữu hạn. Ngày không hợp lệ/thiếu ngày nằm cuối ở cả hai hướng, thứ tự các mục hòa được giữ. Không đoán ngày từ phần mô tả. Dùng Hoàn tác để trở lại thứ tự cũ nếu cần.

## Hai chế độ bố cục

**Maison nguyên bản** giữ thiết kế cũ: khối đầu, cột trái/phải và phần ngoài khung hồ sơ. Kéo trực tiếp trên CV để chuyển block giữa vùng nếu muốn; menu phản ánh thứ tự logic của các vùng.

**Lưới linh hoạt** là chế độ mới trong Bố cục CV:

1. Danh sách từ trên xuống là thứ tự CV đọc trái sang phải, rồi xuống hàng. Kéo/nút lên xuống trong danh sách hoặc trên CV đều thay cùng thứ tự.
2. Độ rộng 1–12 cho từng block. Đặt Học vấn 6 và Quá trình làm việc 6, để chúng liền nhau trong danh sách: hai block cùng một hàng.
3. Đặt Kinh nghiệm triển khai 12 ở sau: block này chiếm toàn hàng, những block tiếp theo xuống hàng mới.
4. Nếu tổng độ rộng đang có trên hàng không đủ chỗ cho block kế tiếp, block đó xuống hàng. Không đưa block phía sau ngược lên lấp khoảng trống, để thứ tự hình ảnh/DOM/menu thống nhất.
5. Chiều cao hàng theo block cao nhất, không phải kiểu masonry. Độ rộng quá nhỏ có thể làm chữ xuống nhiều dòng; nên dùng 6/12 hoặc 12/12 cho nội dung dài.
6. Mobile và chế độ preview Mobile xếp một cột để đọc được; cấu hình desktop vẫn được lưu. Web công khai và bản in trình duyệt dùng bố cục đang chọn. PDF tự động tiếp tục mẫu A4 một cột của v1.4, giữ thứ tự, tiêu đề và nội dung theo cấu hình, không biến thành grid nhiều cột.

Hai chế độ giữ cấu hình riêng khi chuyển qua lại; đổi chế độ không xóa dữ liệu hoặc reset cấu hình bên kia. Thông tin đầu trang và nút Portfolio giữ nguyên. Bỏ chọn block để ẩn, không xóa dữ liệu nháp. Khi xuất bản, nội dung và tiêu đề tùy chỉnh của block ẩn đều không nằm trong public snapshot; revision riêng tư vẫn đầy đủ.

## Lưu trữ, tương thích và phục hồi

Schema CV nâng lên **4**, capability database **5**. JSON schema 1/2/3 và revision cũ vẫn đọc được; layout thiếu cấu hình được chuyển về Maison ban đầu, các block không bị mất. JSON mới giữ cả hai chế độ, span/thứ tự, tiêu đề và thời gian triển khai. App cũ từ chối schema tương lai; không dùng source cũ để lưu sau nâng cấp.

Các thay đổi vẫn đi qua autosave, CAS, bản khôi phục cục bộ và hoàn tác 50 mốc. Không tự xuất bản khi kéo/thêm/đổi tiêu đề. Mốc lịch sử cũ không bị sửa; khôi phục mốc cũ đưa về bố cục/nội dung của thời điểm đó rồi lưu thành version mới. Có thể khôi phục mốc Trước khôi phục để quay lại cấu hình hiện tại.

Nếu có lỗi SQL trong transaction, xử lý lỗi và chạy lại toàn bộ; không xóa bảng hoặc tắt RLS. Nếu deploy lỗi sau nâng cấp, giữ dữ liệu/public snapshot, sửa và deploy bản v1.5 tương thích capability 5. Không hạ hàm schema_version hoặc dùng editor cũ như cách rollback dữ liệu.

## Nghiệm thu trên project thật

| Thao tác | Kết quả cần thấy |
| --- | --- |
| Nâng cấp/tải lại editor | CV, owner, ảnh, lịch sử còn nguyên; mặc định Maison với cấu hình đã có |
| Chưa chọn block → chọn một block | Không toolbar ban đầu; chỉ block được chọn có ＋/kéo/lên/xuống và các dòng có mũi tên |
| Kéo trong/cross vùng Maison hoặc grid | Đổi đúng block, không trùng/mất; tự lưu, hoàn tác được |
| Thêm từ ＋ và từ nút cuối bảng | Mục nối dưới cùng, focus đúng ô mới, thanh bên không về đầu |
| Di chuyển từng dòng | Nội dung và thứ tự cùng đổi, không di chuyển block khác |
| Đổi tiêu đề rồi mở thiết bị khác | Tiêu đề trên CV/menu giữ đúng sau lưu; chỉ công khai sau publish |
| Xếp thời gian tăng/giảm | Đúng mốc bắt đầu/kết thúc, mục trống/sai ngày vẫn ở cuối |
| Grid Học vấn 6, công việc 6, triển khai 12 | Hai block đầu cạnh nhau, triển khai toàn hàng và đẩy phần tiếp theo xuống |
| Đổi Maison ↔ Grid | Cả hai cấu hình được giữ; dữ liệu không mất |
| Mobile | Một cột, chữ không tràn ngang; dùng được nút lên/xuống và thêm mới |
| Ẩn block có tiêu đề riêng → publish | Khách/PDF không thấy nội dung hay tiêu đề đó; history riêng tư vẫn có |
| Xuất/nhập JSON, checkpoint/restore | Layout/tiêu đề/thứ tự/thời gian giữ đủ; không tự publish |
| Hai thiết bị cùng sửa | Thiết bị cũ vẫn bị CAS chặn, không ghi đè |

Lần bàn giao chưa có tài khoản Supabase/Vercel đích để chạy migration/deploy/nghiệm thu cloud thật. Kéo cảm ứng trên thiết bị vật lý cần kiểm tra sau deploy; nút lên/xuống là cách thay thế. Xem VERIFICATION.md và TEST-RESULTS.txt cho bằng chứng đã chạy.

Tiếp theo trong roadmap: **v2.0.0 — Portfolio**. Gửi ZIP v1.5.0 mới nhất để xây dựng tiếp.
