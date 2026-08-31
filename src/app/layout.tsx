import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huy Vo | Project Manager & Functional Consultant",
  description: "Professional portfolio of Huy Vo — Project Manager and Functional Consultant focused on business analysis and software implementation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
