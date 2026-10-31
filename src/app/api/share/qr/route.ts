import {loadPublicCv} from '@/lib/public-profile';
import {profileQr} from '@/lib/share-assets';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const {profile,status}=await loadPublicCv(request&&new URL(request.url).searchParams.get('lang')==='en'?'en':'vi');const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'};
 if(!profile)return new Response('CV unavailable',{status:status==='empty'?404:503,headers});
 try{const qr=await profileQr(profile);if(!qr)return new Response('Cần khai báo URL website CV và xuất bản lại.',{status:422,headers});
 const download=new URL(request.url).searchParams.get('download')==='1';
 return new Response(new Uint8Array(qr),{headers:{...headers,'Content-Type':'image/png',...(download?{'Content-Disposition':'attachment; filename="Maison-CV-QR.png"'}:{})}});
 }catch{return new Response('Chưa tạo được QR. Vui lòng thử lại.',{status:503,headers});}
}
