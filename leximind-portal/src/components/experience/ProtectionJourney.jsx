import React from "react";
import { UploadCloud, ScanLine, Fingerprint, Lock, ShieldCheck, Vault } from "lucide-react";
import { useReveal } from "./Reveal";
import { cx } from "../ui";

const STEPS = [
  { icon: UploadCloud, title: "Upload", desc: "An officer submits a case document into the secure intake pipeline." },
  { icon: ScanLine, title: "OCR & Classification", desc: "Content is digitized and automatically classified by sensitivity." },
  { icon: Fingerprint, title: "SHA-256 Hashing", desc: "A unique cryptographic fingerprint is generated for the document." },
  { icon: Lock, title: "AES-256 Encryption", desc: "The document is encrypted before it ever touches storage." },
  { icon: ShieldCheck, title: "Blockchain Registration", desc: "The hash is permanently anchored to an immutable ledger." },
  { icon: Vault, title: "Secure Vault Storage", desc: "The document is sealed, custody-tracked, and ready for investigation." },
];

export default function ProtectionJourney() {
  const [ref, inView] = useReveal(0.15);

  return (
    <div ref={ref} className="relative">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-4">
          The Journey
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">How LexiMind Protects a Document</h2>
        <p className="text-slate-400 mt-3 text-sm sm:text-base">Every file that enters the platform passes through six irreversible checkpoints before it's trusted.</p>
      </div>

      {/* connecting progress line */}
      <div className="hidden lg:block absolute left-0 right-0 top-[6.9rem] h-[2px] mx-16">
        <div className="w-full h-full bg-white/10 rounded-full" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 transition-all ease-out"
          style={{ width: inView ? "100%" : "0%", transitionDuration: "2200ms" }}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4 relative">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="relative flex flex-col items-center text-center transition-all ease-out"
            style={{
              transitionDuration: "700ms",
              transitionDelay: `${i * 140}ms`,
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
            }}
          >
            <div className="relative mb-4">
              <div className={cx("w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors duration-700", inView ? "bg-slate-900 border-cyan-400/40 shadow-[0_0_30px_-8px_rgba(34,211,238,0.55)]" : "bg-slate-900 border-white/10")}>
                <s.icon className="w-6 h-6 text-cyan-300" />
              </div>
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
            </div>
            <div className="text-sm font-semibold text-white">{s.title}</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-[11rem]">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
