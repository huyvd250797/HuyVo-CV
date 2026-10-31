// @vitest-environment node
import {test,expect,vi,beforeEach} from 'vitest';
const mock=vi.hoisted(()=>({branding:vi.fn(),download:vi.fn()}));
vi.mock('../src/lib/public-profile',()=>({loadPublicBranding:mock.branding}));
vi.mock('../src/lib/cloud',()=>({serverCloud:()=>({storage:{from:()=>({download:mock.download})}})}));
import {GET} from '../src/app/api/branding/icon/route';
beforeEach(()=>vi.clearAllMocks());
test('Favicon serves saved public branding and falls back to the bundled default',async()=>{
 const path='11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.png';mock.branding.mockResolvedValue({name:'Boss',favicon:'/api/media/'+path});mock.download.mockResolvedValue({data:new Blob(['PNG'],{type:'image/png'}),error:null});
 const result=await GET();expect(result.headers.get('Content-Type')).toBe('image/png');expect(mock.download).toHaveBeenCalledWith(path);expect(result.headers.get('Cache-Control')).toBe('no-store');
 mock.branding.mockResolvedValue({favicon:''});const fallback=await GET();expect(fallback.headers.get('Content-Type')).toBe('image/svg+xml');expect(await fallback.text()).toContain('<svg');
});
