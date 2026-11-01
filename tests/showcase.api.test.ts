// @vitest-environment node
import {beforeEach,expect,test,vi} from 'vitest';
import sharp from 'sharp';
import seed from '../src/data/profile.json';
import {validateCv} from '../src/lib/validation.mjs';
import {createEnglishProfile} from '../src/lib/i18n.mjs';
const mock=vi.hoisted(()=>({owner:vi.fn()}));
vi.mock('../src/lib/api',async original=>({...await original<typeof import('../src/lib/api')>(),ownerContext:mock.owner}));
import {POST as publish} from '../src/app/api/admin/publish/route';
import {POST as upload} from '../src/app/api/admin/upload/route';
const user={id:'11111111-1111-4111-8111-111111111111'};let db:any,content:any;
beforeEach(()=>{
 const p=validateCv({...seed,name:'Test Owner',role:'PM',summary:'Giới thiệu',objective:'Mục tiêu',email:'qa@example.com',education:[],skills:[],certificates:[],experience:[],projects:[],implementations:[{id:'epu',code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai hệ thống'}]}).data!;
 content={...p,translations:{en:{...createEnglishProfile(p),role:'PM',summary:'Introduction',objective:'Objective'}}};content.translations.en.implementations[0].name='Electric Power University';
 const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn(async()=>({data:{content,version:8},error:null})),insert:vi.fn(async()=>({error:null}))};
 const storage={upload:vi.fn(async()=>({error:null})),remove:vi.fn(async()=>({error:null}))};db={from:vi.fn(()=>query),rpc:vi.fn(async()=>({data:{},error:null})),storage:{from:vi.fn(()=>storage)}};mock.owner.mockResolvedValue({db,user});
});
function json(body:unknown){return new Request('http://app.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
async function imageRequest(bytes:Uint8Array,mime='image/png'){const form=new FormData();form.append('file',new File([bytes as BlobPart],'image.png',{type:mime}));return new Request('http://app.test/api/admin/upload',{method:'POST',body:form});}
test('Publication exposes a localized exact field address and never mutates either language on a missing translation',async()=>{
 const response=await publish(json({expectedVersion:8,languages:['vi','en']})),body=await response.json();expect(response.status).toBe(422);expect(db.rpc).not.toHaveBeenCalled();
 expect(body.error).toContain('Tiếng Anh → Kinh nghiệm triển khai → EPU – Electric Power University');expect(body.error).toContain('Vai trò / Phạm vi triển khai');expect(body.issues[0]).toMatchObject({language:'en',section:'delivery',group:'implementations',rowId:'epu',rowIndex:0,field:'description'});
 expect((await publish(json({expectedVersion:8,languages:['vi']}))).status).toBe(200);
});
test('Upload rejects a corrupt image signature with a clear repair instruction before storage is changed',async()=>{
 const response=await upload(await imageRequest(new Uint8Array([137,80,78,71,13,10,26,10])));expect(response.status).toBe(422);expect((await response.json()).error).toContain('Ảnh bị hỏng');expect(db.storage.from).not.toHaveBeenCalled();
});
test('A real cropped WebP uploads privately and returns a stable owner-scoped media path',async()=>{
 const bytes=await sharp({create:{width:1280,height:800,channels:3,background:'#8d7654'}}).webp().toBuffer();const response=await upload(await imageRequest(bytes,'image/webp'));expect(response.status).toBe(200);expect((await response.json()).portrait).toMatch(new RegExp('^/api/media/'+user.id+'/[a-f0-9-]+\\.webp$'));expect(db.storage.from).toHaveBeenCalledWith('cv-assets');expect(db.from).toHaveBeenCalledWith('cv_assets');
});
