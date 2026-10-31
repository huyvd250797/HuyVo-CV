import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { Editor } from '../src/components/Editor';
import type { Profile } from '../src/lib/types';
const mocks=vi.hoisted(()=>({client:null as any}));
vi.mock('../src/lib/browser-cloud',()=>({browserCloud:()=>mocks.client}));
const fixture:Profile={publication:'draft',language:'vi',name:'Tên kiểm thử',role:'IT Project Manager / Business Analyst',summary:'Kết nối nhu cầu nghiệp vụ với giải pháp công nghệ.',objective:'Xây dựng sản phẩm hữu ích và trải nghiệm rõ ràng.',email:'test@example.com',phone:'',address:'',website:'',portrait:'',portraitAlt:'Ảnh chân dung',siteUrl:'',cvFile:'',education:[],skills:[],experience:[],implementations:[],projects:[],certificates:[]};
const session={access_token:'qa-token-not-a-real-credential',user:{id:'11111111-1111-4111-8111-111111111111',email:'test@example.com'}};
let remote:any;let publication:any;let stateChange:any;let rejectSave=false;
beforeEach(()=>{
 window.localStorage.clear();
 remote={content:structuredClone(fixture),version:1,updated_at:'2026-10-31T10:00:00Z'};publication=null;rejectSave=false;
 mocks.client={auth:{getSession:vi.fn(async()=>({data:{session}})),onAuthStateChange:vi.fn((cb:any)=>{stateChange=cb;return {data:{subscription:{unsubscribe:vi.fn()}}};}),signOut:vi.fn(async()=>stateChange('SIGNED_OUT',null))}};
 vi.stubGlobal('fetch',vi.fn(async(url:string,options:any={})=>{
  if(url==='/api/admin/cv'&&options.method==='PUT') {
   if(rejectSave)return {ok:false,status:409,json:async()=>({error:'CV đã được cập nhật ở thiết bị khác.'})};
   const input=JSON.parse(options.body);expect(input.expectedVersion).toBe(remote.version);
   remote={content:input.content,version:remote.version+1,updated_at:'2026-10-31T10:10:00Z'};
   return {ok:true,status:200,json:async()=>({document:structuredClone(remote)})};
  }
  if(url==='/api/admin/publish'){publication={document_version:remote.version,published_at:'2026-10-31T10:11:00Z'};return {ok:true,status:200,json:async()=>({publication})};}
  return {ok:true,status:200,json:async()=>({document:structuredClone(remote),publication})};
 }));
 vi.spyOn(window,'confirm').mockReturnValue(true);
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});

