import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeLayout,moveItem,publicContent} from '../src/lib/layout.mjs';
import {validateCv} from '../src/lib/validation.mjs';
import {renderCv,escapeHtml} from '../src/lib/render.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
test('v1.1 records get the default layout; incomplete or duplicated order does not lose sections',()=>{
 assert.deepEqual(normalizeLayout().order.aside,['education','skills','certificates']);
 const layout=normalizeLayout({order:{aside:['skills','skills','projects','evil']},hidden:['skills','skills','unknown']});
 assert.deepEqual(layout.order.aside,['skills','education','certificates']);assert.deepEqual(layout.hidden,['skills']);
 assert.deepEqual(moveItem(['a','b','c'],2,0),['c','a','b']);
});
test('Renderer reorders within columns and hides full sections while keeping the Portfolio entry',()=>{
 const html=renderCv({...seed,layout:{order:{aside:['certificates','skills','education'],intro:['personal','objective'],career:['delivery','experience']},hidden:['skills','projects']}});
 assert(html.indexOf('id="certificates"')<html.indexOf('id="education"'));
 assert(html.indexOf('id="personal"')<html.indexOf('id="objective"'));
 assert(html.indexOf('id="delivery"')<html.indexOf('id="experience"'));
 assert.doesNotMatch(html,/id="skills"|id="projects"|href="#projects"/);
 assert.match(html,/id="portfolio"/);assert.match(html,/Mở Portfolio/);
});
test('Hidden content is preserved in draft and removed from the public payload',()=>{
 const draft={...seed,email:'private@example.com',objective:'PRIVATE OBJECTIVE',layout:{hidden:['personal','objective','education'],order:{}}};
 const snapshot=publicContent(draft);
 assert.equal(draft.email,'private@example.com');assert.equal(snapshot.email,'');assert.equal(snapshot.objective,'');assert.deepEqual(snapshot.education,[]);
 assert.equal(snapshot.name,draft.name);
});
test('Publish validates visible content and allows a deliberately hidden contact section',()=>{
 const draft={...seed,name:'Tên thật',layout:{hidden:['personal','objective','education','skills','experience'],order:{}}};
 assert.deepEqual(validateCv(draft,true).errors,[]);
});
test('Vietnamese Unicode is composed consistently in saved content and rendering',()=>{
 const text='Hồ sơ của bạn. Chăm chút từng chi tiết. Chưa xuất bản.';
 const nfd=text.normalize('NFD');assert.notEqual(text,nfd);
 assert.equal(escapeHtml(nfd),text);
 assert.equal(validateCv({...seed,name:nfd}).data.name,text);
});
test('Bundled serif fonts cover Vietnamese/Latin and do not depend on a remote font service',async()=>{
 const css=await readFile(new URL('../src/app/globals.css',import.meta.url),'utf8');
 assert.match(css,/font-family: 'Maison Serif'/);assert.doesNotMatch(css,/Georgia|fonts\.googleapis/);
 assert.match(css,/U\+1EA0-1EF9/i);
 for(const subset of ['vietnamese','latin-ext','latin'])for(const style of ['normal','italic']){
  const bytes=await readFile(new URL(`../public/fonts/noto-serif-${subset}-400-${style}.woff2`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'wOF2');
 }
});
