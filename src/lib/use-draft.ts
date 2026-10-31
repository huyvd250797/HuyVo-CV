'use client';
import { useCallback,useEffect,useReducer,useRef } from 'react';
import { validateCv } from './validation.mjs';
import type { Profile } from './types';
type Phase='idle'|'pending'|'saving'|'saved'|'offline'|'error'|'conflict';
type Backup={content:Profile;baseVersion:number;updatedAt:string};
type Model={draft:Profile|null;version:number;cacheBaseVersion:number|null;updatedAt:string;saved:string;phase:Phase;error:string;conflict:boolean;blocked:boolean;edited:boolean;history:Profile[];future:Profile[];lastKey:string;lastTime:number;epoch:number;recovery:Backup|null};
const fresh=(epoch=0):Model=>({draft:null,version:0,cacheBaseVersion:null,updatedAt:'',saved:'',phase:'idle',error:'',conflict:false,blocked:false,edited:false,history:[],future:[],lastKey:'',lastTime:0,epoch,recovery:null});
export const draftSignature=(p:Profile)=>JSON.stringify(validateCv(p).data);
const isDirty=(m:Model)=>!!m.draft&&draftSignature(m.draft)!==m.saved;
export function useDraft({call,identity,active,delay=1200}:{call:(path:string,init?:RequestInit)=>Promise<any>;identity:string;active:boolean;delay?:number}) {
 const model=useRef<Model>(fresh());const [tick,redraw]=useReducer((n:number)=>n+1,0);
 const flight=useRef<{promise:Promise<boolean>;abort:AbortController}|null>(null);
 const composing=useRef(false);const alive=useRef(true);const [cacheWarning,setCacheWarning]=useReducer((_:string,v:string)=>v,'');
 const key=identity?`maison-cv:recovery:v1.2:${identity}`:'';
 const persist=useCallback(()=>{
  if(!key||typeof window==='undefined')return;
  const m=model.current;
  try {
   if(m.recovery)return; // Keep the offered copy until the owner makes a choice.
   if(m.draft&&isDirty(m)&&m.edited)window.localStorage.setItem(key,JSON.stringify({content:m.draft,baseVersion:m.cacheBaseVersion??m.version,updatedAt:new Date().toISOString()}));
   else window.localStorage.removeItem(key);
  }catch {setCacheWarning('Thiết bị không lưu được bản khôi phục cục bộ. Hãy giữ trang mở và kiểm tra trạng thái lưu online.');}
 },[key]);
 const notify=useCallback(()=>{if(alive.current)redraw();},[]);
 const reset=useCallback((draft:Profile,version:number,updatedAt:string,exists=true,offerRecovery=true)=>{
  flight.current?.abort.abort();flight.current=null;composing.current=false;
  const m=fresh(model.current.epoch+1);m.draft=draft;m.version=version;m.updatedAt=updatedAt;m.saved=exists?draftSignature(draft):'';m.phase=exists?'saved':'idle';
  if(key)try {
   const text=window.localStorage.getItem(key);const backup=text?JSON.parse(text):null;
   if(offerRecovery&&backup&&Number.isSafeInteger(backup.baseVersion)&&backup.baseVersion>=0&&typeof backup.updatedAt==='string') {
    const parsed=validateCv(backup.content);
    if(parsed.data&&!parsed.errors.length&&draftSignature(parsed.data)!==draftSignature(draft))m.recovery={...backup,content:parsed.data};
    else window.localStorage.removeItem(key);
   }else if(!offerRecovery)window.localStorage.removeItem(key);
  }catch {try{window.localStorage.removeItem(key);}catch{/* Cache is optional. */}}
  model.current=m;notify();
 },[key,notify]);
 const change=useCallback((next:Profile|((p:Profile)=>Profile),mergeKey='')=>{
  const m=model.current;if(!m.draft)return;
  const value=typeof next==='function'?next(m.draft):next;
  if(JSON.stringify(value)===JSON.stringify(m.draft))return;
  const now=Date.now();
  if(!mergeKey||mergeKey!==m.lastKey||now-m.lastTime>750)m.history=[...m.history,structuredClone(m.draft)].slice(-50);
  m.draft=value;m.future=[];m.lastKey=mergeKey;m.lastTime=now;m.edited=true;
  if(!m.conflict){m.error='';m.blocked=false;m.phase=!isDirty(m)?'saved':navigator.onLine===false?'offline':'pending';}
  persist();notify();
 },[persist,notify]);
 const save=useCallback(():Promise<boolean>=>{
  const m=model.current;
  if(flight.current)return flight.current.promise;
  if(!m.draft||m.conflict||m.recovery||composing.current)return Promise.resolve(false);
  if(navigator.onLine===false){m.phase='offline';m.error='Đang mất kết nối. Bản đang soạn được giữ trên thiết bị này.';persist();notify();return Promise.resolve(false);}
  const parsed=validateCv(m.draft);
  if(parsed.errors.length||!parsed.data){m.error=parsed.errors.join('\n');m.phase='error';m.blocked=true;persist();notify();return Promise.resolve(false);}
  const epoch=m.epoch;const abort=new AbortController();m.phase='saving';m.error='';m.edited=true;notify();
  const job={abort,promise:Promise.resolve(false)};
  job.promise=(async()=>{
   try {
    const data=await call('/api/admin/cv',{method:'PUT',headers:{'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({content:parsed.data,expectedVersion:m.version})});
    if(model.current.epoch!==epoch)return false;
    const current=model.current;current.version=Number(data.document.version);current.updatedAt=data.document.updated_at;current.saved=draftSignature(data.document.content);
    current.blocked=false;current.phase=isDirty(current)?(navigator.onLine===false?'offline':'pending'):'saved';persist();notify();return true;
   }catch(error) {
    if(model.current.epoch!==epoch||abort.signal.aborted)return false;
    const current=model.current;const status=(error as {status?:number}).status;
    current.conflict=status===409;current.phase=current.conflict?'conflict':navigator.onLine===false?'offline':'error';current.blocked=true;
    current.error=error instanceof Error?error.message:'Chưa lưu được bản nháp. Hãy thử lại.';persist();notify();return false;
   }finally {if(flight.current===job){flight.current=null;notify();}}
  })();flight.current=job;return job.promise;
 },[call,persist,notify]);
 useEffect(()=>{
  const m=model.current;
  if(!active||!m.edited||!isDirty(m)||m.blocked||m.conflict||m.recovery||flight.current||composing.current||navigator.onLine===false)return;
  const timer=window.setTimeout(()=>void save(),delay);return()=>window.clearTimeout(timer);
 },[active,tick,save,delay]);
 useEffect(()=>{
  alive.current=true;
  const offline=()=>{const m=model.current;if(m.draft&&isDirty(m)){m.phase='offline';persist();notify();}};
  const online=()=>{const m=model.current;if(m.draft&&isDirty(m)&&!m.conflict){m.blocked=false;m.phase='pending';notify();}};
  const leave=(e:BeforeUnloadEvent)=>{persist();if(isDirty(model.current)){e.preventDefault();e.returnValue='';}};
  window.addEventListener('offline',offline);window.addEventListener('online',online);window.addEventListener('beforeunload',leave);
  return()=>{alive.current=false;window.removeEventListener('offline',offline);window.removeEventListener('online',online);window.removeEventListener('beforeunload',leave);flight.current?.abort.abort();};
 },[persist,notify]);
 const travel=(redo:boolean)=>{
  const m=model.current;const list=redo?m.future:m.history;if(!m.draft||!list.length)return;
  const value=list[list.length-1];if(redo){m.future=list.slice(0,-1);m.history=[...m.history,structuredClone(m.draft)];}else{m.history=list.slice(0,-1);m.future=[...m.future,structuredClone(m.draft)];}
  m.draft=value;m.edited=true;m.lastKey='';m.blocked=m.conflict;if(!m.conflict){m.error='';m.phase='pending';}persist();notify();
 };
 const discardRecovery=()=>{model.current.recovery=null;if(key)try{window.localStorage.removeItem(key);}catch{}notify();};
 const restoreRecovery=()=>{
  const m=model.current,backup=m.recovery;if(!backup||!m.draft)return;
  m.history=[structuredClone(m.draft)];m.future=[];m.draft=backup.content;m.recovery=null;m.edited=true;
  m.conflict=backup.baseVersion!==m.version;m.cacheBaseVersion=m.conflict?backup.baseVersion:null;m.blocked=m.conflict;m.phase=m.conflict?'conflict':'pending';
  m.error=m.conflict?'Bản trên thiết bị được soạn từ phiên bản cũ hơn bản online. Hãy giữ bản này để đối chiếu, rồi tải bản mới nhất; app đã dừng tự lưu để tránh ghi đè.':'';
  persist();notify();
 };
 const clear=useCallback((removeLocal=false)=>{
  flight.current?.abort.abort();flight.current=null;composing.current=false;model.current=fresh(model.current.epoch+1);
  if(removeLocal&&key)try{window.localStorage.removeItem(key);}catch{}notify();
 },[key,notify]);
 const pauseConflict=()=>{model.current.conflict=true;model.current.blocked=true;model.current.phase='conflict';notify();};
 const m=model.current;
 return {draft:m.draft,version:m.version,updatedAt:m.updatedAt,phase:m.phase,saveError:m.error,conflict:m.conflict,recovery:m.recovery,cacheWarning,dirty:isDirty(m),saving:m.phase==='saving',canUndo:m.history.length>0,canRedo:m.future.length>0,
  reset,change,save,clear,undo:()=>travel(false),redo:()=>travel(true),discardRecovery,restoreRecovery,pauseConflict,setComposing:(value:boolean)=>{composing.current=value;if(!value)notify();}};
}