test('Unconfigured app explains setup, without offering fake cloud saving',async()=>{
 mocks.client=null;render(<Editor/>);
 await screen.findByText('Source đã sẵn sàng. Hoàn tất thiết lập Supabase một lần để chỉnh sửa và lưu CV online.');
 expect(screen.queryByRole('button',{name:'Lưu nháp'})).toBeNull();
});
test('Owner edits, saves cloud draft, confirms publication and reloads on another session',async()=>{
 const ui=render(<Editor/>);
 await screen.findByRole('heading',{name:'Hồ sơ của bạn.'});
 const name=screen.getByLabelText('Họ và tên');
 fireEvent.change(name,{target:{value:'Tên sau chỉnh sửa'}});
 const publish=screen.getByRole('button',{name:'Xuất bản ↗'});
 expect((publish as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);
 await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 expect(remote.content.name).toBe('Tên sau chỉnh sửa');
 expect(publication).toBeNull();
 expect((publish as HTMLButtonElement).disabled).toBe(false);
 fireEvent.click(publish);
 await screen.findByRole('dialog');
 fireEvent.click(screen.getByRole('button',{name:'Xuất bản CV ↗'}));
 await screen.findByText('Đã xuất bản. Thiết bị khác mở hoặc tải lại CV sẽ thấy bản mới.');
 expect(publication.document_version).toBe(2);
 if(process.env.QA_CAPTURE_DIR){
  await mkdir(process.env.QA_CAPTURE_DIR,{recursive:true});
  const css=await readFile(`${process.cwd()}/src/app/globals.css`,'utf8');
  await writeFile(`${process.env.QA_CAPTURE_DIR}/editor.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);
  fireEvent.click(screen.getByRole('button',{name:/Thông tin cá nhân/}));
  await writeFile(`${process.env.QA_CAPTURE_DIR}/editor-panel.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);
 }
 ui.unmount();render(<Editor/>);
 await waitFor(()=>expect((screen.getByLabelText('Họ và tên') as HTMLInputElement).value).toBe('Tên sau chỉnh sửa'));
});
test('Stale device save keeps unsaved draft and offers explicit conflict resolution',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');rejectSave=true;
 fireEvent.change(screen.getByLabelText('Họ và tên'),{target:{value:'Bản trên thiết bị B'}});
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);
 await screen.findByRole('button',{name:'Giữ bản đang soạn'});
 expect((screen.getByLabelText('Họ và tên') as HTMLInputElement).value).toBe('Bản trên thiết bị B');
 expect(remote.content.name).toBe('Tên kiểm thử');
 expect((screen.getByRole('button',{name:'Xuất bản ↗'}) as HTMLButtonElement).disabled).toBe(true);
});
test('Collections can be added/deleted and preview is read only',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(screen.getByRole('button',{name:/03.*Học vấn/}));
 fireEvent.click(screen.getByRole('button',{name:'＋ Thêm học vấn'}));
 fireEvent.change(screen.getByLabelText('Trường / Cơ sở đào tạo'),{target:{value:'Trường kiểm thử'}});
 expect(document.querySelector('.editor-preview')?.textContent).toContain('Trường kiểm thử');
 fireEvent.click(screen.getByRole('button',{name:'Xóa'}));
 expect(screen.queryByLabelText('Trường / Cơ sở đào tạo')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Xem trước'}));
 expect(document.querySelector('[contenteditable="true"]')).toBeNull();
 expect(screen.queryByLabelText('Họ và tên')).toBeNull();
});
test('Direct text editing commits the field on blur and updates the editing panel',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 const field=document.querySelector('[data-cv-field="name"]') as HTMLElement;
 Object.defineProperty(field,'innerText',{value:'Tên nhập trực tiếp',configurable:true});
 fireEvent.blur(field);
 expect((screen.getByLabelText('Họ và tên') as HTMLInputElement).value).toBe('Tên nhập trực tiếp');
 expect((screen.getAllByRole('button',{name:'Lưu nháp'})[0] as HTMLButtonElement).disabled).toBe(false);
});
test('Typing directly enables Save immediately and saves the active field before blur',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 const field=document.querySelector('[data-cv-field="name"]') as HTMLElement;
 Object.defineProperty(field,'innerText',{value:'Tên chưa rời con trỏ',configurable:true});
 fireEvent.input(field);
 const save=screen.getAllByRole('button',{name:'Lưu nháp'})[0] as HTMLButtonElement;
 expect(save.disabled).toBe(false);
 fireEvent.click(save);
 await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 expect(remote.content.name).toBe('Tên chưa rời con trỏ');
});
test('Signed-out owner gets a login form and a readable invalid-credentials error',async()=>{
 mocks.client.auth.getSession=vi.fn(async()=>({data:{session:null}}));
 mocks.client.auth.signInWithPassword=vi.fn(async()=>({error:new Error('bad credentials')}));
 render(<Editor/>);await screen.findByLabelText('Email tài khoản');
 fireEvent.change(screen.getByLabelText('Email tài khoản'),{target:{value:'test@example.com'}});
 fireEvent.change(screen.getByLabelText('Mật khẩu',{exact:true}),{target:{value:'not-a-real-password'}});
 fireEvent.click(screen.getByRole('button',{name:'Đăng nhập ↗'}));
 await screen.findByText('Đăng nhập chưa thành công. Kiểm tra email và mật khẩu.');
 expect(mocks.client.auth.signInWithPassword).toHaveBeenCalledOnce();
});
test('Signing out this device uses local scope and returns to login',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(screen.getByRole('button',{name:'Đăng xuất'}));
 await screen.findByLabelText('Email tài khoản');
 expect(mocks.client.auth.signOut).toHaveBeenCalledWith({scope:'local'});
});
test('Owner can hide sections, reorder the left column, undo and select a mobile preview',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(screen.getByRole('button',{name:/Bố cục CV/}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Kỹ năng'}));
 expect(document.querySelector('.editor-preview #skills')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Đưa block Chứng chỉ lên'}));
 fireEvent.click(screen.getByRole('button',{name:'Đưa block Chứng chỉ lên'}));
 const blocks=Array.from(document.querySelectorAll('.editor-preview .resume-aside>section')).map(x=>x.id);
 expect(blocks).toEqual(['certificates','education']);
 fireEvent.click(screen.getByRole('button',{name:'Hoàn tác'}));
 fireEvent.click(screen.getByRole('button',{name:'Hoàn tác'}));
 fireEvent.click(screen.getByRole('button',{name:'Hoàn tác'}));
 expect(document.querySelector('.editor-preview #skills')).not.toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Mobile · 390px'}));
 expect(document.querySelector('.editor-app')?.classList.contains('mobile-preview-mode')).toBe(true);
});
test('Collection ordering updates preview and is saved with the draft',async()=>{
 remote.content.skills=[{name:'Kỹ năng A',description:''},{name:'Kỹ năng B',description:''}];
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(screen.getByRole('button',{name:/04.*Kỹ năng/}));
 fireEvent.click(screen.getByRole('button',{name:'Đưa Kỹ năng 2 lên'}));
 expect(document.querySelector('.editor-preview .skill h3')?.textContent).toBe('Kỹ năng B');
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);
 await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 expect(remote.content.skills[0].name).toBe('Kỹ năng B');
});
test('Recovery from the archive updates the editor without triggering publication or another autosave',async()=>{
 const prior=vi.mocked(fetch).getMockImplementation()!;
 const id='33333333-3333-4333-8333-333333333333';
 const restored={...fixture,name:'Hồ sơ khôi phục'};
 const revision={id,kind:'manual',label:'Mốc phục hồi',note:'',document_version:1,created_at:'2026-10-31T10:00:00Z',size_bytes:2300,content:restored};
 vi.mocked(fetch).mockImplementation(async(input,options)=>{
  const path=String(input);
  if(path==='/api/admin/history')return {ok:true,status:200,json:async()=>({items:[revision],nextCursor:null})} as Response;
  if(path==='/api/admin/history/'+id)return {ok:true,status:200,json:async()=>({revision})} as Response;
  if(path.endsWith('/restore')){remote={content:restored,version:2,updated_at:'2026-10-31T12:00:00Z'};return {ok:true,status:200,json:async()=>({document:remote})} as Response;}
  return prior(input,options);
 });
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:'Lịch sử ↶'}));
 fireEvent.click(await screen.findByRole('button',{name:/Mốc thủ công.*Mốc phục hồi/}));
 fireEvent.click(await screen.findByRole('button',{name:'Khôi phục mốc vào nháp ↗'}));
 fireEvent.click(await screen.findByRole('button',{name:'Xác nhận thay bản nháp'}));
 await waitFor(()=>expect((screen.getByLabelText('Họ và tên') as HTMLInputElement).value).toBe('Hồ sơ khôi phục'));
 expect(document.querySelector('.history-panel')).toBeNull();
 expect(await screen.findByText('Đã khôi phục vào bản nháp và giữ mốc trước khôi phục. CV công khai chưa thay đổi.')).toBeTruthy();
 expect(vi.mocked(fetch).mock.calls.some(([url,init])=>String(url).includes('/publish')||init?.method==='PUT')).toBe(false);
});

