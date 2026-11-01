'use client';
import { useCallback, useEffect,useLayoutEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type FocusEvent, type ClipboardEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browserCloud } from '@/lib/browser-cloud';
import { renderCv } from '@/lib/render.mjs';
import {localizedProfile,updateLocalized,createEnglishProfile,completeEnglishSection,mediaPaths} from '@/lib/i18n.mjs';
import {usePrivateMedia} from '@/lib/use-private-media';
import {useReorderMotion} from '@/lib/use-reorder-motion';
import {InlineEditor,type InlineEdit} from './InlineEditor';
import {BrandMark} from './BrandMark';
import {AppImageCropper} from './AppImageCropper';
import {AppShowcaseMedia} from './AppShowcaseEditor';
import {completeEnglishApps} from '@/lib/showcase.mjs';
import { validateCv,validatePublication } from '@/lib/validation.mjs';
import type { Profile,SectionId,CvLayout,Locale,Preferences,Branding,Project,PublicationIssue } from '@/lib/types';
import { useDraft } from '@/lib/use-draft';
import { normalizeLayout,layoutZones,maisonZones,sectionOrder,sectionTitle,moveSection,moveItem } from '@/lib/layout.mjs';
import {sortByTime} from '@/lib/chronology.mjs';
import {useCanvasDrag} from '@/lib/use-canvas-drag';
import { SortHandle } from './SortHandle';
import { HistoryPanel } from './HistoryPanel';
import seed from '@/data/profile.json';

