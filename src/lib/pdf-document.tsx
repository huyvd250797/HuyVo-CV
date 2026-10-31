import {formatPeriod} from './i18n.mjs';
import React from 'react';
import path from 'node:path';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {Document,Page,Text,View,Link,Image,Font,StyleSheet,renderToBuffer} from '@react-pdf/renderer';
import type {Profile,SectionId} from './types';
import {normalizeLayout,publicContent,sectionOrder,sectionTitle} from './layout.mjs';
import {canonicalCvUrl} from './sharing.mjs';
import {safeWebUrl,safeEmail,safePhone} from './render.mjs';
const fonts=path.join(process.cwd(),'public/fonts/pdf');
function registerFonts(){
Font.register({family:'Helvetica',fonts:[{src:'Helvetica'},{src:'Helvetica-Bold',fontWeight:700},{src:'Helvetica-Oblique',fontStyle:'italic'},{src:'Helvetica-BoldOblique',fontWeight:700,fontStyle:'italic'}]});
Font.registerHyphenationCallback(word=>[word]);
Font.register({family:'MaisonSans',fonts:[{src:path.join(fonts,'NotoSans-Regular.ttf')},{src:path.join(fonts,'NotoSans-Bold.ttf'),fontWeight:700}]});
Font.register({family:'MaisonSerif',src:path.join(fonts,'NotoSerif-Regular.ttf')});
}
registerFonts();
Font.registerHyphenationCallback(word=>[word]);
const s=StyleSheet.create({
 page:{fontFamily:'MaisonSans',fontSize:9.5,lineHeight:1.65,color:'#39352e',paddingTop:38,paddingBottom:53,paddingHorizontal:43,backgroundColor:'#fffdf9'},
 top:{fontSize:8,letterSpacing:2,color:'#8d7654',marginBottom:17},
 hero:{flexDirection:'row',gap:22,borderBottomWidth:1,borderColor:'#d6cbb8',paddingBottom:20,marginBottom:12},
 heroCopy:{flexGrow:1,flexShrink:1},name:{fontFamily:'MaisonSerif',fontSize:28,lineHeight:1.45,marginBottom:7},role:{fontWeight:700,fontSize:10.5,color:'#806b4b',marginBottom:9},
 photo:{width:76,height:96,objectFit:'cover',borderRadius:28},summary:{color:'#615b51',fontSize:9.5},
 section:{marginTop:15},heading:{marginTop:15,fontFamily:'MaisonSerif',fontSize:15,lineHeight:1.5,color:'#554630',borderBottomWidth:.5,borderColor:'#ded4c3',paddingBottom:5,marginBottom:9},
 entry:{marginBottom:10},entryTitle:{fontWeight:700,fontSize:10.5,lineHeight:1.6},meta:{fontSize:8.5,color:'#8c7453',marginBottom:4},body:{color:'#5c564d',marginBottom:4},bullet:{paddingLeft:9,marginBottom:3},
 contact:{flexDirection:'row',flexWrap:'wrap',gap:8},link:{color:'#6d5738',textDecoration:'none'},code:{fontWeight:700,fontSize:11,color:'#665035',letterSpacing:1},
 qrRow:{flexDirection:'row',alignItems:'center',borderTopWidth:.5,borderColor:'#ded4c3',marginTop:20,paddingTop:12,gap:16},qr:{width:58,height:58},qrText:{flex:1,fontSize:8,color:'#736956'},
 footer:{position:'absolute',left:43,right:43,bottom:24,borderTopWidth:.5,borderColor:'#ded4c3',paddingTop:6,flexDirection:'row',justifyContent:'space-between',fontSize:7,color:'#8b806f',height:17,lineHeight:1.2},
});
function Body({children}:{children?:React.ReactNode}){return <Text style={s.body} orphans={2} widows={2}>{children}</Text>;}
function WebLink({href,children}:{href?:string|null;children:React.ReactNode}){return href?<Link src={href} style={s.link}>{children}</Link>:<Text>{children}</Text>;}
const titles:Record<SectionId,string>={objective:'Mục tiêu nghề nghiệp',personal:'Thông tin liên hệ',education:'Học vấn',skills:'Kỹ năng cá nhân',certificates:'Chứng chỉ',experience:'Kinh nghiệm làm việc',delivery:'Kinh nghiệm triển khai',projects:'Sản phẩm nổi bật'};
export function CvPdf({profile,version,portrait,qr,logos={}}:{profile:Profile;version:number;portrait?:Buffer;qr?:Buffer;logos?:Record<string,Buffer>}){
 // Defence in depth: even a full private input cannot expose hidden fields in a public PDF.
 const p=publicContent(profile),layout=normalizeLayout(p.layout),hidden=new Set(layout.hidden),url=canonicalCvUrl(p.siteUrl,p.language);
 const en=p.language==='en';const order=sectionOrder(layout);const enTitles:Record<SectionId,string>={objective:'Career objective',personal:'Contact information',education:'Education',skills:'Skills',certificates:'Certifications',experience:'Professional experience',delivery:'Implementation experience',projects:'Selected applications & projects'};
 const body=(id:SectionId):React.ReactNode=>{
  switch(id){
   case 'objective':return p.objective?<Body>{p.objective}</Body>:null;
   case 'personal':return <View style={s.contact}>{[[en?'Email':'Email',p.email,safeEmail(p.email)],[en?'Phone':'Điện thoại',p.phone,safePhone(p.phone)],['Website',p.website,safeWebUrl(p.website)],[en?'Location':'Địa chỉ',p.address,null]].filter(([,value])=>value).map(([label,value,href])=><Text key={label} style={s.body}>{label}: <WebLink href={href}>{value}</WebLink></Text>)}</View>;
   case 'education':return p.education.map((r,i)=><View key={i} style={s.entry}><Text style={s.entryTitle} minPresenceAhead={22}>{r.school}</Text><Text style={s.meta}>{[r.degree,formatPeriod(r.period,p.language)].filter(Boolean).join(' | ')}</Text>{r.detail&&<Body>{r.detail}</Body>}</View>);
   case 'skills':return p.skills.map((r,i)=><View key={i} style={s.entry}><Text style={s.entryTitle} minPresenceAhead={18}>{r.name}</Text>{r.description&&<Body>{r.description}</Body>}</View>);
   case 'certificates':return p.certificates.map((r,i)=><View key={i} style={s.entry}><Text style={s.entryTitle} minPresenceAhead={18}>{r.name}</Text><Text style={s.meta}>{[r.issuer,formatPeriod(r.year,p.language)].filter(Boolean).join(' | ')}</Text>{safeWebUrl(r.url||'')&&<Text style={s.body}><WebLink href={safeWebUrl(r.url||'')}>{en?'Verify':'Xác minh'}: {r.url}</WebLink></Text>}</View>);
   case 'experience':return p.experience.map((r,i)=><View key={i} style={s.entry}><Text style={s.entryTitle} minPresenceAhead={28}>{r.role}</Text><Text style={s.meta}>{[r.company,formatPeriod(r.period,p.language)].filter(Boolean).join(' | ')}</Text>{r.summary&&<Body>{r.summary}</Body>}{r.highlights.map((line,n)=><Text style={s.bullet} key={n} orphans={2} widows={2}>- {line}</Text>)}</View>);
   case 'delivery':return p.implementations.map((r,i)=><View key={i} style={s.entry}><View style={{flexDirection:'row',gap:9,alignItems:'center',marginBottom:4}} wrap={false}>{logos[String(i)]&&<Image src={{data:logos[String(i)],format:'jpg'}} style={{width:28,height:28,objectFit:'contain'}}/>}<View style={{flex:1}}>{r.code&&<Text style={s.code}>{r.code}</Text>}<Text style={s.entryTitle}>{r.name}</Text></View></View>{r.period&&<Text style={s.meta}>{formatPeriod(r.period,p.language)}</Text>}{r.description&&<Body>{r.description}</Body>}</View>);
   case 'projects':return p.projects.map((r,i)=><View key={i} style={s.entry}><Text style={s.entryTitle} minPresenceAhead={25}>{r.name}</Text><Text style={s.meta}>{[r.role,formatPeriod(r.year,p.language)].filter(Boolean).join(' | ')}</Text>{r.description&&<Body>{r.description}</Body>}{!!r.technologies.length&&<Body>{en?'Technologies':'Công nghệ'}: {r.technologies.join(', ')}</Body>}{[['Demo',r.demoUrl],[en?'Source code':'Mã nguồn',r.sourceUrl]].filter(([,href])=>safeWebUrl(href||'')).map(([label,href])=><Text style={s.body} key={label}><WebLink href={safeWebUrl(href||'')}>{label}: {href}</WebLink></Text>)}</View>);
  }
 };
 const nonempty=(id:SectionId)=>id==='personal'?!!(p.email||p.phone||p.address||p.website):id==='objective'?!!p.objective:(id==='delivery'?p.implementations:p[id as 'education']).length>0;
 return <Document title={`${p.name} - ${p.role}`} author={p.name} subject={`${en?'Published profile - version':'Hồ sơ công khai - phiên bản'} ${version}`} creator="Maison CV v1.6.0" language={en?'en-US':'vi-VN'}><Page size="A4" style={s.page} wrap>
  <Text style={s.top}>{p.branding?.name||'MAISON'} / {en?'PROFESSIONAL PROFILE':'HỒ SƠ NĂNG LỰC'}</Text>
  <View style={s.hero}><View style={s.heroCopy}><Text style={s.name} minPresenceAhead={30}>{p.name}</Text><Text style={s.role}>{p.role}</Text>{p.summary&&<Text style={s.summary} orphans={2} widows={2}>{p.summary}</Text>}</View>{portrait&&<Image src={{data:portrait,format:'jpg'}} style={s.photo}/>}</View>
  {order.filter(id=>!hidden.has(id)&&nonempty(id)).map(id=><React.Fragment key={id}><Text style={s.heading} minPresenceAhead={65}>{layout.titles[id]||(en?enTitles[id]:titles[id])}</Text>{body(id)}</React.Fragment>)}
  {url&&<View style={s.qrRow} wrap={false}>{qr&&<Image src={{data:qr,format:'png'}} style={s.qr}/>}<View style={s.qrText}><Text>{en?'Online CV & Portfolio':'Hồ sơ online & Portfolio'}</Text><Link src={url} style={s.link}>{url}</Link><Text>{en?'Published version':'Bản công khai'} v{version}. {en?'Scan for the latest profile.':'Quét QR để xem nội dung hiện hành.'}</Text><Link src={new URL(en?'/portfolio?lang=en':'/portfolio',url).href} style={s.link}>{en?'Open Portfolio':'Mở Portfolio'}</Link></View></View>}

 </Page></Document>;
}
let rendering:Promise<unknown>=Promise.resolve();
export function renderCvPdf(profile:Profile,version:number,portrait?:Buffer,qr?:Buffer,logos?:Record<string,Buffer>):Promise<Buffer>{
 // fontkit objects contain mutable glyph/subset state. Reusing them across documents
 // can drop characters when switching VI/EN. Serialize and load fresh font objects.
 const result=rendering.catch(()=>{}).then(()=>renderFresh(profile,version,portrait,qr,logos));rendering=result;return result;
}
async function renderFresh(profile:Profile,version:number,portrait?:Buffer,qr?:Buffer,logos?:Record<string,Buffer>){
 Font.clear();registerFonts();
 const raw=await renderToBuffer(<CvPdf profile={profile} version={version} portrait={portrait} qr={qr} logos={logos}/>);
 // Stamp after pagination: the footer stays inside A4 and cannot affect text flow.
 const pdf=await PDFDocument.load(raw),font=await pdf.embedFont(StandardFonts.Helvetica),pages=pdf.getPages();
 pages.forEach((page,index)=>{
  const text=`MAISON CV / v${version}     |     ${index+1} / ${pages.length}`;
  page.drawLine({start:{x:43,y:38},end:{x:page.getWidth()-43,y:38},thickness:.5,color:rgb(.86,.82,.75)});
  page.drawText(text,{x:page.getWidth()-43-font.widthOfTextAtSize(text,7),y:24,font,size:7,color:rgb(.5,.46,.39)});
 });
 return Buffer.from(await pdf.save());
}
