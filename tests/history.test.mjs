import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeBackup,parseBackup,diffProfiles,MAX_BACKUP_BYTES} from '../src/lib/history.mjs';
const seed=JSON.parse(await readFile(new URL('../src/data/profile.json',import.meta.url),'utf8'));
test('JSON backup round trips CV content, layout and schema without exporting credentials',()=>{
 const profile={...seed,name:'Tên thật',schemaVersion:2,layout:{order:{aside:['skills','education','certificates']},hidden:['projects']},access_token:'NEVER EXPORT',password:'SECRET'};
 const backup=makeBackup(profile,7,'2026-10-31T12:00:00.000Z');
 assert.equal(backup.documentVersion,7);assert.equal(backup.media.included,false);
 assert.doesNotMatch(JSON.stringify(backup),/NEVER EXPORT|SECRET|access_token/);
 const parsed=parseBackup(JSON.stringify(backup));assert.deepEqual(parsed.errors,[]);assert.equal(parsed.data.name,'Tên thật');assert.deepEqual(parsed.data.layout.hidden,['projects']);
});
test('Legacy JSON including decomposed Vietnamese is converted without changing source data',()=>{
 const legacy={...seed,name:'Hồ sơ'.normalize('NFD')};const parsed=parseBackup('\uFEFF'+JSON.stringify(legacy));
 assert.deepEqual(parsed.errors,[]);assert.equal(parsed.data.name,'Hồ sơ');assert(parsed.warnings.length>0);assert.notEqual(legacy.name,parsed.data.name);
});
test('Malformed, unrelated and future-version backups are rejected before import',()=>{
 for(const value of ['{broken','[]','null',JSON.stringify({title:'not a CV'}),{format:'wrong',formatVersion:1,profile:seed},{format:'maison-cv-backup',formatVersion:9,profile:seed},{...seed,schemaVersion:99},{...seed,skills:'bad'}]){
  const result=parseBackup(value);assert(result.errors.length>0);assert.equal(result.data,null);
 }
});
test('Import limits are measured in bytes and reject unsafe links and malformed rows',()=>{
 assert(parseBackup({...seed,name:'ắ'.repeat(MAX_BACKUP_BYTES/2)}).errors.length>0);
 assert(parseBackup({...seed,website:'javascript:alert(1)'}).errors.length>0);
 assert(parseBackup({...seed,experience:[null]}).errors.length>0);
});
test('Comparisons identify contact, ordering and visibility changes, without mutating either profile',()=>{
 const before={...seed,skills:[{name:'A',description:''},{name:'B',description:''}]},after=structuredClone(before);
 after.email='new@example.com';after.skills.reverse();after.layout={hidden:['projects'],order:{}};
 const rows=diffProfiles(before,after);assert.deepEqual(rows.map(x=>x.key),['contact','skills','layout']);
 assert.match(rows.find(x=>x.key==='contact').after,/new@example.com/);assert.equal(before.skills[0].name,'A');
});
test('Semantically identical hidden sets and normalized Vietnamese do not create spurious differences',()=>{
 const a={...seed,name:'Hồ sơ',layout:{order:{},hidden:['skills','projects']}},b={...seed,name:'Hồ sơ'.normalize('NFD'),layout:{order:{},hidden:['projects','skills']}};
 assert.deepEqual(diffProfiles(a,b),[]);
});
