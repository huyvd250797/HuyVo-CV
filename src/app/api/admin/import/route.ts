import {createHash} from 'node:crypto';
import {ownerContext,json,failure,readJson,ApiError,dbFailure} from '@/lib/api';
import {parseBackup} from '@/lib/history.mjs';
export async function POST(request:Request) {
 try {
  const {db,user}=await ownerContext(request);const body=await readJson(request,300000);
  if(!['preview','apply'].includes(body.action))throw new ApiError(400,'Chọn xem trước hoặc áp dụng file nhập.');
  const parsed=parseBackup(body.backup);
  if(parsed.errors.length||!parsed.data)throw new ApiError(422,parsed.errors.join('\n'));
  const content=parsed.data,warnings=[...parsed.warnings];
  if(content.portrait.startsWith('/api/media/')) {
   const path=content.portrait.slice('/api/media/'.length);
   if(!path.startsWith(user.id+'/')){
    content.portrait='';warnings.push('Ảnh thuộc tài khoản khác nên không được nhập. Hãy chọn lại ảnh sau khi nhập nội dung.');
   }else {
    const signed=await db.storage.from('cv-assets').createSignedUrl(path,60);
    if(signed.error){
     const e=signed.error as {statusCode?:string|number;message?:string};
     if(Number(e.statusCode)===404||/not found|does not exist/i.test(e.message||'')){content.portrait='';warnings.push('Ảnh trong file không còn ở project này. Nội dung sẽ được nhập và để trống ảnh.');}
     else throw new ApiError(503,'Chưa kiểm tra được ảnh trong file. Kiểm tra kết nối rồi thử lại.');
    }
   }
  }
  const previewHash=createHash('sha256').update(JSON.stringify(content)).digest('hex');
  if(body.action==='preview')return json({content,warnings,previewHash});
  if(body.previewHash!==previewHash)throw new ApiError(412,'Nội dung hoặc ảnh đã thay đổi từ lần xem trước. Hãy chọn file để kiểm tra lại trước khi áp dụng.');
  if(!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<0)throw new ApiError(400,'Phiên bản hiện tại không hợp lệ.');
  const {data,error}=await db.rpc('apply_cv_recovery',{p_expected_version:body.expectedVersion,p_source:'import',p_content:content});
  if(error)dbFailure(error);return json({...data,warnings});
 }catch(error){return failure(error);}
}
