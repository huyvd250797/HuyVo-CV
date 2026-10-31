// @vitest-environment node
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import seed from '../src/data/profile.json';
const mocks=vi.hoisted(()=>({load:vi.fn(),render:vi.fn(),portrait:vi.fn(),qr:vi.fn(),logos:vi.fn()}));
vi.mock('../src/lib/public-profile',()=>({loadPublicCv:mocks.load}));
vi.mock('../src/lib/pdf-document',()=>({renderCvPdf:mocks.render}));
vi.mock('../src/lib/share-assets',()=>({publicPortrait:mocks.portrait,profileQr:mocks.qr,unitLogos:mocks.logos}));
import {GET as pdf} from '../src/app/api/cv/pdf/route';
import {GET as qr} from '../src/app/api/share/qr/route';
const profile={...seed,publication:'published' as const,name:'Võ Đức Huy',siteUrl:'https://cv.example.com/'};
beforeEach(()=>{vi.clearAllMocks();mocks.load.mockResolvedValue({profile,version:17,status:'ready'});mocks.render.mockResolvedValue(Buffer.from('%PDF-1.7\nTEST'));mocks.portrait.mockResolvedValue(undefined);mocks.logos.mockResolvedValue({});mocks.qr.mockResolvedValue(Buffer.from('PNG'));});
afterEach(()=>vi.restoreAllMocks());
test('Public PDF returns attachment from publication only and avoids client/CDN caching',async()=>{
 const r=await pdf(new Request('https://cv.example.com/api/cv/pdf'));expect(r.status).toBe(200);expect(r.headers.get('Content-Type')).toBe('application/pdf');expect(r.headers.get('Content-Disposition')).toContain('CV-Vo-duc-Huy-v17-VI.pdf');expect(r.headers.get('X-CV-Version')).toBe('17');expect(r.headers.get('Cache-Control')).toBe('no-store');expect(mocks.render).toHaveBeenCalledWith(profile,17,undefined,expect.any(Buffer),{});
});
test('Changed published content at same version gets a new PDF, so cache cannot serve an old snapshot',async()=>{
 mocks.load.mockResolvedValue({profile:{...profile,name:'Tên sau cập nhật'},version:17,status:'ready'});const r=await pdf(new Request('https://cv.example.com/api/cv/pdf'));expect(r.status).toBe(200);expect(mocks.render.mock.calls[0][0].name).toBe('Tên sau cập nhật');
});
test('Unpublished and unavailable CV do not render or expose a draft',async()=>{
 for(const [status,http] of [['empty',404],['unconfigured',503],['error',503]]){mocks.load.mockResolvedValue({profile:null,status});expect((await pdf(new Request('https://cv.example.com/api/cv/pdf'))).status).toBe(http);expect((await qr(new Request('https://cv.example.com/api/share/qr'))).status).toBe(http);}expect(mocks.render).not.toHaveBeenCalled();
});
test('Renderer failure and oversized output return a retryable error, not a broken PDF',async()=>{
 mocks.load.mockResolvedValue({profile:{...profile,name:'error-render'},version:18,status:'ready'});mocks.render.mockRejectedValueOnce(new Error('FONT_MISSING'));expect((await pdf(new Request('https://cv.example.com/api/cv/pdf'))).status).toBe(503);
 mocks.load.mockResolvedValue({profile:{...profile,name:'large-render'},version:18,status:'ready'});mocks.render.mockResolvedValueOnce(Buffer.alloc(4_000_001));expect((await pdf(new Request('https://cv.example.com/api/cv/pdf'))).status).toBe(503);
});
test('QR download is PNG and missing public website URL is explicit',async()=>{
 const r=await qr(new Request('https://cv.example.com/api/share/qr?download=1'));expect(r.headers.get('Content-Disposition')).toContain('Maison-CV-QR.png');expect(r.headers.get('Content-Type')).toBe('image/png');
 mocks.qr.mockResolvedValue(undefined);expect((await qr(new Request('https://cv.example.com/api/share/qr'))).status).toBe(422);
});

test('English PDF and QR explicitly read the English snapshot and label the download EN',async()=>{
 const en={...profile,language:'en',name:'English Applicant'};mocks.load.mockResolvedValue({profile:en,version:26,status:'ready'});
 const response=await pdf(new Request('https://cv.example.com/api/cv/pdf?lang=en'));expect(response.status).toBe(200);expect(mocks.load).toHaveBeenLastCalledWith('en');expect(response.headers.get('Content-Disposition')).toContain('-EN.pdf');expect(mocks.render.mock.calls.at(-1)?.[0].language).toBe('en');
 await qr(new Request('https://cv.example.com/api/share/qr?lang=en'));expect(mocks.load).toHaveBeenLastCalledWith('en');
});
