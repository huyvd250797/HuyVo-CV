import {ownerContext,json,failure,readJson,ApiError,dbFailure} from '@/lib/api';
import {parseBackup} from '@/lib/history.mjs';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  const {db}=await ownerContext(request);const {id}=await params;const body=await readJson(request);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<0)throw new ApiError(400,'Mốc lưu hoặc phiên bản hiện tại không hợp lệ.');
  const revision=await db.from('cv_revisions').select('content').eq('id',id).maybeSingle();
  if(revision.error)dbFailure(revision.error);if(!revision.data)throw new ApiError(404,'Không tìm thấy mốc lưu này.');
  const parsed=parseBackup(revision.data.content);if(parsed.errors.length)throw new ApiError(422,parsed.errors.join('\n'));
  const {data,error}=await db.rpc('apply_cv_recovery',{p_expected_version:body.expectedVersion,p_source:'restore',p_revision_id:id});
  if(error)dbFailure(error);return json(data);
 }catch(error){return failure(error);}
}
