import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCv,imageType } from '../src/lib/validation.mjs';
import { renderCv } from '../src/lib/render.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
test('Draft supports incomplete content; public snapshot blocks placeholders and missing contacts',()=>{
 assert.deepEqual(validateCv(seed).errors,[]);
 assert(validateCv(seed,true).errors.length>0);
 const real={...seed,name:'Tên kiểm thử',role:'Business Analyst',objective:'Đóng góp thực tế',email:'test@example.com',education:[],skills:[],experience:[]};
 assert.deepEqual(validateCv(real,true).errors,[]);
});
test('Input validation rejects oversized arrays, malformed rows, data URLs and unsafe links',()=>{
 for (const patch of [{skills:Array(51).fill({name:'x',description:''})},{experience:[null]},{portrait:'data:image/png;base64,abc'},{website:'javascript:alert(1)'},{projects:[{name:'x',description:'',role:'',year:'',technologies:[],demoUrl:'https://u:p@example.com'}]},{name:{nested:true}}])assert(validateCv({...seed,...patch}).errors.length>0);
 const parsed=validateCv({...seed,publication:'published',cvFile:'/stale.pdf',secret:'do not persist'}).data;
 assert.equal(parsed.publication,'draft');assert.equal(parsed.cvFile,'');assert.equal(parsed.secret,undefined);
});
test('Image validation checks signatures instead of trusting extension or MIME type',()=>{
 assert.equal(imageType(new Uint8Array([137,80,78,71,13,10,26,10])).mime,'image/png');
 assert.equal(imageType(new Uint8Array([255,216,255])).extension,'jpg');
 assert.equal(imageType(new TextEncoder().encode('<svg onload="alert(1)">')),null);
 assert.equal(imageType(new TextEncoder().encode('<html>fake.jpg</html>')),null);
});
test('Editor hooks are opt-in; public rendering remains escaped and links to current print route',()=>{
 const editor=renderCv({...seed,name:'<img onerror=alert(1)>'},{editing:true});
 assert.match(editor,/data-inline-path="name"/);assert.match(editor,/data-cv-section="education"/);
 assert.match(editor,/&lt;img onerror=alert\(1\)&gt;/);assert.doesNotMatch(editor,/<img onerror/);
 const publicHtml=renderCv(seed,{printHref:'/print'});
 assert.doesNotMatch(publicHtml,/contenteditable|data-cv-section|cv.pdf/);
 assert.match(publicHtml,/href="\/print"/);assert.match(publicHtml,/Mở Portfolio/);
});
