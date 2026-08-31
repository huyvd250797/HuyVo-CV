import type { Metadata } from "next";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Contact | ${profile.name}`,
  description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${profile.name}`,
    description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main id="top">
      <Header />
      <div className="contact-page-spacer" />
      <Contact />
      <Footer />
    </main>
  );
}
