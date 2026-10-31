import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderCv } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
import { HoldingPage } from '@/components/HoldingPage';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const { profile:p } = await loadPublicCv();
  if (!p) return { title:'CV đang hoàn thiện',robots:{index:false,follow:false} };
  return { title:`${p.name} — ${p.role}`,description:p.summary,robots:{index:true,follow:true},openGraph:{title:`${p.name} — ${p.role}`,description:p.summary,type:'website',locale:'vi_VN',images:['/og-image.png']} };
}
export default async function HomePage() {
  const { profile, status } = await loadPublicCv();
  if (!profile) return <HoldingPage error={status==='error'} />;
  return <><PublicMarkup html={renderCv(profile,{ printHref:'/print' })} /><a className="owner-entry" href="/admin">Quản lý CV</a></>;
}
