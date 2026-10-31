import {DocumentLanguage} from '@/components/DocumentLanguage';
import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderCv } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
import { HoldingPage } from '@/components/HoldingPage';
import { PrintButton } from '@/components/PrintButton';
export const dynamic='force-dynamic';
export const metadata: Metadata = { title:'In CV',robots:{index:false,follow:false} };
export default async function PrintPage({searchParams}:{searchParams:Promise<{lang?:string}>}) {
  const { profile,status } = await loadPublicCv((await searchParams).lang==='en'?'en':'vi');
  if (!profile) return <HoldingPage error={status==='error'}/>;
  return <div lang={profile.language}><DocumentLanguage language={profile.language}/><div className="print-toolbar"><a href={profile.language==='en'?'/en':'/'}>{profile.language==='en'?'← Back to CV':'← Quay lại CV'}</a><a className="direct-pdf" href={'/api/cv/pdf?lang='+profile.language}>{profile.language==='en'?'Download A4 PDF ↓':'Tải PDF A4 tự động ↓'}</a><p>{profile.language==='en'?'Or print using your browser.':'Hoặc in qua hộp thoại trình duyệt.'}</p><PrintButton language={profile.language}/></div><PublicMarkup html={renderCv(profile,{homeHref:profile.language==='en'?'/en':'/',portfolioHref:'/portfolio?lang='+profile.language})}/></div>;
}
