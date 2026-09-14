"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { announceReady, setScrollLock } from "../../lib/smooth";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const finish = () => {
        const tl = gsap.timeline({ onComplete: () => setScrollLock(false) });
        tl.to(root.current, {
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.inOut",
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
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8"
    >
      <div
        ref={counter}
        className="font-(--font-instrument-serif) text-[clamp(4rem,14vw,12rem)] leading-[0.8] tracking-[-0.04em] text-paper"
      >
        0%
      </div>
    </div>
  );
}
