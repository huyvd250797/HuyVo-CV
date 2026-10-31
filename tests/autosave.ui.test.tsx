import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {renderHook,act,waitFor,cleanup,fireEvent} from '@testing-library/react';
import {useDraft} from '../src/lib/use-draft';
import {validateCv} from '../src/lib/validation.mjs';
import seed from '../src/data/profile.json';
const initial=validateCv({...seed,name:'Tên thử nghiệm',email:'test@example.com'}).data!;
let remote:any;let call:any;
beforeEach(()=>{
 localStorage.clear();remote={content:structuredClone(initial),version:1,updated_at:'2026-10-31T12:00:00Z'};
 call=vi.fn(async(_path:string,init:RequestInit)=>{
  const body=JSON.parse(String(init.body));expect(body.expectedVersion).toBe(remote.version);
  remote={content:body.content,version:remote.version+1,updated_at:new Date().toISOString()};return {document:structuredClone(remote)};
 });
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function setup(identity='project:owner',delay=35){const hook=renderHook(()=>useDraft({call,identity,active:true,delay}));act(()=>hook.result.current.reset(structuredClone(initial),1,remote.updated_at));return hook;}
test('Autosave debounces typing, saves a draft once and never calls publish',async()=>{
 const {result}=setup();
 act(()=>{result.current.change(p=>({...p,name:'H'}),'name');result.current.change(p=>({...p,name:'Huy'}),'name');});
 await waitFor(()=>expect(result.current.phase).toBe('saved'));
 expect(call).toHaveBeenCalledTimes(1);expect(remote.content.name).toBe('Huy');expect(result.current.dirty).toBe(false);
 expect(call.mock.calls[0][0]).toBe('/api/admin/cv');
});
test('Typing during an in-flight save stays editable and the next save uses the returned version',async()=>{
 let release:any;const real=call;call=vi.fn((_path:string,init:RequestInit)=>new Promise(resolve=>{release=()=>real(_path,init).then(resolve);}));
 const {result}=setup();
 act(()=>result.current.change(p=>({...p,name:'Bản A'})));
 await waitFor(()=>expect(result.current.saving).toBe(true));
 act(()=>result.current.change(p=>({...p,name:'Bản B trong lúc lưu'})));
 await act(async()=>{release();});
 expect(result.current.draft?.name).toBe('Bản B trong lúc lưu');expect(result.current.dirty).toBe(true);expect(result.current.version).toBe(2);
 await waitFor(()=>expect(call).toHaveBeenCalledTimes(2));
 await act(async()=>{release();});
 expect(remote.content.name).toBe('Bản B trong lúc lưu');expect(result.current.dirty).toBe(false);expect(result.current.version).toBe(3);
});
test('Offline changes are backed up per owner; reconnect saves them online',async()=>{
 const online=vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 const {result}=setup();
 act(()=>{result.current.change(p=>({...p,name:'Nháp mất mạng'}));fireEvent(window,new Event('offline'));});
 expect(result.current.phase).toBe('offline');expect(localStorage.getItem('maison-cv:recovery:v1.2:project:owner')).toContain('Nháp mất mạng');expect(call).not.toHaveBeenCalled();
 online.mockReturnValue(true);act(()=>fireEvent(window,new Event('online')));
 await waitFor(()=>expect(remote.content.name).toBe('Nháp mất mạng'));
 expect(localStorage.getItem('maison-cv:recovery:v1.2:project:owner')).toBeNull();
});
test('A conflict pauses autosave, keeps edits and does not retry on more typing',async()=>{
 call=vi.fn(async()=>{throw Object.assign(new Error('Có dữ liệu mới ở thiết bị khác'),{status:409});});
 const {result}=setup();act(()=>result.current.change(p=>({...p,name:'Không ghi đè'})));
 await waitFor(()=>expect(result.current.conflict).toBe(true));
 act(()=>result.current.change(p=>({...p,role:'Vẫn tiếp tục soạn'})));
 await new Promise(r=>setTimeout(r,80));expect(call).toHaveBeenCalledTimes(1);
 expect(result.current.draft?.name).toBe('Không ghi đè');expect(localStorage.length).toBe(1);
});
test('Recovery is offered before saving; a backup from an older cloud version is never silently written',async()=>{
 const key='maison-cv:recovery:v1.2:project:owner';localStorage.setItem(key,JSON.stringify({content:{...initial,name:'Bản cần khôi phục'},baseVersion:0,updatedAt:new Date().toISOString()}));
 const {result,unmount}=setup();expect(result.current.recovery?.content.name).toBe('Bản cần khôi phục');
 act(()=>result.current.restoreRecovery());
 expect(result.current.draft?.name).toBe('Bản cần khôi phục');expect(result.current.conflict).toBe(true);
 await new Promise(r=>setTimeout(r,70));expect(call).not.toHaveBeenCalled();
 expect(JSON.parse(localStorage.getItem(key)!).baseVersion).toBe(0);
 unmount();const again=setup();act(()=>again.result.current.restoreRecovery());
 expect(again.result.current.conflict).toBe(true);
});
test('Recovery at the current version can be restored and saved; a different owner sees no copy',async()=>{
 const key='maison-cv:recovery:v1.2:project:owner';localStorage.setItem(key,JSON.stringify({content:{...initial,name:'Bản khôi phục hợp lệ'},baseVersion:1,updatedAt:new Date().toISOString()}));
 const other=setup('project:someone-else');expect(other.result.current.recovery).toBeNull();other.unmount();
 const {result}=setup();act(()=>result.current.restoreRecovery());
 await waitFor(()=>expect(remote.content.name).toBe('Bản khôi phục hợp lệ'));
});
test('IME composition delays saving until the composed word is complete',async()=>{
 const {result}=setup();
 act(()=>{result.current.setComposing(true);result.current.change(p=>({...p,name:'Chưa kết thúc gõ dấu'}));});
 await new Promise(r=>setTimeout(r,70));expect(call).not.toHaveBeenCalled();
 act(()=>result.current.setComposing(false));await waitFor(()=>expect(call).toHaveBeenCalledTimes(1));
});
test('Undo and redo restore values without restoring old cloud versions',async()=>{
 const {result}=setup('project:owner',10000);
 act(()=>result.current.change(p=>({...p,name:'Tên mới'}),'name'));
 await act(async()=>{await result.current.save();});expect(result.current.version).toBe(2);
 act(()=>result.current.undo());expect(result.current.draft?.name).toBe(initial.name);expect(result.current.version).toBe(2);expect(result.current.dirty).toBe(true);
 act(()=>result.current.redo());expect(result.current.draft?.name).toBe('Tên mới');expect(result.current.version).toBe(2);
});
