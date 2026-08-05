import { useState, useEffect } from "react";
import HeroSection from "@/components/flashboard/HeroSection";
import AudiencePricing from "@/components/flashboard/AudiencePricing";
import CalculatorHowFaq from "@/components/flashboard/CalculatorHowFaq";
import LeadFooter from "@/components/flashboard/LeadFooter";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="flashboard-landing">
      <HeroSection scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AudiencePricing />
      <CalculatorHowFaq />
      <LeadFooter />
    </div>
  );
};

export default Index;
