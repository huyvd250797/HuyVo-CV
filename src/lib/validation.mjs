import {groupLabels,fieldLabels,contentFieldLabel,rowLabel} from './content-labels.mjs';
import {appStatuses} from './showcase.mjs';
import {localeOf,englishIssues,localizedProfile} from './i18n.mjs';
import { normalizeLayout,publicContent } from './layout.mjs';
const groups = {
  education: ['school','degree','period','detail'],
  skills: ['name','description'],
  experience: ['role','company','period','summary','highlights'],
  implementations: ['code','name','description','period','logo'],
  projects: ['name','description','role','year','technologies','demoUrl','sourceUrl','platform','cover','coverAlt'],
  certificates: ['name','issuer','year','url'],
};
const fields = ['name','role','summary','objective','email','phone','website','address','portrait','portraitAlt','siteUrl'];
export function validWebUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
function validateSingle(input, publishing = false) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: ['Dữ liệu CV không hợp lệ.'], data: null };
  const data = { publication: 'draft', language: localeOf(input.language), cvFile: '', schemaVersion: 6 };
  function string(value, label, max = 6000) {
    if (typeof value !== 'string') { errors.push(`${label}: cần là văn bản.`); return ''; }
    if (value.length > max) errors.push(`${label}: tối đa ${max} ký tự.`);
    return value.normalize('NFC').trim();
  }
  for (const field of fields) data[field] = string(input[field] ?? '', fieldLabels[field]||field, ['summary','objective'].includes(field) ? 6000 : 500);
  if (data.email && !/^[^\s<>"'@?&#]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(data.email)) errors.push('Email không hợp lệ.');
  if (data.phone && !/^\+?[0-9 ()-]{7,25}$/.test(data.phone)) errors.push('Số điện thoại không hợp lệ.');
  for (const key of ['website','siteUrl']) if (data[key] && !validWebUrl(data[key])) errors.push(`${key}: nhập đường dẫn http/https hợp lệ.`);
  if (data.portrait && !/^\/(?:api\/media\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp)|[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/.test(data.portrait)) errors.push('Ảnh chân dung không hợp lệ. Hãy tải ảnh bằng nút Thay ảnh.');
  const validImage=value=>!value||/^\/(?:api\/media\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp)|[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/.test(value);
  if(input.branding){data.branding={name:string(input.branding.name??'maison.','Nhãn hiệu',80),logo:string(input.branding.logo??'','Logo',500),favicon:string(input.branding.favicon??'','Biểu tượng',500)};if(!validImage(data.branding.logo)||!validImage(data.branding.favicon))errors.push('Logo/biểu tượng không hợp lệ.');}
  for (const [group, keys] of Object.entries(groups)) {
    const items = input[group];
    if (!Array.isArray(items) || items.length > 50) { errors.push(`${groupLabels[group]}: tối đa 50 mục.`); data[group] = []; continue; }
    data[group] = items.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push(`${groupLabels[group]} → Mục ${index+1}: dữ liệu không hợp lệ.`); item = {}; }
      const row = {id:typeof item.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(item.id)?item.id:`${group}-legacy-${index}`};
      for (const key of keys) {
        const label = `${groupLabels[group]} → ${rowLabel(item,index)} → ${contentFieldLabel(group,key)}`;
        if (['highlights','technologies'].includes(key)) {
          if (!Array.isArray(item[key]) || item[key].length > 40) { errors.push(`${label}: tối đa 40 dòng.`); row[key] = []; }
          else row[key] = item[key].map(v => string(v,label,1500)).filter(Boolean);
        } else row[key] = string(item[key] ?? '',label,key==='code'?80:6000);
        if(['logo','cover'].includes(key)&&!validImage(row[key]))errors.push(`${label}: ảnh không hợp lệ. Hãy dùng nút tải ảnh JPG/PNG/WebP trong phần chỉnh sửa.`);
        if (['url','demoUrl','sourceUrl'].includes(key) && row[key] && !validWebUrl(row[key])) errors.push(`${label}: đường dẫn không hợp lệ.`);
      }
      if(group==='projects'){
        for(const flag of ['featured','hidden']){if(item[flag]!==undefined&&typeof item[flag]!=='boolean')errors.push(`${groupLabels[group]} → ${rowLabel(item,index)} → ${fieldLabels[flag]}: cần là lựa chọn bật/tắt.`);row[flag]=item[flag]===true;}
        row.status=appStatuses.includes(item.status)?item.status:'developing';
        if(item.status!==undefined&&!appStatuses.includes(item.status))errors.push(`${groupLabels[group]} → ${rowLabel(item,index)} → Trạng thái không hợp lệ.`);
        row.images=[];
        if(item.images!==undefined&&(!Array.isArray(item.images)||item.images.length>8))errors.push(`${groupLabels[group]} → ${rowLabel(item,index)} → Thư viện ảnh: tối đa 8 ảnh.`);
        else if(Array.isArray(item.images)){
          const used=new Set();
          row.images=item.images.map((image,n)=>{
            const context=`${groupLabels[group]} → ${rowLabel(item,index)} → Ảnh ${n+1}`;
            if(!image||typeof image!=='object'||Array.isArray(image)){errors.push(`${context}: dữ liệu ảnh không hợp lệ.`);image={};}
            const result={id:typeof image.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(image.id)?image.id:`image-legacy-${n}`,src:string(image.src??'',context+' / File ảnh',500),alt:string(image.alt??'',context+' / Mô tả ảnh',500)};
            if(!result.src||!validImage(result.src))errors.push(`${context}: file ảnh không hợp lệ. Hãy tải lại ảnh trong trình chỉnh sửa.`);
            if(used.has(result.id))errors.push(`${context}: mã ảnh bị trùng. Hãy bỏ ảnh trùng rồi tải lại.`);used.add(result.id);return result;
          });
        }
      }
      return row;
    });
  }
  for(const group of Object.keys(groups)){const used=new Set();data[group].forEach((row,index)=>{if(used.has(row.id))row.id=`${group}-duplicate-${index}`;used.add(row.id);});}
  data.layout=normalizeLayout(input.layout);
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 180000) errors.push('Nội dung CV quá dài. Vui lòng rút gọn.');
  if (publishing) {
    const visible=publicContent(data);
    if (!data.name || /\[.*\]/.test(data.name)) errors.push('Điền họ và tên trước khi xuất bản.');
    if (!data.role || /\[.*\]/.test(data.role)) errors.push('Điền vị trí công việc trước khi xuất bản.');
    if (!data.layout.hidden.includes('personal') && !data.email && !data.phone) errors.push('Cần ít nhất email hoặc số điện thoại để liên hệ.');
    for (const [group,required] of Object.entries({education:['school'],skills:['name'],certificates:['name'],experience:['role','company'],implementations:['name'],projects:['name']})) {
      visible[group].forEach((item,index)=>{if(required.some(key=>!item[key]))errors.push(`${groupLabels[group]} → ${rowLabel(item,index)}: điền ${required.map(key=>contentFieldLabel(group,key)).join(" và ")} hoặc xóa mục đang để trống.`);});
    }
    const hasPlaceholder = value => typeof value === 'string' ? /\[[^\]]+\]/.test(value) : Array.isArray(value) ? value.some(hasPlaceholder) : value && typeof value === 'object' ? Object.values(value).some(hasPlaceholder) : false;
    if (hasPlaceholder(visible)) errors.push('CV còn nội dung mẫu trong dấu [ ]. Hãy thay hoặc xóa các mục chưa dùng.');
  }
  return { errors, data };
}
export function validateCv(input,publishing=false){
 const parsed=validateSingle(input,publishing);if(parsed.data&&input?.translations?.en){
  const en=validateSingle({...input.translations.en,language:'en'},false);parsed.errors.push(...en.errors.map(e=>'Tiếng Anh → '+e));if(en.data)parsed.data.translations={en:en.data};
 }
 if(parsed.data&&new TextEncoder().encode(JSON.stringify(parsed.data)).byteLength>400000)parsed.errors.push('Hai bản CV vượt quá giới hạn nội dung.');
 return parsed;
}
export function validatePublication(bundle,language){
 const content=localizedProfile(bundle,language);if(!content)return {errors:['Chưa có bản nháp '+(language==='en'?'tiếng Anh':'tiếng Việt')],issues:[],data:null};
 const parsed=validateSingle({...content,language},true);
 const issues=language==='en'?englishIssues(bundle):[];
 const prefix=language==='en'?'Tiếng Anh':'Tiếng Việt';
 parsed.errors=parsed.errors.map(error=>`${prefix} → ${error}`);
 if(parsed.data&&!parsed.data.layout.hidden.includes('projects')){
  for(const [index,row] of parsed.data.projects.entries()){
   if(row.hidden)continue;
   const add=(field,message)=>issues.push({language,section:'projects',group:'projects',rowId:row.id,rowIndex:index,field,message:`${prefix} → Ứng dụng đã xây dựng → ${row.name||`Mục ${index+1}`} → ${message}`});
   if(row.cover&&!row.coverAlt)add('coverAlt','Thêm mô tả ảnh bìa để người xem dùng trình đọc màn hình hiểu được hình ảnh.');
   for(const [n,image] of row.images.entries())if(!image.alt)add('images',`Ảnh ${n+1} trong thư viện chưa có mô tả. Hãy điền “Mô tả ảnh ${n+1}”.`);
  }
 }
 parsed.errors.push(...issues.map(issue=>issue.message));return {...parsed,issues};
}
export function imageType(bytes) {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)) return { mime:'image/png', extension:'png' };
  if (bytes.length >= 3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return { mime:'image/jpeg', extension:'jpg' };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP') return { mime:'image/webp', extension:'webp' };
  return null;
}
