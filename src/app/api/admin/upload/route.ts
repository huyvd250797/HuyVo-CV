import sharp from 'sharp';
import { ownerContext, json, failure, ApiError, dbFailure } from '@/lib/api';
import { imageType } from '@/lib/validation.mjs';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { db, user } = await ownerContext(request);
    if (Number(request.headers.get('content-length') || 0) > 3300000) throw new ApiError(413,'Chọn ảnh nhỏ hơn 3 MB.');
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > 3*1024*1024) throw new ApiError(422,'Chọn ảnh JPG, PNG hoặc WebP, tối đa 3 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer()); const type = imageType(bytes);
    if (!type || file.type !== type.mime) throw new ApiError(422,'Định dạng ảnh không hợp lệ. Chỉ nhận JPG, PNG hoặc WebP.');
    try{const meta=await sharp(bytes,{limitInputPixels:25_000_000}).metadata();if(!meta.width||!meta.height||meta.width*meta.height>25_000_000)throw new Error();}catch{throw new ApiError(422,'Ảnh bị hỏng hoặc vượt quá 25 triệu điểm ảnh. Hãy chọn ảnh JPG/PNG/WebP khác, tối đa 3 MB.');}
    const path = `${user.id}/${crypto.randomUUID()}.${type.extension}`;
    const upload = await db.storage.from('cv-assets').upload(path,bytes,{ contentType:type.mime,upsert:false,cacheControl:'0' });
    if (upload.error) throw new ApiError(503,'Chưa tải được ảnh. Kiểm tra Storage bucket và quyền upload.');
    const meta = await db.from('cv_assets').insert({ path,owner_id:user.id,mime_type:type.mime,size_bytes:file.size });
    if (meta.error) { await db.storage.from('cv-assets').remove([path]); dbFailure(meta.error); }
    return json({ portrait:`/api/media/${path}` });
  } catch (error) { return failure(error); }
}
