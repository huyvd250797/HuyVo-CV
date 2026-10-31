// @vitest-environment node
import {test,expect,vi,beforeEach} from 'vitest';
import seed from '../src/data/profile.json';
const mock=vi.hoisted(()=>({server:vi.fn(),config:vi.fn(),rows:[] as any[]}));
vi.mock('../src/lib/cloud',()=>({serverCloud:mock.server,cloudConfig:mock.config}));
// React request memoization is deliberately disabled outside a server request.
vi.mock('react',async original=>({...await original<typeof import('react')>(),cache:(fn:any)=>fn}));
import {loadPublicCv} from '../src/lib/public-profile';
beforeEach(()=>{mock.config.mockReturnValue({ready:true});mock.rows=[{language:'vi',document_version:23,content:{...seed,name:'VI published',translations:{en:{...seed,name:'PRIVATE_EN'}}}}];const query={select:vi.fn().mockReturnThis(),eq:vi.fn(async()=>({data:mock.rows,error:null}))};mock.server.mockReturnValue({from:()=>query,rpc:async()=>({data:{name:'Boss',logo:'',favicon:''},error:null})});});
test('English draft in a VI publication cannot create an English public CV or leak to VI',async()=>{
 const vi=await loadPublicCv('vi');expect(vi.profile?.name).toBe('VI published');expect(vi.profile?.translations).toBeUndefined();expect(vi.languages).toEqual(['vi']);
 const en=await loadPublicCv('en');expect(en.status).toBe('empty');expect(en.profile).toBeNull();
});
test('Independent English publication, availability and live branding are loaded explicitly',async()=>{
 mock.rows.push({language:'en',document_version:25,content:{...seed,name:'EN published',language:'en'}});
 const en=await loadPublicCv('en');expect(en.version).toBe(25);expect(en.profile?.language).toBe('en');expect(en.profile?.name).toBe('EN published');expect(en.profile?.branding?.name).toBe('Boss');expect(en.languages).toEqual(['vi','en']);
 mock.rows=mock.rows.filter(r=>r.language==='en');expect((await loadPublicCv('vi')).profile).toBeNull();expect((await loadPublicCv('vi',true)).profile?.language).toBe('en');
});
