import { ownerContext, json, failure, readJson, ApiError, dbFailure } from '@/lib/api';
import {mediaPaths} from '@/lib/i18n.mjs';
import { validateCv } from '@/lib/validation.mjs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { db } = await ownerContext(request);
    const [draft, published] = await Promise.all([
      db.from('cv_documents').select('content,version,updated_at').eq('id',true).maybeSingle(),
      db.from('cv_publications').select('language,document_version,published_at').eq('id',true),
    ]);
    if (draft.error || published.error) throw new ApiError(503,'Chưa đọc được CV. Kiểm tra migration và kết nối Supabase.');
    return json({ document:draft.data, publication:published.data?.find((p:{language:string})=>p.language==='vi')||null,publications:published.data||[] });
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    const { db, user } = await ownerContext(request);
    const body = await readJson(request);
    if (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 0) throw new ApiError(400,'Phiên bản lưu không hợp lệ.');
    const parsed = validateCv(body.content);
    if (parsed.errors.length || !parsed.data) return json({ error:parsed.errors.join('\n') },422);
    if (mediaPaths(parsed.data).some(path=>path.startsWith('/api/media/')&&!path.startsWith(`/api/media/${user.id}/`))) throw new ApiError(422,'Ảnh không thuộc tài khoản của bạn.');
    const { data, error } = await db.rpc('save_cv_draft',{ p_content:parsed.data,p_expected_version:body.expectedVersion });
    if (error) dbFailure(error);
    return json({ document:data });
  } catch (error) { return failure(error); }
}
