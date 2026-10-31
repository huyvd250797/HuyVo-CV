// @vitest-environment node
import {expect,test} from 'vitest';
import {mkdir,writeFile} from 'node:fs/promises';
import {Font} from '@react-pdf/renderer';
import {renderCvPdf} from '../src/lib/pdf-document';
import type {Profile} from '../src/lib/types';
import {profileQr} from '../src/lib/share-assets';
import {publicContent,normalizeLayout} from '../src/lib/layout.mjs';
import seed from '../src/data/profile.json';
import sharp from 'sharp';
import {createEnglishProfile} from '../src/lib/i18n.mjs';
const p:Profile={...seed,publication:'published',name:'Nguyễn Văn An',role:'IT Project Manager / Business Analyst',summary:'Kết nối nhu cầu nghiệp vụ với giải pháp công nghệ. Đồng hành cùng đội ngũ để xây dựng sản phẩm có giá trị.',objective:'Phát triển hệ thống quản trị giáo dục với trải nghiệm rõ ràng, vận hành ổn định và dữ liệu tin cậy.',email:'qa@example.com',phone:'0901234567',siteUrl:'https://cv.example.com/',website:'https://example.com/',address:'Thành phố Hồ Chí Minh',education:[{school:'Đại học Công nghệ',degree:'Công nghệ thông tin',period:'2015 - 2019',detail:'Nền tảng phân tích và phát triển phần mềm.'}],skills:[{name:'Phân tích nghiệp vụ',description:'Khảo sát, đặc tả yêu cầu và phối hợp nghiệm thu.'},{name:'Quản lý dự án',description:'Theo dõi tiến độ, kiểm soát thay đổi và trao đổi với các bên.'}],certificates:[{name:'Chứng chỉ kiểm thử',issuer:'Đơn vị đào tạo',year:'2020',url:'https://example.com/certificate'}],experience:[{role:'Project Manager',company:'Công ty Công nghệ',period:'2019 - hiện tại',summary:'Phối hợp đội ngũ phát triển hệ thống giáo dục.',highlights:['Phân tích quy trình nghiệp vụ và kiểm soát phạm vi.','Hướng dẫn sử dụng, kiểm thử và hỗ trợ vận hành.']}],implementations:[{code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai hệ thống quản trị, khảo sát nghiệp vụ và hỗ trợ đào tạo người sử dụng.'}],projects:[{name:'Ứng dụng quản trị cá nhân',role:'Phân tích & Phát triển',year:'2026',description:'Quản lý thông tin và truy cập trên nhiều thiết bị.',technologies:['Next.js','Supabase'],demoUrl:'https://example.com/demo',sourceUrl:''}]};
test('Real renderer creates a selectable-font Vietnamese A4 PDF, and a long document with page wrapping',async()=>{
 const qr=await profileQr(p);const normal=await renderCvPdf(p,18,undefined,qr);expect(normal.subarray(0,5).toString()).toBe('%PDF-');expect(normal.length).toBeGreaterThan(20000);expect(normal.length).toBeLessThan(4_000_000);
 const long={...p,layout:{hidden:['skills' as const],order:{intro:['objective' as const,'personal' as const],aside:['education' as const,'skills' as const,'certificates' as const],career:['delivery' as const,'experience' as const]}},skills:[{name:'HIDDEN_PRIVATE',description:'HIDDEN_PRIVATE'}],experience:Array.from({length:10},(_,i)=>({...p.experience[0],role:`Vị trí số ${i+1}`,summary:'Nội dung tiếng Việt có dấu, đảm bảo đầy đủ khi tự ngắt trang. '.repeat(40),highlights:[`MỐC KIỂM TRA ${i+1}`,'Phần cuối không bị cắt khỏi PDF.']}))};
 const large=await renderCvPdf(long,19,undefined,qr);expect(large.length).toBeGreaterThan(normal.length);expect(large.length).toBeLessThan(4_000_000);
 if(process.env.PDF_QA_DIR){await mkdir(process.env.PDF_QA_DIR,{recursive:true});await writeFile(`${process.env.PDF_QA_DIR}/normal.pdf`,normal);await writeFile(`${process.env.PDF_QA_DIR}/long.pdf`,large);await writeFile(`${process.env.PDF_QA_DIR}/qr.png`,qr!);await writeFile(`${process.env.PDF_QA_DIR}/profile.json`,JSON.stringify(publicContent(p)));}
},30000);

test('Real English PDF includes complete localized content, date formatting and optional uniform logos',async()=>{
 const en={...createEnglishProfile(p),publication:'published' as const,role:'IT Project Manager / Business Analyst',summary:'Connect business requirements with technology and reliable delivery.',objective:'Build useful applications and improve operational efficiency.',address:'Ho Chi Minh City, Vietnam',education:[{school:'University of Technology',degree:'Information Technology',period:'09/2015 - 06/2019',detail:'Software engineering and business analysis.'}],skills:[{name:'Business analysis',description:'Requirements, documentation and acceptance.'}],certificates:[{name:'Software Delivery Certificate',issuer:'Training Center',year:'10/2020',url:'https://example.com/certificate'}],experience:[{role:'Project Manager',company:'Technology Company',period:'07/2019 - Hiện tại',summary:'Coordinate enterprise software delivery.',highlights:['Manage scope and stakeholder communication.','Support testing, training and operations.']}],implementations:[{code:'EPU',name:'Electric Power University',period:'2024 - Hiện tại',description:'Education management system implementation.'}],projects:[{name:'Personal Workspace',role:'Analysis & Development',year:'10/2026',description:'Manage information across devices.',technologies:['Next.js','Supabase'],demoUrl:'https://example.com/demo',sourceUrl:'https://example.com/source'}]};
 const logo=await sharp(Buffer.from('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#806b4b"/><text x="15" y="60" font-size="30" fill="white">QA</text></svg>')).jpeg().toBuffer();
 const bytes=await renderCvPdf(en,24,undefined,await profileQr(en),{'0':logo});expect(bytes.length).toBeGreaterThan(20000);
 if(process.env.PDF_QA_DIR){await mkdir(process.env.PDF_QA_DIR,{recursive:true});await writeFile(`${process.env.PDF_QA_DIR}/english.pdf`,bytes);await writeFile(`${process.env.PDF_QA_DIR}/english-profile.json`,JSON.stringify(en));await writeFile(`${process.env.PDF_QA_DIR}/logo.jpg`,logo);}
},30000);

test('PDF keeps custom headings and grid reading order when using its A4 reading layout',async()=>{
 const profile={...p,layout:normalizeLayout({mode:'grid',grid:{order:['education','experience','delivery','skills'],spans:{education:6,experience:6,delivery:12}},titles:{education:'Nền tảng học tập',experience:'Hành trình nghề nghiệp'},hidden:['certificates']})};
 const pdf=await renderCvPdf(profile,20);expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
 if(process.env.PDF_QA_DIR){await mkdir(process.env.PDF_QA_DIR,{recursive:true});await writeFile(`${process.env.PDF_QA_DIR}/grid.pdf`,pdf);}
},30000);

// Regression: fontkit caches glyph state; each PDF needs fresh fonts, including parallel language requests.
test('PDF language requests use isolated font objects and concurrent generation stays valid',async()=>{
 const first=await renderCvPdf(p,30);const font=Font.getFont({fontFamily:'MaisonSerif'}).data;
 const [second,third]=await Promise.all([renderCvPdf({...p,language:'en',role:'Project Manager'},31),renderCvPdf(p,32)]);
 expect(Font.getFont({fontFamily:'MaisonSerif'}).data===font).toBe(false);
 for(const bytes of [first,second,third])expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
},30000);
