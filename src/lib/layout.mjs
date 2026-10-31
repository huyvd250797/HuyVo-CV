export const layoutZones={intro:['objective','personal'],aside:['education','skills','certificates'],career:['experience','delivery']};
export const sectionIds=[...Object.values(layoutZones).flat(),'projects'];
export const maisonZones=['intro','aside','career','tail'];
export const defaultTitles={objective:'Từng bước, có định hướng.',personal:'Thông tin liên hệ',education:'Học vấn.',skills:'Kỹ năng cá nhân.',certificates:'Chứng chỉ.',experience:'Quá trình làm việc.',delivery:'Kinh nghiệm triển khai.',projects:'Những điều tôi tự tay xây dựng.'};
const unique=list=>[...new Set(list.filter(id=>sectionIds.includes(id)))];
export function normalizeLayout(value){
 const source=value&&typeof value==='object'?value:{},order={},used=new Set();
 // Old layouts keep their original constrained columns. New layouts allow moving across Maison regions.
 for(const zone of maisonZones){
  const allowed=zone==='tail'?['projects']:layoutZones[zone];
  const items=Array.isArray(source.order?.[zone])?source.order[zone]:[];
  order[zone]=unique(items).filter(id=>(['maison','grid'].includes(source.mode)?true:allowed.includes(id))&&!used.has(id));order[zone].forEach(id=>used.add(id));
 }
 for(const id of sectionIds)if(!used.has(id)){const zone=Object.keys(layoutZones).find(key=>layoutZones[key].includes(id))||'tail';order[zone].push(id);used.add(id);}
 const titles={};for(const id of sectionIds){const v=source.titles?.[id];if(typeof v==='string'&&v.normalize('NFC').trim())titles[id]=v.normalize('NFC').trim().slice(0,100);}
 const fallback=maisonZones.flatMap(zone=>order[zone]),gridSource=source.grid&&typeof source.grid==='object'?source.grid:{};
 const gridOrder=unique([...(Array.isArray(gridSource.order)?gridSource.order:[]),...fallback]);
 const spans={};for(const id of sectionIds){const width=gridSource.spans?.[id];spans[id]=Number.isInteger(width)&&width>=1&&width<=12?width:({delivery:12,projects:12}[id]||6);}
 return {mode:source.mode==='grid'?'grid':'maison',order,hidden:unique(Array.isArray(source.hidden)?source.hidden:[]),titles,grid:{order:gridOrder,spans}};
}
export function sectionOrder(value){const l=normalizeLayout(value);return l.mode==='grid'?l.grid.order:maisonZones.flatMap(zone=>l.order[zone]);}
export function sectionTitle(value,id){return normalizeLayout(value).titles[id]||defaultTitles[id]||id;}
export function moveSection(value,from,to){
 const l=normalizeLayout(value);if(from===to||!sectionIds.includes(from)||!sectionIds.includes(to))return l;
 if(l.mode==='grid'){l.grid.order=moveItem(l.grid.order,l.grid.order.indexOf(from),l.grid.order.indexOf(to));return l;}
 const a=maisonZones.find(zone=>l.order[zone].includes(from)),b=maisonZones.find(zone=>l.order[zone].includes(to));
 if(a===b)l.order[a]=moveItem(l.order[a],l.order[a].indexOf(from),l.order[a].indexOf(to));
 else {const down=sectionOrder(l).indexOf(from)<sectionOrder(l).indexOf(to);l.order[a]=l.order[a].filter(id=>id!==from);l.order[b].splice(l.order[b].indexOf(to)+(down?1:0),0,from);}
 return l;
}
export function publicContent(profile){
 const data=structuredClone(profile);data.layout=normalizeLayout(data.layout);
 const fields={objective:['objective'],personal:['email','phone','website','address'],education:['education'],skills:['skills'],certificates:['certificates'],experience:['experience'],delivery:['implementations'],projects:['projects']};
 for(const id of data.layout.hidden){for(const key of fields[id])data[key]=Array.isArray(data[key])?[]:'';delete data.layout.titles[id];}
 return {...data,publication:'published',cvFile:''};
}
export function moveItem(items,from,to){if(from===to||from<0||to<0||from>=items.length||to>=items.length)return items;const result=[...items];const [item]=result.splice(from,1);result.splice(to,0,item);return result;}
