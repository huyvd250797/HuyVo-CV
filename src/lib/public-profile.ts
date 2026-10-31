import {cache} from 'react';
import {cloudConfig,serverCloud} from './cloud';
import {validateCv} from './validation.mjs';
import type {Profile,Locale,Branding} from './types';
export const loadPublicBranding=cache(async():Promise<Branding>=>{
 const fallback={name:'maison.',logo:'',favicon:''};if(!cloudConfig().ready)return fallback;
 try{const {data,error}=await serverCloud().rpc('public_cv_branding');return error?fallback:{...fallback,...data};}catch{return fallback;}
});
export const loadPublicCv=cache(async(language:Locale='vi',fallback=false):Promise<{profile:Profile|null;status:'ready'|'unconfigured'|'empty'|'error';version?:number;languages:Locale[]} >=>{
 if(!cloudConfig().ready)return {profile:null,status:'unconfigured',languages:[]};
 try{
  const [result,branding]=await Promise.all([serverCloud().from('cv_publications').select('content,document_version,language').eq('id',true),loadPublicBranding()]);
  if(result.error)return {profile:null,status:'error',languages:[]};const rows=result.data||[],languages=rows.map(row=>row.language as Locale).filter(l=>l==='vi'||l==='en');
  const row=rows.find(row=>row.language===language)||(fallback?rows[0]:null);if(!row)return {profile:null,status:'empty',languages};
  const parsed=validateCv({...row.content,language:row.language});if(parsed.errors.length||!parsed.data)return {profile:null,status:'error',languages};
  delete parsed.data.translations;return {profile:{...parsed.data,branding,publication:'published'},status:'ready',version:Number(row.document_version),languages};
 }catch{return {profile:null,status:'error',languages:[]};}
});
