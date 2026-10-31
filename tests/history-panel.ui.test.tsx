import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {HistoryPanel} from '../src/components/HistoryPanel';
import {makeBackup} from '../src/lib/history.mjs';
import type {Profile} from '../src/lib/types';
const profile:Profile={publication:'draft',language:'vi',name:'Hồ sơ hiện tại',role:'IT Project Manager',summary:'Giải pháp phù hợp với nhu cầu thực tế.',objective:'Phát triển sản phẩm hữu ích.',email:'test@example.com',phone:'',website:'',address:'',portrait:'',portraitAlt:'Ảnh chân dung',siteUrl:'',cvFile:'',education:[],skills:[],experience:[],implementations:[],projects:[],certificates:[]};
const old={...profile,name:'Hồ sơ đã lưu',objective:'Mục tiêu trước đây.'};
const revision={id:'11111111-1111-4111-8111-111111111111',kind:'manual',label:'Ứng tuyển PM',note:'Bản đã hoàn thiện',document_version:3,created_at:'2026-10-31T10:00:00Z',size_bytes:2400,content:old};
let call:any,applied:any,conflict:any;
beforeEach(()=>{
 applied=vi.fn();conflict=vi.fn();
 call=vi.fn(async(path:string,init:RequestInit={})=>{
  const body=init.body?JSON.parse(String(init.body)):null;
  if(path==='/api/admin/history'&&init.method==='POST')return {revision};
  if(path==='/api/admin/history')return {items:[revision],nextCursor:null};
  if(path.includes('/restore'))return {document:{content:old,version:8,updated_at:'2026-10-31T12:00:00Z'}};
  if(path==='/api/admin/import'&&body.action==='preview')return {content:body.backup.profile,warnings:[],previewHash:'a'.repeat(64)};
  if(path==='/api/admin/import')return {document:{content:body.backup.profile,version:8,updated_at:'2026-10-31T12:00:00Z'}};
  return {revision};
 });
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function panel(overrides:any={}){return render(<HistoryPanel draft={profile} version={7} dirty={false} saving={false} blocked={false} statusText="Đã lưu nháp · v7" call={call} onClose={vi.fn()} onSave={vi.fn(async()=>{})} onApplied={applied} onConflict={conflict} {...overrides}/>);}
test('Owner compares a selected revision, previews CV, and restores only after explicit confirmation',async()=>{
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});
 fireEvent.click(screen.getByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/}));
 await screen.findByText('2 nhóm thông tin có thay đổi.');
 expect(screen.getAllByText(/Hồ sơ đã lưu/).length).toBeGreaterThan(0);
 fireEvent.click(screen.getByRole('button',{name:'Xem CV'}));
 expect(document.querySelector('.history-cv')?.textContent).toContain('Hồ sơ đã lưu');
 fireEvent.click(screen.getByRole('button',{name:'Khôi phục mốc vào nháp ↗'}));
 await screen.findByRole('alertdialog');expect(applied).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Xác nhận thay bản nháp'}));
 await waitFor(()=>expect(applied).toHaveBeenCalledOnce());
 expect(call.mock.calls.find((x:any[])=>x[0].endsWith('/restore'))[1].body).toContain('"expectedVersion":7');
 expect(call.mock.calls.some((x:any[])=>x[0].includes('/publish'))).toBe(false);
});
test('Unsaved changes block checkpoints and recovery while offering to save the current draft',async()=>{
 const save=vi.fn(async()=>{});panel({dirty:true,onSave:save});
 await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});
 expect((screen.getByRole('button',{name:'Tạo mốc từ nháp đã lưu'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Lưu nháp hiện tại'}));expect(save).toHaveBeenCalledOnce();
 fireEvent.click(screen.getByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/}));
 await screen.findByText('2 nhóm thông tin có thay đổi.');
 expect((screen.getByRole('button',{name:'Khôi phục mốc vào nháp ↗'}) as HTMLButtonElement).disabled).toBe(true);
});
test('A manual checkpoint sends the label and current version and appears in the archive',async()=>{
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});
 fireEvent.change(screen.getByLabelText('Tên mốc'),{target:{value:'Nộp hồ sơ vòng 2'}});
 fireEvent.change(screen.getByLabelText('Ghi chú'),{target:{value:'Điều chỉnh kinh nghiệm'}});
 fireEvent.click(screen.getByRole('button',{name:'Tạo mốc từ nháp đã lưu'}));
 await screen.findByText('Đã tạo mốc lưu trên cloud.');
 const body=JSON.parse(call.mock.calls.find((x:any[])=>x[0]==='/api/admin/history'&&x[1]?.method==='POST')[1].body);
 expect(body).toEqual({expectedVersion:7,label:'Nộp hồ sơ vòng 2',note:'Điều chỉnh kinh nghiệm'});
});
test('Malformed JSON does not reach the import API or change the current draft',async()=>{
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});
 fireEvent.change(screen.getByLabelText('File JSON nhập'),{target:{files:[new File(['{bad'],'bad.json',{type:'application/json'})]}});
 await screen.findByText('File JSON không hợp lệ.');
 expect(call.mock.calls.some((x:any[])=>x[0]==='/api/admin/import')).toBe(false);expect(applied).not.toHaveBeenCalled();
});
test('Valid JSON is previewed, compared and confirmed before being applied to a new draft',async()=>{
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});
 const file=new File([JSON.stringify(makeBackup(old,3))],'backup.json',{type:'application/json'});
 fireEvent.change(screen.getByLabelText('File JSON nhập'),{target:{files:[file]}});
 await screen.findByText('2 nhóm thông tin có thay đổi.');
 expect(call.mock.calls.filter((x:any[])=>x[0]==='/api/admin/import')).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Áp dụng file vào nháp ↗'}));
 await screen.findByRole('alertdialog');expect(applied).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Xác nhận thay bản nháp'}));
 await waitFor(()=>expect(applied).toHaveBeenCalledOnce());
 const last=call.mock.calls.filter((x:any[])=>x[0]==='/api/admin/import').at(-1);
 expect(JSON.parse(last[1].body).previewHash).toBe('a'.repeat(64));
});
test('A stale restore keeps the panel open and tells the editor to pause autosave',async()=>{
 const normal=call;call=vi.fn(async(path:string,init:RequestInit={})=>{if(path.includes('/restore'))throw Object.assign(new Error('Có bản mới trên thiết bị khác.'),{status:409});return normal(path,init);});
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});fireEvent.click(screen.getByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/}));
 await screen.findByText('2 nhóm thông tin có thay đổi.');fireEvent.click(screen.getByRole('button',{name:'Khôi phục mốc vào nháp ↗'}));
 fireEvent.click(await screen.findByRole('button',{name:'Xác nhận thay bản nháp'}));
 await screen.findByRole('alert');expect(conflict).toHaveBeenCalledWith('Có bản mới trên thiết bị khác.');expect(applied).not.toHaveBeenCalled();
});
test('Archive render can be captured for visual QA without connecting to a real account',async()=>{
 panel();await screen.findByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/});fireEvent.click(screen.getByRole('button',{name:/Mốc thủ công.*Ứng tuyển PM/}));
 await screen.findByText('2 nhóm thông tin có thay đổi.');
 if(process.env.QA_CAPTURE_DIR){await mkdir(process.env.QA_CAPTURE_DIR,{recursive:true});const css=await readFile(`${process.cwd()}/src/app/globals.css`,'utf8');await writeFile(`${process.env.QA_CAPTURE_DIR}/history.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);}
});
