import React, { useMemo } from "react";

// Deterministic pseudo-random so particles don't jump around on re-render.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function ParticleField({ count = 26, className = "" }) {
  const particles = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 1.5 + rand() * 2.5,
      duration: 14 + rand() * 16,
      delay: -rand() * 20,
      drift: (rand() - 0.5) * 60,
      opacity: 0.25 + rand() * 0.45,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-dot"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
