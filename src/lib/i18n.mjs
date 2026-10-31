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
 if(locale==='en'){const {translations,...profile}=next;return {...bundle,translations:{...bundle.translations,en:{...profile,language:'en'}}};}
 const {translations,...profile}=next;return {...profile,language:'vi',translations:bundle.translations};
}
export function createEnglishProfile(vi){
 const copy=structuredClone(vi);delete copy.translations;copy.language='en';copy.portraitAlt='Portrait';copy.role='';copy.summary='';copy.objective='';
 const fields={education:['school','degree','detail'],skills:['name','description'],certificates:['name'],experience:['role','summary','highlights'],implementations:['name','description'],projects:['description','role']};
 for(const [group,keys] of Object.entries(fields))copy[group]=copy[group].map(row=>{const r={...row};for(const key of keys)r[key]=Array.isArray(r[key])?[]:'';if(r.period)r.period=formatPeriod(r.period,'en');return r;});
 copy.layout={...copy.layout,titles:{...englishTitles}};return copy;
}
export function formatPeriod(value,language){
 if(language!=='en'||typeof value!=='string')return value||'';
 let text=value.replace(/hiện tại|đến nay|nay|present|current|ongoing/gi,'Present').replace(/tháng\s*(\d{1,2})(?:\s*năm)?\s+(\d{4})/gi,(_,m,y)=>`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 text=text.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,(_,d,m,y)=>`${Number(d)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 text=text.replace(/\b(\d{1,2})\/(\d{4})\b/g,(_,m,y)=>`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]||m} ${y}`);
 return text.replace(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/g,m=>m[0]+m.slice(1).toLowerCase());
}
export function englishGaps(bundle){
 const vi=localizedProfile(bundle,'vi'),en=localizedProfile(bundle,'en');if(!en)return ['Chưa có bản nháp tiếng Anh.'];const errors=[],hidden=new Set(en.layout?.hidden||[]);
 for(const key of ['role','summary','objective'])if(vi[key]&&!en[key]&&!(key==='objective'&&hidden.has('objective')))errors.push(`English: cần hoàn thiện ${key}.`);
 const groups={education:['school','degree','detail'],skills:['name','description'],certificates:['name'],experience:['role','summary','highlights'],implementations:['name','description'],projects:['description','role']};
 for(const [group,keys] of Object.entries(groups)){
  if(hidden.has(group==='implementations'?'delivery':group))continue;
  if(vi[group].length&&!en[group].length){errors.push(`English: danh sách ${group} chưa có nội dung.`);continue;}
  for(const [index,row] of en[group].entries()){const original=vi[group].find((item,n)=>item.id&&row.id?item.id===row.id:n===index);for(const key of keys)if(original?.[key]?.length&&!row[key]?.length)errors.push(`English: ${group} ${index+1} còn thiếu ${key}.`);}
 }
 return errors;
}
export function mediaPaths(profile){
 const items=[profile?.portrait,...(profile?.implementations||[]).map(row=>row.logo),profile?.branding?.logo,profile?.branding?.favicon];
 if(profile?.translations?.en)items.push(...mediaPaths(profile.translations.en));return [...new Set(items.filter(Boolean))];
}