test('Implementation code and full name edit independently, autosave and render in two lines',async()=>{
 remote.content.implementations=[{name:'EPU',description:'Nội dung trước nâng cấp'}];
 render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(screen.getByRole('button',{name:/07.*Kinh nghiệm triển khai/}));
 fireEvent.change(screen.getByLabelText('Mã đơn vị (ví dụ: EPU)'),{target:{value:'EPU'}});
 fireEvent.change(screen.getByLabelText('Tên đơn vị đầy đủ'),{target:{value:'Trường Đại học Điện lực'}});
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 expect(remote.content.implementations[0]).toMatchObject({code:'EPU',name:'Trường Đại học Điện lực',description:'Nội dung trước nâng cấp'});
 expect(document.querySelector('.unit-code')?.textContent).toBe('EPU');expect(document.querySelector('.unit-name')?.textContent).toBe('Trường Đại học Điện lực');
 if(process.env.QA_CAPTURE_DIR){const css=await readFile('src/app/globals.css','utf8');await mkdir(process.env.QA_CAPTURE_DIR,{recursive:true});await writeFile(`${process.env.QA_CAPTURE_DIR}/unit-editor.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);}
});

test('Canvas tools are hidden initially; selecting a block reveals only its add and item move controls',async()=>{
 remote.content.skills=[{name:'Kỹ năng A',description:''},{name:'Kỹ năng B',description:''}];render(<Editor/>);await screen.findByLabelText('Họ và tên');
 expect(document.querySelector('.cv-block-tools')).toBeNull();
 fireEvent.click(document.querySelector('.editor-preview #skills h2')!);
 expect(screen.getByRole('button',{name:'Thêm dữ liệu Kỹ năng cá nhân.'})).toBeTruthy();expect(document.querySelectorAll('.cv-block-tools').length).toBe(1);
 fireEvent.click(screen.getByRole('button',{name:'Đưa dòng 2 của Kỹ năng cá nhân. lên'}));expect(document.querySelector('.editor-preview .skill h3')?.textContent).toBe('Kỹ năng B');
 fireEvent.keyDown(document.querySelector('.editor-preview')!,{key:'Escape'});expect(document.querySelector('.cv-block-tools')).toBeNull();
});
test('Plus adds at the bottom of the matching panel and focuses the new row without resetting scroll to zero',async()=>{
 remote.content.skills=[{name:'A',description:''},{name:'B',description:''}];render(<Editor/>);await screen.findByLabelText('Họ và tên');
 fireEvent.click(document.querySelector('.editor-preview #skills h2')!);const pane=document.querySelector('.panel-fields') as HTMLElement;pane.scrollTop=300;
 const original=Element.prototype.getBoundingClientRect;
 vi.spyOn(Element.prototype,'getBoundingClientRect').mockImplementation(function(this:Element){if(this.matches('[data-editor-row="skills:2"]'))return {top:900,bottom:1200,height:300,left:0,right:300,width:300,x:0,y:900,toJSON(){}};if(this.matches('.panel-fields'))return {top:200,bottom:800,height:600,left:0,right:300,width:300,x:0,y:200,toJSON(){}};return original.call(this);});
 fireEvent.click(screen.getByRole('button',{name:'Thêm dữ liệu Kỹ năng cá nhân.'}));
 expect(screen.getAllByLabelText('Tên kỹ năng').length).toBe(3);const added=document.querySelector('[data-editor-row="skills:2"] input');expect(document.activeElement).toBe(added);expect(pane.scrollTop).toBe(984);
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');expect(remote.content.skills.map((r:any)=>r.name)).toEqual(['A','B','']);
});
test('Owner can rename a block, see its navigation label and undo the title',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(document.querySelector('.editor-preview #education h2')!);
 fireEvent.change(screen.getByLabelText('Tiêu đề block'),{target:{value:'Nền tảng học tập'}});expect(document.querySelector('.editor-preview #education h2')?.textContent).toBe('Nền tảng học tập');expect(screen.getByRole('button',{name:/Nền tảng học tập.*↗/})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Hoàn tác'}));expect(document.querySelector('.editor-preview #education h2')?.textContent).toBe('Học vấn.');
});
test('Grid mode saves 6/6/12 widths and follows the same block order in CV and navigation',async()=>{
 remote.content.education=[{school:'Đại học Công nghệ',degree:'Công nghệ thông tin',period:'2015 - 2019',detail:''}];remote.content.experience=[{role:'Project Manager',company:'Công ty Công nghệ',period:'2019 - Hiện tại',summary:'Phân tích nghiệp vụ, phối hợp triển khai và vận hành hệ thống.',highlights:[]}];remote.content.implementations=[{code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai hệ thống quản trị giáo dục.',period:'2024 - Hiện tại'},{code:'DTHU',name:'Đơn vị triển khai DTHU',description:'Hỗ trợ vận hành hệ thống.',period:'2023'}];
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:/Bố cục CV/}));fireEvent.click(screen.getByRole('button',{name:/Lưới linh hoạt/}));
 fireEvent.change(screen.getByLabelText('Độ rộng Học vấn'),{target:{value:'6'}});fireEvent.change(screen.getByLabelText('Độ rộng Kinh nghiệm làm việc'),{target:{value:'6'}});fireEvent.change(screen.getByLabelText('Độ rộng Kinh nghiệm triển khai'),{target:{value:'12'}});
 fireEvent.click(screen.getByRole('button',{name:'Đưa block Kinh nghiệm làm việc lên'}));fireEvent.click(screen.getByRole('button',{name:'Đưa block Kinh nghiệm làm việc lên'}));
 const ids=Array.from(document.querySelectorAll('.cv-grid>.cv-block')).map(n=>n.id);expect(ids.indexOf('experience')).toBe(ids.indexOf('education')+1);expect(document.querySelector('#delivery')?.getAttribute('data-grid-span')).toBe('12');
 const navigation=screen.getByRole('navigation',{name:'Các phần CV'});expect(navigation.textContent!.indexOf('Học vấn')).toBeLessThan(navigation.textContent!.indexOf('Kinh nghiệm làm việc'));
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);await screen.findByText('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');expect(remote.content.layout.mode).toBe('grid');expect(remote.content.layout.grid.spans.delivery).toBe(12);
 if(process.env.QA_CAPTURE_DIR){const css=await readFile('src/app/globals.css','utf8');await mkdir(process.env.QA_CAPTURE_DIR,{recursive:true});await writeFile(`${process.env.QA_CAPTURE_DIR}/studio-grid.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);}
 fireEvent.click(screen.getByRole('button',{name:/Maison nguyên bản/}));expect(document.querySelector('.resume-aside')).toBeTruthy();expect(document.querySelector('.cv-grid')).toBeNull();fireEvent.click(screen.getByRole('button',{name:/Lưới linh hoạt/}));expect(document.querySelector('#delivery')?.getAttribute('data-grid-span')).toBe('12');
});
test('Time sorting uses selected direction/edge and leaves undated rows at the bottom',async()=>{
 remote.content.experience=[{role:'Cũ',company:'A',period:'JUL 2019 - OCT 2019',summary:'',highlights:[]},{role:'Không rõ',company:'A',period:'',summary:'',highlights:[]},{role:'Mới',company:'A',period:'2023 - Hiện tại',summary:'',highlights:[]}];
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(document.querySelector('.editor-preview #experience h2')!);
 fireEvent.click(screen.getByRole('button',{name:'Tự động sắp xếp'}));expect(screen.getAllByLabelText('Vị trí công việc')[0].getAttribute('value')).toBe('Mới');
 fireEvent.change(screen.getByLabelText('Thứ tự thời gian'),{target:{value:'asc'}});fireEvent.click(screen.getByRole('button',{name:'Tự động sắp xếp'}));expect(screen.getAllByLabelText('Vị trí công việc').map(n=>(n as HTMLInputElement).value)).toEqual(['Cũ','Mới','Không rõ']);
});
test('Pointer dragging a selected canvas block moves its actual layout and cancellation makes no changes',async()=>{
 vi.stubGlobal('PointerEvent',MouseEvent);vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(document.querySelector('.editor-preview #education h2')!);
 const target=document.querySelector('.editor-preview #delivery')!;Object.defineProperty(document,'elementFromPoint',{configurable:true,value:vi.fn(()=>target)});
 const handle=screen.getByRole('button',{name:'Kéo block Học vấn.'});fireEvent.pointerDown(handle,{button:0,clientX:10,clientY:100,pointerId:1});fireEvent.pointerMove(handle,{clientX:10,clientY:500,pointerId:1});fireEvent.pointerUp(handle,{clientX:10,clientY:500,pointerId:1});
 expect(Array.from(document.querySelectorAll('.resume-career>.cv-block')).map(n=>n.id)).toEqual(['experience','delivery','education']);
 const other=screen.getByRole('button',{name:'Kéo block Học vấn.'});fireEvent.pointerDown(other,{button:0,clientX:1,clientY:1,pointerId:2});fireEvent.pointerCancel(other,{pointerId:2});expect(document.querySelector('.cv-drop-target')).toBeNull();delete (document as any).elementFromPoint;
});
