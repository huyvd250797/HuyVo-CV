import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {canonicalCvUrl,pdfFilename,publishedMetadata} from '../src/lib/sharing.mjs';
import {validateCv} from '../src/lib/validation.mjs';
import {parseBackup,makeBackup,diffProfiles} from '../src/lib/history.mjs';
import {renderCv} from '../src/lib/render.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
test('Unit code is optional in legacy profiles, bounded, NFC normalized, and preserved in JSON history',()=>{
 const old={...seed,schemaVersion:2,implementations:[{name:'EPU',description:'Phạm vi cũ'}]};
 const legacy=parseBackup(old);assert.deepEqual(legacy.errors,[]);assert.equal(legacy.data.implementations[0].code,'');assert.equal(legacy.data.implementations[0].name,'EPU');assert.equal(legacy.data.schemaVersion,4);
 const current={...seed,implementations:[{code:'EPU',name:'Trường Đại học Điện lực'.normalize('NFD'),description:'Triển khai quản trị đào tạo.'}]};
 const parsed=parseBackup(makeBackup(current,18));assert.deepEqual(parsed.errors,[]);assert.equal(parsed.data.implementations[0].name,'Trường Đại học Điện lực');assert.equal(parsed.data.implementations[0].code,'EPU');
 assert(diffProfiles(old,current).find(x=>x.key==='implementations').after.includes('Mã đơn vị: EPU'));
 assert(validateCv({...current,implementations:[{...current.implementations[0],code:'x'.repeat(81)}]}).errors.length);
});
test('Implementation cards show separate escaped code/name lines and keep no-code legacy cards',()=>{
 const html=renderCv({...seed,implementations:[{code:'EPU',name:'Trường Đại học Điện lực',description:'Nội dung'},{name:'Đơn vị trước nâng cấp',description:'Cũ'},{code:'<script>',name:'<img>',description:'<b>'}]});
 assert.match(html,/<strong class="unit-code">EPU<\/strong><span class="unit-name">Trường Đại học Điện lực<\/span>/);assert.match(html,/unit-name-only">Đơn vị trước nâng cấp/);assert(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);
});
test('Sharing URL accepts website origins only without credentials, fragments, tracking or admin paths',()=>{
 assert.equal(canonicalCvUrl('https://example.com/admin?token=NO#secret'),'https://example.com/');
 for(const value of ['',null,'javascript:alert(1)','file:///etc/passwd','https://user:password@example.com'])assert.equal(canonicalCvUrl(value),null);
 assert.equal(canonicalCvUrl('http://localhost:3000/'),'http://localhost:3000/');
});
test('PDF filename is header safe and includes normalized profile name plus snapshot version',()=>{
 assert.equal(pdfFilename('Võ Đức Huy',17),'CV-Vo-duc-Huy-v17.pdf');assert(!/[\r\n"/\\]/.test(pdfFilename('"\r\nX: /evil',8)));assert.equal(pdfFilename('',0),'CV-Ho-so-v1.pdf');
});
test('Social metadata uses published identity and snapshot image URL, without fabricating localhost',()=>{
 const metadata=publishedMetadata({...seed,name:'Tên thật',role:'PM',siteUrl:'https://cv.example.com/admin'},9);
 assert.equal(metadata.alternates.canonical,'https://cv.example.com/');assert.equal(metadata.openGraph.images[0].url,'https://cv.example.com/api/share/image?v=9');assert.equal(metadata.twitter.card,'summary_large_image');
 const absent=publishedMetadata({...seed,siteUrl:''},9);assert.equal(absent.alternates,undefined);assert.equal(absent.openGraph.images,undefined);
});
