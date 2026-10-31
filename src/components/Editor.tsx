'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type FocusEvent, type ClipboardEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browserCloud } from '@/lib/browser-cloud';
import { renderCv } from '@/lib/render.mjs';
import { validateCv } from '@/lib/validation.mjs';
import type { Profile,SectionId,CvLayout } from '@/lib/types';
import { useDraft } from '@/lib/use-draft';
import { normalizeLayout,layoutZones,moveItem } from '@/lib/layout.mjs';
import { SortHandle } from './SortHandle';
import { HistoryPanel } from './HistoryPanel';
import seed from '@/data/profile.json';

type Section = SectionId|'layout';
type Collection = 'education'|'skills'|'certificates'|'experience'|'implementations'|'projects';
type Row = Record<string,string|string[]>;
type Publication = { document_version:number; published_at:string } | null;
const sections: {id:Section;label:string;number:string}[] = [
 {id:'personal',label:'Thông tin cá nhân',number:'01'}, {id:'objective',label:'Mục tiêu nghề nghiệp',number:'02'},
 {id:'education',label:'Học vấn',number:'03'}, {id:'skills',label:'Kỹ năng',number:'04'},
 {id:'certificates',label:'Chứng chỉ',number:'05'}, {id:'experience',label:'Kinh nghiệm làm việc',number:'06'},
 {id:'delivery',label:'Kinh nghiệm triển khai',number:'07'}, {id:'projects',label:'Sản phẩm nổi bật',number:'08'},
];
const definitions: Record<Collection,{ label:string; fields:{key:string;label:string;multiline?:boolean;list?:boolean}[] }> = {
 education:{label:'Học vấn',fields:[{key:'school',label:'Trường / Cơ sở đào tạo'},{key:'degree',label:'Chuyên ngành / Bằng cấp'},{key:'period',label:'Thời gian'},{key:'detail',label:'Thông tin bổ sung',multiline:true}]},
 skills:{label:'Kỹ năng',fields:[{key:'name',label:'Tên kỹ năng'},{key:'description',label:'Mô tả năng lực',multiline:true}]},
 certificates:{label:'Chứng chỉ',fields:[{key:'name',label:'Tên chứng chỉ'},{key:'issuer',label:'Đơn vị cấp'},{key:'year',label:'Năm cấp'},{key:'url',label:'Đường dẫn xác minh (tùy chọn)'}]},
 experience:{label:'Kinh nghiệm',fields:[{key:'role',label:'Vị trí công việc'},{key:'company',label:'Công ty / Tổ chức'},{key:'period',label:'Thời gian'},{key:'summary',label:'Vai trò và phạm vi',multiline:true},{key:'highlights',label:'Trách nhiệm / Kết quả — mỗi dòng một ý',multiline:true,list:true}]},
 implementations:{label:'Đơn vị triển khai',fields:[{key:'code',label:'Mã đơn vị (ví dụ: EPU)'},{key:'name',label:'Tên đơn vị đầy đủ'},{key:'description',label:'Vai trò / Phạm vi triển khai',multiline:true}]},
 projects:{label:'Sản phẩm',fields:[{key:'name',label:'Tên sản phẩm'},{key:'description',label:'Bài toán và giá trị sản phẩm',multiline:true},{key:'role',label:'Vai trò của bạn'},{key:'year',label:'Năm thực hiện'},{key:'technologies',label:'Công nghệ — mỗi dòng một công nghệ',multiline:true,list:true},{key:'demoUrl',label:'Đường dẫn demo (tùy chọn)'},{key:'sourceUrl',label:'Đường dẫn mã nguồn (tùy chọn)'}]},
};
function dateLabel(value?:string) { return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa lưu'; }
function Field({label,value,onChange,multiline=false}: {label:string;value:string;onChange:(value:string)=>void;multiline?:boolean}) {
 return <label className="editor-field"><span>{label}</span>{multiline ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={4} maxLength={6000}/> : <input value={value} onChange={e=>onChange(e.target.value)} maxLength={label.startsWith('Mã đơn vị')?80:500}/>}</label>;
}

export function Editor() {
 const client = useMemo(()=>browserCloud(),[]);
 const [session,setSession] = useState<Session|null>(null);
 const [starting,setStarting] = useState(!!client);
 const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
 const [showPassword,setShowPassword] = useState(false); const [recovery,setRecovery] = useState(false);
 const [busy,setBusy] = useState(''); const [error,setError] = useState(''); const [notice,setNotice] = useState('');
 const [loaded,setLoaded] = useState(false);
 const userId=session?.user.id;
 const [publication,setPublication] = useState<Publication>(null);
 const [selected,setSelected] = useState<Section>('personal');
 const [panel,setPanel] = useState(false); const [preview,setPreview] = useState(false); const [confirmPublish,setConfirmPublish] = useState(false);
 const [avatar,setAvatar] = useState('');
 const [historyOpen,setHistoryOpen]=useState(false);const appliedNotice=useRef<string|null>(null);
 const [inlineFocus,setInlineFocus]=useState(false);const frozenHtml=useRef('');
 const [device,setDevice]=useState<'desktop'|'mobile'>('desktop');
 const loadSequence=useRef(0);
 const fileInput = useRef<HTMLInputElement>(null); const mounted = useRef(true);


 useEffect(()=>{
  mounted.current=true;
  if (!client) { setStarting(false); return; }
  client.auth.getSession().then(({data})=>{ if (mounted.current) {setSession(data.session);setStarting(false);} }).catch(()=>{if(mounted.current){setError('Chưa đọc được phiên đăng nhập. Hãy tải lại trang.');setStarting(false);}});
  const {data:{subscription}} = client.auth.onAuthStateChange((event,current)=>{
   setSession(current); setStarting(false);
   if (event==='PASSWORD_RECOVERY') setRecovery(true);
  });
  if (new URLSearchParams(window.location.search).get('recovery')==='1') {setRecovery(true);window.history.replaceState({},'', '/admin');}
  return ()=>{mounted.current=false;subscription.unsubscribe();};
 },[client]);
 const call = useCallback(async(path:string,init:RequestInit={})=>{
  if (!client) throw new Error('Chưa cấu hình Supabase.');
  const { data:{session:current} } = await client.auth.getSession();
  if (!current) throw new Error('Phiên đã hết hạn. Hãy đăng nhập lại; bản đang soạn vẫn ở trang này.');
  const response = await fetch(path,{...init,cache:'no-store',headers:{...init.headers,Authorization:`Bearer ${current.access_token}`}});
  const data=await response.json();
  if (!response.ok) {throw Object.assign(new Error(data.error || 'Thao tác chưa thành công.'),{status:response.status});}
  return data;
 },[client]);
 const draftCtl=useDraft({call,identity:userId?`${process.env.NEXT_PUBLIC_SUPABASE_URL||'local'}:${userId}`:'',active:loaded&&!!session&&!recovery&&!busy&&!historyOpen});
 const {draft,version,updatedAt,dirty,conflict,reset,clear}=draftCtl;
 const setDraft=(updater:Profile|((current:Profile)=>Profile),key='')=>draftCtl.change(updater,key);
 useEffect(()=>{setNotice(appliedNotice.current||'');appliedNotice.current=null;setError('');},[draft]);
 const layout=normalizeLayout(draft?.layout);
 const statusText=draftCtl.saving?'Đang lưu nháp…':conflict?'Cần kiểm tra xung đột':draftCtl.phase==='offline'?'Mất kết nối · giữ trên thiết bị':draftCtl.phase==='error'?'Lưu chưa thành công':dirty?'Đang chờ tự lưu…':version?`Đã lưu nháp · v${version}`:'Chưa lưu online';
 const load = useCallback(async(discardLocal=false)=>{
  const sequence=++loadSequence.current;
  setBusy('load');setError('');setNotice('');
  try {
   const data=await call('/api/admin/cv');if(sequence!==loadSequence.current)return;
   if (data.document) {
    const parsed=validateCv(data.document.content);
    if(parsed.errors.length || !parsed.data)throw new Error('Dữ liệu CV đã lưu không hợp lệ. Chưa thay đổi bản đang soạn.');
    reset(parsed.data,Number(data.document.version),data.document.updated_at,true,!discardLocal);
   } else {
    const parsed=validateCv(structuredClone(seed));if(parsed.data)reset(parsed.data,0,'',false,!discardLocal);
   }
   setInlineFocus(false);setPublication(data.publication);setLoaded(true);
  } catch(e) {if(sequence===loadSequence.current)setError(e instanceof Error?e.message:'Chưa tải được CV.');} finally {if(sequence===loadSequence.current)setBusy('');}
 },[call,reset]);
 useEffect(()=>{setLoaded(false);setHistoryOpen(false);clear(false);if(userId)void load();return()=>{loadSequence.current++;};},[userId,load,clear]);
 useEffect(()=>{
  if(!confirmPublish)return;
  const dialog=document.querySelector('.publish-dialog');
  const controls=Array.from(dialog?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);
  controls[0]?.focus();
  function key(event:KeyboardEvent) {
   if(event.key==='Escape'&&!busy)setConfirmPublish(false);
   if(event.key==='Tab'&&controls.length){const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  }
  document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
 },[confirmPublish,busy]);
 useEffect(()=>{
  let objectUrl='';let cancelled=false;setAvatar('');
  if (!draft?.portrait.startsWith('/api/media/') || !client || !userId)return;
  const portrait=draft.portrait;
  void (async()=>{
   try{
    const {data:{session:current}}=await client.auth.getSession();
    if(!current)return;
    const response=await fetch(portrait,{headers:{Authorization:`Bearer ${current.access_token}`},cache:'no-store'});
    if(!response.ok)throw new Error();
    objectUrl=URL.createObjectURL(await response.blob());if(!cancelled)setAvatar(objectUrl);
   }catch {if(!cancelled)setNotice('Chưa tải được ảnh xem trước. Hãy kiểm tra kết nối hoặc tải lại bản nháp.');}
  })();
  return()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[draft?.portrait,client,userId]);
 const html = useMemo(()=>{
  if(!draft)return '';
  if(inlineFocus)return frozenHtml.current;
  const output=renderCv({...draft,publication:'draft',cvFile:''},{editing:!preview&&!busy&&!draftCtl.recovery}).replace('<main id="main">','<div class="cv-preview-content">').replace('</main>','</div>');
  return avatar && draft.portrait.startsWith('/api/media/') ? output.replace(`src="${draft.portrait}"`,`src="${avatar}"`) : output;
 },[draft,preview,busy,avatar,inlineFocus,draftCtl.recovery]);
 function update(key:string,value:string) {
  setDraft(current=>({...current,[key]:value.normalize('NFC')}),'field:'+key);setNotice('');
 }
 function choose(id:Section) {setSelected(id);setPanel(true);}
 async function authenticate(event:FormEvent) {
  event.preventDefault();if(!client)return;setBusy('auth');setError('');setNotice('');
  try {
   if(recovery && session) {
    if(password.length<10)throw new Error('Mật khẩu mới cần ít nhất 10 ký tự.');
    const {error:e}=await client.auth.updateUser({password});if(e)throw e;setRecovery(false);setPassword('');setNotice('Đã cập nhật mật khẩu.');
   } else {
    const {error:e}=await client.auth.signInWithPassword({email:email.trim(),password});
    if(e)throw new Error('Đăng nhập chưa thành công. Kiểm tra email và mật khẩu.');setPassword('');
   }
  }catch(e){setError(e instanceof Error?e.message:'Chưa đăng nhập được.');}finally{setBusy('');}
 }
 async function forgotPassword() {
  if(!client)return;if(!email.trim()){setError('Nhập email tài khoản trước khi yêu cầu khôi phục.');return;}
  setBusy('recovery');setError('');
  try{const {error:e}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/callback`});if(e)throw e;setNotice('Nếu email hợp lệ, hướng dẫn khôi phục sẽ được gửi đến hộp thư. Mở liên kết trên trình duyệt này.');}
  catch{setError('Chưa gửi được email khôi phục. Kiểm tra cấu hình Auth/email và thử lại.');}finally{setBusy('');}
 }
 async function save() {
  setError('');setNotice('');
  if(await draftCtl.save())setNotice('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 }
 function preparePublish() {
  if(!draft)return;
  if(dirty || draftCtl.saving || conflict || version===0){setError('Hãy lưu bản nháp mới nhất trước khi xuất bản.');return;}
  const check=validateCv(draft,true);if(check.errors.length){setError(check.errors.join('\n'));return;}
  setError('');setConfirmPublish(true);
 }
 async function publish() {
  setBusy('publish');setError('');
  try {const data=await call('/api/admin/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedVersion:version})});setPublication(data.publication);setNotice('Đã xuất bản. Thiết bị khác mở hoặc tải lại CV sẽ thấy bản mới.');setConfirmPublish(false);}
  catch(e){if((e as {status?:number}).status===409)draftCtl.pauseConflict();setError(e instanceof Error?e.message:'Chưa xuất bản được.');setConfirmPublish(false);}finally{setBusy('');}
 }
 async function upload(file?:File) {
  if(!file)return;setBusy('upload');setError('');setNotice('');
  try{
   if(file.size>3*1024*1024)throw new Error('Chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 3 MB.');
   const form=new FormData();form.append('file',file);const data=await call('/api/admin/upload',{method:'POST',body:form});
   update('portrait',data.portrait);setNotice('Đã tải ảnh. Lưu nháp để giữ thay đổi, rồi xuất bản khi sẵn sàng.');
  }catch(e){setError(e instanceof Error?e.message:'Chưa tải được ảnh.');}finally{setBusy('');if(fileInput.current)fileInput.current.value='';}
 }
 async function signOut() {
  if(dirty && !window.confirm('Bản đang soạn chưa được lưu. Đăng xuất và bỏ thay đổi này?'))return;
  await client?.auth.signOut({scope:'local'});clear(true);setLoaded(false);setPassword('');setError('');setNotice('');setRecovery(false);
 }
 function reload() {if(!dirty || window.confirm('Tải bản mới nhất sẽ thay bản đang soạn chưa lưu. Tiếp tục?'))void load(true);}
 function keepConflictCopy() {
  if(!draft)return;const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Maison-CV-ban-dang-soan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Đã tải bản đang soạn để đối chiếu. Bản này chưa được lưu online. Sau khi tải lại bản online mới nhất, mở Lịch sử → Nhập JSON để đối chiếu và nhập lại khi cần.');
 }
 function previewClick(event:MouseEvent<HTMLDivElement>) {
  if(preview||busy)return;const target=event.target as HTMLElement;
  if(target.closest('a'))event.preventDefault();
  const section=target.closest('[data-cv-section]')?.getAttribute('data-cv-section') as Section|undefined;
  if(section)choose(section);
 }
 function inlineBlur(event:FocusEvent<HTMLDivElement>) {
  const target=event.target as HTMLElement;const key=target.dataset.cvField;
  if(key && ['name','role','summary','objective'].includes(key))update(key,target.innerText||target.textContent||'');setInlineFocus(false);
 }
 function trackInlineField(target:HTMLElement) {
  const field=target.closest('[data-cv-field]') as HTMLElement|null;const key=field?.dataset.cvField;
  if(field && key && ['name','role','summary','objective'].includes(key)){update(key,field.innerText||field.textContent||'');}
 }
 function pastePlain(event:ClipboardEvent<HTMLDivElement>) {
  const target=event.target as HTMLElement;if(!target.closest('[data-cv-field]'))return;
  event.preventDefault();const selection=window.getSelection();if(!selection?.rangeCount)return;
  const range=selection.getRangeAt(0);range.deleteContents();const node=document.createTextNode(event.clipboardData.getData('text/plain'));range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection.removeAllRanges();selection.addRange(range);
  trackInlineField(target);
 }
 function layoutEditor() {
  const labels:Record<string,string>={intro:'Khối đầu CV',aside:'Cột trái',career:'Cột phải'};
  const name=(id:SectionId)=>id==='personal'?'Thông tin liên hệ':sections.find(s=>s.id===id)?.label||id;
  const move=(zone:keyof CvLayout['order'],from:number,to:number)=>setDraft(p=>({...p,layout:{...normalizeLayout(p.layout),order:{...normalizeLayout(p.layout).order,[zone]:moveItem(normalizeLayout(p.layout).order[zone],from,to)}}}));
  const hide=(id:SectionId,on:boolean)=>setDraft(p=>{const l=normalizeLayout(p.layout);return {...p,layout:{...l,hidden:on?l.hidden.filter(x=>x!==id):[...l.hidden,id]}};});
  return <><p className="panel-description">Kéo nút ⋮⋮ để đổi thứ tự trong từng khối, hoặc dùng nút lên/xuống. Các cột giữ bố cục Maison. Tắt một mục để ẩn khỏi CV; nội dung bản nháp vẫn được giữ.</p>{Object.keys(layoutZones).map(zone=><div className="layout-zone" key={zone}><h3>{labels[zone]}</h3>{layout.order[zone as keyof CvLayout['order']].map((id,index)=><div className="layout-row" data-sortable-group={`layout-${zone}`} data-sortable-index={index} key={id}><SortHandle group={`layout-${zone}`} index={index} count={layout.order[zone as keyof CvLayout['order']].length} label={name(id)} onMove={(from,to)=>move(zone as keyof CvLayout['order'],from,to)}/><label><input type="checkbox" checked={!layout.hidden.includes(id)} onChange={e=>hide(id,e.target.checked)}/><span>{name(id)}</span></label></div>)}</div>)}<div className="layout-zone"><h3>Sản phẩm nổi bật</h3><label className="layout-toggle"><input type="checkbox" checked={!layout.hidden.includes('projects')} onChange={e=>hide('projects',e.target.checked)}/> Hiện sản phẩm nổi bật</label></div><p className="panel-description">Thông tin đầu trang và nút Mở Portfolio luôn được giữ. Mục bị ẩn sẽ không nằm trong dữ liệu công khai khi xuất bản lại.</p></>;
 }
 function collectionEditor(group:Collection) {
  if(!draft)return null;const definition=definitions[group];const rows=draft[group] as unknown as Row[];
  function replace(next:Row[],key='') {setDraft(current=>({...current,[group]:next}),key);}
  return <><p className="panel-description">Nội dung hiển thị theo thứ tự bên dưới. Xóa các mục mẫu chưa sử dụng trước khi xuất bản.</p>{rows.map((row,index)=><article className="editor-item" data-sortable-group={group} data-sortable-index={index} key={`${group}-${index}`}><div className="editor-item-heading"><SortHandle group={group} index={index} count={rows.length} label={`${definition.label} ${index+1}`} onMove={(from,to)=>replace(moveItem(rows,from,to))}/><span>{definition.label} {String(index+1).padStart(2,'0')}</span><button type="button" className="text-danger" onClick={()=>{if(window.confirm('Xóa mục này khỏi bản nháp?'))replace(rows.filter((_,i)=>i!==index));}}>Xóa</button></div>{definition.fields.map(field=><Field key={field.key} label={field.label} multiline={field.multiline} value={Array.isArray(row[field.key])?(row[field.key] as string[]).join('\n'):String(row[field.key]||'')} onChange={value=>replace(rows.map((item,i)=>i===index?{...item,[field.key]:field.list?value.split('\n'):value}:item),`${group}:${index}:${field.key}`)}/>)}</article>)}<button type="button" className="add-item" disabled={rows.length>=50} onClick={()=>replace([...rows,Object.fromEntries(definition.fields.map(f=>[f.key,f.list?[]:'']))])}>＋ Thêm {definition.label.toLowerCase()}</button></>;
 }
 function acceptRecovery(document:{content:Profile;version:number;updated_at:string},message:string){
  const parsed=validateCv(document.content);if(parsed.errors.length||!parsed.data)throw new Error('Dữ liệu trả về chưa hợp lệ. Hãy tải lại bản nháp online để kiểm tra.');
  appliedNotice.current=message;reset(parsed.data,Number(document.version),document.updated_at,true,false);setInlineFocus(false);setHistoryOpen(false);
 }
 const displayError=error||draftCtl.saveError;
 const feedback=<>{draftCtl.recovery&&<div className="editor-message recovery" role="status"><strong>Có bản nháp chưa lưu trên thiết bị này</strong><p>Soạn lúc {dateLabel(draftCtl.recovery.updatedAt)}. Khôi phục để xem lại hoặc dùng bản online hiện tại.</p><div className="message-actions"><button onClick={draftCtl.restoreRecovery}>Khôi phục bản trên thiết bị</button><button onClick={draftCtl.discardRecovery}>Dùng bản online</button></div></div>}{draftCtl.cacheWarning&&<div className="editor-message error" role="status">{draftCtl.cacheWarning}</div>}{displayError&&<div className="editor-message error" role="alert"><strong>Chưa hoàn tất thao tác</strong><p>{displayError}</p>{conflict&&<div className="message-actions"><button onClick={keepConflictCopy}>Giữ bản đang soạn</button><button onClick={reload}>Tải bản mới nhất</button></div>}</div>}{notice&&<div className="editor-message success" role="status">{notice}</div>}</>;

 if(starting)return <main id="main" className="auth-page"><div className="loading-ring"/><p>Đang mở không gian của bạn…</p></main>;
 if(!client)return <main id="main" className="auth-page"><div className="auth-card setup-card"><a className="wordmark" href="/">maison.</a><p className="micro">BẮT ĐẦU / CLOUD SETUP</p><h1>Kết nối để<br/><em>lưu câu chuyện của bạn.</em></h1><p>Source đã sẵn sàng. Hoàn tất thiết lập Supabase một lần để chỉnh sửa và lưu CV online.</p><ol><li>Chạy migration trong thư mục <code>supabase/migrations</code>.</li><li>Tạo tài khoản và gán User UID bằng <code>supabase/setup-owner.sql</code>.</li><li>Thêm hai biến trong <code>.env.example</code> vào Vercel rồi redeploy.</li></ol><p className="auth-note">Hướng dẫn từng bước nằm trong README đi kèm source. Trang công khai chưa hiển thị nội dung nháp.</p><a className="button" href="/">← Quay lại website</a></div></main>;
 if(!session || recovery)return <main id="main" className="auth-page"><div className="auth-story"><a className="wordmark" href="/">maison.<span>THE EDITOR’S ROOM</span></a><p className="micro">YOUR STORY. YOUR NEXT CHAPTER.</p><h1>Một hồ sơ.<br/><em>Dấu ấn của bạn.</em></h1><p>Một không gian riêng để chăm chút trải nghiệm, năng lực và những điều bạn tự tay xây dựng.</p><span className="auth-version">MAISON CV / v1.4.0</span></div><form className="auth-card" onSubmit={authenticate}><p className="micro">PRIVATE ACCESS</p><h2>{recovery&&session?'Đặt mật khẩu mới.':'Chào mừng trở lại.'}</h2><p>{recovery&&session?'Cập nhật mật khẩu để tiếp tục quản lý hồ sơ.':'Đăng nhập tài khoản chủ sở hữu để chỉnh sửa CV.'}</p>{feedback}{!(recovery&&session)&&<label className="editor-field"><span>Email tài khoản</span><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label>}<label className="editor-field"><span>{recovery&&session?'Mật khẩu mới':'Mật khẩu'}</span><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={recovery?'new-password':'current-password'} minLength={recovery?10:undefined} required/><button type="button" aria-label={showPassword?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Ẩn':'Hiện'}</button></div></label><button type="submit" className="button primary auth-submit" disabled={!!busy}>{busy?'Đang xử lý…':recovery&&session?'Lưu mật khẩu':'Đăng nhập ↗'}</button>{!recovery&&<button className="forgot-link" type="button" onClick={forgotPassword} disabled={!!busy}>Quên mật khẩu?</button>}{recovery&&<button className="forgot-link" type="button" onClick={()=>setRecovery(false)}>Quay lại</button>}<div className="auth-note">Chỉ chủ sở hữu đã được cấp quyền có thể chỉnh sửa. Người xem CV không cần đăng nhập.</div><a className="back-public" href="/">← Xem website công khai</a></form></main>;
 if(!loaded || !draft)return <main id="main" className="editor-loading"><a className="wordmark" href="/">maison.</a><h1>Không gian chỉnh sửa.</h1>{busy?<p>Đang tải dữ liệu online…</p>:<>{feedback}<button className="button primary" onClick={()=>void load()}>Thử tải lại</button></>}<button className="button" onClick={signOut}>Đăng xuất</button></main>;

 return <main id="main" onCompositionStart={()=>draftCtl.setComposing(true)} onCompositionEnd={()=>draftCtl.setComposing(false)} className={`editor-app ${preview?'preview-mode':''} ${device==='mobile'?'mobile-preview-mode':''}`}>
  <div className="editor-workspace" inert={historyOpen}><header className="editor-topbar"><a className="wordmark" href="/admin">maison.<span>CV STUDIO</span></a><div className="editor-status"><span className={`status-dot ${dirty?'unsaved':''}`}/><span>{statusText}</span></div><div className="editor-toolbar"><button className="editor-secondary history-launch" onClick={()=>{setInlineFocus(false);setHistoryOpen(true);}} disabled={!!busy}>Lịch sử ↶</button><button className="editor-secondary undo-control" aria-label="Hoàn tác" disabled={!!busy||!draftCtl.canUndo} onClick={()=>{setInlineFocus(false);draftCtl.undo();}}>↶</button><button className="editor-secondary undo-control" aria-label="Làm lại" disabled={!!busy||!draftCtl.canRedo} onClick={()=>{setInlineFocus(false);draftCtl.redo();}}>↷</button><button className="editor-secondary" onClick={()=>{setPreview(!preview);setPanel(false);}} disabled={!!busy}>{preview?'← Chỉnh sửa':'Xem trước'}</button><button className="editor-secondary" onClick={()=>void save()} disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||!dirty}>{draftCtl.saving?'Đang lưu…':'Lưu nháp'}</button><button className="editor-publish" onClick={preparePublish} disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||dirty||!version||publication?.document_version===version}>{busy==='publish'?'Đang xuất bản…':'Xuất bản ↗'}</button></div></header>
  <div className="editor-layout"><aside className="editor-navigation"><div className="workspace-caption"><span>YOUR WORKSPACE</span><h2>Hồ sơ của bạn.</h2></div><nav aria-label="Các phần CV"><button className={selected==='layout'?'selected':''} onClick={()=>choose('layout')}><span>✧</span>Bố cục CV<b>↗</b></button>{sections.map(section=><button key={section.id} className={selected===section.id?'selected':''} onClick={()=>choose(section.id)}><span>{section.number}</span>{section.label}<b>↗</b></button>)}</nav><div className="workspace-note"><span className="micro">BẢN CÔNG KHAI</span><strong>{publication?'Đã xuất bản':'Chưa xuất bản'}</strong><p>{publication?`Bản nháp v${publication.document_version} · ${dateLabel(publication.published_at)}`:'Lưu nháp, xem trước rồi xuất bản khi bạn đã sẵn sàng.'}</p><a href="/" target="_blank" rel="noopener noreferrer">Mở website ↗</a>{publication&&<a href="/#sharing-title" target="_blank" rel="noopener noreferrer">PDF & Chia sẻ CV ↗</a>}</div><div className="workspace-bottom"><p title={session.user.email}>{session.user.email}</p><button onClick={reload} disabled={!!busy}>Tải bản mới nhất</button><button onClick={signOut} disabled={!!busy}>Đăng xuất</button></div></aside>
   <section className="editor-canvas"><div className="canvas-caption"><div><p className="micro">{preview?'DRAFT PREVIEW':'LIVE EDITOR'}</p><h2>{preview?'Xem trước bản nháp.':'Chăm chút từng chi tiết.'}</h2><p>{preview?'Bản này chỉ hiển thị trong phiên quản lý. Khách chưa thấy các thay đổi.':'Bấm vào tên, vị trí, giới thiệu hoặc mục tiêu để gõ trực tiếp. Chọn các phần còn lại để chỉnh sửa.'}</p></div><button className="editor-secondary print-draft" onClick={()=>window.print()} disabled={!!busy}>In bản nháp ↓</button></div><div className="preview-controls" aria-label="Kích thước xem trước"><button aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Desktop</button><button aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Mobile · 390px</button><span>Tự lưu nháp · Sau khi ngừng nhập</span></div><div className="feedback-area">{feedback}</div><div className="editor-preview" onFocus={event=>{if((event.target as HTMLElement).closest('[data-cv-field]')){frozenHtml.current=html;setInlineFocus(true);}}} onClick={previewClick} onInput={event=>trackInlineField(event.target as HTMLElement)} onBlur={inlineBlur} onPaste={pastePlain} dangerouslySetInnerHTML={{__html:html}}/><p className="canvas-footnote">Lần lưu gần nhất: {dateLabel(updatedAt)} · Tự lưu nháp online; xuất bản vẫn cần xác nhận.</p></section>
   {!preview&&<><button className="mobile-editor-launch" onClick={()=>setPanel(true)}>✎ Chỉnh sửa nội dung</button>{panel&&<button className="panel-backdrop" aria-label="Đóng bảng chỉnh sửa" onClick={()=>setPanel(false)}/>}<aside className={`editor-panel ${panel?'open':''}`} aria-label="Bảng chỉnh sửa"><div className="panel-heading"><div><p className="micro">EDIT DETAILS</p><h2>{selected==='layout'?'Bố cục CV':sections.find(s=>s.id===selected)?.label}</h2></div><button className="panel-close" onClick={()=>setPanel(false)} aria-label="Đóng bảng chỉnh sửa">×</button></div><div className="mobile-section-select"><label>Phần đang sửa<select value={selected} onChange={e=>setSelected(e.target.value as Section)}><option value="layout">Bố cục CV</option>{sections.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div><fieldset disabled={!!busy||!!draftCtl.recovery} className="panel-fields">
    {selected==='personal'&&<><div className="portrait-control">{avatar||draft.portrait?<img src={avatar||draft.portrait} alt="Ảnh chân dung đang chỉnh"/>:<div className="portrait-placeholder">m.</div>}<div><button type="button" className="editor-secondary" onClick={()=>fileInput.current?.click()}>{busy==='upload'?'Đang tải…':'Thay ảnh'}</button><p>JPG, PNG, WebP · Tối đa 3 MB</p>{draft.portrait&&<button type="button" className="text-danger" onClick={()=>update('portrait','')}>Bỏ ảnh khỏi CV</button>}</div></div>{[['name','Họ và tên'],['role','Vị trí / Chức danh'],['summary','Giới thiệu ngắn'],['email','Email liên hệ'],['phone','Số điện thoại'],['website','Website cá nhân'],['address','Địa chỉ / Thành phố'],['portraitAlt','Mô tả ảnh'],['siteUrl','URL website CV (dùng cho chia sẻ, QR và sitemap)']].map(([key,label])=><Field key={key} label={label} value={String(draft[key as keyof Profile]||'')} multiline={key==='summary'} onChange={value=>update(key,value)}/>)}</>}
    {selected==='objective'&&<><p className="panel-description">Mục tiêu thể hiện hướng phát triển và giá trị bạn muốn đóng góp.</p><Field label="Mục tiêu nghề nghiệp" value={draft.objective} multiline onChange={value=>update('objective',value)}/></>}
    {selected==='layout'&&layoutEditor()}
    {!['personal','objective','layout'].includes(selected)&&collectionEditor(selected==='delivery'?'implementations':selected as Collection)}
   </fieldset><div className="panel-footer"><span>{statusText}</span><button className="editor-publish" disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||!dirty} onClick={()=>void save()}>{draftCtl.saving?'Đang lưu…':'Lưu nháp'}</button></div></aside></>}
  </div><input type="file" ref={fileInput} accept="image/jpeg,image/png,image/webp" hidden onChange={e=>void upload(e.target.files?.[0])}/>
  {confirmPublish&&<div className="publish-overlay"><div className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title"><p className="micro">READY FOR THE NEXT CHAPTER?</p><h2 id="publish-title">Chia sẻ hồ sơ<br/><em>của bạn.</em></h2><p>Bản nháp v{version} sẽ thay CV đang công khai. Nội dung, ảnh và thông tin liên hệ trong bản này có thể được mọi người xem.</p><div className="publish-summary"><strong>{draft.name}</strong><span>{draft.role}</span></div><div className="dialog-actions"><button className="editor-secondary" disabled={!!busy} onClick={()=>setConfirmPublish(false)}>Xem lại</button><button className="editor-publish" disabled={!!busy} onClick={()=>void publish()}>{busy?'Đang xuất bản…':'Xuất bản CV ↗'}</button></div></div></div>}
 </div>
  {historyOpen&&<HistoryPanel draft={draft} version={version} dirty={dirty} saving={draftCtl.saving} blocked={conflict||!!draftCtl.recovery} statusText={statusText} call={call} onSave={save} onClose={()=>setHistoryOpen(false)} onApplied={acceptRecovery} onConflict={message=>{draftCtl.pauseConflict();setError(message);}}/>}
 </main>;
}
