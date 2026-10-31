import {ownerContext,json,failure,readJson,ApiError,dbFailure} from '@/lib/api';
const fields='id,kind,label,note,document_version,created_at,size_bytes,parent_revision_id';
export async function GET(request:Request) {
 try {
  const {db}=await ownerContext(request);const url=new URL(request.url);let query=db.from('cv_revisions').select(fields).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(21);
  const cursor=url.searchParams.get('cursor');
  if(cursor){
   let time:string,id:string;
   try {
    if(cursor.length>512)throw new Error();
    const parsed=JSON.parse(Buffer.from(cursor,'base64url').toString());[time,id]=parsed;
    if(!Array.isArray(parsed)||parsed.length!==2||typeof time!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/.test(time)||!Number.isFinite(Date.parse(time))||typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Error();
   }catch{throw new ApiError(400,'Mốc phân trang không hợp lệ. Hãy tải lại lịch sử.');}
   query=query.or(`created_at.lt.${time},and(created_at.eq.${time},id.lt.${id})`);
  }
  const {data,error}=await query;if(error)dbFailure(error);
  const rows=data||[],items=rows.slice(0,20),last=items.at(-1);
  return json({items,nextCursor:rows.length>20&&last?Buffer.from(JSON.stringify([last.created_at,last.id])).toString('base64url'):null});
 }catch(error){return failure(error);}
}
export async function POST(request:Request) {
 try {
  const {db}=await ownerContext(request);const body=await readJson(request);
  if(!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<1)throw new ApiError(400,'Lưu nháp online trước khi tạo mốc.');
  if(typeof body.label!=='string'||body.label.length>120||typeof(body.note??'')!=='string'||(body.note||'').length>1000)throw new ApiError(422,'Tên mốc tối đa 120 ký tự; ghi chú tối đa 1.000 ký tự.');
  const {data,error}=await db.rpc('create_cv_checkpoint',{p_expected_version:body.expectedVersion,p_label:body.label.trim().normalize('NFC'),p_note:(body.note||'').trim().normalize('NFC')});
  if(error)dbFailure(error);return json({revision:data});
 }catch(error){return failure(error);}
}
