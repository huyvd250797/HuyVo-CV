import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title:{default:'Maison — CV Online',template:'%s · Maison'},description:'Hồ sơ năng lực và kinh nghiệm chuyên môn.',robots:{index:false,follow:false} };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="vi"><body><a className="skip" href="#main">Đến nội dung chính</a>{children}</body></html>;
}
