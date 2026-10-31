# Nâng cấp Maison CV v1.1.0 → v1.2.0

1. Giữ nguyên Supabase project, owner UID, dữ liệu, ảnh và hai biến môi trường Vercel. Không điền giá trị thật vào source.
2. Sao lưu dữ liệu/file theo công cụ phù hợp của project trước khi thay đổi production.
3. Chạy `supabase/migrations/202610310002_flexible_editor.sql` trong SQL Editor. Migration này chỉ thay các hàm lưu/xuất bản và thêm kiểm tra phiên bản; không reset hay seed CV.
4. **Không chạy lại migration 001 sau 002**. Project hoàn toàn mới chạy 001 → 002 → setup-owner.
5. Push source v1.2.0 lên repo đang dùng, deploy Vercel với Node.js 24.x, install `npm ci`, build `npm run build`, output mặc định Next.js.
6. Mở lại các tab quản trị để dùng code mới. CV cũ tự nhận bố cục mặc định; thông tin trong Supabase không bị thay bằng JSON mẫu.
7. Sửa một trường và ngừng nhập khoảng 1,2 giây: trạng thái chuyển đang chờ → đang lưu → đã lưu nháp. Kiểm tra thiết bị khác sau khi tải lại.
8. Vào Bố cục CV: thử kéo hoặc ↑/↓, ẩn một phần, hoàn tác/làm lại; chuyển Desktop/Mobile. Các thao tác này tự lưu nháp.
9. Thử mất mạng, nhập nội dung, mở lại để chọn bản khôi phục; nếu cloud đã đổi version, app phải dừng tự lưu và giữ nội dung để đối chiếu.
10. Xuất bản để khách thấy thay đổi. Những trường bị ẩn chỉ được gỡ khỏi dữ liệu công khai sau lần xuất bản mới; nội dung nháp vẫn giữ đầy đủ.
11. Kiểm tra dấu tại “Hồ sơ của bạn”, “Chăm chút từng chi tiết”, “Chưa xuất bản” trên Windows và điện thoại; thử ảnh và In/Lưu PDF như cũ.

Nếu `/admin` yêu cầu migration 002, chạy migration đúng project trước khi thử lại. Không tắt RLS để xử lý lỗi. Chưa có lịch sử cloud của v1.3; hoàn tác của v1.2 chỉ trong phiên, bản khôi phục chưa lưu chỉ ở thiết bị/trình duyệt đang dùng.
