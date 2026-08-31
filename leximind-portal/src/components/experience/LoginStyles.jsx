import React from "react";

export default function LoginStyles() {
  return (
    <style>{`
      @keyframes loginRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      .login-in { animation: loginRise 0.7s cubic-bezier(.16,1,.3,1) both; }

      @keyframes loginCardIn { from { opacity: 0; transform: translateY(22px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .login-card-in { animation: loginCardIn 0.75s cubic-bezier(.16,1,.3,1) both; }

      @keyframes ringPulse { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
      .login-ring-pulse { animation: ringPulse 3s ease-in-out infinite; }

      @keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .login-ring-spin { animation: ringSpin 14s linear infinite; }
      .login-ring-spin-rev { animation: ringSpin 20s linear infinite reverse; }

      /* Focus underline that sweeps in under an input's border on focus-within */
      .login-underline { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px;
        background: linear-gradient(90deg, transparent, #22d3ee, transparent); transform: scaleX(0); transition: transform .35s ease; }
      .login-field-group:focus-within .login-underline { transform: scaleX(1); }

      /* Shimmer sweep across the primary submit button */
      @keyframes btnShimmer { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
      .login-shimmer { position: relative; overflow: hidden; }
      .login-shimmer::after {
        content: ""; position: absolute; top: 0; bottom: 0; width: 34%; left: 0;
        background: linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: translateX(-120%) skewX(-15deg); pointer-events: none;
      }
      .login-shimmer:hover::after { animation: btnShimmer 1.1s ease; }

      /* Ambient floating document/lock glyphs, very low opacity, slow drift */
      @keyframes ambientDrift { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(10px,-16px) rotate(4deg); } }
      .login-ambient-icon { animation: ambientDrift 9s ease-in-out infinite; }

      /* Encryption status badge — cycling lines fade in/out (JS toggles the active line) */
      @keyframes statusFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      .login-status-line { animation: statusFade .4s ease both; }

      @keyframes scanSweepY { 0% { transform: translateY(-100%); opacity: 0; } 15% { opacity: .7; } 85% { opacity: .7; } 100% { transform: translateY(100%); opacity: 0; } }
      .login-scan { animation: scanSweepY 3.2s ease-in-out infinite; }

      /* Welcome overlay */
      @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes welcomeCheckIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
      @keyframes welcomeRing { from { stroke-dashoffset: 126; } to { stroke-dashoffset: 0; } }
      .welcome-overlay-in { animation: overlayFade .35s ease both; }
      .welcome-check-in { animation: welcomeCheckIn .5s cubic-bezier(.16,1,.4,1) .25s both; }
      .welcome-ring-draw { stroke-dasharray: 126; stroke-dashoffset: 126; animation: welcomeRing .7s ease-out .05s forwards; }

      @media (prefers-reduced-motion: reduce) {
        .login-in, .login-card-in, .login-ring-pulse, .login-ring-spin, .login-ring-spin-rev,
        .login-ambient-icon, .login-status-line, .login-scan, .welcome-overlay-in, .welcome-check-in,
        .welcome-ring-draw, .login-shimmer::after {
          animation: none !important;
        }
      }
    `}</style>
  );
}
