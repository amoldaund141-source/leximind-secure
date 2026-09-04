import React from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ShieldHalf, ArrowRight, Fingerprint, ChevronDown, ShieldCheck, Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GlobalStyles, Button, cx } from "../components/ui";
import { ROLE_PREFIX } from "../data/mockData";
import ExperienceStyles from "../components/experience/ExperienceStyles";
import ParticleField from "../components/experience/ParticleField";
import CursorGlow from "../components/experience/CursorGlow";
import HeroVisual from "../components/experience/HeroVisual";
import { Reveal } from "../components/experience/Reveal";
import ProtectionJourney from "../components/experience/ProtectionJourney";
import FeatureStory from "../components/experience/FeatureStory";

const HERO_WORDS = [
  { text: "Secure Every Document.", cls: "" },
  { text: "Trace Every Action.", cls: "" },
  { text: "Trust Every Record.", cls: "text-gradient-cyan" },
];

export default function LandingPage() {
  const { user, role } = useAuth();
  if (user) return <Navigate to={`/${ROLE_PREFIX[role]}/dashboard`} replace />;

  return (
    <div className="relative bg-slate-950 text-white overflow-x-clip" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <GlobalStyles />
      <ExperienceStyles />
      <CursorGlow />

      {/* -------------------------------------------------- NAV -------------------------------------------------- */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center"><ShieldHalf className="w-4.5 h-4.5 text-slate-950" /></div>
            <span className="font-bold tracking-wide text-sm sm:text-base">LexiMind Secure</span>
          </div>
          <Link to="/login"><Button variant="accent" size="sm">Officer Sign In</Button></Link>
        </div>
      </nav>

      {/* -------------------------------------------------- HERO -------------------------------------------------- */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-[-10%] w-[36rem] h-[36rem] bg-cyan-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 65% 55% at 50% 35%, black 20%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 35%, black 20%, transparent 78%)",
            }}
          />
          <ParticleField count={28} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center w-full py-16">
          <div className="text-center lg:text-left">
            <span className="hero-word inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-6" style={{ animationDelay: "0.05s" }}>
              <Fingerprint className="w-3.5 h-3.5" /> AI-Powered Secure Legal & Investigation Intelligence Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08]">
              {HERO_WORDS.map((w, i) => (
                <span key={i} className={cx("hero-word block", w.cls)} style={{ animationDelay: `${0.18 + i * 0.16}s` }}>
                  {w.text}
                </span>
              ))}
            </h1>

            <p className="hero-word text-slate-400 mt-6 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed" style={{ animationDelay: "0.72s" }}>
              LexiMind Secure encrypts, hashes, and blockchain-verifies every piece of case evidence — giving
              investigation officers, forensic analysts and legal teams one trusted system of record from first
              upload to final verdict.
            </p>

            <div className="hero-word flex flex-col sm:flex-row items-center lg:items-start gap-3 mt-9 justify-center lg:justify-start" style={{ animationDelay: "0.88s" }}>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="accent" size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]">
                  Enter the Secure Intelligence Portal
                </Button>
              </Link>
              <a href="#journey" className="w-full sm:w-auto">
                <Button variant="subtle" size="lg" className="w-full sm:w-auto !bg-white/5 !text-slate-200 hover:!bg-white/10 border border-white/10">
                  Explore the Platform
                </Button>
              </a>
            </div>

            <div className="hero-word flex items-center gap-1.5 justify-center lg:justify-start mt-7 text-xs text-slate-500" style={{ animationDelay: "1.02s" }}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 encrypted · Blockchain-verified · Every access logged
            </div>
          </div>

          <Reveal delay={200} threshold={0.05}>
            <HeroVisual />
          </Reveal>
        </div>

        <a href="#journey" className="hidden sm:flex absolute bottom-8 inset-x-0 flex-col items-center gap-1.5 text-slate-500 hover:text-cyan-300 transition-colors animate-bob">
          <span className="text-[11px] tracking-wide uppercase">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-chevron" />
        </a>
      </section>

      {/* -------------------------------------------------- JOURNEY -------------------------------------------------- */}
      <section id="journey" className="relative py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <ProtectionJourney />
        </div>
      </section>

      {/* -------------------------------------------------- CAPABILITIES -------------------------------------------------- */}
      <section className="relative py-24 sm:py-32 border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-cyan-600/[0.06] rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-5 relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3 h-3" /> Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Built for the weight of real investigations</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">Six systems working together so no document, action or connection ever goes unverified.</p>
          </Reveal>
          <FeatureStory />
        </div>
      </section>

      {/* -------------------------------------------------- FINAL CTA -------------------------------------------------- */}
      <section className="relative py-28 sm:py-36 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 55% 60% at 50% 50%, black 10%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 55% 60% at 50% 50%, black 10%, transparent 75%)",
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-3xl animate-glow-pulse" />
        </div>

        <Reveal className="relative max-w-2xl mx-auto px-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
            <ShieldHalf className="w-7 h-7 text-cyan-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to secure the record?</h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-base max-w-md mx-auto">
            Sign in with your officer credentials to enter the Command Center and pick up your cases, evidence and investigations.
          </p>
          <Link to="/login" className="inline-block mt-8">
            <Button variant="accent" size="lg" icon={ArrowRight} className="shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]">
              Enter the Secure Intelligence Portal
            </Button>
          </Link>
          <p className="text-xs text-slate-500 mt-5 tracking-wide">Secure · Verify · Trace · Investigate</p>
        </Reveal>
      </section>

      {/* -------------------------------------------------- FOOTER -------------------------------------------------- */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2"><ShieldHalf className="w-4 h-4 text-cyan-500" /> LexiMind Secure — AI-Powered Secure Legal & Investigation Intelligence Platform</div>
          <div>Prototype for SIH 2026 · Not for operational use</div>
        </div>
      </footer>
    </div>
  );
}
