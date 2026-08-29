import Hero from "@/components/home/hero";
import BrandIntro from "@/components/home/brand-intro";
import BusinessPanels from "@/components/home/business-panels";
import EventsTeaser from "@/components/home/events-teaser";
import CtaSection from "@/components/home/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandIntro />
      <BusinessPanels />
      <EventsTeaser />
      <CtaSection />
    </>
  );
}
