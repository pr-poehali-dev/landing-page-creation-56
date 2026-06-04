import { useState, useEffect } from "react";
import HeroSection from "@/components/led/HeroSection";
import ContentSections from "@/components/led/ContentSections";
import ContactSection from "@/components/led/ContactSection";

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  return (
    <div id="led-landing">
      <HeroSection scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrollTo={scrollTo} />
      <ContentSections scrollTo={scrollTo} />
      <ContactSection scrollTo={scrollTo} />
    </div>
  );
}
