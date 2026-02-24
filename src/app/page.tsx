import HeroSection from "@/components/landing/HeroSection";
import StatsBand from "@/components/landing/StatsBand";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ReviewsMarquee from "@/components/landing/ReviewsMarquee";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBand />
      <HowItWorks />
      <FeaturesGrid />
      <ReviewsMarquee />
      <CTASection />
    </>
  );
}
