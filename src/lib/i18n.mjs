import {groupLabels,contentFieldLabel,rowLabel} from './content-labels.mjs';
import {englishApp,syncAppAssets} from './showcase.mjs';
export const languages=['vi','en'];
export const languageName={vi:'Tiếng Việt',en:'English'};
export const englishTitles={objective:'Career objective',personal:'Contact information',education:'Education',skills:'Skills',certificates:'Certifications',experience:'Professional experience',delivery:'Implementation experience',projects:'Selected applications & projects'};
export function localeOf(value){return value==='en'?'en':'vi';}
export function textFor(p,vi,en){return p.language==='en'?en:vi;}
export function localizedProfile(bundle,language='vi'){
 const locale=localeOf(language);if(locale==='en')return bundle?.translations?.en?{...bundle.translations.en,language:'en'}:null;
 if(!bundle)return null;const {translations,...profile}=bundle;return {...profile,language:'vi'};
}
export function updateLocalized(bundle,language,updater){
 const locale=localeOf(language),current=localizedProfile(bundle,locale);if(!current)return bundle;
 const next=typeof updater==='function'?updater(current):updater;
 if(locale==='en'){const {translations,...profile}=next;return syncAppAssets({...bundle,translations:{...bundle.translations,en:{...profile,language:'en'}}},'en');}
 const {translations,...profile}=next;return syncAppAssets({...profile,language:'vi',translations:bundle.translations},'vi');
}
export function createEnglishProfile(vi){
 const copy=structuredClone(vi);delete copy.translations;copy.language='en';copy.portraitAlt='Portrait';copy.role='';copy.summary='';copy.objective='';
 const fields={education:['school','degree','detail'],skills:['name','description'],certificates:['name'],experience:['role','summary','highlights'],implementations:['name','description'],projects:['description','role']};
 for(const [group,keys] of Object.entries(fields))copy[group]=copy[group].map(row=>{const r={...row};for(const key of keys)r[key]=Array.isArray(r[key])?[]:'';if(r.period)r.period=formatPeriod(r.period,'en');return r;});
 copy.projects=copy.projects.map(englishApp);
 copy.layout={...copy.layout,titles:{...englishTitles}};return copy;
}
export function completeEnglishSection(bundle,group){
 if(!bundle.translations?.en||!['education','skills','certificates','experience','implementations','projects'].includes(group))return bundle;
 const en=bundle.translations.en,template=createEnglishProfile(bundle),ids=new Set(en[group].map(row=>row.id));
 return {...bundle,translations:{...bundle.translations,en:{...en,[group]:[...en[group],...template[group].filter(row=>!ids.has(row.id))]}}};
}
export function formatPeriod(value,language){
 if(language!=='en'||typeof value!=='string')return value||'';
 let text=value.replace(/hiện tại|đến nay|nay|present|current|ongoing/gi,'Present').replace(/tháng\s*(\d{1,2})(?:\s*năm)?\s+(\d{4})/gi,(_,m,y)=>`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 text=text.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,(_,d,m,y)=>`${Number(d)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 text=text.replace(/\b(\d{1,2})\/(\d{4})\b/g,(_,m,y)=>`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 return text.replace(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/g,m=>m[0]+m.slice(1).toLowerCase());
}
export function englishIssues(bundle){
 const vi=localizedProfile(bundle,'vi'),en=localizedProfile(bundle,'en');
 if(!en)return [{language:'en',section:'personal',field:'role',message:'Tiếng Anh → Chưa có bản nháp. Chọn EN để tạo và hoàn thiện nội dung trước khi xuất bản.'}];
 const issues=[],hidden=new Set(en.layout?.hidden||[]);
 const add=(section,group,row,index,key,detail)=>{
  const location=group?`${groupLabels[group]} → ${rowLabel(row,index)}`:section==='objective'?'Mục tiêu nghề nghiệp':'Thông tin cá nhân';
  issues.push({language:'en',section,group,rowId:row?.id,rowIndex:group?index:undefined,field:key,message:`Tiếng Anh → ${location} → ${detail||`Thiếu “${contentFieldLabel(group,key)}”. Bản tiếng Việt đã có nội dung; hãy bổ sung bản tiếng Anh.`}`});
 };
 for(const key of ['role','summary','objective'])if(vi[key]?.trim()&&!en[key]?.trim()&&!(key==='objective'&&hidden.has('objective')))add(key==='objective'?'objective':'personal',null,null,0,key);
 const groups={education:['school','degree','period','detail'],skills:['name','description'],certificates:['name','issuer','year'],experience:['role','company','period','summary','highlights'],implementations:['name','description','period'],projects:['name','description','role','platform','year','technologies','coverAlt']};
 const meaningful=value=>Array.isArray(value)?value.filter(v=>typeof v==='string'&&v.trim()).length:typeof value==='string'?value.trim().length:0;
 for(const [group,keys] of Object.entries(groups)){
  const section=group==='implementations'?'delivery':group;if(hidden.has(section))continue;
  const viRows=(vi[group]||[]),enRows=(en[group]||[]);
  for(const [viIndex,original] of viRows.entries()){
   if(group==='projects'&&original.hidden)continue;
   const index=enRows.findIndex((item,n)=>original.id&&item.id?item.id===original.id:n===viIndex),row=enRows[index];
   if(!row){add(section,group,original,viIndex,'name','Chưa có mục tương ứng trong bản tiếng Anh. Bổ sung mục có cùng mã định danh; với ứng dụng, dùng “Bổ sung app từ VI” trong phần EN.');continue;}
   if(group==='projects'&&row.hidden)continue;
   for(const key of keys){
    const expected=meaningful(original[key]),actual=meaningful(row[key]);
    if(expected&&!actual)add(section,group,{...original,...row,name:row.name||original.name},index,key);
    else if(Array.isArray(original[key])&&actual<expected)add(section,group,row,index,key,`“${contentFieldLabel(group,key)}” mới có ${actual}/${expected} dòng so với tiếng Việt. Hãy hoàn thiện các dòng còn thiếu.`);
   }
   if(group==='projects')for(const image of original.images||[]){const translated=(row.images||[]).find(item=>item.id===image.id);if(image.alt?.trim()&&!translated?.alt?.trim())add(section,group,row,index,'images',`Thiếu mô tả tiếng Anh cho ảnh ${original.images.indexOf(image)+1} trong thư viện ảnh.`);}
  }
 }
 return issues;
}
export function englishGaps(bundle){return englishIssues(bundle).map(issue=>issue.message);}
export function mediaPaths(profile){
 const items=[...(profile?.projects||[]).flatMap(row=>[row.cover,...(row.images||[]).map(image=>image.src)]),profile?.portrait,...(profile?.implementations||[]).map(row=>row.logo),profile?.branding?.logo,profile?.branding?.favicon];
 if(profile?.translations?.en)items.push(...mediaPaths(profile.translations.en));return [...new Set(items.filter(Boolean))];
}
