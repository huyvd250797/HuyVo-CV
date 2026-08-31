import type { Metadata } from "next";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Contact | ${profile.name}`,
  description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
};

export default function ContactPage() {
  return (
    <main>
      <Header />
      <div className="contact-page-spacer" />
      <Contact />
      <Footer />
    </main>
  );
}
