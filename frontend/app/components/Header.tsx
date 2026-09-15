"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Product } from "../../lib/api";
import { useOrder } from "./chrome";
import { onReady, scrollToId } from "../../lib/smooth";

const LINKS: { label: string; id: string }[] = [
  { label: "Specifications", id: "specs" },
  { label: "Who it's for", id: "who" },
  { label: "About", id: "paper" },
  { label: "Inside the box", id: "inside" }
];

/**
 * Header — fixed glassmorphic navigation bar.
 *
 * `position: fixed`, `inset-x-0`, `z-50`; translucent dark glass with a
 * backdrop blur. Left logo, centered links with hover underline draw
 * (`::after` scaleX 0 → 1, origin left), and a high-contrast dark pill
 * CTA that opens the order popup.
 */
export default function Header({ product }: { product: Product }) {
  const header = useRef<HTMLElement>(null);
  const { openOrder } = useOrder();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !header.current) return;
      gsap.set(header.current, { y: -32, autoAlpha: 0 });
      onReady(() => {
        gsap.to(header.current, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out"
        });
      });
    },
    { scope: header }
  );

  const orderLabel = product.ctaLabel || "Order";
  const orderPrice = product.ctaPrice || "$300";

  return (
    <header
      ref={header}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-md"
    >
      <div className="flex h-16 items-center justify-between px-5 md:px-10 lg:h-20">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollToId("main")}
          className="shrink-0 font-serif text-headline-4 text-paper"
        >
          Nōta
        </button>

        {/* Center links */}
        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="nav-link text-menu-link text-paper/70 transition-colors hover:text-paper"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <button
          type="button"
          onClick={openOrder}
          className="shrink-0 rounded-full bg-ink px-5 py-3 text-button text-paper shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          {orderLabel} Nōta One • {orderPrice}
        </button>
      </div>
    </header>
  );
}