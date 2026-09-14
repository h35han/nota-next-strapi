"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { announceReady, setScrollLock } from "../../lib/smooth";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      const tl = gsap.timeline({ onComplete: () => setScrollLock(false) });
      tl.to(root.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => {
          if (root.current) {
            root.current.style.display = "none";
            root.current.style.pointerEvents = "none";
          }
        },
      });
      tl.call(() => announceReady(), undefined, ">-0.05");
    };

    if (reduced) {
      if (counter.current) counter.current.textContent = "100%";
      finish();
      return;
    }

    const state = { v: 0 };
    gsap.to(state, {
      v: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counter.current) counter.current.textContent = `${Math.round(state.v)}%`;
      },
      onComplete: finish,
    });
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-100 flex items-end justify-between bg-ink px-[max(1.25rem,4.5vw)] pb-[max(1.25rem,4vw)]"
    >
      <div className="text-footer text-white-40">NŌTA</div>
      <div
        ref={counter}
        className="font-(--font-instrument-serif) text-[clamp(4rem,14vw,12rem)] leading-[0.8] tracking-[-0.04em] text-paper"
      >
        0%
      </div>
    </div>
  );
}