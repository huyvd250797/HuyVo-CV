import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderCv } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
import { HoldingPage } from '@/components/HoldingPage';
import { PrintButton } from '@/components/PrintButton';
export const dynamic='force-dynamic';
export const metadata: Metadata = { title:'In CV',robots:{index:false,follow:false} };
export default async function PrintPage() {
  const { profile,status } = await loadPublicCv();
  if (!profile) return <HoldingPage error={status==='error'}/>;
  return <><div className="print-toolbar"><a href="/">← Quay lại CV</a><p>Chọn máy in hoặc “Save as PDF” trong hộp thoại.</p><PrintButton/></div><PublicMarkup html={renderCv(profile)}/></>;
}
