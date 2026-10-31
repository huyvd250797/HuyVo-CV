import { ownerContext, json, failure, readJson, ApiError, dbFailure } from '@/lib/api';
import { validateCv } from '@/lib/validation.mjs';
export async function POST(request: Request) {
  try {
    const { db } = await ownerContext(request);
    const body = await readJson(request);
    if (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) throw new ApiError(400,'Hãy lưu bản nháp trước khi xuất bản.');
    const draft = await db.from('cv_documents').select('content,version').eq('id',true).single();
    if (draft.error) dbFailure(draft.error);
    if (Number(draft.data?.version) !== body.expectedVersion) throw new ApiError(409,'Bản nháp đã thay đổi trên thiết bị khác. Hãy tải lại để kiểm tra.');
    const parsed = validateCv(draft.data?.content,true);
    if (parsed.errors.length) return json({ error:parsed.errors.join('\n') },422);
    const { data, error } = await db.rpc('publish_cv',{ p_expected_version:body.expectedVersion });
    if (error) dbFailure(error);
    return json({ publication:data });
  } catch (error) { return failure(error); }
}
