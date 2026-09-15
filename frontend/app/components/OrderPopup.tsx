"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Homepage, Product } from "../../lib/api";
import { setScrollLock } from "../../lib/smooth";

function PopupBody({ homepage, onClose }: { homepage: Homepage; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // No backend collector in the seed — optimistic success.
    setState("success");
  };

  if (state === "success") {
    return (
      <div className="px-6 py-8 text-center md:px-10 md:py-10">
        <h2 className="font-serif text-headline-3">{homepage.popupSuccess || "All set. We'll keep you posted"}</h2>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 text-button text-mist underline-offset-4 hover:underline"
        >
          {homepage.popupClose || "Close"}
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 text-center md:px-10 md:py-10">
      <h2 className="font-serif text-headline-3">{homepage.popupHeading || "Stay ahead"}</h2>
      <p className="mt-4 text-main text-mist">
        {homepage.popupText || "Launching soon. Get early access and insider updates."}
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={homepage.popupInputPlaceholder || "E-mail"}
          className="w-full rounded-full border border-black/10 bg-black-10 px-5 py-3.5 text-button outline-none transition-colors focus:border-ink/40"
        />
        {state === "error" && (
          <p className="text-card text-red-600">{homepage.popupError || "Something went wrong! Try again"}</p>
        )}
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-4 text-button text-paper transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {homepage.popupButton || "Notify me"}
        </button>
      </form>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 text-button text-mist underline-offset-4 hover:underline"
      >
        {homepage.popupClose || "Close"}
      </button>
    </div>
  );
}

/**
 * Order popup — early-access signup triggered by the header CTA.
 *
 * Email field with success / error states, all copy from Strapi
 * (`homepage.popup_*`). Scroll is locked while open. The inner body
 * remounts on each open so its form state resets.
 */
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
  useEffect(() => {
    setScrollLock(open);
    return () => setScrollLock(false);
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-paper text-ink">
        {product.popupImage && (
          <div className="max-h-44 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.popupImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <PopupBody homepage={homepage} onClose={onClose} />
      </div>
    </div>
  );
}