import React, { useEffect, useRef, useState } from "react";
import { cx } from "../ui";

/* Fires once when the element first enters the viewport, then disconnects —
   deliberately cheap: no scroll listeners, no re-observing. */
export function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { setInView(true); return; }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView];
}

export function Reveal({ as: Tag = "div", delay = 0, className = "", children, threshold = 0.2, y = 24 }) {
  const [ref, inView] = useReveal(threshold);
  return (
    <Tag
      ref={ref}
      className={cx("transition-all ease-out", className)}
      style={{
        transitionDuration: "800ms",
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
