"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { scrollToId, setScrollLock } from "../../lib/smooth";
import { useOrder } from "./chrome";

const NAV = [
  { label: "Specifications", id: "specs" },
  { label: "Who it's for", id: "who" },
  { label: "About", id: "paper" },
  { label: "Inside the box", id: "inside" },
];

export default function Header({ orderLabel }: { orderLabel: string }) {
  const { openOrder } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrollLock(menu);
    if (menu && overlay.current) {
      gsap.fromTo(
        overlay.current.querySelectorAll("[data-menu-item]"),
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.07, delay: 0.15 }
      );
    }
  }, [menu]);

  const go = (id: string) => {
    setMenu(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  const openFromMenu = () => {
    setMenu(false);
    requestAnimationFrame(() => openOrder());
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-70 w-full transition-[background-color,padding] duration-500 ${
          scrolled ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-[max(1.25rem,4.5vw)] py-[1.1rem]">
          <button
            onClick={() => scrollToId("main")}
            className="text-button uppercase tracking-tight text-paper"
          >
            NŌTA<span className="text-paper/60">.</span>
          </button>

          <nav className="hidden items-center gap-[clamp(1rem,2.6vw,2.75rem)] lg:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="text-menu-link text-white-40 transition-colors duration-300 hover:text-paper"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openOrder}
              className="hidden rounded-full border border-white/40 px-6 py-3 text-menu-link text-paper transition-[background-color,color] duration-300 hover:bg-paper hover:text-ink sm:block"
            >
              {orderLabel}
            </button>
            <button
              aria-label="Open menu"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.75 lg:hidden"
            >
              <span className={`h-px w-6 bg-paper transition-transform duration-300 ${menu ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-paper transition-transform duration-300 ${menu ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlay}
        className={`fixed inset-0 z-65 flex flex-col justify-between bg-ink px-[max(1.25rem,4.5vw)] pb-[max(1.5rem,4vw)] pt-24 transition-[opacity,visibility] duration-500 lg:hidden ${
          menu ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-col">
          {NAV.map((item) => (
            <button
              key={item.id}
              data-menu-item
              onClick={() => go(item.id)}
              className="text-left font-(--font-instrument-serif) text-[clamp(2.5rem,10vw,4.5rem)] leading-[1.05] tracking-[-0.04em] text-paper"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div data-menu-item>
          <button
            onClick={openFromMenu}
            className="w-full rounded-full bg-paper px-8 py-5 text-button text-ink"
          >
            {orderLabel}
          </button>
        </div>
      </div>
    </>
  );
}
