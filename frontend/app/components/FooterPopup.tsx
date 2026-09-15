"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Homepage, TeamMember } from "../../lib/api";
import { setScrollLock } from "../../lib/smooth";

/**
 * Footer popup — the team card opened from the footer's "Builded by NōtaTeam"
 * link (reference block `i8n40m1el_0`, `data-action-element='i8n40m1el_0'`).
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
 */

/**
 * Element ids of the reference's nine `popup-link` anchors, matched
 * positionally to the Strapi `team-members` collection (`order` 0-4 land in
 * `footer-popup__list-top`, 5-8 in `footer-popup__list-bottom`, exactly as the
 * reference splits them).
 */
const LIST_TOP_IDS = ["i76dcqvj6_0", "iq13vujsn_0", "iqgub8xbx_0", "i2zpcvgmb_0", "i5rmm4jos_0"];
const LIST_BOTTOM_IDS = ["ilg9pyr6x_0", "inj58w0yf_0", "iyhgdr138_0", "i77rrbpqq_0"];

/** How many names the reference puts in `footer-popup__list-top`. */
const LIST_TOP_COUNT = 5;

function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function FooterPopup({
  open,
  onClose,
  homepage,
  team
}: {
  open: boolean;
  onClose: () => void;
  homepage: Homepage;
  /** The Strapi `team-member` collection, passed down by `Footer`. */
  team: TeamMember[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  const listTop = team.slice(0, LIST_TOP_COUNT);
  const listBottom = team.slice(LIST_TOP_COUNT);

  // `scrollLock: true` in the reference's tt_modal settings.
  useEffect(() => {
    setScrollLock(open, "footer-popup");
    return () => setScrollLock(false, "footer-popup");
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
    <div
      ref={root}
      className="pop-up pop-up--u-i8n40m1el footer-popup"
      id="i8n40m1el_0"
      style={{ display: "none", opacity: 0 }}
    >
      <div
        className="pop-up__overlay pop-up__overlay--u-i7eln75pr footer-popup__overlay"
        id="i7eln75pr_0"
        onClick={onClose}
      ></div>
      <div className="pop-up__outside-close-button" id="iobhdtjt1_0" onClick={onClose}></div>
      {/* `aria-label` is the one addition to the reference node: the popup is
          the team behind the "Builded by NōtaTeam" action, and its metadata
          comes from the homepage single type. */}
      <div
        className="pop-up__content pop-up__content--u-ita86m2cj bc--main-radial footer-popup__list"
        id="ita86m2cj_0"
        aria-label={homepage.footerBuiltBy}
      >
        <div className="div footer-popup__list-top" id="iu4bpxwq2_0">
          {listTop.map((member, i) => (
            <a
              key={`${member.name}-${i}`}
              href={`https://telegram.me/${member.telegram}`}
              data-action-element=""
              target="_blank"
              className="link popup-link"
              id={LIST_TOP_IDS[i] ?? undefined}
            >
              <span className="text-block-wrap-div">{member.name}</span>
            </a>
          ))}
        </div>
        <div className="div footer-popup__list-bottom" id="idvyiz9zx_0">
          {listBottom.map((member, i) => (
            <a
              key={`${member.name}-${i}`}
              href={`https://telegram.me/${member.telegram}`}
              data-action-element=""
              target="_blank"
              className="link popup-link"
              id={LIST_BOTTOM_IDS[i] ?? undefined}
            >
              <span className="text-block-wrap-div">{member.name}</span>
            </a>
          ))}
        </div>
        <div className="pop-up__inside-close-button footer-popup__close" id="ibg8u1pmu_0" onClick={onClose}></div>
      </div>
    </div>
  );
}
