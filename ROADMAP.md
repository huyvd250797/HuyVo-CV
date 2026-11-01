# Maison CV — Roadmap hoàn thiện CV

Cập nhật 31/10/2026. Mục tiêu: hoàn thiện CV dùng ứng tuyển trước, sau đó xây Portfolio chuyên sâu. v1.7.0 đã xây source; nghiệm thu Supabase/Vercel thật thực hiện sau khi Boss cập nhật migration/source lên project hiện tại.

| Phiên bản | Kết quả | Điều kiện hoàn thành | Trạng thái |
| --- | --- | --- | --- |
| v1.0 — Maison Espresso | Thiết kế CV và Portfolio chờ | CV hiển thị, có source nền | Đã có |
| v1.1 — Online Editor & Cloud Save | Sửa online, Auth owner, Database/Storage, nháp/public riêng | Lưu rồi xem trên thiết bị khác; khách không đọc nháp | Đã có source; migration 001 |
| v1.2 — Flexible Editing & Autosave | Autosave, undo, sắp xếp, ẩn block, phục hồi cục bộ, font VI | Không mất dữ liệu khi mất mạng/xung đột; không tự publish | Đã có source; 002 |
| v1.3 — History & Recovery | Mốc lưu, diff, xem/khôi phục, JSON | Khôi phục vào nháp, giữ public, kiểm tra trước khi áp dụng | Đã có source; 003 |
| v1.4 — PDF & Professional Sharing | A4/PDF thật, QR, copy/share/OG, mã đơn vị | PDF đầy đủ chữ có thể chọn; ảnh/metadata từ public | Đã có source; 004 |
| v1.5 — Visual Layout Studio | Kéo block/dòng, tiêu đề, thêm tại chỗ, xếp thời gian, Maison/Lưới linh hoạt | 6+6/12 đúng bố cục, giữ hai chế độ | Đã có source; 005 |
| **v1.6 — Bilingual CV** | **VI/EN độc lập, publish theo ngôn ngữ, PDF/share theo ngôn ngữ; settings/Auto Save/branding, inline nhanh, logo, animation, xóa history** | **Sửa EN giữ VI; EN chưa publish không lộ; mỗi lần publish chỉ đổi bộ được chọn; nghiệm thu checklist UPGRADE** | **Đã xây source và kiểm tra; migration 006, cần nghiệm thu project thật** |
| **v1.7 — App Showcase** | **Hiển thị các app đã xây dựng kèm ảnh minh họa thật** | Thêm/sửa/sắp xếp app; ảnh bìa/gallery/upload/alt text; tên/mô tả/vai trò/công nghệ/trạng thái, demo/GitHub tùy chọn; nội dung VI/EN; mobile rõ, PDF có tóm tắt | **Đã xây source; migration 007, cần nghiệm thu project thật** |
| v1.8 — CV Presentation & PDF | Tinh chỉnh CV và bản ứng tuyển | Chọn mẫu A4 chuyên nghiệp và bản đơn giản thuận tiện đọc/ATS; kiểm soát ngắt trang, độ dài/ẩn mục riêng, kiểm tra font/đường link, preview theo ngôn ngữ | Sau 1.7; bảo toàn bản hiện có |
| v1.9 — Release Readiness | Hoàn thiện để dùng gửi ứng tuyển | Rà nội dung VI/EN/thời gian/liên hệ; kiểm tra responsive, keyboard, tải trang, backup/restore, quyền dữ liệu và xung đột; nghiệm thu Vercel/Supabase thực tế | Chốt CV trước Portfolio |
| v2.0 — Portfolio | Trang dự án chuyên sâu từ nút cuối CV | Danh sách/chi tiết `/portfolio/[slug]`; bài toán → vai trò → giải pháp → kết quả có chứng cứ, ảnh/video, demo/source, quản trị VI/EN nháp/public | Sau khi CV ổn định; tái sử dụng dữ liệu app |

## v1.7 đã triển khai

