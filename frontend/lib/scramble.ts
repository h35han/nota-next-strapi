"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scramble-text intro, ported 1:1 from the reference
 * (`.reference/scripts/inline_07.js`).
 *
 * Each `.scramble-text` element is rebuilt as three stacked layers: a solid
 * `base` whose letters fade in left-to-right, plus two "ghost" layers that
 * show random letters from the remaining tail of the word, producing the
 * flickering decode effect. Elements already on the first screen are queued
 * 2000 ms after load and staggered by 50 ms; the rest fire when they reach
 * 85% of the viewport.
 */
const NARROW_CHARS = ["i", "t", "r", "f", "j", "c", "v", "y", "s"];
const DELAY_STEP = 50;
const FIRST_DELAY = 2000;

function animateElement(el: HTMLElement, delay = 0): void {
  const original = el.textContent?.trim() ?? "";
  if (!original) return;
  const letters = [...original];

  el.innerHTML = "";

  const base = document.createElement("div");
  base.classList.add("scramble-base");
  letters.forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.opacity = "0";
    base.appendChild(span);
  });

  const ghost1 = document.createElement("div");
  ghost1.classList.add("scramble-ghost");
  const ghost2 = document.createElement("div");
  ghost2.classList.add("scramble-ghost2");
  letters.forEach(() => {
    const a = document.createElement("span");
    a.textContent = "\u00A0";
    ghost1.appendChild(a);
    const b = document.createElement("span");
    b.textContent = "\u00A0";
    ghost2.appendChild(b);
  });

  el.appendChild(base);
  el.appendChild(ghost1);
  el.appendChild(ghost2);

  const baseSpans = base.querySelectorAll("span");
  const g1Spans = ghost1.querySelectorAll("span");
  const g2Spans = ghost2.querySelectorAll("span");

  const duration = Math.max(0.6, Math.min(1.6, letters.length * 0.04));

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      baseSpans.forEach((s) => ((s as HTMLElement).style.opacity = "1"));
      gsap.to([ghost1, ghost2], {
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => el.setAttribute("data-animated", "true")
      });
    }
  });

  tl.to(
    {},
    {
      duration,
      ease: "linear",
      onUpdate() {
        const p = this.progress();
        const windowStart = Math.floor(p * (letters.length + 1) * 0.93);
        const shouldScramble = Date.now() - windowStart * 10 > 20;

        for (let i = 0; i < letters.length; i += 1) {
          const inWindow = i >= windowStart && i < windowStart + 2;
          if (i < windowStart) (baseSpans[i] as HTMLElement).style.opacity = "1";

          const remaining = letters.slice(Math.max(0, i - 6));
          if (inWindow) {
            if (shouldScramble) {
              let randomChar = remaining[Math.floor(Math.random() * remaining.length)].toLowerCase();
              if (randomChar === " " || "xmw".includes(randomChar)) {
                randomChar = NARROW_CHARS[Math.floor(Math.random() * NARROW_CHARS.length)];
              }
              g1Spans[i].textContent = randomChar;
              g2Spans[i].textContent = randomChar;
            }
            (g1Spans[i] as HTMLElement).style.opacity = "0.95";
            (g2Spans[i] as HTMLElement).style.opacity = "0.92";
          } else {
            (g1Spans[i] as HTMLElement).style.opacity = "0";
            (g2Spans[i] as HTMLElement).style.opacity = "0";
          }
        }
      }
    }
  );

  setTimeout(() => tl.play(), delay);
}

/**
 * Boot the scramble effect for every `.scramble-text` inside `root`.
 * Returns a cleanup function.
 */
export function initScrambleText(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {};

  // Below 992px the reference skips the effect entirely.
  if (window.innerWidth <= 991) {
    root.querySelectorAll<HTMLElement>(".scramble-text").forEach((el) => {
      el.style.opacity = "1";
      el.setAttribute("data-animated", "true");
    });
    return () => {};
  }

  const triggers: ScrollTrigger[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const elements = root.querySelectorAll<HTMLElement>(".scramble-text:not([data-animated])");
  let currentDelay = FIRST_DELAY;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isOnFirstScreen = rect.top < window.innerHeight * 0.9;
    if (isOnFirstScreen) {
      timers.push(setTimeout(() => animateElement(el, currentDelay), 0));
      currentDelay += DELAY_STEP;
    } else {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => animateElement(el, 0)
        })
      );
    }
  });

  return () => {
    triggers.forEach((t) => t.kill());
    timers.forEach((t) => clearTimeout(t));
  };
}
