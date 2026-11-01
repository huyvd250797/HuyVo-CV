import {createHash} from 'node:crypto';
import {loadPublicCv} from '@/lib/public-profile';
import {renderCvPdf} from '@/lib/pdf-document';
import {publicPortrait,profileQr,unitLogos,appCovers} from '@/lib/share-assets';
import {pdfFilename} from '@/lib/sharing.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
const cache=new Map<string,Promise<Buffer>>();
export async function GET(request:Request){
 const {profile,status,version=1}=await loadPublicCv(request&&new URL(request.url).searchParams.get('lang')==='en'?'en':'vi');
 const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'};
 if(!profile)return Response.json({error:status==='empty'?'CV chưa được xuất bản.':'Chưa tải được CV công khai. Vui lòng thử lại.'},{status:status==='empty'?404:503,headers});
 try{
  const key=createHash('sha256').update(JSON.stringify([version,profile])).digest('hex');
  if(!cache.has(key)){
   if(cache.size>=4)cache.delete(cache.keys().next().value!);
   const pending=(async()=>{const [portrait,qr,logos,covers]=await Promise.all([publicPortrait(profile),profileQr(profile),unitLogos(profile),appCovers(profile)]);const pdf=await renderCvPdf(profile,version,portrait,qr,logos,covers);if(pdf.length>4_000_000)throw new Error('PDF_TOO_LARGE');return pdf;})();
   cache.set(key,pending);pending.catch(()=>{if(cache.get(key)===pending)cache.delete(key);});
  }
  const pdf=await cache.get(key)!;
  return new Response(new Uint8Array(pdf),{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${pdfFilename(profile.name,version).replace('.pdf',profile.language==='en'?'-EN.pdf':'-VI.pdf')}"`,'X-CV-Version':String(version)}});
 }catch{ return Response.json({error:'Chưa tạo được PDF. Hãy thử lại hoặc dùng In / Lưu PDF qua trình duyệt.'},{status:503,headers}); }
}