Mở rộng `projects` hiện tại, không tạo bộ dữ liệu trùng: ảnh bìa + gallery tối đa 8 ảnh; upload/cắt 16:10, alt text VI/EN; nền tảng/trạng thái/nổi bật/ẩn app; sắp xếp và PDF có bìa/tóm tắt. Đồng bộ ảnh/liên kết theo ID giữa hai bản nháp; publish riêng vẫn giữ snapshot ngôn ngữ còn lại. JSON/lịch sử/import/RLS hiểu đầy đủ media mới.

Giữ kiểm tra VI có thì EN phải đủ khi xuất bản EN: thông báo ngôn ngữ/phần/tên mục/trường và nút Sửa, nhận biết mục EN thiếu hoàn toàn; Bổ sung mục/app từ VI giữ ID và bản dịch đã nhập. Không tự dịch nội dung cá nhân hoặc tự thêm ảnh/khẳng định công nghệ của các app. Schema nội dung 6; capability 7 chặn editor cũ làm mất dữ liệu mới.

## Phiên bản kế tiếp — v1.8.0 CV Presentation & PDF

| Mục tiêu | Chức năng chính | Kỹ thuật / dữ liệu | Điều kiện hoàn thành | Phụ thuộc |
| --- | --- | --- | --- | --- |
| CV thống nhất khi xem và ứng tuyển | Tinh chỉnh Maison/Grid, mẫu A4 chuyên nghiệp và bản đơn giản hỗ trợ ATS; kiểm soát ngắt trang, ảnh app, tiêu đề và nội dung dài VI/EN | Lưu tùy chọn bản in; renderer/PDF dùng cùng thứ tự và cấu hình hiển thị; giữ schema cũ và quyền ảnh | Preview/web/PDF đủ nội dung, ảnh rõ, không cắt chữ, thử hồ sơ ngắn/dài, VI/EN | Source v1.7 và bộ ảnh/nội dung thật; sau đó nghiệm thu v1.9 trước Portfolio v2.0 |

## v1.6 đã triển khai

VI là hồ sơ gốc để tương thích dữ liệu cũ; EN là bộ nội dung riêng trong nháp. Chọn VI/EN khi sửa; layout và tiêu đề riêng. Không gọi dịch vụ dịch, không tự bịa bản dịch dữ liệu cloud chưa cung cấp. EN cần được hoàn thiện trước khi publish; nhãn/tiêu đề mặc định/thời gian public và PDF có tiếng Anh.

Xuất bản VI/EN/Tất cả theo snapshot; khách chỉ thấy chuyển ngôn ngữ sau khi cả hai publication tồn tại. Thêm Auto Save checkbox, logo/favicons, logo đơn vị, sửa trực tiếp bằng double click, ＋ cuối block, đổi chỗ theo đường cong, xóa mốc/all có xác nhận. Lịch sử/JSON hỗ trợ cả hai ngôn ngữ; giữ owner, version, dữ liệu cũ và hai env.

## Thứ tự công việc nội dung

1. Hoàn thiện CV VI: chức danh, giới thiệu, mục tiêu, kinh nghiệm và kết quả có thật.
2. Điền CV EN đúng thuật ngữ PM/BA; kiểm tra riêng tiêu đề, tên trường/đơn vị và thời gian; xuất bản từng bản để duyệt.
3. Chuẩn bị mỗi app: tên, 1 ảnh bìa + ảnh màn hình thật, mô tả, vai trò, công nghệ, URL demo/source nếu công khai được. Không cần chờ Portfolio để hiển thị app trên CV.
4. Kiểm tra CV/PDF VI và EN trên PC, điện thoại; gửi thử link và PDF qua các kênh Boss sử dụng.
5. Chốt v1.9, tiếp tục Portfolio cho case study chi tiết.

CV tập trung vào kinh nghiệm và bằng chứng ngắn gọn; Portfolio phát triển câu chuyện dự án. Không thêm marketplace, thanh toán, nhiều tài khoản đăng ký hoặc AI viết CV vào phạm vi hiện tại.
