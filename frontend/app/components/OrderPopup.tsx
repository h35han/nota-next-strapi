"use client";

import { useEffect, useRef, useState, type FormEvent, type HTMLAttributes } from "react";
import { gsap } from "gsap";
import type { Homepage, Product } from "../../lib/api";
import { setScrollLock } from "../../lib/smooth";

/**
 * Order popup — the early-access signup opened from the header CTA and from the
 * mobile menu's order block (reference block `i4bbl7try_0`).
 *
 * Taptop drives every `pop-up` through its `tt_modal` settings (id `825693763`,
 * see `.reference/scripts/inline_13.js`):
 *
 *   { closeOnOverlay: true, scrollLock: true, effect: "fade",
 *     open:  { easing: "linear", duration: 200 },
 *     close: { easing: "linear", duration: 200 } }
 *
 * Like the reference, the node always exists in the document (hidden with
 * `display: none`) and the fade is what shows/hides it.
 *
 * There is no backend collector in the port, so a valid e-mail goes straight to
 * the success state; the error state is the reference's own validation path
 * (`.form__field--u-ixj6u7qa9.is-error .text--u-i0fta0jg1 { display: flex }` in
 * `design.css` shows the `error-text` message = `homepage.popupError`).
 */

/** Taptop renders action targets as `<div href="/" role="button">`; React's
 *  types don't accept `href` on a div, so it is spread in loosely to keep the
 *  DOM identical to the reference. */
const orderAction = { href: "/", "data-action-element": "i4bbl7try_0" } as unknown as HTMLAttributes<HTMLDivElement>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The form body is its own component so the whole form state resets every time
 * the popup opens — the parent re-keys it on the closed → open edge (the same
 * trick the previous implementation used, which remounted the body).
 */
function PopupBody({ homepage }: { homepage: Homepage }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState("error");
      return;
    }
    // No backend collector — optimistic success.
    setState("success");
  };

  return (
    <div className={`form popup__form form--u-i1bnnq8cf${state === "success" ? " is-success" : ""}`} id="i1bnnq8cf_0">
      <form
        action="#"
        className="form__state-default popup__default-state"
        id="ia1dy20p3_0"
        data-s3-anketa-id="201209716"
        onSubmit={submit}
      >
        <div className="div popup__text-wrapper" id="iyk9q28qm_0">
          <div className="text headline--1 tc--main-black text--u-ixt89z1z0" id="ixt89z1z0_0">
            <span className="text-block-wrap-div">{homepage.popupHeading || "Stay ahead"}</span>
          </div>
          <div className="text popup__main-text tc--gray main-text" id="imcg0hehx_0">
            <span className="text-block-wrap-div">
              {homepage.popupText || "Launching soon. Get early access and insider updates"}
            </span>
          </div>
        </div>
        <div
          data-type-field="email"
          data-field-position=""
          className={`form__field popup__input-group button-title form__field--u-ixj6u7qa9${
            state === "error" ? " is-error" : ""
          }`}
          id="ixj6u7qa9_0"
        >
          <input
            placeholder={homepage.popupInputPlaceholder || "E-mail"}
            type="email"
            className="form__input popup__input tc--main-black-40 form__input--u-i9d6td3ac"
            id="i9d6td3ac_0"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") setState("idle");
            }}
          />
          <div className="form__field-error form__field-error--u-irrh8fhis" id="irrh8fhis_0">
            <span className="text-block-wrap-div">Это поле обязательно для заполнения</span>
          </div>
          <div className="text error-text text--u-i0fta0jg1" id="i0fta0jg1_0">
            <span className="text-block-wrap-div">{homepage.popupError || "Something went wrong! Try again"}</span>
          </div>
        </div>
        <button type="submit" className="submit_button popup__button submit_button--u-iau8fobkk" id="iau8fobkk_0">
          <span className="text-button button-title" id="izgubndmb_0">
            <span className="text-block-wrap-div">{homepage.popupButton || "Notify me"}</span>
          </span>
          <div className="div button__separator bc--main-white" id="iczvt8g41_0"></div>
        </button>
      </form>
      <div className="form__state-success form__state-success--u-i2th1p7i3" id="i2th1p7i3_0">
        <div className="text headline--1 text--u-iph0ejp0l" id="iph0ejp0l_0">
          <span className="text-block-wrap-div">{homepage.popupSuccess || "All set. We’ll keep you posted"}</span>
        </div>
      </div>
      <div className="form__state-error" id="i6l34jarn_0">
        <div className="form__text-error" id="iw5psryjc_0">
          <span className="text-block-wrap-div">Что-то не так. Попробуйте позже</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderPopup({
  homepage,
  product,
  open,
  onClose
}: {
  homepage: Homepage;
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [formKey, setFormKey] = useState(0);

  // The reference modal carries no product copy or media (`product` stays part
  // of the component contract for the provider in `chrome.tsx`).
  void product;

  // Reset the body on every closed → open edge (React's "adjust state when a
  // prop changes" pattern — no effect, no extra commit).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  // `scrollLock: true` in the reference's tt_modal settings.
  useEffect(() => {
    setScrollLock(open, "order-popup");
    return () => setScrollLock(false, "order-popup");
  }, [open]);

  // Show / hide: `effect: "fade"`, 200 ms linear both ways.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReduced();

    if (open) {
      shown.current = true;
      gsap.killTweensOf(el);
      if (reduced) {
        gsap.set(el, { display: "flex", opacity: 1 });
        return;
      }
      gsap.set(el, { display: "flex", opacity: 0 });
      gsap.to(el, { opacity: 1, duration: 0.2, ease: "none" });
      return;
    }

    if (!shown.current) return;
    shown.current = false;
    const hide = () => gsap.set(el, { display: "none", opacity: 0 });
    if (reduced) {
      hide();
      return;
    }
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 0, duration: 0.2, ease: "none", onComplete: hide });
  }, [open]);

  return (
    <div ref={root} className="pop-up popup" id="i4bbl7try_0" style={{ display: "none", opacity: 0 }}>
      <div className="pop-up__overlay popup__overlay" id="iawuv6seo_0" onClick={onClose}></div>
      <div className="pop-up__outside-close-button" id="i6xdvj65k_0" onClick={onClose}></div>
      <div className="pop-up__content popup__content bc--main-white text-align--center" id="ioqucvwmp_0">
        <PopupBody key={formKey} homepage={homepage} />
        <div className="pop-up__inside-close-button popup__button-close" id="irss7rao5_0" onClick={onClose}></div>
        <div
          {...orderAction}
          role="button"
          className="link button-title popup__close tc--gray"
          id="i0s0s0e83_0"
          onClick={onClose}
        >
          <span className="text-block-wrap-div">{homepage.popupClose || "Close"}</span>
        </div>
      </div>
    </div>
  );
}
