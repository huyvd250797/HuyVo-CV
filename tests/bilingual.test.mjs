import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createEnglishProfile,localizedProfile,updateLocalized,formatPeriod,englishGaps,mediaPaths} from '../src/lib/i18n.mjs';
import {validateCv,validatePublication} from '../src/lib/validation.mjs';
import {makeBackup,parseBackup,diffProfiles} from '../src/lib/history.mjs';
import {renderCv,renderDocument} from '../src/lib/render.mjs';
import {canonicalCvUrl,publishedMetadata} from '../src/lib/sharing.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
const vi=validateCv({...seed,name:'Nguyễn Văn An',role:'Quản lý dự án',summary:'Phân tích và triển khai phần mềm.',objective:'Phát triển chuyên môn.',email:'qa@example.com',education:[],skills:[],certificates:[],experience:[],implementations:[],projects:[]}).data;
test('English starts with independent content and defaults; editing either language preserves the other',()=>{
 const en=createEnglishProfile(vi);assert.equal(en.role,'');assert.equal(en.name,vi.name);assert.equal(en.layout.titles.education,'Education');
 let bundle={...vi,translations:{en}};bundle=updateLocalized(bundle,'en',p=>({...p,role:'Project Manager',objective:'Professional growth.'}));
 assert.equal(bundle.role,'Quản lý dự án');assert.equal(bundle.objective,'Phát triển chuyên môn.');
 bundle=updateLocalized(bundle,'vi',p=>({...p,summary:'Giới thiệu mới.'}));assert.equal(bundle.translations.en.role,'Project Manager');assert.equal(bundle.translations.en.summary,'');
 assert.equal(localizedProfile(bundle,'vi').translations,undefined);
});
test('English publication requires its content while Vietnamese publication can precede it',()=>{
 const bundle={...vi,translations:{en:createEnglishProfile(vi)}};
 assert.deepEqual(validatePublication(bundle,'vi').errors,[]);assert(englishGaps(bundle).length>=3);assert(validatePublication(bundle,'en').errors.length);
 bundle.translations.en={...bundle.translations.en,role:'Project Manager',summary:'Business analysis and delivery.',objective:'Professional growth.'};
 assert.deepEqual(validatePublication(bundle,'en').errors,[]);
});
test('Bilingual backup, row identity, optional logos and English differences survive round trip',()=>{
 const source={...vi,implementations:[{id:'epu',code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai',logo:'/epu.png'}]};
 const bundle={...source,translations:{en:createEnglishProfile(source)}};bundle.translations.en.implementations[0].name='Electric Power University';
 const result=parseBackup(makeBackup(bundle,23));assert.deepEqual(result.errors,[]);assert.equal(result.data.translations.en.implementations[0].id,'epu');assert.deepEqual(mediaPaths(bundle),['/epu.png']);
 const changed=updateLocalized(bundle,'en',p=>({...p,summary:'English change'}));assert(diffProfiles(bundle,changed).some(d=>d.key==='en:identity'));
 assert(parseBackup({...makeBackup(bundle,23),profile:{...bundle,translations:{en:{...bundle.translations.en,schemaVersion:99}}}}).errors.length);
});
test('English dates, public headings, action labels and share links use the selected locale',()=>{
 assert.equal(formatPeriod('Tháng 9 năm 2024 - Hiện tại','en'),'Sep 2024 - Present');assert.equal(formatPeriod('01/2024 – 31/10/2026','en'),'Jan 2024 – 31 Oct 2026');assert.equal(formatPeriod('2024 - Hiện tại','vi'),'2024 - Hiện tại');
 const en={...createEnglishProfile(vi),publication:'published',role:'Project Manager',summary:'Delivery.',objective:'Professional growth.',phone:'0901234567',address:'Vietnam',siteUrl:'https://cv.example.com'};
 const html=renderCv(en,{pdfHref:'/api/cv/pdf?lang=en',portfolioHref:'/portfolio?lang=en'});assert.match(html,/>Career objective<\/h2>/);assert.match(html,/>Phone<\/dt>/);assert.match(html,/Open Portfolio/);assert.doesNotMatch(html,/HỒ SƠ|Kinh nghiệm|Liên hệ|Địa chỉ|Mở Portfolio|ĐANG HOÀN THIỆN/);
 assert.match(renderDocument(en),/<html lang="en">/);assert.equal(canonicalCvUrl(en.siteUrl,'en'),'https://cv.example.com/en');assert.equal(publishedMetadata(en,23).openGraph.locale,'en_US');
});
test('Selected blocks expose a bottom add action; public CV has no editing actions',()=>{
 const p={...vi,implementations:[{id:'epu',code:'EPU',name:'Electric Power University',description:'Delivery',logo:'/epu.png'}]};
 const selected=renderCv(p,{editing:true,activeSection:'delivery'});assert.match(selected,/class="unit-logo"[^>]*width="44" height="44"/);assert.match(selected,/cv-bottom-add/);assert.match(selected,/data-inline-path="implementations.0.name"/);
 assert.doesNotMatch(renderCv(p),/cv-bottom-add|data-inline-path|data-cv-action/);
});
