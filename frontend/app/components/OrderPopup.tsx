"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import type { Homepage, Product } from "../../lib/api";
import { setScrollLock } from "../../lib/smooth";

function Popup({
  homepage,
  product,
  onClose,
}: {
  homepage: Homepage;
  product: Product;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setScrollLock(true);
    if (box.current) {
      gsap.fromTo(
        box.current,
        { yPercent: 6, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
    return () => setScrollLock(false);
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/85 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        ref={box}
        onSubmit={submit}
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-paper text-ink sm:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink transition-colors hover:bg-black/5"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {product.popupImage && (
          <div className="relative min-h-60 w-full overflow-hidden bg-black-10 sm:min-h-0 sm:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.popupImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex w-full flex-col items-start gap-6 p-[clamp(1.5rem,4vw,3rem)] sm:w-1/2">
          <div className="text-headline-3">{homepage.popupHeading}</div>
          <p className="text-main text-black-40">{homepage.popupText}</p>
          {sent ? (
            <div className="text-button text-ink">{homepage.popupSuccess}</div>
          ) : (
            <>
              <input
                required
                type="email"
                placeholder={homepage.popupInputPlaceholder || "E-mail"}
                className="w-full border-b border-black/20 bg-transparent pb-3 text-main text-ink outline-hidden placeholder:text-black/30 focus:border-ink"
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-8 py-4 text-button text-paper transition-transform hover:scale-103"
              >
                {homepage.popupButton || "Notify me"}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default function OrderPopup({
  homepage,
  product,
  open,
  onClose,
}: {
  homepage: Homepage;
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <Popup homepage={homepage} product={product} onClose={onClose} />;
}