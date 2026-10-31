// Only published profile values reach these helpers on public routes.
export function canonicalCvUrl(value,language='vi') {
 try {const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;url.pathname=language==='en'?'/en':'/';url.search='';url.hash='';return url.href;}catch{return null;}
}
export function pdfFilename(name,version) {
 const safe=String(name||'Ho-so').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'Ho-so';
 return `CV-${safe}-v${Number.isSafeInteger(version)&&version>0?version:1}.pdf`;
}
export function publishedMetadata(profile,version) {
 const url=canonicalCvUrl(profile.siteUrl,profile.language),title=`${profile.name} — ${profile.role}`,description=profile.summary.slice(0,300);
 const image=url?new URL(`/api/share/image?lang=${profile.language==='en'?'en':'vi'}&v=${version||1}`,url).href:null;
 return {title,description,robots:{index:true,follow:true},...(url?{metadataBase:new URL(url),alternates:{canonical:url}}:{}),openGraph:{title,description,type:'website',locale:profile.language==='en'?'en_US':'vi_VN',...(url?{url}:{}),...(image?{images:[{url:image,width:1200,height:630,alt:`${profile.language==='en'?'Profile':'Hồ sơ'} ${profile.name}`}]}:{})},twitter:{card:image?'summary_large_image':'summary',title,description,...(image?{images:[image]}:{})}};
}
