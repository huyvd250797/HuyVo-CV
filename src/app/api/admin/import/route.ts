import {createHash} from 'node:crypto';
import {ownerContext,json,failure,readJson,ApiError,dbFailure} from '@/lib/api';
import {mediaPaths} from '@/lib/i18n.mjs';
import {parseBackup} from '@/lib/history.mjs';
export async function POST(request:Request) {
 try {
  const {db,user}=await ownerContext(request);const body=await readJson(request,600000);
  if(!['preview','apply'].includes(body.action))throw new ApiError(400,'Chọn xem trước hoặc áp dụng file nhập.');
  const parsed=parseBackup(body.backup);
  if(parsed.errors.length||!parsed.data)throw new ApiError(422,parsed.errors.join('\n'));
  const content=parsed.data,warnings=[...parsed.warnings];
  const valid=new Set<string>();for(const asset of mediaPaths(content)){
   if(!asset.startsWith('/api/media/')){valid.add(asset);continue;}const path=asset.slice('/api/media/'.length);
   if(!path.startsWith(user.id+'/')){warnings.push('Ảnh/logo thuộc tài khoản khác đã bỏ khỏi bản nhập.');continue;}
   const signed=await db.storage.from('cv-assets').createSignedUrl(path,60);
   if(!signed.error)valid.add(asset);else if(Number((signed.error as any).statusCode)===404||/not found|does not exist/i.test(signed.error.message||''))warnings.push('Ảnh/logo không còn ở project này đã được bỏ.');else throw new ApiError(503,'Chưa kiểm tra được ảnh. Hãy thử lại.');
  }
  const cleanMedia=(p:any)=>{if(p.portrait&&!valid.has(p.portrait))p.portrait='';for(const row of p.implementations||[])if(row.logo&&!valid.has(row.logo))row.logo='';for(const row of p.projects||[]){if(row.cover&&!valid.has(row.cover))row.cover='';row.images=(row.images||[]).filter((image:any)=>valid.has(image.src));}if(p.branding){if(!valid.has(p.branding.logo))p.branding.logo='';if(!valid.has(p.branding.favicon))p.branding.favicon='';}if(p.translations?.en)cleanMedia(p.translations.en);};cleanMedia(content);
  const previewHash=createHash('sha256').update(JSON.stringify(content)).digest('hex');
  if(body.action==='preview')return json({content,warnings,previewHash});
  if(body.previewHash!==previewHash)throw new ApiError(412,'Nội dung hoặc ảnh đã thay đổi từ lần xem trước. Hãy chọn file để kiểm tra lại trước khi áp dụng.');
  if(!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<0)throw new ApiError(400,'Phiên bản hiện tại không hợp lệ.');
  const {data,error}=await db.rpc('apply_cv_recovery',{p_expected_version:body.expectedVersion,p_source:'import',p_content:content});
  if(error)dbFailure(error);return json({...data,warnings});
 }catch(error){return failure(error);}
}
