import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderPortfolio } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
export const dynamic='force-dynamic';
export const metadata: Metadata = { title:'Portfolio — Đang hoàn thiện',robots:{index:false,follow:true} };
export default async function PortfolioPage() {
  const { profile } = await loadPublicCv();
  if (!profile) return <main id="main" className="holding-page"><p className="micro">PORTFOLIO / COMING SOON</p><h1>Mỗi dự án,<br/><em>một câu chuyện riêng.</em></h1><p>Portfolio đang được hoàn thiện.</p><a href="/" className="button primary">Quay lại CV ↗</a></main>;
  return <PublicMarkup html={renderPortfolio(profile)} />;
}
