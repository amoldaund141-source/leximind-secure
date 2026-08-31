import React from "react";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] aspect-square mx-auto select-none" aria-hidden="true">
      <svg viewBox="0 0 520 520" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#0891b2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
        </defs>

        {/* ambient core glow */}
        <circle cx="260" cy="260" r="230" fill="url(#coreGlow)" />

        {/* outer rotating ring with tick marks (blockchain / radar feel) */}
        <g className="hv-spin-slow" style={{ transformOrigin: "260px 260px" }}>
          <circle cx="260" cy="260" r="200" fill="none" stroke="#164e63" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 10" />
        </g>
        <g className="hv-spin-slow-rev" style={{ transformOrigin: "260px 260px" }}>
          <circle cx="260" cy="260" r="165" fill="none" stroke="url(#ringStroke)" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="1 14" />
        </g>

        {/* flowing verification arc — animated dash offset */}
        <circle cx="260" cy="260" r="140" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="18 14" className="hv-dashflow" />

        {/* central vault / shield core */}
        <g style={{ transformOrigin: "260px 260px" }} className="hv-pulse">
          <polygon points="260,150 340,190 340,280 260,340 180,280 180,190" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
          <polygon points="260,150 340,190 340,280 260,340 180,280 180,190" fill="url(#coreGlow)" opacity="0.6" />
          <path d="M260 195 a34 34 0 0 1 34 34 v14 h4 v46 h-76 v-46 h4 v-14 a34 34 0 0 1 34-34 Z" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
          <rect x="226" y="243" width="68" height="46" rx="6" fill="#083344" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="260" cy="264" r="5" fill="#22d3ee" />
        </g>

        {/* orbiting document / hash / chain nodes */}
        {[
          { r: 195, dur: "22s", delay: "0s", size: 34, icon: "doc" },
          { r: 195, dur: "22s", delay: "-7.3s", size: 30, icon: "hash" },
          { r: 195, dur: "22s", delay: "-14.6s", size: 32, icon: "chain" },
        ].map((n, i) => (
          <g key={i} className="hv-orbit" style={{ transformOrigin: "260px 260px", animationDuration: n.dur, animationDelay: n.delay }}>
            <g transform={`translate(${260 + n.r}, 260)`}>
              <g className="hv-counter-orbit" style={{ transformOrigin: "0px 0px", animationDuration: n.dur, animationDelay: n.delay }}>
                <circle r={n.size / 2 + 6} fill="#0f172a" stroke="#164e63" strokeWidth="1.5" />
                {n.icon === "doc" && (
                  <g stroke="#67e8f9" strokeWidth="1.6" fill="none">
                    <rect x={-9} y={-11} width="18" height="22" rx="2" />
                    <line x1={-5} y1={-4} x2="5" y2={-4} />
                    <line x1={-5} y1={1} x2="5" y2="1" />
                    <line x1={-5} y1={6} x2="2" y2="6" />
                  </g>
                )}
                {n.icon === "hash" && (
                  <text textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#67e8f9" fontFamily="ui-monospace, monospace">#</text>
                )}
                {n.icon === "chain" && (
                  <g stroke="#67e8f9" strokeWidth="1.8" fill="none">
                    <rect x={-9} y={-5} width="10" height="10" rx="3" />
                    <rect x={0} y={-5} width="10" height="10" rx="3" />
                  </g>
                )}
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
