import React from 'react';
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Editor} from '../src/components/Editor';
import {validateCv} from '../src/lib/validation.mjs';
import {createEnglishProfile} from '../src/lib/i18n.mjs';
import seed from '../src/data/profile.json';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {renderCv} from '../src/lib/render.mjs';
import {publicContent} from '../src/lib/layout.mjs';
const mocks=vi.hoisted(()=>({client:null as any}));
vi.mock('../src/lib/browser-cloud',()=>({browserCloud:()=>mocks.client}));
const session={access_token:'qa-only',user:{id:'11111111-1111-4111-8111-111111111111',email:'qa@example.com'}};
let remote:any;let publishRequests:any[]=[];
beforeEach(()=>{
 localStorage.clear();publishRequests=[];
 const viProfile=validateCv({...seed,name:'Test Owner',role:'PM',summary:'Triển khai',objective:'Phát triển',email:'qa@example.com',portrait:'',education:[],skills:[],certificates:[],experience:[],implementations:[{id:'epu',code:'EPU',name:'Trường Đại học Điện lực',description:'Triển khai hệ thống'}],projects:[{id:'app-1',name:'Finzaro',description:'Quản lý tài chính',role:'Phát triển',year:'2026',platform:'Web',technologies:['Next.js'],cover:'/app.png',coverAlt:'Tổng quan',images:[],status:'live',featured:false,hidden:false,demoUrl:'https://example.com/demo'}]}).data!;
 const en={...createEnglishProfile(viProfile),role:'PM',summary:'Delivery',objective:'Professional growth'};en.implementations[0].name='Electric Power University';Object.assign(en.projects[0],{description:'Manage finances',role:'Development',coverAlt:'Dashboard'});
 remote={version:10,content:{...viProfile,translations:{en}},updated_at:'2026-10-31T12:00:00Z'};
 mocks.client={auth:{getSession:vi.fn(async()=>({data:{session}})),onAuthStateChange:vi.fn(()=>({data:{subscription:{unsubscribe:vi.fn()}}}))}};
 vi.stubGlobal('fetch',vi.fn(async(url:string,options:any={})=>{
  if(url==='/api/admin/settings')return {ok:true,status:200,json:async()=>({preferences:{version:1,content:{autoSave:false,branding:{name:'maison.',logo:'',favicon:''}}}})};
  if(url==='/api/admin/publish'){publishRequests.push(JSON.parse(options.body));return {ok:true,status:200,json:async()=>({publication:{publications:[{language:'en',document_version:remote.version,published_at:remote.updated_at}]}})};}
  if(options.method==='PUT'){const body=JSON.parse(options.body);remote={content:body.content,version:remote.version+1,updated_at:remote.updated_at};}
  return {ok:true,status:200,json:async()=>({document:structuredClone(remote),publications:[]})};
 }));
 vi.spyOn(window,'confirm').mockReturnValue(true);
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function language(value:string){fireEvent.change(screen.getByLabelText('Ngôn ngữ đang chỉnh sửa'),{target:{value}});}
test('English publication identifies the named implementation and opens its exact missing field',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');await language('en');fireEvent.click(screen.getByRole('button',{name:'Xuất bản ↗'}));fireEvent.click(await screen.findByRole('button',{name:'Xuất bản CV ↗'}));
 await screen.findByRole('alert');expect(publishRequests).toHaveLength(0);
 const problem=screen.getByRole('button',{name:/Tiếng Anh → Kinh nghiệm triển khai → EPU – Electric Power University.*Sửa/});fireEvent.click(problem);
 const field=screen.getByLabelText('Vai trò / Phạm vi triển khai');expect(document.activeElement).toBe(field);
 fireEvent.change(field,{target:{value:'Education software implementation'}});fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);
 await waitFor(()=>expect(remote.content.translations.en.implementations[0].description).toBe('Education software implementation'));
 expect(remote.content.implementations[0].description).toBe('Triển khai hệ thống');
 fireEvent.click(screen.getByRole('button',{name:'Xuất bản ↗'}));fireEvent.click(await screen.findByRole('button',{name:'Xuất bản CV ↗'}));await waitFor(()=>expect(publishRequests).toHaveLength(1));expect(publishRequests[0].languages).toEqual(['en']);
});
test('App cards support highlighting, hiding and shared links while language copy remains separate',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:/08.*(Ứng dụng|Selected applications)/}));
 fireEvent.click(screen.getByLabelText('Ứng dụng nổi bật'));expect(document.querySelector('.editor-preview .app-featured')).not.toBeNull();
 fireEvent.change(screen.getByLabelText('Đường dẫn demo (tùy chọn)'),{target:{value:'https://example.com/new-demo'}});
 fireEvent.change(screen.getByLabelText('Bài toán và giá trị sản phẩm'),{target:{value:'Mô tả tiếng Việt mới'}});
 await language('en');fireEvent.click(screen.getByRole('button',{name:/08.*(Ứng dụng|Selected applications)/}));expect((screen.getByLabelText('Đường dẫn demo (tùy chọn)') as HTMLInputElement).value).toBe('https://example.com/new-demo');expect((screen.getByLabelText('Bài toán và giá trị sản phẩm') as HTMLTextAreaElement).value).toBe('Manage finances');
 fireEvent.click(screen.getByLabelText('Ẩn ứng dụng trên CV'));expect(document.querySelector('.editor-preview .app-hidden')).not.toBeNull();fireEvent.click(screen.getByRole('button',{name:'Xem trước'}));expect(document.querySelector('.editor-preview .app-card')).toBeNull();
});
test('New VI app can be added into EN without replacing an existing translation or losing IDs',async()=>{
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:/08.*(Ứng dụng|Selected applications)/}));fireEvent.click(screen.getByRole('button',{name:'＋ Thêm sản phẩm'}));
 const names=screen.getAllByLabelText('Tên sản phẩm');fireEvent.change(names[1],{target:{value:'SendInt'}});await language('en');fireEvent.click(screen.getByRole('button',{name:/08.*(Ứng dụng|Selected applications)/}));fireEvent.click(screen.getByRole('button',{name:'Bổ sung app từ VI'}));
 expect(screen.getAllByLabelText('Tên sản phẩm')).toHaveLength(2);expect((screen.getAllByLabelText('Bài toán và giá trị sản phẩm')[0] as HTMLTextAreaElement).value).toBe('Manage finances');
 fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);await waitFor(()=>expect(remote.content.translations.en.projects).toHaveLength(2));expect(remote.content.projects[1].id).toBe(remote.content.translations.en.projects[1].id);
});

