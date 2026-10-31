// @vitest-environment node
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
import seed from '../src/data/profile.json';
const mocks=vi.hoisted(()=>({load:vi.fn()}));
vi.mock('../src/lib/public-profile',()=>({loadPublicCv:mocks.load}));
import {GET} from '../src/app/api/share/image/route';
import {profileQr} from '../src/lib/share-assets';
const profile={...seed,publication:'published',name:'Nguyễn Văn An',role:'IT Project Manager / Business Analyst',summary:'Kết nối nhu cầu nghiệp vụ với giải pháp công nghệ. Đồng hành cùng đội ngũ để xây dựng sản phẩm có giá trị.',siteUrl:'https://cv.example.com/'};
beforeEach(()=>vi.clearAllMocks());afterEach(()=>vi.restoreAllMocks());
test('Real social image renderer produces a Vietnamese 1200x630 PNG from the publication',async()=>{
 mocks.load.mockResolvedValue({profile,version:18,status:'ready'});const response=await GET(new Request('https://cv.example.com/api/share/image'));expect(response.status).toBe(200);expect(response.headers.get('Content-Type')).toBe('image/png');const bytes=Buffer.from(await response.arrayBuffer());expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);
 if(process.env.PDF_QA_DIR){await mkdir(process.env.PDF_QA_DIR,{recursive:true});await writeFile(`${process.env.PDF_QA_DIR}/og.png`,bytes);}
},30000);
test('QR generator encodes only the canonical published site and produces bounded PNG output',async()=>{
 const qr=await profileQr({...profile,publication:'published'});expect(qr?.subarray(1,4).toString()).toBe('PNG');const metadata=await sharp(qr).metadata();expect(metadata.width).toBe(480);expect(metadata.height).toBe(480);
 expect(await profileQr({...profile,publication:'published',siteUrl:''})).toBeUndefined();
});
test('No publication means no social identity image',async()=>{
 mocks.load.mockResolvedValue({profile:null,status:'empty'});expect((await GET(new Request('https://cv.example.com/api/share/image'))).status).toBe(404);
});
