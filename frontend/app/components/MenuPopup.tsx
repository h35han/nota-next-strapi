"use client";

import { useEffect, useRef, useSyncExternalStore, type HTMLAttributes, type MouseEvent } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Product } from "../../lib/api";
import { useOrder } from "./chrome";
import { scrollToId } from "../../lib/smooth";

/**
 * Menu popup — the full-screen mobile menu opened by the header burger
 * (`#inv6md7ga_0`). Reference block `ia59t8n6n_0` (`.reference/index.html`
 * lines 130-248).
 *
 * The reference drives it with Taptop's CLICK animation `3304598187`
 * (`.reference/animations_full.json`), which is disabled on the `screen`
 * breakpoint and only enabled at `(max-width: 991px)`:
 *
 *   burger `#inv6md7ga_0`  MOVE    y -100% → 0%  (duration 1, delay 0.1,
 *                                                 ease power1.inOut)
 *                          OPACITY 0 → 1         (duration 0.1)
 *   close  `#ipl6q5707_0`  MOVE    y 0% → -100%  (duration 1, ease power1.inOut)
 *   links / logo           MOVE    y 0% → -100%  (delay 0.3)
 *
 * Vendored CSS ships `.div--u-ia59t8n6n { display: none }` at ≤991px as the
 * "before" state — the reference runtime reveals the node inline, which is what
 * the `display: flex` below does.
 *
 * The reference's own `tt_modal`/CLICK settings carry no `scrollLock`, so the
 * page keeps scrolling behind the menu.
 */

/** Taptop renders action targets as `<div href="/" role="button">`; React's
 *  types don't accept `href` on a div, so it is spread in loosely to keep the
 *  DOM identical to the reference. */
const orderAction = { href: "/", "data-action-element": "i4bbl7try_0" } as unknown as HTMLAttributes<HTMLDivElement>;
const footerPopupAction = {
  href: "/",
  "data-action-element": "i8n40m1el_0"
} as unknown as HTMLAttributes<HTMLDivElement>;

/** The menu only exists below Taptop's desktop breakpoint. */
const MENU_QUERY = "(max-width: 991px)";

