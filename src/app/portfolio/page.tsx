import {DocumentLanguage} from '@/components/DocumentLanguage';
import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderPortfolio } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
export const dynamic='force-dynamic';
export const metadata: Metadata = { title:'Portfolio — Đang hoàn thiện',robots:{index:false,follow:true} };
export default async function PortfolioPage({searchParams}:{searchParams:Promise<{lang?:string}>}) {
  const { profile } = await loadPublicCv((await searchParams).lang==='en'?'en':'vi');
  if (!profile) return <main id="main" className="holding-page"><p className="micro">PORTFOLIO / COMING SOON</p><h1>Mỗi dự án,<br/><em>một câu chuyện riêng.</em></h1><p>Portfolio đang được hoàn thiện.</p><a href="/" className="button primary">Quay lại CV ↗</a></main>;
  return <div lang={profile.language}><DocumentLanguage language={profile.language}/><PublicMarkup html={renderPortfolio(profile,{homeHref:profile.language==='en'?'/en':'/'})} /></div>;
}