type Section = SectionId|'layout'|'settings';
type Collection = 'education'|'skills'|'certificates'|'experience'|'implementations'|'projects';
type Row = Record<string,any>;
type Publication = { language?:Locale; document_version:number; published_at:string } | null;
const sections: {id:Section;label:string;number:string}[] = [
 {id:'personal',label:'Thông tin cá nhân',number:'01'}, {id:'objective',label:'Mục tiêu nghề nghiệp',number:'02'},
 {id:'education',label:'Học vấn',number:'03'}, {id:'skills',label:'Kỹ năng',number:'04'},
 {id:'certificates',label:'Chứng chỉ',number:'05'}, {id:'experience',label:'Kinh nghiệm làm việc',number:'06'},
 {id:'delivery',label:'Kinh nghiệm triển khai',number:'07'}, {id:'projects',label:'Ứng dụng đã xây dựng',number:'08'},
];
const definitions: Record<Collection,{ label:string; fields:{key:string;label:string;multiline?:boolean;list?:boolean}[] }> = {
 education:{label:'Học vấn',fields:[{key:'school',label:'Trường / Cơ sở đào tạo'},{key:'degree',label:'Chuyên ngành / Bằng cấp'},{key:'period',label:'Thời gian'},{key:'detail',label:'Thông tin bổ sung',multiline:true}]},
 skills:{label:'Kỹ năng',fields:[{key:'name',label:'Tên kỹ năng'},{key:'description',label:'Mô tả năng lực',multiline:true}]},
 certificates:{label:'Chứng chỉ',fields:[{key:'name',label:'Tên chứng chỉ'},{key:'issuer',label:'Đơn vị cấp'},{key:'year',label:'Năm cấp'},{key:'url',label:'Đường dẫn xác minh (tùy chọn)'}]},
 experience:{label:'Kinh nghiệm',fields:[{key:'role',label:'Vị trí công việc'},{key:'company',label:'Công ty / Tổ chức'},{key:'period',label:'Thời gian'},{key:'summary',label:'Vai trò và phạm vi',multiline:true},{key:'highlights',label:'Trách nhiệm / Kết quả — mỗi dòng một ý',multiline:true,list:true}]},
 implementations:{label:'Đơn vị triển khai',fields:[{key:'code',label:'Mã đơn vị (ví dụ: EPU)'},{key:'name',label:'Tên đơn vị đầy đủ'},{key:'period',label:'Thời gian triển khai (tùy chọn)'},{key:'description',label:'Vai trò / Phạm vi triển khai',multiline:true}]},
 projects:{label:'Sản phẩm',fields:[{key:'name',label:'Tên sản phẩm'},{key:'description',label:'Bài toán và giá trị sản phẩm',multiline:true},{key:'role',label:'Vai trò của bạn'},{key:'platform',label:'Nền tảng (Web, Windows, iOS...)'},{key:'year',label:'Năm thực hiện'},{key:'technologies',label:'Công nghệ — mỗi dòng một công nghệ',multiline:true,list:true},{key:'demoUrl',label:'Đường dẫn demo (tùy chọn)'},{key:'sourceUrl',label:'Đường dẫn mã nguồn (tùy chọn)'}]},
};
function dateLabel(value?:string) { return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa lưu'; }
function Field({label,value,onChange,multiline=false,fieldKey}: {label:string;value:string;onChange:(value:string)=>void;multiline?:boolean;fieldKey?:string}) {
 return <label className="editor-field"><span>{label}</span>{multiline ? <textarea data-field-key={fieldKey} value={value} onChange={e=>onChange(e.target.value)} rows={4} maxLength={6000}/> : <input data-field-key={fieldKey} data-field-label={label} value={value} onChange={e=>onChange(e.target.value)} maxLength={label==='Tiêu đề block'?100:label.startsWith('Mã đơn vị')?80:500}/>}</label>;
}

export function Editor({initialBranding}:{initialBranding?:Branding}={}) {
 const client = useMemo(()=>browserCloud(),[]);
 const [session,setSession] = useState<Session|null>(null);
 const [starting,setStarting] = useState(!!client);
 const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
 const [showPassword,setShowPassword] = useState(false); const [recovery,setRecovery] = useState(false);
 const [busy,setBusy] = useState(''); const [error,setError] = useState(''); const [notice,setNotice] = useState('');
 const [editingLanguage,setEditingLanguage]=useState<Locale>('vi');
 const [publishTarget,setPublishTarget]=useState<'vi'|'en'|'all'>('vi');
 const [publications,setPublications]=useState<NonNullable<Publication>[]>([]);
 const [preferences,setPreferences]=useState<{content:Preferences;version:number}>({content:{autoSave:true,branding:initialBranding||{name:'maison.',logo:'',favicon:''}},version:1});
 const [settingsDirty,setSettingsDirty]=useState(false);
 const [inlineEdit,setInlineEdit]=useState<InlineEdit|null>(null);const inlineRef=useRef<InlineEdit|null>(null);
 const [cropFile,setCropFile]=useState<File|null>(null);
 const appUpload=useRef<{id:string;kind:'cover'|'gallery';language:Locale}|null>(null);
 const [publicationIssues,setPublicationIssues]=useState<PublicationIssue[]>([]);
 const uploadTarget=useRef('portrait');const motion=useReorderMotion();
 const [loaded,setLoaded] = useState(false);
 const userId=session?.user.id;
 const [publication,setPublication] = useState<Publication>(null);
 const [selected,setSelected] = useState<Section>('personal');
 const [canvasSelection,setCanvasSelection]=useState<SectionId|null>(null);
 const [focusRequest,setFocusRequest]=useState(0);const pendingField=useRef<string|null>(null);
 const panelFields=useRef<HTMLFieldSetElement>(null);const pendingRow=useRef<{group:Collection;index:number;field?:string}|null>(null);
 const [timeDirection,setTimeDirection]=useState<'asc'|'desc'>('desc'),[timeEdge,setTimeEdge]=useState<'start'|'end'>('start');
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
  let response:Response;try{response = await fetch(path,{...init,cache:'no-store',headers:{...init.headers,Authorization:`Bearer ${current.access_token}`}});}catch(e){if((e as Error).name==='AbortError')throw e;throw new Error('Mất kết nối khi gửi yêu cầu. Kiểm tra Internet rồi thử lại; bản đang soạn vẫn được giữ trên thiết bị.');}
  let data:any;try{data=await response.json();}catch{throw new Error(`Máy chủ trả về nội dung không đọc được (HTTP ${response.status}). Hãy thử lại; nếu còn lỗi, kiểm tra lần deploy gần nhất.`);}
  if (!response.ok) {throw Object.assign(new Error(data.error || `Thao tác chưa thành công (HTTP ${response.status}). Hãy thử lại.`),{status:response.status,issues:data.issues});}
  return data;
 },[client]);
 const draftCtl=useDraft({call,identity:userId?`${process.env.NEXT_PUBLIC_SUPABASE_URL||'local'}:${userId}`:'',active:loaded&&!!session&&!recovery&&!busy&&!historyOpen&&preferences.content.autoSave});
 const {draft:bundle,version,updatedAt,dirty,conflict,reset,clear}=draftCtl;
 const draft=useMemo(()=>localizedProfile(bundle,editingLanguage),[bundle,editingLanguage]);
 const privateMedia=usePrivateMedia(draft?[...mediaPaths(draft),preferences.content.branding.logo,preferences.content.branding.favicon]:[],client);
 useLayoutEffect(()=>{motion.play();},[bundle]);
 useEffect(()=>{const icon=document.createElement('link');icon.rel='icon';icon.href=privateMedia[preferences.content.branding.favicon]||preferences.content.branding.favicon||'/api/branding/icon';document.head.appendChild(icon);return()=>icon.remove();},[privateMedia,preferences.content.branding.favicon]);
 const setDraft=(updater:Profile|((current:Profile)=>Profile),key='')=>draftCtl.change(current=>updateLocalized(current,editingLanguage,updater),key);
 useEffect(()=>{const leave=(e:BeforeUnloadEvent)=>{if(settingsDirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave);},[settingsDirty]);
 useEffect(()=>{setNotice(appliedNotice.current||'');appliedNotice.current=null;setError('');setPublicationIssues([]);},[draft]);
 const layout=normalizeLayout(draft?.layout);
 const navSections=sectionOrder(layout).map((id,index)=>({...sections.find(s=>s.id===id)!,number:String(index+1).padStart(2,'0'),label:layout.titles[id]||sections.find(s=>s.id===id)!.label}));
 const blockName=(id:SectionId)=>layout.titles[id]||(id==='personal'?'Thông tin liên hệ':sections.find(s=>s.id===id)?.label)||id;
 function moveBlock(from:SectionId,to:SectionId){if(!draft||preview||busy||draftCtl.recovery)return;motion.capture('blocks');setInlineFocus(false);setDraft(p=>({...p,layout:moveSection(p.layout,from,to)}));}
 function swapBlock(from:SectionId,to:SectionId){if(!draft||preview||busy)return;motion.capture('blocks');setDraft(p=>{const l=normalizeLayout(p.layout);if(l.mode==='grid')l.grid.order=l.grid.order.map(id=>id===from?to:id===to?from:id);else for(const zone of maisonZones)l.order[zone]=l.order[zone].map(id=>id===from?to:id===to?from:id);return {...p,layout:l};});}
 const canvasDrag=useCanvasDrag(swapBlock);
 useLayoutEffect(()=>{
  const request=pendingRow.current,pane=panelFields.current;if(pendingField.current&&pane){pane.querySelector<HTMLInputElement>(`[data-field-key="${pendingField.current}"]`)?.focus();pendingField.current=null;}if(!request||!pane||selected!==(request.group==='implementations'?'delivery':request.group))return;
  const row=pane.querySelector<HTMLElement>(`[data-editor-row="${request.group}:${request.index}"]`);if(!row)return;pendingRow.current=null;
  const top=pane.scrollTop+row.getBoundingClientRect().top-pane.getBoundingClientRect().top-16;
  pane.scrollTop=Math.max(0,top);(request.field?row.querySelector<HTMLElement>(`[data-field-key="${request.field}"]`):null)?.querySelector<HTMLInputElement>('input,textarea')?.focus({preventScroll:true});
  (request.field?row.querySelector<HTMLInputElement>(`input[data-field-key="${request.field}"],textarea[data-field-key="${request.field}"]`):row.querySelector<HTMLInputElement>('input,textarea'))?.focus({preventScroll:true});
 },[draft,selected,panel,focusRequest]);
 const currentPublication=publications.find(p=>p.language===editingLanguage);
 const publicHref=editingLanguage==='en'?'/en':'/';
 const statusText=draftCtl.saving?'Đang lưu nháp…':conflict?'Cần kiểm tra xung đột':draftCtl.phase==='offline'?'Mất kết nối · giữ trên thiết bị':draftCtl.phase==='error'?'Lưu chưa thành công':dirty?(preferences.content.autoSave?'Đang chờ tự lưu…':'Chưa lưu · Auto Save đã tắt'):version?`Đã lưu nháp · v${version}`:'Chưa lưu online';
 const load = useCallback(async(discardLocal=false)=>{
  const sequence=++loadSequence.current;
  setBusy('load');setError('');setNotice('');
  try {
   const [data,settings]=await Promise.all([call('/api/admin/cv'),call('/api/admin/settings')]);if(sequence!==loadSequence.current)return;if(settings?.preferences){setPreferences({...settings.preferences,version:Number(settings.preferences.version)});setSettingsDirty(false);}if(sequence!==loadSequence.current)return;
   if (data.document) {
    const parsed=validateCv(data.document.content);
    if(parsed.errors.length || !parsed.data)throw new Error('Dữ liệu CV đã lưu không hợp lệ. Chưa thay đổi bản đang soạn.');
    reset(parsed.data,Number(data.document.version),data.document.updated_at,true,!discardLocal);
   } else {
    const parsed=validateCv(structuredClone(seed));if(parsed.data)reset(parsed.data,0,'',false,!discardLocal);
   }
   setInlineFocus(false);setPublication(data.publication);setPublications(data.publications|| (data.publication?[{...data.publication,language:'vi'}]:[]));setLoaded(true);
  } catch(e) {if(sequence===loadSequence.current)setError(e instanceof Error?e.message:'Chưa tải được CV.');} finally {if(sequence===loadSequence.current)setBusy('');}
 },[call,reset]);
 useEffect(()=>{setLoaded(false);setHistoryOpen(false);setCanvasSelection(null);clear(false);if(userId)void load();return()=>{loadSequence.current++;};},[userId,load,clear]);
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
 const html = useMemo(()=>{
  if(!draft)return '';
  if(inlineFocus)return frozenHtml.current;
  const output=renderCv({...draft,branding:preferences.content.branding,publication:'draft',cvFile:''},{editing:!preview&&!busy&&!draftCtl.recovery,activeSection:canvasSelection}).replace('<main id="main">','<div class="cv-preview-content">').replace('</main>','</div>');
  let html=output;for(const [path,url] of Object.entries(privateMedia))html=html.replaceAll(`src="${path}"`,`src="${url}"`).replaceAll(`href="${path}"`,`href="${url}"`);return html;
 },[draft,preview,busy,privateMedia,preferences.content.branding,inlineFocus,draftCtl.recovery,canvasSelection]);
 function update(key:string,value:string) {
  setDraft(current=>({...current,[key]:value.normalize('NFC')}),'field:'+key);setNotice('');
 }
 function choose(id:Section) {setSelected(id);setCanvasSelection(id==='layout'||id==='settings'?null:id);setPanel(true);}
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
  commitInline(false);setError('');setNotice('');
  if(await draftCtl.save())setNotice('Đã lưu nháp online. Khách vẫn thấy bản đã xuất bản.');
 }
 function preparePublish() {
  if(!draft)return;
  if(dirty || draftCtl.saving || conflict || version===0){setError('Hãy lưu bản nháp mới nhất trước khi xuất bản.');return;}
  setPublishTarget(editingLanguage);setError('');setPublicationIssues([]);setConfirmPublish(true);
 }
 async function publish() {
  if(!bundle)return;const reports=(publishTarget==='all'?['vi','en']:[publishTarget]).map(language=>validatePublication(bundle,language as Locale));
  if(reports.some(report=>report.errors.length)){setPublicationIssues(reports.flatMap(report=>report.issues));setError(reports.flatMap(report=>report.errors).join('\n'));setConfirmPublish(false);return;}
  setPublicationIssues([]);setBusy('publish');setError('');
  try {const data=await call('/api/admin/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedVersion:version,languages:publishTarget==='all'?['vi','en']:[publishTarget]})});setPublication(data.publication);setPublications(current=>{const updated=data.publication?.publications||[{...data.publication,language:publishTarget==='all'?'vi':publishTarget}];return [...current.filter(p=>!updated.some((next:any)=>next.language===p.language)),...updated];});setNotice('Đã xuất bản. Thiết bị khác mở hoặc tải lại CV sẽ thấy bản mới.');setConfirmPublish(false);}
  catch(e){if((e as {status?:number}).status===409)draftCtl.pauseConflict();setError(e instanceof Error?e.message:'Chưa xuất bản được.');setPublicationIssues((e as {issues?:PublicationIssue[]}).issues||[]);setConfirmPublish(false);}finally{setBusy('');}
 }
 async function upload(file?:File) {
  if(!file)return;setBusy('upload');setError('');setNotice('');
  try{
   if(file.size>3*1024*1024)throw new Error('Chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 3 MB.');
   const form=new FormData();form.append('file',file);const data=await call('/api/admin/upload',{method:'POST',body:form});
   if(uploadTarget.current==='portrait')update('portrait',data.portrait);
   else if(uploadTarget.current.startsWith('unit:')){const index=Number(uploadTarget.current.split(':')[1]);setDraft(p=>({...p,implementations:p.implementations.map((row,i)=>i===index?{...row,logo:data.portrait}:row)}));}
   else{const key=uploadTarget.current==='brand'?'logo':'favicon';setPreferences(p=>({...p,content:{...p.content,branding:{...p.content.branding,[key]:data.portrait}}}));setSettingsDirty(true);}
   setNotice('Đã tải ảnh/logo. Lưu nháp hoặc Lưu cài đặt để giữ thay đổi.');
  }catch(e){setError(e instanceof Error?e.message:'Chưa tải được ảnh.');}finally{setBusy('');if(fileInput.current)fileInput.current.value='';}
 }
 function requestAppUpload(id:string,kind:'cover'|'gallery'){
  appUpload.current={id,kind,language:editingLanguage};uploadTarget.current='app';fileInput.current?.click();
 }
 function selectFile(file?:File){
  if(!file)return;
  if(uploadTarget.current!=='app'){void upload(file);return;}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024){setError('Ảnh ứng dụng: chọn JPG, PNG hoặc WebP tối đa 3 MB.');if(fileInput.current)fileInput.current.value='';return;}
  setCropFile(file);if(fileInput.current)fileInput.current.value='';
 }
 async function uploadApp(file:File){
  const target=appUpload.current;if(!target)throw new Error('Chưa chọn ứng dụng nhận ảnh. Hãy đóng cửa sổ và chọn ảnh lại.');
  const form=new FormData();form.append('file',file);
  const data=await call('/api/admin/upload',{method:'POST',body:form});
  draftCtl.change(current=>updateLocalized(current,target.language,p=>({...p,projects:p.projects.map(row=>row.id!==target.id?row:target.kind==='cover'?{...row,cover:data.portrait}:{...row,images:[...(row.images||[]),{id:crypto.randomUUID(),src:data.portrait,alt:''}].slice(0,8)})})));
  setCropFile(null);setNotice('Đã tải ảnh ứng dụng. Điền mô tả ảnh, lưu nháp và xuất bản ngôn ngữ cần cập nhật.');
 }
 function openIssue(issue:PublicationIssue){
  commitInline(false);setInlineFocus(false);setEditingLanguage(issue.language);
  const profile=localizedProfile(bundle,issue.language);if(issue.group&&profile){const rows=(profile as any)[issue.group]||[],index=issue.rowId?rows.findIndex((row:any)=>row.id===issue.rowId):issue.rowIndex;if(index>=0)pendingRow.current={group:issue.group as Collection,index,field:issue.field};}
  if(!issue.group)pendingField.current=issue.field;setFocusRequest(n=>n+1);choose(issue.section);setNotice('Đang mở '+issue.message);
 }
 async function signOut() {
  if((dirty||settingsDirty) && !window.confirm('Bản đang soạn chưa được lưu. Đăng xuất và bỏ thay đổi này?'))return;
  await client?.auth.signOut({scope:'local'});clear(true);setLoaded(false);setPassword('');setError('');setNotice('');setRecovery(false);
 }
 function reload() {if((!dirty&&!settingsDirty) || window.confirm('Tải bản mới nhất sẽ thay bản đang soạn chưa lưu. Tiếp tục?'))void load(true);}
 function keepConflictCopy() {
  if(!bundle)return;let text=JSON.stringify(bundle,null,2);if(new TextEncoder().encode(text).length>524288)text=JSON.stringify(bundle);const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Maison-CV-ban-dang-soan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Đã tải bản đang soạn để đối chiếu. Bản này chưa được lưu online. Sau khi tải lại bản online mới nhất, mở Lịch sử → Nhập JSON để đối chiếu và nhập lại khi cần.');
 }
 function collectionFor(id:Section):Collection|null{return ['education','skills','certificates','experience','delivery','projects'].includes(id)?(id==='delivery'?'implementations':id as Collection):null;}
 function addRow(group:Collection){
  if(!draft||busy||draftCtl.recovery)return;const count=draft[group].length;if(count>=50){setError('Mỗi danh sách tối đa 50 mục.');return;}
  const id=group==='implementations'?'delivery':group;choose(id);setInlineFocus(false);pendingRow.current={group,index:count};
  const row={id:crypto.randomUUID(),...Object.fromEntries(definitions[group].fields.map(f=>[f.key,f.list?[]:'']))};setDraft(p=>({...p,[group]:[...p[group],row]}));
 }
 function moveRow(group:Collection,from:number,to:number){motion.capture('rows');setInlineFocus(false);setDraft(p=>({...p,[group]:moveItem(p[group] as Row[],from,to)}));}
 function previewClick(event:MouseEvent<HTMLDivElement>){
  if(preview||busy||draftCtl.recovery)return;const target=event.target as HTMLElement,action=target.closest<HTMLButtonElement>('[data-cv-action]');
  if(action){event.preventDefault();event.stopPropagation();if(action.disabled)return;const id=action.dataset.section as SectionId;const group=collectionFor(id),index=Number(action.dataset.index);
   if(action.dataset.cvAction==='drag-block')return;
   if(action.dataset.cvAction==='add-row'){if(group)addRow(group);else{choose(id);panelFields.current?.querySelector<HTMLInputElement>('textarea,input[data-field-label="Họ và tên"]')?.focus({preventScroll:true});}return;}
   if(action.dataset.cvAction?.startsWith('row-')&&group){moveRow(group,index,index+(action.dataset.cvAction==='row-up'?-1:1));return;}
   const order=sectionOrder(layout).filter(key=>!layout.hidden.includes(key)),position=order.indexOf(id),to=order[position+(action.dataset.cvAction==='block-up'?-1:1)];if(to)moveBlock(id,to);return;
  }
  if(target.closest('a'))event.preventDefault();const section=target.closest('[data-cv-section]')?.getAttribute('data-cv-section') as SectionId|undefined;
  if(section)choose(section);else setCanvasSelection(null);
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
 function layoutEditor(){
  const labels:Record<string,string>={intro:'Khối đầu CV',aside:'Cột trái',career:'Cột phải',tail:'Ngoài khung hồ sơ'};
  const hide=(id:SectionId,on:boolean)=>setDraft(p=>{const l=normalizeLayout(p.layout);return {...p,layout:{...l,hidden:on?l.hidden.filter(x=>x!==id):[...l.hidden,id]}};});
  const toggle=(mode:'maison'|'grid')=>setDraft(p=>({...p,layout:{...normalizeLayout(p.layout),mode}}));
  const row=(id:SectionId,index:number,order:SectionId[],group:string)=><div className="layout-row layout-studio-row" data-sortable-group={group} data-sortable-index={index} key={id}><SortHandle group={group} index={index} count={order.length} label={`block ${blockName(id)}`} onMove={(from,to)=>moveBlock(order[from],order[to])}/><label><input type="checkbox" checked={!layout.hidden.includes(id)} onChange={e=>hide(id,e.target.checked)}/><span>{blockName(id)}</span></label>{layout.mode==='grid'&&<label className="span-field"><span>Độ rộng</span><select aria-label={`Độ rộng ${blockName(id)}`} value={layout.grid.spans[id]} onChange={e=>setDraft(p=>{const l=normalizeLayout(p.layout);return {...p,layout:{...l,grid:{...l.grid,spans:{...l.grid.spans,[id]:Number(e.target.value)}}}};})}>{Array.from({length:12},(_,n)=><option value={n+1} key={n}>{n+1}/12</option>)}</select></label>}</div>;
  return <><div className="layout-mode-options" role="group" aria-label="Kiểu bố cục"><button type="button" aria-pressed={layout.mode==='maison'} onClick={()=>toggle('maison')}>Maison nguyên bản<span>Khung đầu & hai cột</span></button><button type="button" aria-pressed={layout.mode==='grid'} onClick={()=>toggle('grid')}>Lưới linh hoạt<span>Tùy chỉnh độ rộng 12 phần</span></button></div><p className="panel-description">{layout.mode==='grid'?'Thứ tự bên dưới là thứ tự từ trái sang phải, rồi xuống hàng trên CV. Hai block 6/12 chung một hàng; 12/12 chiếm toàn bộ hàng. Mobile xếp thành một cột.':'Giữ phong cách Maison. Kéo block trực tiếp trên CV để đổi vị trí, kể cả giữa các vùng. Hai chế độ giữ cấu hình riêng khi chuyển qua lại.'}</p>{layout.mode==='grid'?<div className="layout-zone"><h3>Thứ tự & độ rộng</h3>{layout.grid.order.map((id,index)=>row(id,index,layout.grid.order,'grid-blocks'))}</div>:maisonZones.map(zone=><div className="layout-zone" key={zone}><h3>{labels[zone]}</h3>{layout.order[zone].map((id,index)=>row(id,index,layout.order[zone],`layout-${zone}`))}</div>)}<p className="panel-description">Bỏ chọn để ẩn block. Nội dung nháp vẫn giữ nguyên. Thông tin đầu trang và nút Mở Portfolio luôn được giữ.</p></>;
 }
 function collectionEditor(group:Collection){
  if(!draft)return null;const definition=definitions[group],rows=draft[group] as unknown as Row[],timeField=['education','experience','implementations'].includes(group)?'period':['certificates','projects'].includes(group)?'year':null;
  function replace(next:Row[],key=''){if(!key&&next.length===rows.length)motion.capture('rows');setDraft(p=>({...p,[group]:next}),key);}
  return <>{editingLanguage==='en'&&group!=='projects'&&<div className="app-showcase-help"><button type="button" onClick={()=>{draftCtl.change(current=>completeEnglishSection(current,group));setNotice('Đã bổ sung mục còn thiếu từ VI. Hãy hoàn thiện bản dịch trong các mục mới.');}}>Bổ sung mục từ VI</button></div>}{group==='projects'&&<div className="app-showcase-help"><p>Thêm ảnh màn hình thật để giới thiệu ứng dụng. Có thể đánh dấu nổi bật hoặc ẩn từng app mà vẫn giữ nội dung trong nháp.</p>{editingLanguage==='en'&&<button type="button" onClick={()=>{draftCtl.change(current=>completeEnglishApps(current));setNotice('Đã bổ sung app còn thiếu và đồng bộ ảnh/liên kết từ VI. Nội dung tiếng Anh hiện có được giữ.');}}>Bổ sung app từ VI</button>}</div>}<p className="panel-description">Chỉnh sửa bên dưới hoặc chọn block trên CV để thêm và sắp xếp trực tiếp.</p>{timeField?<div className="chronology-tools"><label>Thứ tự thời gian<select aria-label="Thứ tự thời gian" value={timeDirection} onChange={e=>setTimeDirection(e.target.value as 'asc'|'desc')}><option value="asc">Từ nhỏ đến lớn · Cũ → Mới</option><option value="desc">Từ lớn đến nhỏ · Mới → Cũ</option></select></label>{timeField==='period'&&<label>Căn cứ<select aria-label="Mốc thời gian sắp xếp" value={timeEdge} onChange={e=>setTimeEdge(e.target.value as 'start'|'end')}><option value="start">Thời gian bắt đầu</option><option value="end">Thời gian kết thúc</option></select></label>}<button type="button" disabled={rows.length<2} onClick={()=>replace(sortByTime(rows,timeField,timeDirection,timeField==='period'?timeEdge:'start'))}>Tự động sắp xếp</button><small>Mục chưa có thời gian hợp lệ được giữ cuối danh sách.</small></div>:<p className="panel-description">Danh sách này không có trường thời gian; dùng kéo thả hoặc nút lên/xuống.</p>}{rows.map((row,index)=><article className="editor-item" data-motion-key={`panel:${group}:${row.id||index}`} data-editor-row={`${group}:${index}`} data-sortable-group={group} data-sortable-index={index} key={String(row.id||`${group}-${index}`)}><div className="editor-item-heading"><SortHandle group={group} index={index} count={rows.length} label={`${definition.label} ${index+1}`} onMove={(from,to)=>replace(moveItem(rows,from,to))}/><span>{definition.label} {String(index+1).padStart(2,'0')}</span><button type="button" className="text-danger" onClick={()=>{if(window.confirm('Xóa mục này khỏi bản nháp?'))replace(rows.filter((_,i)=>i!==index));}}>Xóa</button></div>{group==='implementations'&&<div className="unit-logo-editor">{row.logo&&<img src={privateMedia[String(row.logo)]||String(row.logo)} alt="Logo đơn vị" width="44" height="44"/>}<button type="button" onClick={()=>{uploadTarget.current='unit:'+index;fileInput.current?.click();}}>＋ Logo đơn vị</button>{row.logo&&<button type="button" onClick={()=>replace(rows.map((item,i)=>i===index?{...item,logo:''}:item))}>Bỏ logo</button>}</div>}{group==='projects'&&<AppShowcaseMedia row={row as Project} index={index} assets={privateMedia} onChange={patch=>replace(rows.map((item,i)=>i===index?{...item,...patch}:item),'project:'+String(row.id))} onUpload={requestAppUpload}/>} {definition.fields.map(field=><Field key={field.key} fieldKey={field.key} label={field.label} multiline={field.multiline} value={Array.isArray(row[field.key])?(row[field.key] as string[]).join('\n'):String(row[field.key]||'')} onChange={value=>replace(rows.map((item,i)=>i===index?{...item,[field.key]:field.list?value.split('\n'):value}:item),`${group}:${index}:${field.key}`)}/>)}</article>)}<button type="button" className="add-item" disabled={rows.length>=50} onClick={()=>addRow(group)}>＋ Thêm {definition.label.toLowerCase()}</button></>;
 }
 function switchLanguage(language:Locale){commitInline(false);setInlineFocus(false);setCanvasSelection(null);if(language==='en'&&bundle&&!bundle.translations?.en)draftCtl.change(current=>({...current,translations:{en:createEnglishProfile(localizedProfile(current,'vi')!)}}));setEditingLanguage(language);setPanel(false);}
 function setting(updater:(p:Preferences)=>Preferences){setPreferences(p=>({...p,content:updater(p.content)}));setSettingsDirty(true);}
 async function saveSettings(){setBusy('settings');setError('');try{const data=await call('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:preferences.content,expectedVersion:preferences.version})});setPreferences({...data.preferences,version:Number(data.preferences.version)});setSettingsDirty(false);setNotice('Đã lưu cài đặt. Logo áp dụng trên toàn website.');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 function settingsEditor(){return <><label className="setting-toggle"><input type="checkbox" checked={preferences.content.autoSave} onChange={e=>setting(p=>({...p,autoSave:e.target.checked}))}/> Auto Save · Tự lưu nháp</label><p className="panel-description">Bỏ chọn để chỉ lưu bằng nút Lưu. Lưu cài đặt để giữ lựa chọn cho các thiết bị.</p><Field label="Tên thương hiệu" value={preferences.content.branding.name} onChange={name=>setting(p=>({...p,branding:{...p.branding,name:name.slice(0,80)}}))}/>{[['brand','Logo thương hiệu (thay chữ maison)'],['favicon','Biểu tượng tab trình duyệt']].map(([target,label])=><div className="branding-control" key={target}><strong>{label}</strong>{preferences.content.branding[target==='brand'?'logo':'favicon']&&<img src={privateMedia[preferences.content.branding[target==='brand'?'logo':'favicon']]||preferences.content.branding[target==='brand'?'logo':'favicon']} alt={label}/>}<button type="button" onClick={()=>{uploadTarget.current=target;fileInput.current?.click();}}>Thay ảnh</button><button type="button" onClick={()=>setting(p=>({...p,branding:{...p.branding,[target==='brand'?'logo':'favicon']:''}}))}>Dùng mặc định</button></div>)}<p className="panel-description">JPG, PNG, WebP · tối đa 3 MB. Logo/biểu tượng được công khai sau khi Lưu cài đặt; nội dung CV vẫn xuất bản riêng theo ngôn ngữ.</p><button className="editor-publish" type="button" disabled={!settingsDirty||!!busy} onClick={()=>void saveSettings()}>Lưu cài đặt</button></>;}
 function inlineValue(path:string):string|null{if(!draft)return null;const tokens=path.split('.');if(tokens.some(t=>['__proto__','prototype','constructor'].includes(t)))return null;let value:any=draft;for(const key of tokens)value=value?.[key];if(value===undefined&&tokens[0]==='layout'&&tokens[1]==='titles')return sectionTitle(layout,tokens[2] as SectionId,draft.language);return typeof value==='string'?value:Array.isArray(value)?value.join('\n'):null;}
 function openInline(event:MouseEvent<HTMLDivElement>){if(preview||busy)return;const target=(event.target as HTMLElement).closest<HTMLElement>('[data-inline-path]');if(!target)return;event.preventDefault();event.stopPropagation();commitInline(false);const path=target.dataset.inlinePath!,value=inlineValue(path);if(value===null)return;const r=target.getBoundingClientRect();choose(target.dataset.inlineSection as SectionId);const edit={path,value,left:r.left,top:r.top,width:r.width,label:'Sửa nội dung · '+(target.dataset.inlineSection||'')};inlineRef.current=edit;setInlineEdit(edit);}
 function commitInline(cloud:boolean){const edit=inlineRef.current;if(!edit)return;inlineRef.current=null;setInlineEdit(null);setDraft(p=>{const next=structuredClone(p),tokens=edit.path.split('.');let target:any=next;for(let i=0;i<tokens.length-1;i++){const key=tokens[i];if(!target[key])target[key]={};target=target[key];}const key=tokens.at(-1)!;target[key]=Array.isArray(target[key])?edit.value.split('\n'):edit.value.normalize('NFC');return next;},'inline:'+edit.path);if(cloud)void draftCtl.save();}
 function acceptRecovery(document:{content:Profile;version:number;updated_at:string},message:string){
  const parsed=validateCv(document.content);if(parsed.errors.length||!parsed.data)throw new Error('Dữ liệu trả về chưa hợp lệ. Hãy tải lại bản nháp online để kiểm tra.');
  appliedNotice.current=message;reset(parsed.data,Number(document.version),document.updated_at,true,false);if(editingLanguage==='en'&&!parsed.data.translations?.en)setEditingLanguage('vi');setInlineFocus(false);setHistoryOpen(false);
 }
 const displayError=error||draftCtl.saveError;
 useEffect(()=>{if(displayError)document.querySelector<HTMLElement>('.feedback-area')?.scrollIntoView?.({block:'nearest',behavior:'smooth'});},[displayError]);
 const feedback=<>{draftCtl.recovery&&<div className="editor-message recovery" role="status"><strong>Có bản nháp chưa lưu trên thiết bị này</strong><p>Soạn lúc {dateLabel(draftCtl.recovery.updatedAt)}. Khôi phục để xem lại hoặc dùng bản online hiện tại.</p><div className="message-actions"><button onClick={draftCtl.restoreRecovery}>Khôi phục bản trên thiết bị</button><button onClick={draftCtl.discardRecovery}>Dùng bản online</button></div></div>}{draftCtl.cacheWarning&&<div className="editor-message error" role="status">{draftCtl.cacheWarning}</div>}{displayError&&<div className="editor-message error" role="alert"><strong>Chưa hoàn tất thao tác</strong><ul className="editor-error-list">{displayError.split('\n').filter(line=>line&&!publicationIssues.some(issue=>issue.message===line)).map((line,index)=><li key={index}>{line}</li>)}</ul>{publicationIssues.length>0&&<div className="validation-locations"><p>Bấm để mở đúng phần cần bổ sung:</p>{publicationIssues.map((issue,index)=><button type="button" key={index} onClick={()=>openIssue(issue)}>{issue.message} <b>→ Sửa</b></button>)}</div>}{conflict&&<div className="message-actions"><button onClick={keepConflictCopy}>Giữ bản đang soạn</button><button onClick={reload}>Tải bản mới nhất</button></div>}</div>}{notice&&<div className="editor-message success" role="status">{notice}</div>}</>;

 if(starting)return <main id="main" className="auth-page"><div className="loading-ring"/><p>Đang mở không gian của bạn…</p></main>;
 if(!client)return <main id="main" className="auth-page"><div className="auth-card setup-card"><a className="wordmark" href="/"><BrandMark branding={preferences.content.branding} source={privateMedia[preferences.content.branding.logo]}/></a><p className="micro">BẮT ĐẦU / CLOUD SETUP</p><h1>Kết nối để<br/><em>lưu câu chuyện của bạn.</em></h1><p>Source đã sẵn sàng. Hoàn tất thiết lập Supabase một lần để chỉnh sửa và lưu CV online.</p><ol><li>Chạy migration trong thư mục <code>supabase/migrations</code>.</li><li>Tạo tài khoản và gán User UID bằng <code>supabase/setup-owner.sql</code>.</li><li>Thêm hai biến trong <code>.env.example</code> vào Vercel rồi redeploy.</li></ol><p className="auth-note">Hướng dẫn từng bước nằm trong README đi kèm source. Trang công khai chưa hiển thị nội dung nháp.</p><a className="button" href="/">← Quay lại website</a></div></main>;
 if(!session || recovery)return <main id="main" className="auth-page"><div className="auth-story"><a className="wordmark" href="/"><BrandMark branding={preferences.content.branding} source={privateMedia[preferences.content.branding.logo]}/><span>THE EDITOR’S ROOM</span></a><p className="micro">YOUR STORY. YOUR NEXT CHAPTER.</p><h1>Một hồ sơ.<br/><em>Dấu ấn của bạn.</em></h1><p>Một không gian riêng để chăm chút trải nghiệm, năng lực và những điều bạn tự tay xây dựng.</p><span className="auth-version">MAISON CV / v1.7.0</span></div><form className="auth-card" onSubmit={authenticate}><p className="micro">PRIVATE ACCESS</p><h2>{recovery&&session?'Đặt mật khẩu mới.':'Chào mừng trở lại.'}</h2><p>{recovery&&session?'Cập nhật mật khẩu để tiếp tục quản lý hồ sơ.':'Đăng nhập tài khoản chủ sở hữu để chỉnh sửa CV.'}</p>{feedback}{!(recovery&&session)&&<label className="editor-field"><span>Email tài khoản</span><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label>}<label className="editor-field"><span>{recovery&&session?'Mật khẩu mới':'Mật khẩu'}</span><div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={recovery?'new-password':'current-password'} minLength={recovery?10:undefined} required/><button type="button" aria-label={showPassword?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Ẩn':'Hiện'}</button></div></label><button type="submit" className="button primary auth-submit" disabled={!!busy}>{busy?'Đang xử lý…':recovery&&session?'Lưu mật khẩu':'Đăng nhập ↗'}</button>{!recovery&&<button className="forgot-link" type="button" onClick={forgotPassword} disabled={!!busy}>Quên mật khẩu?</button>}{recovery&&<button className="forgot-link" type="button" onClick={()=>setRecovery(false)}>Quay lại</button>}<div className="auth-note">Chỉ chủ sở hữu đã được cấp quyền có thể chỉnh sửa. Người xem CV không cần đăng nhập.</div><a className="back-public" href="/">← Xem website công khai</a></form></main>;
 if(!loaded || !draft)return <main id="main" className="editor-loading"><a className="wordmark" href="/"><BrandMark branding={preferences.content.branding} source={privateMedia[preferences.content.branding.logo]}/></a><h1>Không gian chỉnh sửa.</h1>{busy?<p>Đang tải dữ liệu online…</p>:<>{feedback}<button className="button primary" onClick={()=>void load()}>Thử tải lại</button></>}<button className="button" onClick={signOut}>Đăng xuất</button></main>;

 return <main id="main" onCompositionStart={()=>draftCtl.setComposing(true)} onCompositionEnd={()=>draftCtl.setComposing(false)} className={`editor-app ${preview?'preview-mode':''} ${device==='mobile'?'mobile-preview-mode':''}`}>
  <div className="editor-workspace" inert={historyOpen||!!cropFile}><header className="editor-topbar"><a className="wordmark" href="/admin"><BrandMark branding={preferences.content.branding} source={privateMedia[preferences.content.branding.logo]}/><span>CV STUDIO</span></a><div className="editor-status"><span className={`status-dot ${dirty?'unsaved':''}`}/><span>{statusText}</span></div><div className="editor-toolbar"><select aria-label="Ngôn ngữ đang chỉnh sửa" value={editingLanguage} disabled={!!busy} onChange={e=>switchLanguage(e.target.value as Locale)}><option value="vi">VI · Tiếng Việt</option><option value="en">EN · English</option></select><button className="editor-secondary" onClick={()=>choose('settings')} disabled={!!busy}>⚙ Cài đặt</button><button className="editor-secondary history-launch" onClick={()=>{setInlineFocus(false);setHistoryOpen(true);}} disabled={!!busy}>Lịch sử ↶</button><button className="editor-secondary undo-control" aria-label="Hoàn tác" disabled={!!busy||!draftCtl.canUndo} onClick={()=>{setInlineFocus(false);draftCtl.undo();}}>↶</button><button className="editor-secondary undo-control" aria-label="Làm lại" disabled={!!busy||!draftCtl.canRedo} onClick={()=>{setInlineFocus(false);draftCtl.redo();}}>↷</button><button className="editor-secondary" onClick={()=>{setPreview(!preview);setPanel(false);setCanvasSelection(null);}} disabled={!!busy}>{preview?'← Chỉnh sửa':'Xem trước'}</button><button className="editor-secondary" onClick={()=>void save()} disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||!dirty}>{draftCtl.saving?'Đang lưu…':'Lưu nháp'}</button><button className="editor-publish" onClick={preparePublish} disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||dirty||!version}>{busy==='publish'?'Đang xuất bản…':'Xuất bản ↗'}</button></div></header>
  <div className="editor-layout"><aside className="editor-navigation"><div className="workspace-caption"><span>YOUR WORKSPACE</span><h2>Hồ sơ của bạn.</h2></div><nav aria-label="Các phần CV"><button className={selected==='layout'?'selected':''} onClick={()=>choose('layout')}><span>✧</span>Bố cục CV<b>↗</b></button><button className={selected==='settings'?'selected':''} onClick={()=>choose('settings')}><span>⚙</span>Cài đặt<b>↗</b></button>{navSections.map(section=><button key={section.id} className={selected===section.id?'selected':''} onClick={()=>choose(section.id)}><span>{section.number}</span>{section.label}<b>↗</b></button>)}</nav><div className="workspace-note"><span className="micro">BẢN CÔNG KHAI</span><strong>{editingLanguage.toUpperCase()} · {currentPublication?'Đã xuất bản':'Chưa xuất bản'}</strong><p>{currentPublication?`Bản nháp v${currentPublication.document_version} · ${dateLabel(currentPublication.published_at)}`:'Lưu nháp, xem trước rồi xuất bản khi bạn đã sẵn sàng.'}</p><a href={publicHref} target="_blank" rel="noopener noreferrer">Mở website ↗</a>{currentPublication&&<a href={publicHref+"#sharing-title"} target="_blank" rel="noopener noreferrer">PDF & Chia sẻ CV ↗</a>}</div><div className="workspace-bottom"><p title={session.user.email}>{session.user.email}</p><button onClick={reload} disabled={!!busy}>Tải bản mới nhất</button><button onClick={signOut} disabled={!!busy}>Đăng xuất</button></div></aside>
   <section className="editor-canvas"><div className="canvas-caption"><div><p className="micro">{preview?'DRAFT PREVIEW':'LIVE EDITOR'}</p><h2>{preview?'Xem trước bản nháp.':'Chăm chút từng chi tiết.'}</h2><p>{preview?'Bản này chỉ hiển thị trong phiên quản lý. Khách chưa thấy các thay đổi.':'Double click vào nội dung hoặc tiêu đề để sửa trực tiếp. Chọn block để thêm và sắp xếp dữ liệu.'}</p></div><button className="editor-secondary print-draft" onClick={()=>window.print()} disabled={!!busy}>In bản nháp ↓</button></div><div className="preview-controls" aria-label="Kích thước xem trước"><button aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Desktop</button><button aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Mobile · 390px</button><span>{preferences.content.autoSave?'Tự lưu nháp · Sau khi ngừng nhập':'Auto Save đã tắt · Lưu bằng nút Lưu nháp'}</span></div><div className="feedback-area">{feedback}</div><div className="editor-preview" {...canvasDrag} onDoubleClick={openInline} onMouseDown={event=>{if((event.target as HTMLElement).closest('[data-cv-action]'))event.preventDefault();}} onKeyDown={event=>{if(event.key==='Escape'){setCanvasSelection(null);setInlineFocus(false);}}} onFocus={event=>{if((event.target as HTMLElement).closest('[data-cv-field]')){frozenHtml.current=html;setInlineFocus(true);}}} onClick={previewClick} onInput={event=>trackInlineField(event.target as HTMLElement)} onBlur={inlineBlur} onPaste={pastePlain} dangerouslySetInnerHTML={{__html:html}}/><p className="canvas-footnote">Lần lưu gần nhất: {dateLabel(updatedAt)} · {preferences.content.autoSave?'Tự lưu nháp online':'Lưu nháp thủ công'}; xuất bản vẫn cần xác nhận.</p></section>
   {!preview&&<><button className="mobile-editor-launch" onClick={()=>setPanel(true)}>✎ Chỉnh sửa nội dung</button>{panel&&<button className="panel-backdrop" aria-label="Đóng bảng chỉnh sửa" onClick={()=>setPanel(false)}/>}<aside className={`editor-panel ${panel?'open':''}`} aria-label="Bảng chỉnh sửa"><div className="panel-heading"><div><p className="micro">EDIT DETAILS</p><h2>{selected==='layout'?'Bố cục CV':selected==='settings'?'Cài đặt':blockName(selected as SectionId)}</h2></div><button className="panel-close" onClick={()=>setPanel(false)} aria-label="Đóng bảng chỉnh sửa">×</button></div><div className="mobile-section-select"><label>Phần đang sửa<select value={selected} onChange={e=>choose(e.target.value as Section)}><option value="layout">Bố cục CV</option><option value="settings">Cài đặt</option>{navSections.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div><fieldset ref={panelFields} disabled={!!busy||!!draftCtl.recovery} className="panel-fields">
    {!['layout','settings'].includes(selected)&&<Field label="Tiêu đề block" value={draft.layout?.titles?.[selected as SectionId]??sectionTitle(layout,selected as SectionId,draft.language)} onChange={value=>setDraft(p=>{const l=normalizeLayout(p.layout);return {...p,layout:{...l,titles:{...l.titles,[selected]:value}}};},'title:'+selected)}/>}
    {selected==='personal'&&<><div className="portrait-control">{privateMedia[draft.portrait]||draft.portrait?<img src={privateMedia[draft.portrait]||draft.portrait} alt="Ảnh chân dung đang chỉnh"/>:<div className="portrait-placeholder">m.</div>}<div><button type="button" className="editor-secondary" onClick={()=>{uploadTarget.current='portrait';fileInput.current?.click();}}>{busy==='upload'?'Đang tải…':'Thay ảnh'}</button><p>JPG, PNG, WebP · Tối đa 3 MB</p>{draft.portrait&&<button type="button" className="text-danger" onClick={()=>update('portrait','')}>Bỏ ảnh khỏi CV</button>}</div></div>{[['name','Họ và tên'],['role','Vị trí / Chức danh'],['summary','Giới thiệu ngắn'],['email','Email liên hệ'],['phone','Số điện thoại'],['website','Website cá nhân'],['address','Địa chỉ / Thành phố'],['portraitAlt','Mô tả ảnh'],['siteUrl','URL website CV (dùng cho chia sẻ, QR và sitemap)']].map(([key,label])=><Field key={key} fieldKey={key} label={label} value={String(draft[key as keyof Profile]||'')} multiline={key==='summary'} onChange={value=>update(key,value)}/>)}</>}
    {selected==='objective'&&<><p className="panel-description">Mục tiêu thể hiện hướng phát triển và giá trị bạn muốn đóng góp.</p><Field fieldKey="objective" label="Mục tiêu nghề nghiệp" value={draft.objective} multiline onChange={value=>update('objective',value)}/></>}
    {selected==='layout'&&layoutEditor()}{selected==='settings'&&settingsEditor()}
    {!['personal','objective','layout','settings'].includes(selected)&&collectionEditor(selected==='delivery'?'implementations':selected as Collection)}
   </fieldset><div className="panel-footer"><span>{statusText}</span><button className="editor-publish" disabled={!!busy||draftCtl.saving||!!draftCtl.recovery||conflict||!dirty} onClick={()=>void save()}>{draftCtl.saving?'Đang lưu…':'Lưu nháp'}</button></div></aside></>}
  </div><input type="file" ref={fileInput} accept="image/jpeg,image/png,image/webp" hidden onChange={e=>selectFile(e.target.files?.[0])}/>
  {confirmPublish&&<div className="publish-overlay"><div className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title"><p className="micro">READY FOR THE NEXT CHAPTER?</p><h2 id="publish-title">Chia sẻ hồ sơ<br/><em>của bạn.</em></h2><label className="editor-field"><span>Ngôn ngữ xuất bản</span><select aria-label="Ngôn ngữ xuất bản" value={publishTarget} onChange={e=>setPublishTarget(e.target.value as 'vi'|'en'|'all')}><option value="vi">Tiếng Việt</option><option value="en" disabled={!bundle?.translations?.en}>Tiếng Anh</option><option value="all" disabled={!bundle?.translations?.en}>Tất cả · VI + EN</option></select></label><p>Chỉ ngôn ngữ được chọn sẽ cập nhật. Bản nháp v{version} sẽ thay CV đang công khai. Nội dung, ảnh và thông tin liên hệ trong bản này có thể được mọi người xem.</p><div className="publish-summary">{(publishTarget==='all'?['vi','en']:[publishTarget]).map(language=>{const profile=localizedProfile(bundle,language as Locale);return profile?<div key={language}><small>{language==='en'?'English':'Tiếng Việt'}</small><strong>{profile.name}</strong><span>{profile.role}</span></div>:null;})}</div><div className="dialog-actions"><button className="editor-secondary" disabled={!!busy} onClick={()=>setConfirmPublish(false)}>Xem lại</button><button className="editor-publish" disabled={!!busy} onClick={()=>void publish()}>{busy?'Đang xuất bản…':'Xuất bản CV ↗'}</button></div></div></div>}
 </div>
  {cropFile&&<AppImageCropper file={cropFile} onSave={uploadApp} onCancel={()=>setCropFile(null)}/>}
  {inlineEdit&&<InlineEditor edit={inlineEdit} onChange={value=>{const next={...inlineEdit,value};inlineRef.current=next;setInlineEdit(next);}} onCommit={commitInline} onCancel={()=>{inlineRef.current=null;setInlineEdit(null);}}/>}
  {historyOpen&&<HistoryPanel draft={bundle!} version={version} dirty={dirty} saving={draftCtl.saving} blocked={conflict||!!draftCtl.recovery} statusText={statusText} call={call} onSave={save} onClose={()=>setHistoryOpen(false)} onApplied={acceptRecovery} onConflict={message=>{draftCtl.pauseConflict();setError(message);}}/>}
 </main>;
}
