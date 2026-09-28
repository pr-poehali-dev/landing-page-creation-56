import { useState, useEffect } from "react";
import HeroSection from "@/components/flashboard/HeroSection";
import AudiencePricing from "@/components/flashboard/AudiencePricing";
import ClientsLogos from "@/components/flashboard/ClientsLogos";
import MapComparison from "@/components/flashboard/MapComparison";
import CalculatorHowFaq from "@/components/flashboard/CalculatorHowFaq";
import LeadFooter from "@/components/flashboard/LeadFooter";
import StickyBar from "@/components/flashboard/StickyBar";
import Reveal from "@/components/flashboard/Reveal";
import { CalcPreset } from "@/components/flashboard/pricing";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [calcPreset, setCalcPreset] = useState<CalcPreset | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowSticky(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#top") return;

    let ticks = 0;
    const timer = window.setInterval(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      if (++ticks > 30) window.clearInterval(timer);
    }, 150);

    const stop = () => window.clearInterval(timer);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, []);

  return (
    <div id="flashboard-landing">
      <HeroSection scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Reveal>
        <AudiencePricing />
      </Reveal>
      <Reveal>
        <ClientsLogos />
      </Reveal>
      <Reveal>
        <MapComparison />
      </Reveal>
      <Reveal>
        <CalculatorHowFaq onApply={setCalcPreset} />
      </Reveal>
      <Reveal>
        <LeadFooter preset={calcPreset} />
      </Reveal>
      <StickyBar visible={showSticky} />
    </div>
  );
};

export default Index;