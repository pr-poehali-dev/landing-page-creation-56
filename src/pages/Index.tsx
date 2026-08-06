import { useState, useEffect } from "react";
import HeroSection from "@/components/flashboard/HeroSection";
import AudiencePricing from "@/components/flashboard/AudiencePricing";
import MapComparison from "@/components/flashboard/MapComparison";
import CalculatorHowFaq from "@/components/flashboard/CalculatorHowFaq";
import LeadFooter from "@/components/flashboard/LeadFooter";
import StickyBar from "@/components/flashboard/StickyBar";
import Reveal from "@/components/flashboard/Reveal";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("fb-theme") === "dark";
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowSticky(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("fb-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div id="flashboard-landing" className={dark ? "fb-theme-dark" : ""}>
      <HeroSection scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} dark={dark} setDark={setDark} />
      <Reveal>
        <AudiencePricing />
      </Reveal>
      <Reveal>
        <MapComparison />
      </Reveal>
      <Reveal>
        <CalculatorHowFaq />
      </Reveal>
      <Reveal>
        <LeadFooter />
      </Reveal>
      <StickyBar visible={showSticky} />
    </div>
  );
};

export default Index;