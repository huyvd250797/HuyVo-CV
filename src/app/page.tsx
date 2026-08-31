import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { CareerSummary } from "@/components/career-summary";
import { Contact } from "@/components/contact";
import { Credentials } from "@/components/credentials";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { personJsonLd, websiteJsonLd } from "@/data/structured-data";

export default function Home() {
  return (
    <main>
      <JsonLd data={[personJsonLd, websiteJsonLd]} />
      <Header />
      <Hero />
      <About />
      <CareerSummary />
      <Experience />
      <Projects />
      <Skills />
      <Credentials />
      <Approach />
      <Contact />
      <Footer />
    </main>
  );
}
