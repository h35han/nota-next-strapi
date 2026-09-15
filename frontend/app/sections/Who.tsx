"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Audience, Product } from "../../lib/api";

/**
 * Who — the dark editorial section that follows the curtain transition.
 *
 * This file renders BOTH parallel reference families in one component:
 *
 *   • desktop: `section who` (id `iihsgh87l_0`)
 *   • mobile:  `section who--static` (id `icu3mt31j_0`)
 *
 * The vendored CSS toggles them at 991px and the header colour switch
 * for ≤991px relies on `.who--static` existing, so both must be in the DOM.
 *
 * All of the scroll animation lives in `lib/taptop/engine.ts` and is driven
 * purely by the ids kept below (`icl4n9v4o_0`, `ihde6yg8u_0`, `itb9e5l3d_0`,
 * `ik5hhc3hg_0`, …). The one thing the spec does NOT cover is the
 * character-by-character colour scrub on `.who__text1`, ported by hand from
 * `.reference/scripts/inline_11.js` (see `useEffect` below).
 */

/* ------------------------------------------------------------------ *
 * Reference copy — used only when Strapi returns nothing (CMS offline).
 * ------------------------------------------------------------------ */
const FALLBACK_INTRO_1 =
  "Some thoughts need time, space, and a physical trace to exist. Writing by hand creates focus, presence, and a deeper connection with ideas. This tool is built around that simple truth.";

const FALLBACK_INTRO_2 =
  "This tool is made for people who think on paper. It keeps handwriting natural and focused, letting you write the way you always have without distractions or screens getting in the way. Everything you write syncs to the app, where your notes are organized, searchable, and ready to work with AI when you need more clarity or structure.";

const FALLBACK_AUDIENCES: Audience[] = [
  {
    title: "Students & Learners",
    description:
      "Handwritten notes stay personal and intuitive, but become searchable, organized, and easy to study. Lectures, ideas, and revisions are captured as they are — then supported by AI summaries, text recognition, and quick navigation when it matters most."
  },
  {
    title: "Creators, Designers & Architects",
    description:
      "Sketches, diagrams, concepts, and fragments of ideas belong on paper. This tool makes sure they don’t disappear. Everything drawn or written is safely stored, easy to revisit, and ready to evolve into something bigger — without interrupting the creative flow."
  },
  {
    title: "Managers & Product Thinkers",
    description:
      "Meetings start on paper and end with structure. Notes turn into clear summaries, tasks, and follow-ups. The pen captures everything quietly, while the app helps organize decisions without pulling attention away from the room."
  }
];

/**
 * Desktop theses: the reference gives each `list__item` its own element id
 * (unlike the mobile family, where all three share one base id + `_0/_1/_2`).
 * Kept as literals so the emitted ids/classes match the reference exactly.
 */
const DESKTOP_AUDIENCE_SLOTS = [
  { item: "itb9e5l3d", headline: "ivhudvuif", text: "iyz2ozahi" },
  { item: "iokgtfg7u", headline: "iks7asa8y", text: "ig4caj5z3" },
  { item: "i4n4t5k9h", headline: "in999wsfy", text: "iptbcpcgv" }
];

/**
 * The four `<p>` slots the reference uses inside `descriptor__wrapper`.
 * `who_for_intro` supplies two paragraphs; the reference hard-codes four
 * lines. Extra paragraphs reuse the last slot's id base with their index as
 * the suffix so ids stay unique.
 */
const DESCRIPTOR_SLOTS = [
  { id: "ivsr27ph3", className: "text--u-ivsr27ph3" },
  { id: "i3s4ihqft", className: "" },
  { id: "ixih3nkup", className: "text--u-ixih3nkup" },
  { id: "izrmswpdz", className: "" }
];

/**
 * The reference injects this small stylesheet at runtime
 * (`.reference/index.html`, before the inline_11 script) — it is not part of
 * the vendored CSS files, and it is what keeps `.who__text1` hidden until the
 * characters have been split, gives them their colour transition and gives
 * the space characters their width.
 */
const WHO_TEXT_STYLES = `
.who__text1 { visibility: hidden; display: inline-block !important; }
.who__text1-child { transition: color 0.15s linear; }
.space-char { display: inline-block; width: 0.27em; }
`;

