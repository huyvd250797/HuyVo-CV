import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {loadPublicCv} from '@/lib/public-profile';
import {publicPortrait} from '@/lib/share-assets';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(){
 const {profile:p,status,version}=await loadPublicCv();const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
 if(!p)return new Response('CV unavailable',{status:status==='empty'?404:503,headers});
 try{
  const [font,portrait]=await Promise.all([readFile(path.join(process.cwd(),'public/fonts/pdf/NotoSans-Regular.ttf')),publicPortrait(p)]);
  return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#2d2923',color:'#f1eadc',padding:66,fontFamily:'Maison',flexDirection:'column',justifyContent:'space-between'}}>
   <div style={{display:'flex',justifyContent:'space-between',fontSize:20,color:'#c7ae84'}}><span>maison. / PERSONAL PROFILE</span><span>CV ONLINE</span></div>
   <div style={{display:'flex',gap:45,alignItems:'center'}}><div style={{display:'flex',flexDirection:'column',flex:1}}><div style={{display:'flex',fontSize:p.name.length>35?44:58,lineHeight:1.4,letterSpacing:-1}}>{p.name.slice(0,100)}</div><div style={{display:'flex',fontSize:25,color:'#c7ae84',lineHeight:1.5,marginTop:16}}>{p.role.slice(0,120)}</div><div style={{display:'flex',fontSize:20,color:'#c1b9ab',lineHeight:1.6,marginTop:18}}>{p.summary.slice(0,170)}</div></div>{portrait&&<img width="205" height="260" src={`data:image/jpeg;base64,${portrait.toString('base64')}`} style={{objectFit:'cover',borderRadius:100}}/>}</div>
   <div style={{display:'flex',borderTop:'1px solid #665b49',paddingTop:22,justifyContent:'space-between',fontSize:16,color:'#c7ae84'}}><span>YOUR STORY. YOUR NEXT CHAPTER.</span><span>HỒ SƠ NĂNG LỰC / v{version}</span></div>
  </div>,{width:1200,height:630,fonts:[{name:'Maison',data:font,weight:400,style:'normal'}],headers});
 }catch{return new Response('Ảnh chia sẻ tạm thời chưa tạo được.',{status:503,headers});}
}
