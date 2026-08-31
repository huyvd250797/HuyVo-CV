import type { Metadata } from "next";
import { ScrollUx } from "@/components/scroll-ux";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huy Vo | Project Manager & Functional Consultant",
  description: "Professional portfolio of Huy Vo — Project Manager and Functional Consultant focused on business analysis and software implementation, case studies, resume and refined portfolio interactions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ScrollUx />{children}</body>
    </html>
  );
}