test('Gallery order, image captions and cover selection stay connected across languages',async()=>{
 remote.content.projects[0].images=[{id:'one',src:'/app.png',alt:'Màn hình thứ nhất'},{id:'two',src:'/app-two.png',alt:'Màn hình thứ hai'}];
 remote.content.translations.en.projects[0].images=[{id:'one',src:'/app.png',alt:'First screen'},{id:'two',src:'/app-two.png',alt:'Second screen'}];
 render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:/08.*Ứng dụng/}));
 if(process.env.QA_CAPTURE_DIR){
  const out=process.env.QA_CAPTURE_DIR;await mkdir(out,{recursive:true});const css=await readFile('src/app/globals.css','utf8');const document=(body:string)=>`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${body}</body></html>`;
  await writeFile(`${out}/showcase-editor.html`,document(window.document.body.innerHTML));
  const p=publicContent({...remote.content,projects:[{...remote.content.projects[0],featured:true},{...remote.content.projects[0],id:'sendint',name:'SendInt',featured:false,cover:'/app-two.png',description:'Dữ liệu minh họa cho kiểm thử giao diện. Chuyển tệp giữa các thiết bị.',platform:'Web & Windows'}]});
  await writeFile(`${out}/showcase-public.html`,document(renderCv(p)));
  await writeFile(`${out}/qa-profile.json`,JSON.stringify(p));
 }
 fireEvent.click(screen.getByRole('button',{name:'Đưa ảnh 2 ứng dụng 1 lên'}));expect((screen.getByLabelText('Mô tả ảnh 1') as HTMLInputElement).value).toBe('Màn hình thứ hai');
 fireEvent.click(screen.getAllByRole('button',{name:'Làm ảnh bìa'})[0]);expect((screen.getByLabelText('Mô tả ảnh bìa') as HTMLInputElement).value).toBe('Màn hình thứ hai');
 await language('en');fireEvent.click(screen.getByRole('button',{name:/08.*Selected/}));expect((screen.getByLabelText('Mô tả ảnh 1') as HTMLInputElement).value).toBe('Second screen');expect((screen.getByLabelText('Mô tả ảnh bìa') as HTMLInputElement).value).toBe('Dashboard');
 fireEvent.click(screen.getByRole('button',{name:'Bỏ ảnh 1'}));fireEvent.click(screen.getAllByRole('button',{name:'Lưu nháp'})[0]);await waitFor(()=>expect(remote.content.projects[0].images).toHaveLength(1));expect(remote.content.projects[0].images[0].id).toBe('one');expect(remote.content.projects[0].cover).toBe('/app-two.png');
});

test('Repairing an error focuses the field even when its app block is already selected',async()=>{
 remote.content.projects[0].coverAlt='';render(<Editor/>);await screen.findByLabelText('Họ và tên');fireEvent.click(screen.getByRole('button',{name:/08.*Ứng dụng/}));
 fireEvent.click(screen.getByRole('button',{name:'Xuất bản ↗'}));fireEvent.click(await screen.findByRole('button',{name:'Xuất bản CV ↗'}));fireEvent.click(await screen.findByRole('button',{name:/Tiếng Việt → Ứng dụng đã xây dựng → Finzaro.*Thêm mô tả ảnh bìa.*Sửa/}));expect(document.activeElement).toBe(screen.getByLabelText('Mô tả ảnh bìa'));
});
