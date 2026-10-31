import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title:{default:'Maison — CV Online',template:'%s · Maison'},description:'Hồ sơ năng lực và kinh nghiệm chuyên môn.',icons:{icon:'/api/branding/icon'},robots:{index:false,follow:false} };
export default async function RootLayout({ children,params }: Readonly<{ children: ReactNode;params:Promise<{lang?:string}> }>) {
  return <html lang={(await params).lang==='en'?'en':'vi'}><body><a className="skip" href="#main">Đến nội dung chính</a>{children}</body></html>;
}