export default function Who({ product, audiences }: { product: Product; audiences: Audience[] }) {
  const desktop = useRef<HTMLElement>(null);
  const text1 = useRef<HTMLParagraphElement>(null);

  /** The theses actually rendered: Strapi's list, or the reference copy. */
  const items = audiences.length > 0 ? audiences : FALLBACK_AUDIENCES;

  /**
   * Copy split, matching the reference exactly:
   *
   *   `.who__text1`        ← `product.about`      (the animated paragraph)
   *   `.descriptor__wrapper` ← `product.whoForIntro`, one `<p>` per
   *                            paragraph (the reference hard-codes the same
   *                            two paragraphs, split into four lines).
   */
  const intro = useMemo(() => {
    const paragraphs = (product.whoForIntro || "")
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      text1: product.about || FALLBACK_INTRO_1,
      paragraphs:
        paragraphs.length > 0
          ? paragraphs
          : [FALLBACK_INTRO_2]
    };
  }, [product.about, product.whoForIntro]);

  /** The reference collapses all whitespace before splitting into characters. */
  const text1Normalized = useMemo(
    () => intro.text1.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(),
    [intro.text1]
  );

  /**
   * Port of `.reference/scripts/inline_11.js`:
   *
   *   progress = (vh - rect.top) / rect.height
   *   progress = (progress - 0.28) / (1 - 0.28)
   *   progress = clamp(progress * 6, 0, 1)
   *   char i  ->  #FFFFFF when progress > i / chars.length, else #666666
   *
   * where `rect` is the desktop `.who` section's bounding rect. Runs on
   * scroll + resize through requestAnimationFrame, cleaned up on unmount,
   * and skipped under `prefers-reduced-motion` (the text is shown in its
   * final white state instead).
   */
  useEffect(() => {
    const section = desktop.current;
    const el = text1.current;
    if (!section || !el) return;

    const chars = Array.from(el.querySelectorAll<HTMLElement>("span"));
    // The reference un-hides the paragraph once the characters exist.
    el.style.visibility = "visible";
    if (chars.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      chars.forEach((char) => {
        char.style.color = "#FFFFFF";
      });
      return;
    }

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const startDelayRatio = 0.28;

      let progress = (vh - rect.top) / rect.height;
      progress = (progress - startDelayRatio) / (1 - startDelayRatio);
      progress = Math.max(0, Math.min(1, progress * 6));

      chars.forEach((char, i) => {
        const charProgress = Math.pow(i / chars.length, 1);
        char.style.color = progress > charProgress ? "#FFFFFF" : "#666666";
      });
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text1Normalized]);

  return (
    <>
      <style>{WHO_TEXT_STYLES}</style>

      {/* ---------------------------------------------------------------- *
       * Desktop — section who (hidden ≤991px by shared.css)
       * ---------------------------------------------------------------- */}
      <section className="section who section--u-iihsgh87l bc--main-black" id="iihsgh87l_0" ref={desktop}>
        <div className="container container--u-iwjz3acjp bc--main-black container--primary" id="iwjz3acjp_0">
          <div className="div who__text-content div--u-iduv2dwj8" id="iduv2dwj8_0">
            <div className="div who__camera" id="ioz9idhd5_0">
              <div className="div div--u-i3eaq51rs who__content" id="i3eaq51rs_0">
                <div className="div who__text-wrapper div--u-imbq5l3wt" id="imbq5l3wt_0">
                  <div className="div who__text1-wrapper div--u-icl4n9v4o" id="icl4n9v4o_0">
                    <p
                      className="text large-text--1 tc--main-white-40 who__text1 text--u-i0pakxea2"
                      id="i0pakxea2_0"
                      ref={text1}
                    >
                      {text1Normalized.split("").map((char, i) =>
                        char === " " ? (
                          <span key={i} className="who__text1-child space-char">
                            {"\u00a0"}
                          </span>
                        ) : (
                          <span key={i} className="who__text1-child">
                            {char}
                          </span>
                        )
                      )}
                    </p>
                  </div>
                  <div className="div who__text2-wrapper div--u-in3v5i2kx" id="in3v5i2kx_0">
                    <h2 className="text descriptor tc--main-white-40" id="ikpy8jjm3_0">
                      <span className="text-block-wrap-div">Who it&apos;s for:</span>
                    </h2>
                    <div className="div descriptor__wrapper div--u-iz0a3pmmg" id="iz0a3pmmg_0">
                      {intro.paragraphs.map((paragraph, i) => {
                        const slot =
                          DESCRIPTOR_SLOTS[i] ?? DESCRIPTOR_SLOTS[DESCRIPTOR_SLOTS.length - 1];
                        const suffix = i < DESCRIPTOR_SLOTS.length ? 0 : i;
                        return (
                          <p
                            key={i}
                            className={`text large-text--2 tc--main-white${
                              slot.className ? ` ${slot.className}` : ""
                            }`}
                            id={`${slot.id}_${suffix}`}
                          >
                            <span className="text-block-wrap-div">{paragraph}</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="list tc--main-white who__theses-wrapper list--u-ihde6yg8u" id="ihde6yg8u_0">
            {items.map((audience, i) => {
              const slot =
                DESKTOP_AUDIENCE_SLOTS[i] ?? DESKTOP_AUDIENCE_SLOTS[DESKTOP_AUDIENCE_SLOTS.length - 1];
              const suffix = i < DESKTOP_AUDIENCE_SLOTS.length ? 0 : i;
              return (
                <div
                  key={`${audience.title}-${i}`}
                  className={`list__item thesis__content list__item--u-${slot.item}`}
                  id={`${slot.item}_${suffix}`}
                >
                  <h3
                    className={`text headline--3 text--u-${slot.headline} thesis__headline--width`}
                    id={`${slot.headline}_${suffix}`}
                  >
                    <span className="text-block-wrap-div">{audience.title}</span>
                  </h3>
                  <p
                    className={`text main-text text--u-${slot.text} thesis__text--width`}
                    id={`${slot.text}_${suffix}`}
                  >
                    <span className="text-block-wrap-div">{audience.description}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <div className="div who__video-content div--u-ipm7pwexx" id="ipm7pwexx_0">
            <div className="div who__video-camera" id="icdqqzkqb_0">
              <div className="div who__video-wrapper div--u-i9ofq89ai" id="i9ofq89ai_0">
                <video
                  src={product.whoVideo || undefined}
                  poster=""
                  preload="metadata"
                  playsInline
                  muted
                  className="video video--u-ik5hhc3hg who__video video--s2-ik5hhc3hg"
                  id="ik5hhc3hg_0"
                ></video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * Mobile — section who--static (hidden >991px by shared.css)
       * ---------------------------------------------------------------- */}
      <section className="section bc--main-black section--u-icu3mt31j who--static" id="icu3mt31j_0">
        <div className="container container--u-ijm5pjabb who__camera--static" id="ijm5pjabb_0">
          <div className="div div--u-i4rhc9y2t who__content--static" id="i4rhc9y2t_0">
            <div className="div div--u-iji4b2nx9 who__text-wrapper--static" id="iji4b2nx9_0">
              <div className="div who__text1-wrapper--static" id="in96x4mr5_0">
                <p className="text large-text--1 tc--main-white" id="iwqe5b6fn_0">
                  <span className="text-block-wrap-div">{intro.text1}</span>
                </p>
              </div>
              <div className="div div--u-it941ll5n who__text2-wrapper--static" id="it941ll5n_0">
                <h2 className="text descriptor tc--main-white-40" id="i8c9qivfs_0">
                  <span className="text-block-wrap-div">Who it&apos;s for:</span>
                </h2>
                <div className="div div--u-i7y4sob0o descriptor__wrapper--static" id="i7y4sob0o_0">
                  {intro.paragraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text large-text--2 tc--main-white"
                      id={i === 0 ? "idpcsvwdq_0" : `idpcsvwdq_${i}`}
                    >
                      <span className="text-block-wrap-div">{paragraph}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="list tc--main-white who__theses-wrapper--static" id="ivb8l3mrf_0">
                {items.map((audience, i) => (
                  <div
                    key={`${audience.title}-${i}`}
                    className="list__item list__item--u-iqh75ga2q thesis__content--static"
                    id={`iqh75ga2q_${i}`}
                  >
                    <h3
                      className="text headline--3 text--u-iqb0c71dh thesis__headline--width-static"
                      id={`iqb0c71dh_${i}`}
                    >
                      <span className="text-block-wrap-div">{audience.title}</span>
                    </h3>
                    <p
                      className="text main-text text--u-izp7smx3s thesis__text--width-static"
                      id={`izp7smx3s_${i}`}
                    >
                      <span className="text-block-wrap-div">{audience.description}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="div div--u-i1fv3adl9 who__video-wrapper-static" id="i1fv3adl9_0">
              <video
                src={product.whoVideo || undefined}
                poster=""
                preload="metadata"
                playsInline
                muted
                className="video video--u-i94q53ujh who__video--static video--s2-i94q53ujh"
                id="i94q53ujh_0"
              ></video>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
