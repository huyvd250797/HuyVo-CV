export const layoutZones = {
 intro: ['objective','personal'],
 aside: ['education','skills','certificates'],
 career: ['experience','delivery'],
};
export const sectionIds = [...Object.values(layoutZones).flat(),'projects'];
export function normalizeLayout(value) {
 const source=value&&typeof value==='object'?value:{}; const order={};
 for(const [zone,allowed] of Object.entries(layoutZones)) {
  const list=Array.isArray(source.order?.[zone])?source.order[zone]:[];
  order[zone]=[...new Set([...list.filter(id=>allowed.includes(id)),...allowed])];
 }
 return {order,hidden:[...new Set((Array.isArray(source.hidden)?source.hidden:[]).filter(id=>sectionIds.includes(id)))]};
}
export function publicContent(profile) {
 const data=structuredClone(profile);data.layout=normalizeLayout(data.layout);
 const fields={objective:['objective'],personal:['email','phone','website','address'],education:['education'],skills:['skills'],certificates:['certificates'],experience:['experience'],delivery:['implementations'],projects:['projects']};
 for(const id of data.layout.hidden)for(const key of fields[id])data[key]=Array.isArray(data[key])?[]:'';
 return {...data,publication:'published',cvFile:''};
}
export function moveItem(items,from,to) {
 if(from===to||from<0||to<0||from>=items.length||to>=items.length)return items;
 const result=[...items];const [item]=result.splice(from,1);result.splice(to,0,item);return result;
}
