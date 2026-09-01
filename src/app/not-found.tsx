import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getUiCopy } from "@/data/i18n";

export default function NotFound() {
  const copy = getUiCopy("en");
  return (
    <main id="top">
      <Header locale="en" />
      <section className="section not-found-section">
        <div className="container not-found-card">
          <p className="section-kicker">{copy.notFound.kicker}</p>
          <h1>{copy.notFound.title}</h1>
          <p>{copy.notFound.description}</p>
          <Link href="/en" className="button primary">{copy.notFound.action} <span>↗</span></Link>
        </div>
      </section>
      <Footer locale="en" />
    </main>
  );
}