function subscribeMenuQuery(onChange: () => void): () => void {
  const mq = window.matchMedia(MENU_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function menuQueryMatches(): boolean {
  return window.matchMedia(MENU_QUERY).matches;
}

type MenuLink = { label: string; target: string; anchorId: string; textId: string };

/**
 * The four `popup__link-block` anchors. The reference points them at the
 * `*-static` section ids (`i9uqhe1cp_0`, `icu3mt31j_0`, `ixv7fgfun_0`,
 * `ipavj5rd0_0`) because this menu only ever appears at ≤991px, where the
 * `*-static` half of each section is the visible one.
 */
const MENU_LINKS: MenuLink[] = [
  { label: "Specifications", target: "i9uqhe1cp_0", anchorId: "ihw171frl_0", textId: "i4mzfrolf_0" },
  { label: "Who it's for", target: "icu3mt31j_0", anchorId: "ib1x5kcx2_0", textId: "iho0azm02_0" },
  { label: "About", target: "ixv7fgfun_0", anchorId: "iscqffjt9_0", textId: "ilrhkebp2_0" },
  { label: "Inside the box", target: "ipavj5rd0_0", anchorId: "i23jxciyu_0", textId: "iwhlxe8zz_0" }
];

/**
 * The three responsive slots the reference uses for the order artwork. All of
 * them are fed from the single `product.popup_image` media field — the
 * reference swaps in differently sized crops at each breakpoint via CSS, but
 * the CMS exposes one asset, so the same URL serves all three.
 */
const ORDER_IMG_SIZES = { lg: "1472x1008", md: "896x578", sm: "600x590" };

function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MenuPopup({
  open,
  onClose,
  product
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
}) {
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  // The CLICK animation is disabled above 991px, so the menu only exists there.
  const isMobile = useSyncExternalStore(subscribeMenuQuery, menuQueryMatches, () => false);

  /**
   * Slide the menu back up (`MOVE y 0% → -100%`, duration 1, ease power1.inOut)
   * and tell the parent to close. `delay` matches the reference: `0` for the
   * close button, `0.3` for the anchors, whose CLICK effects are delayed by
   * 300 ms so the in-page scroll starts first.
   */
  const slideOut = (delay: number) => {
    const el = root.current;
    shown.current = false;
    if (el) {
      gsap.killTweensOf(el);
      if (prefersReduced()) {
        gsap.set(el, { y: 0, yPercent: -100, opacity: 0, display: "none" });
      } else {
        gsap.to(el, {
          yPercent: -100,
          duration: 1,
          delay,
          ease: "power1.inOut",
          onComplete: () => gsap.set(el, { display: "none" })
        });
      }
    }
    onClose();
  };

  // Show / hide. Enter: MOVE y -100% → 0% (delay 0.1, duration 1) + OPACITY
  // 0 → 1 (duration 0.1); exit (close button or parent): MOVE y 0% → -100%.
  useEffect(() => {
    const el = root.current;
    if (!el || !isMobile) return;
    const reduced = prefersReduced();

    if (open) {
      shown.current = true;
      gsap.killTweensOf(el);
      if (reduced) {
        gsap.set(el, { display: "flex", y: 0, yPercent: 0, opacity: 1 });
        return;
      }
      gsap.set(el, { display: "flex", y: 0, yPercent: -100, opacity: 0 });
      const tl = gsap.timeline();
      tl.to(el, { yPercent: 0, duration: 1, delay: 0.1, ease: "power1.inOut" }, 0);
      tl.to(el, { opacity: 1, duration: 0.1, ease: "power1.inOut" }, 0);
      return () => {
        tl.kill();
      };
    }

    // `slideOut` already ran for the anchors — nothing to animate here.
    if (!shown.current) return;
    shown.current = false;
    gsap.killTweensOf(el);
    const hide = () => gsap.set(el, { display: "none" });
    if (reduced) {
      gsap.set(el, { yPercent: -100, opacity: 0 });
      hide();
      return;
    }
    gsap.to(el, { yPercent: -100, duration: 1, ease: "power1.inOut", onComplete: hide });
  }, [open, isMobile]);

  // `openMenu` is provided by the orchestrator's `OrderProvider`; read the
  // context defensively so a missing member can never throw here.
  const ctx = useOrder() as { openOrder?: () => void; openMenu?: () => void };

  const goTo = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    scrollToId(target);
    slideOut(0.3);
  };

  const openOrderThenClose = () => {
    ctx.openOrder?.();
    onClose();
  };

  if (!isMobile) return null;

  return (
    <div
      ref={root}
      className="div popup-menu div--u-ia59t8n6n"
      id="ia59t8n6n_0"
      style={{ display: "none", transform: "translateY(-100%)", opacity: 0 }}
    >
      <div className="div popup-menu__content" id="iwb7xtely_0">
        <div className="div popup-menu__top" id="i7yxpx1og_0">
          <div className="div popup__header" id="iqoa82cnv_0">
            <div className="div header__links" id="i861zqqqm_0">
              {/* The reference points its logo at `/main`; the port only has `/`. */}
              <Link
                href="/"
                data-action-element=""
                className="link-block header__logo-link"
                id="it5glpme6_0"
                onClick={() => slideOut(0.3)}
              >
                <span className="svg-icon tc--main-black header__icon--static" id="i05ec6pq6_0">
                  <svg width="71" height="26" viewBox="0 0 71 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.26969 7.45499H3.91969V24.99H-0.000313967V0.55999H5.63469L12.0397 18.095H12.3897V0.55999H16.3097V24.99H10.6747L4.26969 7.45499ZM20.776 -1.13845e-05H31.206V3.21999H20.776V-1.13845e-05ZM25.991 25.41C24.6143 25.41 23.3777 25.1883 22.281 24.745C21.2077 24.3017 20.286 23.6717 19.516 22.855C18.7693 22.0383 18.186 21.0467 17.766 19.88C17.3693 18.7133 17.171 17.4067 17.171 15.96C17.171 14.5133 17.3693 13.2067 17.766 12.04C18.186 10.8733 18.7693 9.88166 19.516 9.06499C20.286 8.24832 21.2077 7.61832 22.281 7.17499C23.3777 6.73166 24.6143 6.50999 25.991 6.50999C27.3443 6.50999 28.5693 6.73166 29.666 7.17499C30.7627 7.61832 31.6843 8.24832 32.431 9.06499C33.201 9.88166 33.7843 10.8733 34.181 12.04C34.601 13.2067 34.811 14.5133 34.811 15.96C34.811 17.4067 34.601 18.7133 34.181 19.88C33.7843 21.0467 33.201 22.0383 32.431 22.855C31.6843 23.6717 30.7627 24.3017 29.666 24.745C28.5693 25.1883 27.3443 25.41 25.991 25.41ZM25.991 21.98C27.2743 21.98 28.2893 21.595 29.036 20.825C29.7827 20.0317 30.156 18.8767 30.156 17.36V14.56C30.156 13.0433 29.7827 11.9 29.036 11.13C28.2893 10.3367 27.2743 9.93999 25.991 9.93999C24.7077 9.93999 23.6927 10.3367 22.946 11.13C22.1993 11.9 21.826 13.0433 21.826 14.56V17.36C21.826 18.8767 22.1993 20.0317 22.946 20.825C23.6927 21.595 24.7077 21.98 25.991 21.98ZM45.0523 24.99C43.3257 24.99 42.054 24.535 41.2373 23.625C40.4207 22.715 40.0123 21.5367 40.0123 20.09V10.465H34.7623V6.92999H38.3323C39.0557 6.92999 39.569 6.78999 39.8723 6.50999C40.1757 6.20666 40.3273 5.68166 40.3273 4.93499V0.55999H44.4923V6.92999H51.8423V10.465H44.4923V21.455H51.8423V24.99H45.0523ZM68.3137 24.99C67.217 24.99 66.3653 24.7217 65.7587 24.185C65.1753 23.625 64.8253 22.855 64.7087 21.875H64.5337C64.207 22.995 63.5653 23.87 62.6087 24.5C61.652 25.1067 60.4737 25.41 59.0737 25.41C57.2537 25.41 55.807 24.9317 54.7337 23.975C53.6603 23.0183 53.1237 21.6883 53.1237 19.985C53.1237 16.345 55.7953 14.525 61.1387 14.525H64.3237V13.335C64.3237 12.1917 64.0437 11.3283 63.4837 10.745C62.9237 10.1617 62.0137 9.86999 60.7537 9.86999C59.6103 9.86999 58.6887 10.0917 57.9887 10.535C57.2887 10.9783 56.6937 11.55 56.2037 12.25L53.6487 10.08C54.2087 9.07666 55.107 8.23666 56.3437 7.55999C57.6037 6.85999 59.2253 6.50999 61.2087 6.50999C63.5887 6.50999 65.4437 7.06999 66.7737 8.18999C68.127 9.28666 68.8037 10.9317 68.8037 13.125V21.63H70.9387V24.99H68.3137ZM60.5787 22.33C61.652 22.33 62.5387 22.085 63.2387 21.595C63.962 21.0817 64.3237 20.3933 64.3237 19.53V17.115H61.2437C58.7937 17.115 57.5687 17.885 57.5687 19.425V20.125C57.5687 20.8483 57.837 21.3967 58.3737 21.77C58.9103 22.1433 59.6453 22.33 60.5787 22.33Z" fill="white"/>
                  </svg>
                </span>
              </Link>
              <div className="div header__button-close" id="ipl6q5707_0" onClick={onClose}>
                <span className="svg-icon svg-icon--u-i4examruo header__close-icon" id="i4examruo_0">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.6455 9.64502L21.998 10.0015L22.3496 10.3501L22.7061 10.7065L21.1338 12.2788L20.7236 12.6929L20.3838 13.0288L19.7061 13.7065L19.708 13.7085L19.4053 14.0073L18.7744 14.6382L18.4873 14.9243L18.1885 15.2241L17.8486 15.564L17.5615 15.8501L17.4111 15.9995L17.5615 16.1499L17.8896 16.4731L18.1768 16.7642L19.4014 17.9888L19.708 18.2915L19.7051 18.2935L19.9082 18.4966L20.3389 18.9263L20.707 19.2954L21.4893 20.0776L21.8789 20.4663L22.251 20.8394L22.7061 21.2935L22.3535 21.646L21.9971 21.9985L21.6455 22.354L21.293 22.7065L20.8379 22.2524L20.4658 21.8794L18.293 19.7065L18.291 19.7085L17.9883 19.4019L17.6807 19.0942L17.3535 18.771L17.0664 18.48L16.1777 17.5913L15.999 17.4116L15.8828 17.5298L15.5752 17.8364L15.2275 18.1851L14.9277 18.4839L14.3584 19.0532L14.0068 19.4058L13.708 19.7085L13.7051 19.7056L13.4697 19.9419L13.1387 20.2739L12.2783 21.1343L11.9502 21.4614L11.5449 21.8667L11.0986 22.314L10.7051 22.7065L10.3496 22.3501L10.001 21.9985L9.64453 21.646L9.29297 21.2935L9.72656 20.8599L10.1357 20.4497L10.5371 20.0483L10.8652 19.7212L11.3076 19.2788L11.6924 18.8892L12.0449 18.5376L12.292 18.2925L12.291 18.2915L12.5938 17.9927L12.8848 17.6978L13.1953 17.3862L13.5156 17.0669L13.8262 16.7593L14.1338 16.4526L14.4248 16.1616L14.583 16.0015L14.4365 15.855L14.1133 15.5308L13.8184 15.2319L13.5068 14.9243L13.1914 14.605L12.5898 14.0034L12.4336 13.8462V13.8472L11.6475 13.061L11.2539 12.6685L10.8691 12.2827L10.1113 11.5249L9.73047 11.1489L9.29297 10.7065L9.64453 10.354L10.001 10.0015L10.3535 9.64502L10.7051 9.29346L11.1152 9.69873L11.4883 10.0757L12.6836 11.271L13.0273 11.6157L13.4375 12.021L13.8145 12.4028L14.0029 12.5903L14.335 12.9175L14.6211 13.2085L14.9238 13.5073L15.2236 13.8071L15.543 14.1304L15.8496 14.437L15.998 14.5835L16.1738 14.4087L16.5098 14.0767L16.792 13.7905L17.3535 13.229L17.6641 12.9175L17.9922 12.5942L18.291 12.2915L18.293 12.2925L21.293 9.29346L21.6455 9.64502Z" fill="black"/>
                  </svg>
                </span>
                <span className="svg-icon svg-icon--u-i77x6gt45 header__close-icon" id="i77x6gt45_0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.9934 10.1138L12.19 10.3049L12.4631 10.5834L12.9382 11.0585L13.4078 11.5282L13.6863 11.8067L13.8829 11.9978L13.6863 12.1944L13.4078 12.4729L12.9382 12.9426L12.4685 13.4122L12.1955 13.6853L11.9934 13.8873L11.8023 13.6907L11.5238 13.4122L11.0541 12.9426L10.579 12.4675L10.3005 12.1944L10.1094 11.9978L10.3114 11.8012L10.5845 11.5282L11.0541 11.0585L11.5238 10.5889L11.8023 10.3049L11.9934 10.1138Z" fill="black"/>
                    <path d="M5.49264 3.59874L5.9896 4.10116L6.50293 4.61449L7.04903 5.16059L7.58421 5.69577L8.04293 6.15449L8.58903 6.69513L9.13513 7.24669L8.66548 7.71634L8.19038 8.18598L7.72073 8.66109L7.25109 9.13074L6.75414 8.63379L6.20257 8.08222L5.67832 7.55797L5.16498 7.04463L4.70626 6.58591L4.1547 6.03435L3.64683 5.53194L3.0625 4.94215L3.53215 4.4725L4.00725 4.00286L4.4769 3.52775L4.94654 3.05811L5.49264 3.59874Z" fill="black"/>
                    <path d="M9.33503 7.45428L9.77737 7.89116L10.1596 8.2789L10.5638 8.67755L10.9624 9.0762L11.3884 9.50762L11.7979 9.9172L12.1911 10.3049L11.716 10.78L11.2464 11.2497L10.7767 11.7193L10.3016 12.1944L9.9139 11.8067L9.48248 11.3753L9.08929 10.9766L8.67425 10.5671L8.25376 10.1411L7.86056 9.7479L7.45099 9.33833L7.04688 8.93422L7.52198 8.46457L7.99163 7.99492L8.46127 7.52528L8.93092 7.05017L9.33503 7.45428Z" fill="black"/>
                    <path d="M18.5151 3.60421L19.0612 3.05811L19.5309 3.52775L20.0005 4.00286L20.4702 4.46704L20.9453 4.94215L20.3992 5.48825L19.9132 5.97428L19.3889 6.49853L18.8483 7.03917L18.3022 7.59073L17.8489 8.03854L17.3083 8.57918L16.7512 9.1362L16.2761 8.66109L15.8119 8.19144L15.3368 7.71634L14.8672 7.25215L15.3751 6.74428L15.9375 6.1818L16.4509 5.66846L16.9642 5.15513L17.5212 4.59811L18.0127 4.10662L18.5151 3.60421Z" fill="black"/>
                    <path d="M14.6553 7.45978L15.054 7.05566L15.5236 7.52531L15.9987 8.00042L16.4684 8.47006L16.9435 8.94517L16.5394 9.34382L16.0752 9.80801L15.6984 10.1848L15.3161 10.5671L14.9175 10.9657L14.4642 11.419L14.0819 11.8013L13.6887 12.1945L13.2191 11.7194L12.7494 11.2497L12.2743 10.7746L11.8047 10.305L12.2306 9.879L12.6784 9.43666L13.0553 9.05439L13.4266 8.68304L13.8034 8.30623L14.2184 7.8912L14.6553 7.45978Z" fill="black"/>
                    <path d="M17.2131 15.329L17.7865 15.9024L18.278 16.3939L18.8404 16.9564L19.321 17.437L19.8398 17.9558L20.3368 18.4527L20.9429 19.0589L20.4733 19.5285L19.9982 19.9982L19.5285 20.4733L19.0589 20.9429L18.4527 20.3368L17.9558 19.8398L17.4315 19.3156L16.9564 18.8404L16.3557 18.2397L15.8424 17.7264L15.3454 17.2294L14.8594 16.7434L15.329 16.2738L15.7987 15.7987L16.2738 15.329L16.7434 14.8594L17.2131 15.329Z" fill="black"/>
                    <path d="M14.0819 12.1998L14.5188 12.6313L14.9011 13.019L15.3052 13.4231L15.7475 13.8654L16.1353 14.2532L16.5339 14.6518L16.9435 15.0559L16.4684 15.531L15.9933 15.9952L15.5291 16.4703L15.054 16.9454L14.6499 16.5359L14.2403 16.1263L13.8034 15.6949L13.4211 15.3071L12.9952 14.8812L12.6184 14.5044L12.2361 14.1221L11.8047 13.6907L12.2743 13.221L12.7494 12.7514L13.2191 12.2763L13.6887 11.8066L14.0819 12.1998Z" fill="black"/>
                    <path d="M6.73229 15.3837L7.25655 14.8649L7.72073 15.3345L8.19584 15.8096L8.66548 16.2738L9.14059 16.7489L8.63272 17.2568L8.19038 17.6991L7.60059 18.2889L7.04357 18.8459L6.60669 19.2828L6.06605 19.8235L5.4708 20.4187L4.94654 20.943L4.47144 20.4679L4.00725 19.9982L3.53215 19.5286L3.0625 19.0589L3.64137 18.4801L4.18747 17.934L4.72264 17.3988L5.15952 16.9619L5.74931 16.3721L6.26265 15.8533L6.73229 15.3837Z" fill="black"/>
                    <path d="M9.89987 12.2163L10.3149 11.8013L10.7791 12.2709L11.2542 12.746L11.7238 13.2102L12.1989 13.6853L11.844 14.0403L11.4344 14.4499L10.9702 14.914L10.5716 15.3127L10.2002 15.684L9.81249 16.0718L9.34285 16.5414L8.94419 16.9455L8.46909 16.4704L7.99398 15.9953L7.52433 15.5257L7.05469 15.056L7.4588 14.6574L7.84653 14.2642L8.26157 13.8491L8.68753 13.4232L9.10256 13.0136L9.51214 12.604L9.89987 12.2163Z" fill="black"/>
                  </svg>
                </span>
              </div>
              <div className="div button__logo" id="i7dtwvtf7_0">
                <span className="svg-icon svg-icon--u-impg1sog4" id="impg1sog4_0">
                  <svg width="38" height="40" viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M27.0312 1.1884C31.7136 -1.90761 38 1.40597 38 6.97004V33.0299C38 38.594 31.7136 41.9076 27.0312 38.8116L17.5942 32.5713C16.9615 33.4443 16.2103 34.2855 15.3465 35.0654C10.678 39.2805 4.50065 40.114 1.54904 36.927C-1.40256 33.74 -0.0107507 27.7393 4.65782 23.5242C5.5628 22.7071 6.52483 22.0177 7.50871 21.4594C6.54119 20.7959 5.60885 20.0135 4.7394 19.1165C-0.396448 13.818 -1.40163 6.53831 2.49429 2.85682C6.39026 -0.824661 13.7122 0.486304 18.8481 5.78487C19.0157 5.9578 19.1787 6.13298 19.3375 6.30992C19.5007 6.17973 19.6697 6.05598 19.8449 5.94015L27.0312 1.1884ZM20.3604 12.7063C16.0229 12.7063 12.5066 16.1781 12.5066 20.4608C12.5066 24.7436 16.0228 28.2156 20.3604 28.2156C24.698 28.2156 28.2145 24.7436 28.2145 20.4608C28.2144 16.1781 24.698 12.7063 20.3604 12.7063Z" fill="black"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <nav className="div popup__links-wrapper" id="iiwkgm53w_0">
            {MENU_LINKS.map((link) => (
              <a
                key={link.anchorId}
                href={`#${link.target}`}
                data-action-element=""
                rel="nofollow"
                target="_self"
                className="link-block popup__link-block"
                id={link.anchorId}
                onClick={(event) => goTo(event, link.target)}
              >
                <div className="text menu-link tc--main-black" id={link.textId}>
                  <span className="text-block-wrap-div">{link.label}</span>
                </div>
              </a>
            ))}
          </nav>
        </div>
        <div
          {...orderAction}
          role="button"
          className="link-block popup__order"
          id="ijw9y5jkj_0"
          onClick={openOrderThenClose}
        >
          <div className="div popup__img-wrapper" id="iz8c5lqta_0">
            <div className="image popup-img768" id="i4ezeljxj_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.popupImage || undefined}
                alt=""
                title=""
                data-size={ORDER_IMG_SIZES.lg}
                data-origin-src={product.popupImage || undefined}
                className="image__img"
                id="io13f18ks_0"
              />
            </div>
            <div className="image popup-img480" id="iwq9gkfvw_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.popupImage || undefined}
                alt=""
                title=""
                data-size={ORDER_IMG_SIZES.md}
                data-origin-src={product.popupImage || undefined}
                className="image__img"
                id="igf6l9rw1_0"
              />
            </div>
            <div className="image popup-img320" id="i2mf5vifa_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.popupImage || undefined}
                alt=""
                title=""
                data-size={ORDER_IMG_SIZES.sm}
                data-origin-src={product.popupImage || undefined}
                className="image__img"
                id="ic1pethtz_0"
              />
            </div>
          </div>
          <div className="div button-order__content div--u-i1q2yjhgv" id="i1q2yjhgv_0">
            <div className="div button-order__texts" id="ikche88ih_0">
              <div className="text button-title tc--main-white" id="iynhujwhb_0">
                <span className="text-block-wrap-div">{product.ctaLabel}</span>
              </div>
              <div className="text button-title tc--main-white-40" id="i5hday4sj_0">
                <span className="text-block-wrap-div">{product.name}</span>
              </div>
              <div className="div button__separator bc--main-white div--u-ivfvatlwp" id="ivfvatlwp_0"></div>
              <div className="text button-title tc--main-white" id="imvea5dtc_0">
                <span className="text-block-wrap-div">{product.ctaPrice}</span>
              </div>
            </div>
          </div>
        </div>
        {/* The reference's popup footer copy is hard-coded (this component has
            no homepage prop); the footer's own metadata is CMS-bound in
            `Footer`/`FooterPopup`. */}
        <div className="div popup__footer tc--gray" id="i8yf8ij7v_0">
          <div className="text footer-title text--u-itsuy8dcb" id="itsuy8dcb_0">
            <span className="text-block-wrap-div">@2026 Nōta Team</span>
          </div>
          <div className="div footer-designed div--u-ijgm8rjck" id="ijgm8rjck_0">
            <a
              href="https://www.behance.net/alicem"
              data-action-element=""
              target="_blank"
              className="link footer-title text-decoration--none tc--gray"
              id="im0kicjff_0"
            >
              <span className="text-block-wrap-div">{"Designed by Alice "}</span>
            </a>
            <a
              href="https://www.uprock.ru/"
              data-action-element=""
              target="_blank"
              className="link footer-title text-decoration--none tc--gray"
              id="ip3jye95h_0"
            >
              <span className="text-block-wrap-div">& UPROCK Studio</span>
            </a>
          </div>
          <div className="div footer-stroke div--u-i7wrlymwm" id="i7wrlymwm_0">
            <a
              href="https://taptop.pro/"
              data-action-element=""
              target="_blank"
              className="link footer-title text-decoration--none tc--gray"
              id="il8zr116d_0"
            >
              <span className="text-block-wrap-div">Made in Taptop</span>
            </a>
            <div className="div button__separator div--u-i2mch6nq9" id="i2mch6nq9_0"></div>
            {/* `data-action-element='i8n40m1el_0'` shows the footer/team popup,
                which no component inside the menu owns — kept as the reference
                action target but inert here. */}
            <div
              {...footerPopupAction}
              role="button"
              className="link footer-title text-decoration--none tc--gray"
              id="ipvka133e_0"
            >
              <span className="text-block-wrap-div">Builded by NōtaTeam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
