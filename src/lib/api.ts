import { NextResponse } from 'next/server';
import { cloudConfig, serverCloud } from './cloud';
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control':'no-store', 'Vary':'Authorization' } }); }
export async function ownerContext(request: Request) {
  if (!cloudConfig().ready) throw new ApiError(503,'Chưa kết nối Supabase. Xem hướng dẫn cấu hình trong README.');
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token || token.length > 10000) throw new ApiError(401,'Vui lòng đăng nhập để tiếp tục.');
  const db = serverCloud(token);
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) throw new ApiError(401,'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  const owner = await db.rpc('cv_schema_version');
  if (owner.error || (Number(owner.data)!==0 && Number(owner.data)!==4)) throw new ApiError(503,'Cần chạy migration v1.4.0 (004) trong Supabase trước khi chỉnh sửa.');
  if (Number(owner.data)===0) throw new ApiError(403,'Tài khoản này chưa được cấp quyền chủ sở hữu CV.');
  return { db, user };
}
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message },error.status);
  console.error('Maison API:', error instanceof Error ? error.message : 'Unknown error');
  return json({ error:'Không thể hoàn tất thao tác. Kiểm tra kết nối rồi thử lại.' },500);
}
export async function readJson(request: Request,limit=220000) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > limit) throw new ApiError(413,'Nội dung quá lớn.');
  try { const value=JSON.parse(text); if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error(); return value; } catch { throw new ApiError(400,'Dữ liệu gửi lên không hợp lệ.'); }
}
export function dbFailure(error: { code?: string; message?: string }) {
  if (error.code === '40001' || error.message?.includes('CV_CONFLICT')) throw new ApiError(409,'CV đã được cập nhật ở thiết bị khác. Giữ bản đang soạn để đối chiếu hoặc tải bản mới nhất.');
  if (error.code === 'P0002') throw new ApiError(404,'Không tìm thấy mốc lưu này.');
  if (error.code === '22023') throw new ApiError(422,'Thông tin hoặc cấu trúc dữ liệu không hợp lệ.');
  if (error.code === '42501') throw new ApiError(403,'Bạn không có quyền thực hiện thao tác này.');
  throw new ApiError(503,'Không thể lưu dữ liệu. Kiểm tra kết nối và migration Supabase rồi thử lại.');
}
