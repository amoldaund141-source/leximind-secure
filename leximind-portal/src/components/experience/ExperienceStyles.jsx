import React from "react";

export default function ExperienceStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; }
      @keyframes heroWordUp { from { opacity: 0; transform: translateY(22px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      .hero-word { display: inline-block; animation: heroWordUp 0.9s cubic-bezier(.16,1,.3,1) both; }

      @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .text-gradient-cyan {
        background: linear-gradient(100deg, #67e8f9, #22d3ee, #a5f3fc, #22d3ee);
        background-size: 300% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: gradientShift 8s ease-in-out infinite;
      }

      @keyframes particleFloat {
        0% { transform: translate3d(0,0,0); opacity: 0; }
        10% { opacity: var(--p-op, .4); }
        50% { transform: translate3d(calc(var(--drift) * 0.5), -46px, 0); }
        90% { opacity: var(--p-op, .4); }
        100% { transform: translate3d(var(--drift), -92px, 0); opacity: 0; }
      }
      .particle-dot {
        position: absolute; border-radius: 9999px; background: #67e8f9;
        box-shadow: 0 0 6px 1px rgba(103,232,249,0.6);
        animation-name: particleFloat; animation-timing-function: ease-in-out; animation-iteration-count: infinite;
      }

      @keyframes scanSweep { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: .6; } 90% { opacity: .6; } 100% { transform: translateY(100%); opacity: 0; } }
      .scan-sweep { animation: scanSweep 6s linear infinite; }

      @keyframes bobY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
      .animate-bob { animation: bobY 2.6s ease-in-out infinite; }

      @keyframes chevronDrop { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(6px); opacity: 1; } }
      .animate-chevron { animation: chevronDrop 1.8s ease-in-out infinite; }

      @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes spinSlowRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      .hv-spin-slow { animation: spinSlow 40s linear infinite; }
      .hv-spin-slow-rev { animation: spinSlowRev 32s linear infinite; }

      @keyframes dashFlow { to { stroke-dashoffset: -320; } }
      .hv-dashflow { animation: dashFlow 9s linear infinite; }

      @keyframes corePulse { 0%, 100% { filter: drop-shadow(0 0 10px rgba(34,211,238,0.35)); } 50% { filter: drop-shadow(0 0 22px rgba(34,211,238,0.65)); } }
      .hv-pulse { animation: corePulse 3.4s ease-in-out infinite; }

      @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes counterOrbit { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      .hv-orbit { animation-name: orbit; animation-timing-function: linear; animation-iteration-count: infinite; }
      .hv-counter-orbit { animation-name: counterOrbit; animation-timing-function: linear; animation-iteration-count: infinite; }

      @keyframes glowPulse { 0%, 100% { opacity: .35; } 50% { opacity: .7; } }
      .animate-glow-pulse { animation: glowPulse 4s ease-in-out infinite; }

      @keyframes flowRight { from { transform: translateX(-8%); } to { transform: translateX(108%); } }
      .flow-right { animation: flowRight 3.2s linear infinite; }

      @media (prefers-reduced-motion: reduce) {
        .particle-dot, .scan-sweep, .animate-bob, .animate-chevron, .hv-spin-slow, .hv-spin-slow-rev,
        .hv-dashflow, .hv-pulse, .hv-orbit, .hv-counter-orbit, .animate-glow-pulse, .flow-right, .hero-word,
        .text-gradient-cyan {
          animation: none !important;
        }
      }
    `}</style>
  );
}
