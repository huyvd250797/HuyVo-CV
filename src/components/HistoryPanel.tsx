'use client';
import {useEffect,useMemo,useRef,useState,type ChangeEvent} from 'react';
import type {Profile} from '@/lib/types';
import {historyKinds,makeBackup,parseBackup,diffProfiles,MAX_BACKUP_BYTES} from '@/lib/history.mjs';
import {renderCv} from '@/lib/render.mjs';
import {localizedProfile} from '@/lib/i18n.mjs';
import {usePrivateMedia} from '@/lib/use-private-media';
import {mediaPaths} from '@/lib/i18n.mjs';
import {browserCloud} from '@/lib/browser-cloud';
type Revision={id:string;kind:string;label:string;note:string;document_version:number;created_at:string;size_bytes:number;content?:Profile;parent_revision_id?:string};
type Call=(path:string,init?:RequestInit)=>Promise<any>;
type Props={draft:Profile;version:number;dirty:boolean;saving:boolean;blocked:boolean;statusText:string;call:Call;onClose:()=>void;onSave:()=>Promise<void>;onApplied:(document:{content:Profile;version:number;updated_at:string},message:string)=>void;onConflict:(message:string)=>void};
const date=(s:string)=>new Date(s).toLocaleString('vi-VN');
function download(profile:Profile,version:number){
 const backup=makeBackup(profile,version);let text=JSON.stringify(backup,null,2);if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)text=JSON.stringify(backup);const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=`Maison-CV-v${version}-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function RevisionCv({profile}:{profile:Profile}){
 const assets=usePrivateMedia(mediaPaths(profile),browserCloud());
 const html=useMemo(()=>{let value=renderCv({...profile,publication:'draft',cvFile:''}).replace('<main id="main">','<div>').replace('</main>','</div>');for(const [path,url] of Object.entries(assets))value=value.replaceAll(`src="${path}"`,`src="${url}"`);return value;},[profile,assets]);
 return <div className="editor-preview history-cv" onClick={e=>{if((e.target as HTMLElement).closest('a'))e.preventDefault();}} dangerouslySetInnerHTML={{__html:html}}/>;
}
export function HistoryPanel({draft,version,dirty,saving,blocked,statusText,call,onClose,onSave,onApplied,onConflict}:Props){
 const [items,setItems]=useState<Revision[]>([]),[cursor,setCursor]=useState<string|null>(null);
 const [selected,setSelected]=useState<Revision|null>(null),[base,setBase]=useState<Revision|null>(null),[baseId,setBaseId]=useState('current');
 const [mode,setMode]=useState<'history'|'import'>('history'),[view,setView]=useState<'diff'|'cv'>('diff');
 const [busy,setBusy]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [label,setLabel]=useState(''),[note,setNote]=useState('');
 const [incoming,setIncoming]=useState<{backup:unknown;content:Profile;warnings:string[];previewHash:string;filename:string}|null>(null);
 const [confirmation,setConfirmation]=useState<{source:'restore'|'import'|'delete'|'all';id?:string;label:string;version:number}|null>(null);
 const [deletePhrase,setDeletePhrase]=useState(''),[viewLanguage,setViewLanguage]=useState<'vi'|'en'>('vi');
 const panel=useRef<HTMLDivElement>(null),file=useRef<HTMLInputElement>(null),alive=useRef(true),detailSeq=useRef(0),baseSeq=useRef(0),listSeq=useRef(0);
 const writing=['apply','checkpoint'].includes(busy);
 const pending=!!busy||loading,clean=!dirty&&!saving&&!blocked;
 const candidate=mode==='import'?incoming?.content:selected?.content;
 const comparison=baseId==='current'?draft:base?.content;
 useEffect(()=>{if(candidate&&typeof window.matchMedia==='function'&&window.matchMedia('(max-width: 650px)').matches)panel.current?.querySelector('.history-detail-pane')?.scrollIntoView({behavior:'smooth',block:'start'});},[candidate]);
 const differences=useMemo(()=>candidate&&comparison?diffProfiles(comparison,candidate):[],[candidate,comparison]);
 function report(e:unknown){const message=e instanceof Error?e.message:'Không thể hoàn tất. Vui lòng thử lại.';setError(message);if((e as {status?:number}).status===409)onConflict(message);}
 async function list(more=false){
  const seq=++listSeq.current;setLoading(true);setError('');
  try {const data=await call('/api/admin/history'+(more&&cursor?'?cursor='+encodeURIComponent(cursor):''));if(!alive.current||seq!==listSeq.current)return;setItems(current=>more?[...current,...data.items.filter((item:Revision)=>!current.some(r=>r.id===item.id))]:data.items);setCursor(data.nextCursor);}
  catch(e){if(alive.current&&seq===listSeq.current)report(e);}finally{if(alive.current&&seq===listSeq.current)setLoading(false);}
 }
 useEffect(()=>{alive.current=true;void list();panel.current?.querySelector<HTMLButtonElement>('.history-close')?.focus();return()=>{alive.current=false;detailSeq.current++;baseSeq.current++;listSeq.current++;};},[]); // List once; paging and refresh are explicit.
 useEffect(()=>{
  function key(e:KeyboardEvent){
   if(e.key==='Escape'){e.preventDefault();if(!writing){if(confirmation)setConfirmation(null);else onClose();}}
   if(e.key!=='Tab')return;
   const container=confirmation?panel.current?.querySelector('.history-confirm'):panel.current;
   const controls=Array.from(container?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary,[tabindex="0"]')||[]).filter(node=>node.getClientRects().length>0);
   const first=controls[0],last=controls.at(-1);if(!first)return;
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  document.addEventListener('keydown',key);if(confirmation)panel.current?.querySelector<HTMLButtonElement>('.history-confirm button')?.focus();return()=>document.removeEventListener('keydown',key);
 },[busy,writing,confirmation,onClose]);
 async function choose(item:Revision){
  const seq=++detailSeq.current;setBusy('detail');setError('');setNotice('');setSelected({...item,content:undefined});
  try {const data=await call('/api/admin/history/'+item.id);if(alive.current&&seq===detailSeq.current)setSelected(data.revision);}
  catch(e){if(alive.current&&seq===detailSeq.current)report(e);}finally{if(alive.current&&seq===detailSeq.current)setBusy('');}
 }
 async function chooseBase(id:string){
  const seq=++baseSeq.current;setBaseId(id);setBase(null);setError('');if(id==='current')return;
  setBusy('base');try{const data=await call('/api/admin/history/'+id);if(alive.current&&seq===baseSeq.current)setBase(data.revision);}
  catch(e){if(alive.current&&seq===baseSeq.current)report(e);}finally{if(alive.current&&seq===baseSeq.current)setBusy('');}
 }
 async function checkpoint(){
  if(!clean||pending||version<1)return;setBusy('checkpoint');setError('');setNotice('');
  try{const data=await call('/api/admin/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedVersion:version,label,note})});setLabel('');setNote('');setNotice('Đã tạo mốc lưu trên cloud.');await list();await choose(data.revision);setNotice('Đã tạo mốc lưu trên cloud.');}
  catch(e){report(e);}finally{if(alive.current)setBusy('');}
 }
 async function readImport(event:ChangeEvent<HTMLInputElement>){
  const uploaded=event.target.files?.[0];event.target.value='';if(!uploaded)return;
  setMode('import');setIncoming(null);setBusy('import-preview');setError('');setNotice('');
  try{
   if(uploaded.size>MAX_BACKUP_BYTES)throw new Error('Chọn file JSON tối đa 512 KB.');
   const text=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Chưa đọc được file.'));reader.readAsText(uploaded);});
   const parsed=parseBackup(text);if(parsed.errors.length||!parsed.data)throw new Error(parsed.errors.join('\n'));
   const backup=JSON.parse(text.replace(/^\uFEFF/,''));const data=await call('/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'preview',backup})});
   if(alive.current){setIncoming({backup,content:data.content,warnings:data.warnings,previewHash:data.previewHash,filename:uploaded.name});setView('diff');}
  }catch(e){if(alive.current)report(e);}finally{if(alive.current)setBusy('');}
 }
 async function apply(){
  if(!confirmation||pending||(['restore','import'].includes(confirmation.source)&&!clean))return;const confirm=confirmation;setBusy('apply');setError('');
  try{
   if(confirm.source==='delete'||confirm.source==='all'){
    await call('/api/admin/history',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(confirm.source==='all'?{all:true,confirm:deletePhrase}:{id:confirm.id})});
    detailSeq.current++;baseSeq.current++;setSelected(null);setBase(null);setBaseId('current');setConfirmation(null);setDeletePhrase('');await list();setNotice('Đã xóa lịch sử đã chọn. CV nháp và bản công khai được giữ nguyên.');return;
   }
   const data=confirm.source==='restore'?await call('/api/admin/history/'+confirm.id+'/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedVersion:confirm.version})}):await call('/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'apply',backup:incoming?.backup,previewHash:incoming?.previewHash,expectedVersion:confirm.version})});
   if(alive.current)onApplied(data.document,confirm.source==='restore'?'Đã khôi phục vào bản nháp và giữ mốc trước khôi phục. CV công khai chưa thay đổi.':'Đã nhập vào bản nháp và giữ mốc trước nhập. CV công khai chưa thay đổi.');
  }catch(e){if(alive.current){report(e);setConfirmation(null);}}finally{if(alive.current)setBusy('');}
 }
 function exportJson(profile:Profile,v:number){try{download(profile,v);setNotice('Đã xuất JSON toàn bộ nội dung, kể cả mục ẩn. File không kèm ảnh, mật khẩu hoặc khóa kết nối.');setError('');}catch(e){report(e);}}
 return <div className="history-overlay"><div className="history-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="history-title">
  <header className="history-header"><div><p className="micro">YOUR STORY / VERSION ARCHIVE</p><h2 id="history-title">Lịch sử & Khôi phục.</h2><p>Mỗi mốc giữ một trạng thái CV. Khôi phục vào nháp để kiểm tra trước khi xuất bản.</p></div><button className="history-close" onClick={onClose} disabled={writing} aria-label="Đóng lịch sử">×</button></header>
  <div className="history-top-actions"><div className="history-tabs"><button aria-pressed={mode==='history'} disabled={pending} onClick={()=>setMode('history')}>Lịch sử</button><button aria-pressed={mode==='import'} disabled={pending} onClick={()=>setMode('import')}>Nhập JSON</button></div><span>{statusText}</span><button className="editor-secondary" disabled={!clean||pending||version<1} onClick={()=>exportJson(draft,version)}>Xuất nháp v{version} · JSON ↓</button></div>
  {!clean&&<div className="history-dirty"><span>{blocked?'Cần xử lý xung đột/bản khôi phục cục bộ ở editor trước khi áp dụng mốc.':'Lưu các thay đổi đang soạn trước khi tạo mốc hoặc khôi phục/nhập file.'}</span><button className="editor-publish" disabled={blocked||saving||!!busy} onClick={()=>void onSave()}>{saving?'Đang lưu…':'Lưu nháp hiện tại'}</button></div>}
  <div className="history-feedback">{error&&<div className="editor-message error" role="alert">{error}</div>}{notice&&<div className="editor-message success" role="status">{notice}</div>}</div>
  <div className="history-grid"><aside className="history-list-pane">
   {mode==='history'?<><div className="checkpoint-form"><p className="micro">SAVE A MOMENT</p><h3>Tạo mốc lưu.</h3><label>Tên mốc<input value={label} maxLength={120} onChange={e=>setLabel(e.target.value)} placeholder="Ví dụ: CV ứng tuyển IT PM" disabled={!!busy}/></label><label>Ghi chú<textarea value={note} maxLength={1000} rows={2} onChange={e=>setNote(e.target.value)} placeholder="Điều chỉnh hoặc mục tiêu của bản này" disabled={!!busy}/></label><button className="editor-publish" disabled={!clean||pending||version<1} onClick={()=>void checkpoint()}>{busy==='checkpoint'?'Đang tạo mốc…':'Tạo mốc từ nháp đã lưu'}</button></div><div className="timeline-heading"><h3>Các mốc đã lưu</h3><button disabled={pending} onClick={()=>void list()}>Làm mới</button><button className="text-danger" disabled={pending||!items.length} onClick={()=>{setDeletePhrase('');setConfirmation({source:'all',label:'Toàn bộ lịch sử VI / EN',version});}}>Xóa tất cả</button></div>{loading&&!items.length?<p className="history-hint" role="status">Đang tải lịch sử…</p>:!items.length?<p className="history-empty">Chưa có mốc lưu. Tạo mốc thủ công hoặc xuất bản CV để bắt đầu.</p>:items.map(item=><button className={`revision-card ${selected?.id===item.id?'selected':''}`} aria-pressed={selected?.id===item.id} key={item.id} onClick={()=>void choose(item)} disabled={!!busy}><span>{historyKinds[item.kind]||item.kind} · v{item.document_version}</span><strong>{item.label}</strong><small>{date(item.created_at)} · {(item.size_bytes/1024).toFixed(1)} KB</small></button>)}{cursor&&<button className="history-more" disabled={pending} onClick={()=>void list(true)}>Tải thêm mốc</button>}</>:<div className="import-intro"><p className="micro">BRING YOUR STORY BACK</p><h3>Nhập bản sao JSON.</h3><p>Chọn file để kiểm tra cấu trúc và xem khác biệt. Dữ liệu chỉ thay đổi sau khi xác nhận áp dụng.</p><button className="editor-publish" disabled={pending} onClick={()=>file.current?.click()}>Chọn file JSON</button><small>Tối đa 512 KB · Hỗ trợ bản sao Maison và JSON hồ sơ cũ.</small><p>Ảnh không nằm trong file JSON. Ảnh của tài khoản/project khác hoặc đã bị xóa cần chọn lại.</p>{incoming&&<div className="import-file"><strong>{incoming.filename}</strong><span>Đã kiểm tra cấu trúc</span>{incoming.warnings.map((warning,i)=><p key={i}>{warning}</p>)}</div>}</div>}
  </aside><section className="history-detail-pane">
   {candidate?<><div className="revision-heading"><div><p className="micro">{mode==='import'?'IMPORT PREVIEW':historyKinds[selected?.kind||'']}</p><h3>{mode==='import'?incoming?.filename:selected?.label}</h3>{selected&&mode==='history'&&<p>{date(selected.created_at)} · Bản nháp v{selected.document_version}{selected.note?' · '+selected.note:''}</p>}</div>{mode==='history'&&selected?.content&&<div><button className="editor-secondary" onClick={()=>exportJson(selected.content!,selected.document_version)} disabled={pending}>Xuất mốc · JSON ↓</button><button className="text-danger" disabled={pending} onClick={()=>setConfirmation({source:'delete',id:selected.id,label:selected.label,version})}>Xóa mốc</button></div>}</div>
    {selected?.kind==='baseline_public'&&mode==='history'&&<p className="history-baseline-note">Mốc này chỉ chứa dữ liệu công khai còn có trước nâng cấp. Nội dung ẩn của thời điểm đó không thể tái tạo; mốc nháp trước nâng cấp được giữ riêng.</p>}
    <div className="revision-view-controls"><div className="history-tabs"><button aria-pressed={view==='diff'} onClick={()=>setView('diff')}>Khác biệt</button><button aria-pressed={view==='cv'} onClick={()=>setView('cv')}>Xem CV</button></div><label>So sánh với<select value={baseId} onChange={e=>void chooseBase(e.target.value)} disabled={pending}><option value="current">Nháp hiện tại · v{version}</option>{items.map(item=><option key={item.id} value={item.id}>{item.label} · v{item.document_version}</option>)}</select></label></div>
    {view==='cv'?<>{candidate.translations?.en&&<label>Ngôn ngữ mốc<select aria-label="Ngôn ngữ mốc" value={viewLanguage} onChange={e=>setViewLanguage(e.target.value as 'vi'|'en')}><option value="vi">Tiếng Việt</option><option value="en">English</option></select></label>}<RevisionCv profile={localizedProfile(candidate,candidate.translations?.en?viewLanguage:'vi')||candidate}/></>:!comparison?<p className="history-hint">Đang tải bản so sánh…</p>:<><p className="difference-summary">{differences.length?`${differences.length} nhóm thông tin có thay đổi.`:'Không có khác biệt về nội dung và bố cục.'}</p><div className="difference-table"><div className="difference-head"><span>{baseId==='current'?'Nháp hiện tại':base?.label||'Mốc so sánh'}</span><span>{mode==='import'?'File đang nhập':'Mốc đã chọn'}</span></div>{differences.map(row=><article className="difference-row" key={row.key}><h4>{row.label}</h4><div><pre>{row.before||'Chưa có nội dung'}</pre><pre>{row.after||'Chưa có nội dung'}</pre></div></article>)}</div></>}
    <footer className="history-apply-bar"><p>Nháp hiện tại sẽ được giữ thành mốc trước khi thay đổi. Bản công khai tiếp tục giữ nguyên.</p><button className="editor-publish" disabled={!clean||pending} onClick={()=>setConfirmation({source:mode==='import'?'import':'restore',id:selected?.id,label:mode==='import'?incoming!.filename:selected!.label,version})}>{mode==='import'?'Áp dụng file vào nháp':'Khôi phục mốc vào nháp'} ↗</button></footer>
   </>:<div className="history-detail-empty"><span>↶</span><h3>{busy==='detail'?'Đang mở mốc…':mode==='import'?'Chọn file để xem trước.':'Chọn một mốc để xem lại.'}</h3><p>So sánh nội dung và bố cục, xem CV, rồi quyết định khôi phục. Không tự xuất bản.</p></div>}
  </section></div>
  <input type="file" ref={file} accept=".json,application/json" hidden aria-label="File JSON nhập" onChange={e=>void readImport(e)}/>
  {confirmation&&<div className="history-confirm-overlay"><div className="history-confirm" role="alertdialog" aria-modal="true" aria-labelledby="history-confirm-title"><p className="micro">A NEW DRAFT, A SAFE CHECKPOINT</p><h3 id="history-confirm-title">{confirmation.source==='all'?'Xóa toàn bộ lịch sử?':confirmation.source==='delete'?'Xóa mốc này?':confirmation.source==='restore'?'Khôi phục mốc này?':'Áp dụng file này?'}</h3><strong>{confirmation.label}</strong>{['delete','all'].includes(confirmation.source)?<><p>Mốc đã xóa không thể khôi phục trong app. CV nháp, các bản đã xuất bản và cài đặt được giữ nguyên.</p>{confirmation.source==='all'&&<label>Nhập DELETE để xác nhận<input aria-label="Xác nhận xóa tất cả" value={deletePhrase} onChange={e=>setDeletePhrase(e.target.value)}/></label>}</>:<p>Bản nháp v{confirmation.version} sẽ được giữ thành mốc trước thay đổi. Khôi phục toàn bộ nội dung VI/EN trong mốc vào nháp mới; CV công khai không đổi.</p>}<div><button className="editor-secondary" disabled={!!busy} onClick={()=>setConfirmation(null)}>Xem lại</button><button className="editor-publish" disabled={!!busy||(['restore','import'].includes(confirmation.source)&&!clean)||(confirmation.source==='all'&&deletePhrase!=='DELETE')} onClick={()=>void apply()}>{busy==='apply'?'Đang xử lý…':['delete','all'].includes(confirmation.source)?'Xác nhận xóa':'Xác nhận thay bản nháp'}</button></div></div></div>}
 </div></div>;
}
