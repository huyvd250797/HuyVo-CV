import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {PublicCvPage} from '@/components/PublicCvPage';
import {loadPublicCv} from '@/lib/public-profile';
import {publishedMetadata} from '@/lib/sharing.mjs';
import type {Locale} from '@/lib/types';
export const dynamic='force-dynamic';
async function locale(params:Promise<{lang:string}>){const {lang}=await params;if(lang!=='en'&&lang!=='vi')notFound();return lang as Locale;}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{const language=await locale(params);const {profile,version}=await loadPublicCv(language);return profile?publishedMetadata(profile,version):{title:language==='en'?'CV not published':'CV chưa xuất bản',robots:{index:false,follow:false}};}
export default async function LanguagePage({params}:{params:Promise<{lang:string}>}){return <PublicCvPage language={await locale(params)}/>;}
