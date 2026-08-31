import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Approach />
      <Contact />
      <Footer />
    </main>
  );
}
