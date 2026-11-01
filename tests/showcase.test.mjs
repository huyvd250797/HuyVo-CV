import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCv,validatePublication} from '../src/lib/validation.mjs';
import {createEnglishProfile,updateLocalized,mediaPaths,englishIssues,completeEnglishSection} from '../src/lib/i18n.mjs';
import {completeEnglishApps} from '../src/lib/showcase.mjs';
import {publicContent} from '../src/lib/layout.mjs';
import {parseBackup,makeBackup,diffProfiles} from '../src/lib/history.mjs';
import {renderCv} from '../src/lib/render.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
const media='/api/media/11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.webp';
const app={id:'finzaro',name:'Finzaro',description:'Quản lý thu chi cá nhân.',role:'Phân tích & phát triển',year:'2026',platform:'Web',technologies:['Next.js','Supabase'],cover:media,coverAlt:'Màn hình tổng quan thu chi',images:[{id:'dashboard',src:media,alt:'Báo cáo theo tháng'}],status:'live',featured:true,hidden:false,demoUrl:'https://example.com/demo',sourceUrl:''};
const vi=()=>validateCv({...seed,name:'Nguyễn Văn An',role:'IT PM',summary:'Triển khai phần mềm',objective:'Phát triển chuyên môn',email:'qa@example.com',education:[],skills:[],certificates:[],experience:[],implementations:[],projects:[app]}).data;
function bundle(){const p=vi();return {...p,translations:{en:{...createEnglishProfile(p),role:'IT PM',summary:'Software delivery',objective:'Professional growth',projects:[{...app,description:'Manage personal income and expenses.',role:'Analysis and development',coverAlt:'Income and expense dashboard',images:[{...app.images[0],alt:'Monthly report'}]}]}}};}
test('Older projects receive compatible defaults; showcase fields round-trip JSON and history differences',()=>{
 const old=vi();delete old.projects[0].cover;delete old.projects[0].images;delete old.projects[0].status;
 const upgraded=validateCv(old);assert.deepEqual(upgraded.errors,[]);assert.equal(upgraded.data.schemaVersion,6);assert.deepEqual(upgraded.data.projects[0].images,[]);assert.equal(upgraded.data.projects[0].status,'developing');
 const p=bundle(),roundtrip=parseBackup(makeBackup(p,10));assert.deepEqual(roundtrip.errors,[]);assert.deepEqual(roundtrip.data.projects[0],p.projects[0]);
 const changed=structuredClone(p);changed.projects[0].images[0].alt='Mô tả ảnh mới';assert.match(diffProfiles(p,changed).find(row=>row.key==='projects').after,/Mô tả ảnh mới/);
});
test('Reject unsafe covers/gallery, too many images, duplicate IDs and invalid app options',()=>{
 for(const patch of [{cover:'https://untrusted.test/x.png'},{images:[{id:'i',src:'javascript:alert(1)',alt:'x'}]},{images:[null]},{images:Array(9).fill(app.images[0])},{images:[app.images[0],app.images[0]]},{featured:'yes'},{status:'unknown'}]){
  const p=vi();Object.assign(p.projects[0],patch);const parsed=validateCv(p);assert(parsed.errors.length,JSON.stringify(patch));assert.match(parsed.errors.join('\n'),/Ứng dụng đã xây dựng.*Finzaro/);
 }
});
test('Assets and links update across locales by stable ID while descriptions and alt text remain independent',()=>{
 const p=bundle(),changed=updateLocalized(p,'en',en=>({...en,projects:en.projects.map(row=>({...row,description:'English change only',demoUrl:'https://example.com/new',images:[{...row.images[0],alt:'English alternative'}]}))}));
 assert.equal(changed.projects[0].description,app.description);assert.equal(changed.projects[0].images[0].alt,app.images[0].alt);assert.equal(changed.projects[0].demoUrl,'https://example.com/new');
 assert.equal(changed.translations.en.projects[0].images[0].alt,'English alternative');
 const removed=updateLocalized(changed,'vi',vi=>({...vi,projects:vi.projects.map(row=>({...row,cover:'',images:[]}))}));assert.equal(removed.translations.en.projects[0].cover,'');assert.deepEqual(removed.translations.en.projects[0].images,[]);
 assert.deepEqual(mediaPaths(p),[media]);
});
test('Missing English implementation descriptions stay required with named, navigable errors after reordering',()=>{
 const p=bundle();p.implementations=[{id:'epu',code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai hệ thống'}];p.translations.en.implementations=[{id:'other',code:'OTHER',name:'Other',description:''},{id:'epu',code:'EPU',name:'Electric Power University',description:''}];
 const report=validatePublication(p,'en');assert.match(report.errors.join('\n'),/Tiếng Anh → Kinh nghiệm triển khai → EPU – Electric Power University → Thiếu “Vai trò \/ Phạm vi triển khai”/);
 const issue=report.issues.find(issue=>issue.field==='description');assert.equal(issue.rowId,'epu');assert.equal(issue.rowIndex,1);assert.equal(issue.section,'delivery');
 assert.deepEqual(validateCv(p).errors,[]);assert.deepEqual(validatePublication(p,'vi').errors,[]);
 p.translations.en.implementations[1].description='System implementation';assert.deepEqual(validatePublication(p,'en').errors,[]);
});
test('Completely missing English rows and partially translated bullet lists cannot be published',()=>{
 const p=bundle();p.experience=[{id:'job-1',role:'Quản lý dự án',company:'ASC',period:'2026',summary:'Triển khai',highlights:['Một','Hai']}];p.translations.en.experience=[];
 assert(englishIssues(p).some(issue=>issue.group==='experience'&&issue.message.includes('Chưa có mục tương ứng')));
 const synced=completeEnglishSection(p,'experience');assert.equal(synced.translations.en.experience[0].id,'job-1');assert.equal(synced.translations.en.experience[0].summary,'');
 Object.assign(synced.translations.en.experience[0],{role:'Project Manager',summary:'Delivery',highlights:['One']});assert(englishIssues(synced).some(issue=>issue.field==='highlights'&&issue.message.includes('1/2')));
});
test('Completing app inventory preserves translations and adds only missing VI IDs with blank translation copy',()=>{
 const p=bundle();p.projects.push({...app,id:'sendint',name:'SendInt'});const next=completeEnglishApps(p);assert.equal(next.translations.en.projects.length,2);assert.equal(next.translations.en.projects[0].description,p.translations.en.projects[0].description);assert.equal(next.translations.en.projects[1].description,'');assert.equal(next.translations.en.projects[1].cover,media);
 assert.equal(completeEnglishApps(next).translations.en.projects.length,2);assert(validatePublication(next,'en').errors.some(error=>error.includes('SendInt')));
});
test('Publication strips hidden apps including media; renderer remains escaped and gallery keyboard accessible',()=>{
 const p=vi();p.projects.push({...app,id:'private',name:'HIDDEN APP',hidden:true,cover:'/private-app.png'});
 const published=publicContent(p);assert.equal(published.projects.length,1);assert.equal(p.projects.length,2);assert(!mediaPaths(published).includes('/private-app.png'));
 const html=renderCv({...p,publication:'published'});assert.doesNotMatch(html,/HIDDEN APP|private-app.png/);assert.match(html,/<details class="app-gallery">/);assert.match(html,/alt="Báo cáo theo tháng"/);assert.match(html,/width="1280" height="800" loading="lazy"/);assert.match(html,/Nổi bật/);
 assert.match(renderCv(p,{editing:true,activeSection:'projects'}),/HIDDEN APP/);
 p.projects[0].name='<script>alert(1)</script>';p.projects[0].coverAlt='" onerror="alert(1)';const safe=renderCv(p);assert.doesNotMatch(safe,/<script>| onerror="/);assert.match(safe,/&lt;script&gt;/);
});
test('Published app pictures require descriptive text in either locale',()=>{
 const p=bundle();p.projects[0].coverAlt='';p.projects[0].images[0].alt='';
 const report=validatePublication(p,'vi');assert.equal(report.issues.length,2);assert(report.issues.every(issue=>issue.section==='projects'&&issue.rowId==='finzaro'));assert.deepEqual(validateCv(p).errors,[]);
});
