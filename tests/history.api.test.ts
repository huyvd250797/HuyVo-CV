// @vitest-environment node
import {test,expect,vi,beforeEach} from 'vitest';
import {makeBackup} from '../src/lib/history.mjs';
import seed from '../src/data/profile.json';
const mock=vi.hoisted(()=>({owner:vi.fn()}));
vi.mock('../src/lib/api',async original=>({...await original<typeof import('../src/lib/api')>(),ownerContext:mock.owner}));
import {POST as importPost} from '../src/app/api/admin/import/route';
import {GET as listGet,POST as checkpointPost} from '../src/app/api/admin/history/route';
import {GET as detailGet} from '../src/app/api/admin/history/[id]/route';
import {POST as restorePost} from '../src/app/api/admin/history/[id]/restore/route';
import {ApiError} from '../src/lib/api';
const userId='11111111-1111-4111-8111-111111111111',recordId='33333333-3333-4333-8333-333333333333';
const profile={...seed,publication:'draft' as const,name:'Tên thử nghiệm',email:'test@example.com'};
let db:any,query:any,rows:any[],detail:any,signed:any;
const request=(body:unknown)=>new Request('http://app.test/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{
 rows=[];detail={id:recordId,content:profile};signed={data:{signedUrl:'https://storage.example/temporary-token'},error:null};
 query={select:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),limit:vi.fn().mockReturnThis(),or:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn(async()=>({data:detail,error:null})),then:(resolve:any,reject:any)=>Promise.resolve({data:rows,error:null}).then(resolve,reject)};
 db={from:vi.fn(()=>query),rpc:vi.fn(async()=>({data:{document:{content:profile,version:8,updated_at:'2026-10-31T12:00:00Z'}},error:null})),storage:{from:vi.fn(()=>({createSignedUrl:vi.fn(async()=>signed)}))}};
 mock.owner.mockResolvedValue({db,user:{id:userId}});
});
test('Unauthenticated history/import requests stop before accessing data',async()=>{
 mock.owner.mockRejectedValue(new ApiError(401,'Vui lòng đăng nhập.'));
 expect((await listGet(new Request('http://app.test/api/admin/history'))).status).toBe(401);
 expect((await importPost(request({action:'preview',backup:makeBackup(profile,3)}))).status).toBe(401);
 expect(db.from).not.toHaveBeenCalled();expect(db.rpc).not.toHaveBeenCalled();
});
test('Malformed or future JSON returns validation errors without any mutation',async()=>{
 for(const backup of [{unrelated:true},{...profile,schemaVersion:99},{format:'other',formatVersion:1,profile}]){
  expect((await importPost(request({action:'apply',backup,expectedVersion:7}))).status).toBe(422);
 }
 expect(db.rpc).not.toHaveBeenCalled();
});
test('Import requires a matching preview and passes a normalized profile with an expected version',async()=>{
 const backup=makeBackup(profile,3);
 const preview=await (await importPost(request({action:'preview',backup}))).json();
 expect(preview.previewHash).toMatch(/^[a-f0-9]{64}$/);expect(db.rpc).not.toHaveBeenCalled();
 expect((await importPost(request({action:'apply',backup,expectedVersion:7,previewHash:'changed'}))).status).toBe(412);
 expect((await importPost(request({action:'apply',backup,expectedVersion:7,previewHash:preview.previewHash}))).status).toBe(200);
 expect(db.rpc).toHaveBeenCalledWith('apply_cv_recovery',expect.objectContaining({p_expected_version:7,p_source:'import',p_content:expect.objectContaining({name:'Tên thử nghiệm',publication:'draft'})}));
});
test('A portrait from another owner is cleared with a warning before import preview',async()=>{
 const backup=makeBackup({...profile,portrait:'/api/media/22222222-2222-4222-8222-222222222222/44444444-4444-4444-8444-444444444444.png'},3);
 const result=await (await importPost(request({action:'preview',backup}))).json();
 expect(result.content.portrait).toBe('');expect(result.warnings.join()).toContain('tài khoản khác');expect(db.storage.from).not.toHaveBeenCalled();
});
test('An absent portrait is explicitly removed, and a changed preview cannot be applied silently',async()=>{
 const backup=makeBackup({...profile,portrait:`/api/media/${userId}/44444444-4444-4444-8444-444444444444.png`},3);
 const preview=await (await importPost(request({action:'preview',backup}))).json();expect(preview.content.portrait).not.toBe('');
 signed={data:null,error:{statusCode:404,message:'Object not found'}};
 const apply=await importPost(request({action:'apply',backup,expectedVersion:7,previewHash:preview.previewHash}));
 expect(apply.status).toBe(412);expect(db.rpc).not.toHaveBeenCalled();
 const fresh=await (await importPost(request({action:'preview',backup}))).json();expect(fresh.content.portrait).toBe('');expect(fresh.warnings.length).toBeGreaterThan(0);
});
test('History listing pages metadata only and rejects malformed cursors',async()=>{
 rows=Array.from({length:21},(_,i)=>({id:`00000000-0000-4000-8000-${String(99-i).padStart(12,'0')}`,kind:'manual',label:'Mốc',created_at:'2026-10-31T12:00:00.123456+00:00',document_version:i+1,size_bytes:2000}));
 const result=await (await listGet(new Request('http://app.test/api/admin/history'))).json();expect(result.items).toHaveLength(20);expect(result.nextCursor).toBeTruthy();
 expect(query.select.mock.calls[0][0]).not.toContain('content');
 expect((await listGet(new Request('http://app.test/api/admin/history?cursor='+encodeURIComponent(result.nextCursor)))).status).toBe(200);expect(query.or).toHaveBeenCalled();
 expect((await listGet(new Request('http://app.test/api/admin/history?cursor=not-json'))).status).toBe(400);
});
test('Checkpoint validation prevents oversized labels from reaching SQL',async()=>{
 expect((await checkpointPost(request({label:'x'.repeat(121),expectedVersion:7}))).status).toBe(422);expect(db.rpc).not.toHaveBeenCalled();
 expect((await checkpointPost(request({label:'Mốc thật',note:'Đã kiểm tra',expectedVersion:7}))).status).toBe(200);
 expect(db.rpc).toHaveBeenCalledWith('create_cv_checkpoint',{p_expected_version:7,p_label:'Mốc thật',p_note:'Đã kiểm tra'});
});
test('Restore validates the revision and maps a stale version to a conflict',async()=>{
 const context={params:Promise.resolve({id:recordId})};
 expect((await detailGet(new Request('http://app.test/api/admin/history/'+recordId),context)).status).toBe(200);
 db.rpc.mockResolvedValue({data:null,error:{code:'40001',message:'CV_CONFLICT'}});
 expect((await restorePost(request({expectedVersion:7}),context)).status).toBe(409);
 expect(db.rpc).toHaveBeenCalledWith('apply_cv_recovery',{p_expected_version:7,p_source:'restore',p_revision_id:recordId});
 detail=null;expect((await restorePost(request({expectedVersion:7}),context)).status).toBe(404);
});
