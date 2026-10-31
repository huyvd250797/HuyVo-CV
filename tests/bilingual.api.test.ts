// @vitest-environment node
import {test,expect,vi,beforeEach} from 'vitest';
import seed from '../src/data/profile.json';
import {validateCv} from '../src/lib/validation.mjs';
import {createEnglishProfile} from '../src/lib/i18n.mjs';
const mock=vi.hoisted(()=>({owner:vi.fn()}));
vi.mock('../src/lib/api',async original=>({...await original<typeof import('../src/lib/api')>(),ownerContext:mock.owner}));
import {POST as publish} from '../src/app/api/admin/publish/route';
import {DELETE as remove} from '../src/app/api/admin/history/route';
import {PUT as settings} from '../src/app/api/admin/settings/route';
let db:any,content:any;
const req=(body:unknown)=>new Request('http://app.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{content=validateCv({...seed,name:'Nguyễn Văn An',role:'PM',summary:'Giới thiệu',objective:'Mục tiêu',email:'qa@example.com',education:[],skills:[],certificates:[],experience:[],implementations:[],projects:[]}).data;content.translations={en:{...createEnglishProfile(content),role:'Project Manager',summary:'Delivery.',objective:'Professional growth.'}};
 const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn(async()=>({data:{content,version:23},error:null}))};db={from:vi.fn(()=>query),rpc:vi.fn(async()=>({data:{},error:null}))};mock.owner.mockResolvedValue({db});});
test('Publish passes only requested languages and validates the whole selected set before mutation',async()=>{
 for(const languages of [['vi'],['en'],['vi','en']]){expect((await publish(req({expectedVersion:23,languages}))).status).toBe(200);expect(db.rpc).toHaveBeenLastCalledWith('publish_cv',{p_expected_version:23,p_languages:languages});}
 db.rpc.mockClear();content.translations.en.summary='';expect((await publish(req({expectedVersion:23,languages:['vi','en']}))).status).toBe(422);expect(db.rpc).not.toHaveBeenCalled();
 expect((await publish(req({expectedVersion:23,languages:['vi']}))).status).toBe(200);
});
test('Publish rejects unknown locale and stale draft without altering snapshots',async()=>{
 expect((await publish(req({expectedVersion:23,languages:['fr']}))).status).toBe(422);expect((await publish(req({expectedVersion:22,languages:['en']}))).status).toBe(409);expect(db.rpc).not.toHaveBeenCalled();
});
test('History deletion requires a single explicit target or DELETE confirmation',async()=>{
 for(const body of [{},{all:true},{id:'bad'},{all:true,confirm:'DELETE',id:'33333333-3333-4333-8333-333333333333'}])expect((await remove(req(body))).status).toBeGreaterThanOrEqual(400);
 expect(db.rpc).not.toHaveBeenCalled();expect((await remove(req({all:true,confirm:'DELETE'}))).status).toBe(200);expect(db.rpc).toHaveBeenCalledWith('delete_cv_history',{p_id:null,p_all:true});
});
test('Settings validates Auto Save type and uses independent preference version',async()=>{
 expect((await settings(req({expectedVersion:2,content:{autoSave:'false',branding:{name:'Maison'}}}))).status).toBe(422);
 const content={autoSave:false,branding:{name:'Boss',logo:'',favicon:''}};expect((await settings(req({expectedVersion:2,content}))).status).toBe(200);expect(db.rpc).toHaveBeenCalledWith('save_cv_preferences',{p_content:content,p_expected_version:2});
});
