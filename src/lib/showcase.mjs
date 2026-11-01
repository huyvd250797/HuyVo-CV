/** Images and links are shared by stable app/image IDs; descriptive copy stays local. */
export const appStatuses = ['live','developing','archived'];
export const appStatusLabel = (status,language='vi') => ({live:language==='en'?'Available':'Đang hoạt động',developing:language==='en'?'In development':'Đang phát triển',archived:language==='en'?'Archived':'Đã lưu trữ'})[status] || '';
export const sharedAppFields=['cover','demoUrl','sourceUrl'];
export function englishApp(source){return {...structuredClone(source),description:'',role:'',platform:source.platform||'',coverAlt:'',images:(source.images||[]).map(image=>({...image,alt:''}))};}
export function shareAppAssets(source,target){
 const shared=Object.fromEntries(sharedAppFields.map(key=>[key,source[key]||'']));
 return {...target,...shared,images:(source.images||[]).map(image=>({id:image.id,src:image.src,alt:(target.images||[]).find(old=>old.id===image.id)?.alt||''}))};
}
export function syncAppAssets(bundle,language){
 if(!bundle.translations?.en)return bundle;
 const source=language==='en'?bundle.translations.en:bundle;
 const target=language==='en'?bundle:bundle.translations.en;
 const projects=(target.projects||[]).map(row=>{const original=(source.projects||[]).find(item=>item.id===row.id);return original?shareAppAssets(original,row):row;});
 return language==='en'?{...bundle,projects}:{...bundle,translations:{...bundle.translations,en:{...bundle.translations.en,projects}}};
}
export function completeEnglishApps(bundle){
 if(!bundle.translations?.en)return bundle;
 const en=bundle.translations.en,ids=new Set(en.projects.map(row=>row.id));
 const projects=[...en.projects,...bundle.projects.filter(row=>!ids.has(row.id)).map(englishApp)].map(row=>{const vi=bundle.projects.find(item=>item.id===row.id);return vi?shareAppAssets(vi,row):row;});
 return {...bundle,translations:{...bundle.translations,en:{...en,projects}}};
}
export function visibleApps(profile){return (profile.projects||[]).filter(app=>!app.hidden);}
