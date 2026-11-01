import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeLayout,sectionOrder,moveSection,publicContent} from '../src/lib/layout.mjs';
import {timeKey,sortByTime} from '../src/lib/chronology.mjs';
import {renderCv} from '../src/lib/render.mjs';
import {makeBackup,parseBackup,diffProfiles} from '../src/lib/history.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
test('Grid normalizes all blocks exactly once, bounded spans and escaped custom titles',()=>{
 const layout=normalizeLayout({mode:'grid',grid:{order:['education','experience','delivery','education','evil'],spans:{education:6,experience:6,delivery:12,skills:500,projects:'6'}},titles:{education:'Học vấn mới'.normalize('NFD'),evil:'NOT ALLOWED'}});
 assert.equal(new Set(sectionOrder(layout)).size,8);assert.deepEqual(sectionOrder(layout).slice(0,3),['education','experience','delivery']);assert.equal(layout.grid.spans.delivery,12);assert.equal(layout.grid.spans.skills,6);assert.equal(layout.grid.spans.projects,12);assert.equal(layout.titles.education,'Học vấn mới');assert(!('evil' in layout.titles));assert.deepEqual(normalizeLayout(layout),layout);
});
test('Both layout configurations survive switching; Maison blocks can move across regions without duplicates',()=>{
 let layout=normalizeLayout();const classic=structuredClone(layout.order);layout=moveSection(layout,'education','experience');assert.equal(layout.order.career[1],'education');assert.equal(sectionOrder(layout).filter(id=>id==='education').length,1);
 const grid={...layout,mode:'grid'};const moved=moveSection(grid,'education','projects');assert.deepEqual(moved.order,layout.order);assert.notDeepEqual(moved.grid.order,grid.grid.order);assert.notDeepEqual(classic,moved.order);assert.deepEqual(normalizeLayout({...moved,mode:'maison'}).order,moved.order);
});
test('Public grid follows actual source order and 6/6/12 spans; admin tools appear only for active block',()=>{
 const profile={...seed,layout:{mode:'grid',grid:{order:['education','experience','delivery'],spans:{education:6,experience:6,delivery:12}},titles:{education:'Học vấn & Đào tạo',experience:'<script>alert(1)</script>'}}};
 const html=renderCv(profile);assert(html.indexOf('id="education"')<html.indexOf('id="experience"'));assert(html.indexOf('id="experience"')<html.indexOf('id="delivery"'));assert.match(html,/data-grid-span="6"/);assert.match(html,/--block-span:12/);assert.match(html,/Học vấn &amp; Đào tạo/);assert(!html.includes('<script>'));assert(!html.includes('data-cv-action'));
 const idle=renderCv(profile,{editing:true});assert(!idle.includes('data-cv-action'));
 const active=renderCv(profile,{editing:true,activeSection:'education'});assert.match(active,/data-cv-action="add-row" data-section="education"/);assert.match(active,/data-cv-action="row-up" data-section="education"/);assert(!active.includes('data-cv-action="add-row" data-section="experience"'));
});
test('Custom titles/grid/time data round trip JSON and history, while hidden titles stay private',()=>{
 const p={...seed,implementations:[{code:'EPU',name:'Trường Đại học Điện lực',period:'2021 - hiện tại',description:'Phạm vi'}],layout:{mode:'grid',grid:{order:['education','experience','delivery'],spans:{education:6,experience:6,delivery:12}},hidden:['skills'],titles:{skills:'PRIVATE SKILL TITLE',education:'Nền tảng học tập'}}};
 const parsed=parseBackup(makeBackup(p,20));assert.deepEqual(parsed.errors,[]);assert.equal(parsed.data.schemaVersion,6);assert.equal(parsed.data.layout.grid.spans.delivery,12);assert.equal(parsed.data.implementations[0].period,'2021 - hiện tại');assert.equal(parsed.data.layout.titles.education,'Nền tảng học tập');
 const published=publicContent(parsed.data);assert(!('skills' in published.layout.titles));assert.equal(parsed.data.layout.titles.skills,'PRIVATE SKILL TITLE');assert(diffProfiles(seed,p).some(row=>row.key==='layout'));
});
test('Chronology supports ranges, Vietnamese/English months and present without guessing invalid dates',()=>{
 assert.equal(timeKey('JUL 2019 - OCT 2019'),20190701);assert.equal(timeKey('JUL 2019 - OCT 2019','end'),20191031);assert.equal(timeKey('09/2020 – 09/2021'),20200901);assert.equal(timeKey('2025-02-15'),20250215);assert.equal(timeKey('Tháng 7 2024'),20240701);assert.equal(timeKey('2021 - Đến nay','end'),Infinity);assert.equal(timeKey('31/02/2024'),null);assert.equal(timeKey('không rõ'),null);
});
test('Chronology is stable in both directions; missing dates remain last; source array is unchanged',()=>{
 const rows=[{name:'missing',period:''},{name:'old',period:'2019 - 2021'},{name:'now',period:'2023 - Hiện tại'},{name:'equal',period:'2019 - 2021'},{name:'bad',period:'31/02/2024'}];
 assert.deepEqual(sortByTime(rows,'period','asc').map(x=>x.name),['old','equal','now','missing','bad']);assert.deepEqual(sortByTime(rows,'period','desc').map(x=>x.name),['now','old','equal','missing','bad']);assert.equal(rows[0].name,'missing');assert.equal(sortByTime(rows,'period','desc','end')[0].name,'now');
});
