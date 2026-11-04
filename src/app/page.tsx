import { Navbar } from '../components/Navbar';
import { LiveTicker } from '../components/LiveTicker';
import { Hero } from '../components/Hero';
import { StatsBar } from '../components/StatsBar';
import { StrategiesShowcase } from '../components/StrategiesShowcase';
import { LiveLobbyPreview } from '../components/LiveLobbyPreview';
import { PlansSection } from '../components/PlansSection';
import { HowItWorks } from '../components/HowItWorks';
import { FaqSection } from '../components/FaqSection';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#06080d] text-slate-100 bg-cyber-grid relative selection:bg-amber-500 selection:text-black">
      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Real-time Streaming Ticker */}
      <LiveTicker />

      {/* Hero Showcase with Live Preview Card */}
      <Hero />

      {/* Telemetry Statistics Bar */}
      <StatsBar />

      {/* The 3 Core Algorithmic Strategies */}
      <StrategiesShowcase />

      {/* Multi-Table Live Surveillance Lobby */}
      <LiveLobbyPreview />

      {/* The 5 Subscription Plans (NOWPayments Crypto) */}
      <PlansSection />

      {/* Systematic 4-Step How It Works Walkthrough */}
      <HowItWorks />

      {/* Comprehensive Frequently Asked Questions */}
      <FaqSection />

      {/* Platform Footer */}
      <Footer />
    </main>
  );
}
