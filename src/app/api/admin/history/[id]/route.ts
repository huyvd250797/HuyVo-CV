import {parseBackup} from '@/lib/history.mjs';
import {ownerContext,json,failure,ApiError,dbFailure} from '@/lib/api';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  const {db}=await ownerContext(request);const {id}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new ApiError(400,'Mã mốc lưu không hợp lệ.');
  const {data,error}=await db.from('cv_revisions').select('id,kind,label,note,document_version,created_at,size_bytes,content,parent_revision_id').eq('id',id).maybeSingle();
  if(error)dbFailure(error);if(!data)throw new ApiError(404,'Không tìm thấy mốc lưu này.');
  const parsed=parseBackup(data.content);if(parsed.errors.length||!parsed.data)throw new ApiError(422,parsed.errors.join('\n'));
  return json({revision:{...data,content:parsed.data}});
 }catch(error){return failure(error);}
}
