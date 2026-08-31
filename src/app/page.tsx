import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { CareerSummary } from "@/components/career-summary";
import { Contact } from "@/components/contact";
import { Credentials } from "@/components/credentials";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <CareerSummary />
      <Experience />
      <Skills />
      <Credentials />
      <Approach />
      <Contact />
      <Footer />
    </main>
  );
}
