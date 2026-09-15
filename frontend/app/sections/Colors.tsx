"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Draggable from "gsap/Draggable";
import type { ColorVariant } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger, Draggable);

/**
 * The desktop section hard-codes five variant slots — silver, graphite,
 * blue, red, orange — so the CMS `color-variant` collection maps onto them
 * one-to-one, in `order`. Nothing is invented here: a missing entry leaves
 * its slot blank rather than borrowing copy or artwork.
 */
const VARIANT_COUNT = 5;

/** Desktop breakpoint used by the reference (`.section-colors` ≥ 992px). */
const DESKTOP_QUERY = "(min-width: 992px)";

/** The reference wraps the last word of a tagline in a `white-space: normal`
 *  span (only the Precision Red slide does this) so it can wrap. */
function lastWord(text: string) {
  const at = text.lastIndexOf(" ");
  return at === -1 ? "" : text.slice(at + 1);
}

function lastWords(text: string) {
  const at = text.lastIndexOf(" ");
  return at === -1 ? text : `${text.slice(0, at)} `;
}

/**
 * GSAP-driven carousel for the mobile `section-colors--static` slider.
 *
 * The reference ships Swiper; we drive the same markup with GSAP instead so
 * the slides move on an explicit `x` transform rather than native
 * scrolling. That removes the whole class of bugs native scroll-snap
 * brought with it — a restored `scrollLeft`, images landing after hydration
 * or a snap point recalculated mid-drag could all leave the carousel on a
 * slide the index state disagreed with, which is what made the order look
 * wrong.
 *
 * `index` is the single source of truth: it positions the track, highlights
 * the bullet and updates the `n / 5` counter, and `Draggable` only ever
 * proposes a new index when the user lets go.
 */
function useCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  /** One slide is exactly one container width. */
  const slideWidth = () => trackRef.current?.parentElement?.clientWidth ?? 0;

  const place = useCallback(
    (next: number, animate: boolean) => {
      const track = trackRef.current;
      if (!track) return;
      const x = -next * slideWidth();
      if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(track, { x });
      } else {
        gsap.to(track, { x, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      }
    },
    []
  );

  const go = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(count - 1, next));
      indexRef.current = target;
      setIndex(target);
      place(target, true);
    },
    [count, place]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    place(0, false);

    const bounds = () => ({
      minX: -(count - 1) * slideWidth(),
      maxX: 0
    });

    const [draggable] = Draggable.create(track, {
      type: "x",
      allowNativeTouchScrolling: false,
      // Let the page scroll vertically while a horizontal drag is in play.
      allowContextMenu: true,
      bounds: bounds(),
      onDragEnd() {
        const width = slideWidth() || 1;
        go(Math.round(-this.x / width));
      }
    });

    const onResize = () => {
      draggable.applyBounds(bounds());
      // Re-seat the track: keep the same slide, new slide width.
      place(indexRef.current, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      draggable.kill();
      gsap.killTweensOf(track);
    };
  }, [count, go, place]);

  return { trackRef, index, go };
}

/** The five CMS `color-variant` entries, in `order`, padded so the fixed
 *  five-slot markup can index safely without inventing any content. */
function useVariants(colors: ColorVariant[]): ColorVariant[] {
  return Array.from(
    { length: VARIANT_COUNT },
    (_, i): ColorVariant => colors[i] ?? { name: "", tagline: "", image: "", accent: "light" }
  );
}

/**
 * ColorsStatic — the ≤991px carousel.
 *
 * Rendered by `page.tsx` as a *sibling before* `.scroll-wrapper`, exactly
 * where the reference puts it. That matters: `.footer` is
 * `position: sticky; bottom: -0.1vw`, so if this section lived inside the
 * wrapper the footer would pin over it and hide the slides.
 */
export function ColorsStatic({ colors }: { colors: ColorVariant[] }) {
  const variants = useVariants(colors);
  const { trackRef, index, go } = useCarousel(VARIANT_COUNT);

  return (
    <section className="section section-colors--static" id="ius70bmqv_0">
        <div className="slider section-colors__slider" id="ie29e5u5m_0">
          <div className="slider__wrapper section-colors__slider-wrapper" id="i0z78cl1f_0">
            <div
              className="slider__list section-colors__slider-list"
              id="izbvywgpp_0"
              ref={trackRef}
            >
              {/* Slide 1 — Silver */}
              <div className="slider__slide section-colors__slide-silver slider__slide--s2-igegjt1yn" id="igegjt1yn_0">
                <div className="div div--u-iaxd36ioi section-colors__wrapper-silver--static" id="iaxd36ioi_0">
                  <div className="image image--u-i8o9p2t8c section-colors__img-wrapper--static" id="i8o9p2t8c_0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variants[0].image || undefined}
                      alt={`${variants[0].name} smart fountain pen`}
                      title=""
                      data-size="1920x1080"
                      data-origin-src={variants[0].image || undefined}
                      className="image__img"
                      id="i0udvdo0v_0"
                    />
                  </div>
                  <div className="div section-colors__content-wrapper--static div--u-iy1egem8b" id="iy1egem8b_0">
                    <div className="div div--u-iljmlulud section-colors__text-wrapper--static" id="iljmlulud_0">
                      <p className="text large-text--3 text--u-ivsxz1j6z tc--main-white" id="ivsxz1j6z_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[0].name}</span>
                        </span>
                      </p>
                    </div>
                    <div className="div div--u-ibc2oyo2t section-colors__text-wrapper2--static" id="ibc2oyo2t_0">
                      <p className="text large-text--3 text--u-ic2b11bdf tc--main-white" id="ic2b11bdf_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[0].tagline}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 — Graphite Black */}
              <div
                className="slider__slide section-colors__slide-graphite slider__slide--s2-iuis433hf"
                id="iuis433hf_0"
              >
                <div className="div div--u-i45fa5fkt section-colors__wrapper-grafit--static" id="i45fa5fkt_0">
                  <div className="image image--u-ibr0i0kla section-colors__img-wrapper--static" id="ibr0i0kla_0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variants[1].image || undefined}
                      alt={`${variants[1].name} smart fountain pen`}
                      title=""
                      data-size="1920x1080"
                      data-origin-src={variants[1].image || undefined}
                      className="image__img"
                      id="iw31d5gy6_0"
                    />
                  </div>
                  <div className="div div--u-i7tswpu1l section-colors__content-wrapper2--static" id="i7tswpu1l_0">
                    <div className="div div--u-i305cy25f section-colors__text-wrapper3--static" id="i305cy25f_0">
                      <p className="text large-text--3 text--u-iaja1qn33 tc--main-white" id="iaja1qn33_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[1].name}</span>
                        </span>
                      </p>
                    </div>
                    <div className="div div--u-ioqwcioqu section-colors__text-wrapper3--static" id="ioqwcioqu_0">
                      <p className="text large-text--3 text--u-ixrqge1t1 tc--main-white" id="ixrqge1t1_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[1].tagline}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 — Mist Blue */}
              <div className="slider__slide section-colors__slide-blue slider__slide--s2-iaoojj58q" id="iaoojj58q_0">
                <div className="div section-colors__wrapper-blue--static" id="iecx9g97a_0">
                  <div className="image section-colors__img-wrapper--static image--u-ix7r3d3xd" id="ix7r3d3xd_0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variants[2].image || undefined}
                      alt={`${variants[2].name} smart fountain pen`}
                      title=""
                      data-size="1920x1080"
                      data-origin-src={variants[2].image || undefined}
                      className="image__img"
                      id="i1yt3v9nr_0"
                    />
                  </div>
                  <div className="div section-colors__content-wrapper--static div--u-i5fah4yk6" id="i5fah4yk6_0">
                    <div className="div section-colors__text-wrapper--static div--u-i9l815a9h" id="i9l815a9h_0">
                      <p className="text large-text--3 text--u-i3wow2x3u tc--main-white" id="i3wow2x3u_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[2].name}</span>
                        </span>
                      </p>
                    </div>
                    <div className="div section-colors__text-wrapper2--static div--u-iz21f4u9c" id="iz21f4u9c_0">
                      <p className="text large-text--3 text--u-iy1y4yr7s tc--main-white" id="iy1y4yr7s_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[2].tagline}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 — Precision Red */}
              <div className="slider__slide section-colors__slide-red" id="i25ex9nqk_0">
                <div className="div div--u-i3rp2axpr section-colors__wrapper-red--static" id="i3rp2axpr_0">
                  <div className="image image--u-iwfe6dvbn section-colors__img-wrapper--static" id="iwfe6dvbn_0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variants[3].image || undefined}
                      alt={`${variants[3].name} smart fountain pen`}
                      title=""
                      data-size="1920x1080"
                      data-origin-src={variants[3].image || undefined}
                      className="image__img"
                      id="itq0dmcbv_0"
                    />
                  </div>
                  <div className="div div--u-ii798v119 section-colors__content-wrapper2--static" id="ii798v119_0">
                    <div className="div div--u-i7dkirmi1 section-colors__text-wrapper3--static" id="i7dkirmi1_0">
                      <p className="text large-text--3 text--u-ir8cpdt4e tc--main-white" id="ir8cpdt4e_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[3].name}</span>
                        </span>
                      </p>
                    </div>
                    <div className="div div--u-i3u4zo3m2 section-colors__text-wrapper4--static" id="i3u4zo3m2_0">
                      <p className="text large-text--3 text--u-i0mtyaqa9 tc--main-white" id="i0mtyaqa9_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{lastWords(variants[3].tagline)}</span>
                          <span style={{ whiteSpace: "normal" }}>{lastWord(variants[3].tagline)}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 5 — Bright Orange */}
              <div className="slider__slide section-colors__slide-orange" id="ifryuwnay_0">
                <div className="div div--u-is4q98ru9 section-colors__wrapper-orange--static" id="is4q98ru9_0">
                  <div className="image image--u-iowie64ap section-colors__img-wrapper--static" id="iowie64ap_0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variants[4].image || undefined}
                      alt={`${variants[4].name} smart fountain pen`}
                      title=""
                      data-size="1920x1080"
                      data-origin-src={variants[4].image || undefined}
                      className="image__img"
                      id="igapw813c_0"
                    />
                  </div>
                  <div className="div div--u-io8bwd1tp section-colors__content-wrapper--static" id="io8bwd1tp_0">
                    <div className="div div--u-ikkyz9s95 section-colors__text-wrapper--static" id="ikkyz9s95_0">
                      <p className="text large-text--3 text--u-iub2ipvc9 tc--violet" id="iub2ipvc9_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[4].name}</span>
                        </span>
                      </p>
                    </div>
                    <div className="div div--u-irkg360pw section-colors__text-wrapper2--static" id="irkg360pw_0">
                      <p className="text large-text--3 text--u-iuo1c5oaj tc--violet" id="iuo1c5oaj_0">
                        <span className="text-block-wrap-div">
                          <span style={{ whiteSpace: "pre" }}>{variants[4].tagline}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="slider__arrows" id="i062i8458_0">
              <button
                type="button"
                className="slider__arrow-prev slider__arrow-prev--u-i5ptk2kyb"
                id="i5ptk2kyb_0"
                onClick={() => go(index - 1)}
              />
              <div className="slider__pagination section-colors__paginations--static" id="ilrv8rfe5_0">
                <div className="slider__pages" id="iwcg69ldc_0">
                  <div className="slider__current-page" id="immrelhcm_0">
                    <span className="text-block-wrap-div">{index + 1}</span>
                  </div>
                  <div className="slider__page-delimiter" id="igmboi02o_0">
                    <span className="text-block-wrap-div">/</span>
                  </div>
                  <div className="slider__page-count" id="ia6st9t5u_0">
                    <span className="text-block-wrap-div">{VARIANT_COUNT}</span>
                  </div>
                </div>
                <div className="slider__bullets section-colors__bullets--static slider__bullets--u-icpiz07pt" id="icpiz07pt_0">
                  {variants.map((_, i) => (
                    <div
                      key={`mobile-dot-${i}`}
                      role="button"
                      tabIndex={0}
                      className={`slider__dot section-colors__dot--static bc--white-40${
                        index === i ? " is-current" : ""
                      }${i === 0 ? " slider__dot--u-i64buh8tf" : ""}`}
                      id={["i64buh8tf_0", "i5rr08ctr_0", "izoyvh3ai_0", "iepu5k9mf_0", "irg8ehu5a_0"][i]}
                      onClick={() => go(i)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          go(i);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="slider__arrow-next slider__arrow-next--u-io07idws3"
                id="io07idws3_0"
                onClick={() => go(index + 1)}
              />
            </div>
          </div>
          <div className="slider__thumbs-wrapper" id="i9t3c77e3_0">
            <div className="slider__thumbs-list" id="isj2h0akl_0">
              <div className="slider__thumb" id="iuw0yt18g_0">
                <div className="slider__thumb-image" id="irnifvtdg_0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={variants[0].image || undefined}
                    alt={`${variants[0].name} smart fountain pen`}
                    title=""
                    data-size="1920x1080"
                    data-origin-src={variants[0].image || undefined}
                    className="image__img"
                    id="i5h78o1x9_0"
                  />
                </div>
              </div>
              <div className="slider__thumb" id="i3elguuo6_0">
                <div className="slider__thumb-image" id="ikdciptpa_0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={variants[1].image || undefined}
                    alt={`${variants[1].name} smart fountain pen`}
                    title=""
                    data-size="1920x1080"
                    data-origin-src={variants[1].image || undefined}
                    className="image__img"
                    id="iftmyuoz9_0"
                  />
                </div>
              </div>
              <div className="slider__thumb" id="i6sb2pirl_0">
                <div className="slider__thumb-image" id="i9pz3ahae_0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={variants[2].image || undefined}
                    alt={`${variants[2].name} smart fountain pen`}
                    title=""
                    data-size="1920x1080"
                    data-origin-src={variants[2].image || undefined}
                    className="image__img"
                    id="ip9d769zz_0"
                  />
                </div>
              </div>
              <div className="slider__thumb" id="id3d9npw4_0">
                <div className="slider__thumb-image" id="ie0e39w2i_0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={variants[3].image || undefined}
                    alt={`${variants[3].name} smart fountain pen`}
                    title=""
                    data-size="1920x1080"
                    data-origin-src={variants[3].image || undefined}
                    className="image__img"
                    id="i7q7urt1f_0"
                  />
                </div>
              </div>
              <div className="slider__thumb" id="ik54jtf6c_0">
                <div className="slider__thumb-image" id="ictfpssm8_0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={variants[4].image || undefined}
                    alt={`${variants[4].name} smart fountain pen`}
                    title=""
                    data-size="1920x1080"
                    data-origin-src={variants[4].image || undefined}
                    className="image__img"
                    id="isavj8yno_0"
                  />
                </div>
              </div>
            </div>
            <div className="slider__thumbs-arrows" id="i1023phdh_0">
              <button type="button" className="slider__thumb-arrow-prev" id="i559l5ljw_0" />
              <button type="button" className="slider__thumb-arrow-next" id="iz3hb3bdb_0" />
            </div>
          </div>
        </div>
    </section>
  );
}

/**
 * Colors — the ≥992px scrollytelling section (350vh, sticky camera).
 * Rendered by `page.tsx` inside `.scroll-wrapper`, before the footer.
 */
export default function Colors({ colors }: { colors: ColorVariant[] }) {
  const camera = useRef<HTMLDivElement>(null);
  const desktop = useRef<HTMLDivElement>(null);
  const variants = useVariants(colors);

  // The slider scrolls its own list, so the page-level scroll
  // measurements have to be redone when the viewport changes.
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const root = desktop.current;
    const container = camera.current;
    if (!root || !container) return;

    const media = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const images = Array.from(root.querySelectorAll<HTMLElement>('[id$="_0"][class*="section-colors__img-wrapper--static"]'));
    const contents = Array.from(root.querySelectorAll<HTMLElement>('[id$="_0"][class*="section-colors__content-wrapper"]'));
    const dots = Array.from(root.querySelectorAll<HTMLElement>('[id$="_0"][class*="pagination-dot"]'));

    /* The reference spec (see `.reference/animations_full.json`) drives
       these ids against `#itcx2nwlb_0` with these keyframes, in percent of
       the section's 350vh scroll range:

         i8xxxe533 (silver copy)      1 -> 0    @ 15-25
         ii452cx5b (graphite image)   0 -> 1    @ 10-25
         il18j45dh (graphite copy)    0 -> 1    @ 15-25, 1 -> 0 @ 35-45
         inkrb08oy (blue image)       0 -> 1    @ 35-45
         iqogndg22 (blue copy)        0 -> 1    @ 35-45, 1 -> 0 @ 55-65
         iwd7fdw96 (red image)        0 -> 1    @ 55-65
         iunzn1r8v (red copy)         0 -> 1    @ 55-65, 1 -> 0 @ 75-85
         i44lvqr6l (orange image)     0 -> 1    @ 75-85
         i9yml8q3k (orange copy)      0 -> 1    @ 75-85
         ingm9j6ml (dot 1)            1 -> 0.4  @ 10-25
         iuyp5b57e (dot 2)            0.4 -> 1  @ 15-25, 1 -> 0.4 @ 35-45
         ijiw4belh (dot 3)            0.4 -> 1  @ 35-45, 1 -> 0.4 @ 55-65
         ivuwyi94b (dot 4)            0.4 -> 1  @ 55-65, 1 -> 0.4 @ 75-85
         iz9ohs15z (dot 5)            0.4 -> 1  @ 75-85

       The spec never fades a single image back OUT, so on its own every
       render it has revealed stays at opacity 1 and all five pens stack.
       The image fade-outs below are the hand-written part; the copy and dot
       keyframes are reproduced exactly. */

    let tl: gsap.core.Timeline | null = null;

    /* Fade windows, in percent of the section's scroll range, taken straight
       from the spec (`.reference/animations_full.json`) so the desktop
       section matches the reference:

         variant  pen render   copy
         silver   visible      1 → 0    @ 15-25
         graphite in 10-25     0 → 1 @ 15-25, 1 → 0 @ 35-45
         blue     in 35-45     0 → 1 @ 35-45, 1 → 0 @ 55-65
         red      in 55-65     0 → 1 @ 55-65, 1 → 0 @ 75-85
         orange   in 75-85     0 → 1 @ 75-85, then holds

       `null` means "this side never runs", which is why it is spelled out
       rather than encoded as a degenerate range. Each pen render fades in and
       then stays at 1 — the five wrappers are stacked in DOM order, so the
       newest simply covers the previous one, exactly as the reference does. */
    type Fade = { in: [number, number] | null; out: [number, number] | null };

    const IMAGE_FADES: Fade[] = [
      { in: null, out: null },
      { in: [10, 25], out: null },
      { in: [35, 45], out: null },
      { in: [55, 65], out: null },
      { in: [75, 85], out: null }
    ];
    const COPY_FADES: Fade[] = [
      { in: null, out: [15, 25] },
      { in: [15, 25], out: [35, 45] },
      { in: [35, 45], out: [55, 65] },
      { in: [55, 65], out: [75, 85] },
      { in: [75, 85], out: null }
    ];
    /* Pagination dots: 0.4 base, brightening while their variant is on. */
    const DOT_FADES: Fade[] = [
      { in: null, out: [10, 25] },
      { in: [15, 25], out: [35, 45] },
      { in: [35, 45], out: [55, 65] },
      { in: [55, 65], out: [75, 85] },
      { in: [75, 85], out: null }
    ];

    const ramp = (v: number, [a, b]: [number, number]) =>
      b === a ? 1 : Math.min(1, Math.max(0, (v - a) / (b - a)));

    /** Opacity at scroll percentage `p` for one fade description. */
    const opacityAt = (p: number, { in: rise, out: fall }: Fade) => {
      const up = rise ? ramp(p, rise) : 1;
      const down = fall ? ramp(p, fall) : 0;
      return Math.max(0, Math.min(1, Math.min(up, 1 - down)));
    };

    const apply = (p: number) => {
      images.forEach((el, i) => gsap.set(el, { opacity: opacityAt(p, IMAGE_FADES[i]) }));
      contents.forEach((el, i) => gsap.set(el, { opacity: opacityAt(p, COPY_FADES[i]) }));
      dots.forEach((el, i) => gsap.set(el, { opacity: 0.4 + 0.6 * opacityAt(p, DOT_FADES[i]) }));
    };

    const build = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      tl = null;
      // The desktop family is `display: none` below 992px — nothing to scrub.
      if (!media.matches) return;

      apply(0);
      if (reduced) return;

      /* A single ScrollTrigger drives every opacity from one `onUpdate`.
       *
       * The elements carry `data-tt-skip`, so `lib/taptop/engine.ts` leaves
       * them alone — two timelines writing the same property meant the
       * result depended on ScrollTrigger's internal update order, which is
       * not something worth depending on. Computing the value ourselves is
       * deterministic and keeps the spec's own curves. */
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: desktop.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress * 100),
          onRefresh: (self) => apply(self.progress * 100)
        }
      });
    };

    build();
    media.addEventListener("change", build);

    return () => {
      media.removeEventListener("change", build);
      tl?.scrollTrigger?.kill();
      tl?.kill();
    };
  }, []);

  return (
    <div ref={desktop} className="section section--u-itcx2nwlb section-colors" id="itcx2nwlb_0">
      <div
        ref={camera}
        className="container section-colors__camera container--u-ihhnniscu"
        id="ihhnniscu_0"
      >
          <div className="div section-colors__content" id="imodgwvc7_0">
            {/* Variant 1 — Silver */}
            <div className="div section-colors__wrapper-silver div--u-i4niya4cp" id="i4niya4cp_0">
              <div data-tt-skip className="image image--u-iqrvm6uro section-colors__img-wrapper--static" id="iqrvm6uro_0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variants[0].image || undefined}
                  alt="Silver smart fountain pen"
                  title=""
                  data-size="1920x1080"
                  data-origin-src={variants[0].image || undefined}
                  className="image__img"
                  id="iqikcd8xb_0"
                />
              </div>
              <div data-tt-skip className="div section-colors__content-wrapper div--u-i8xxxe533" id="i8xxxe533_0">
                <div className="div section-colors__text-wrapper div--u-ivpg8x4qh" id="ivpg8x4qh_0">
                  <p className="text large-text--3 text--u-irazfckmj tc--main-white" id="irazfckmj_0">
                    <span className="text-block-wrap-div">{variants[0].name}</span>
                  </p>
                </div>
                <div className="div div--u-i6j5mxh11 section-colors__text-wrapper2" id="i6j5mxh11_0">
                  <p className="text large-text--3 text--u-ip9qdygyw tc--main-white" id="ip9qdygyw_0">
                    <span className="text-block-wrap-div">{variants[0].tagline}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Variant 2 — Graphite Black */}
            <div className="div section-colors__wrapper-graphite div--u-i9u537bzj" id="i9u537bzj_0">
              <div data-tt-skip className="image image--u-ii452cx5b section-colors__img-wrapper--static" id="ii452cx5b_0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variants[1].image || undefined}
                  alt="Black smart fountain pen"
                  title=""
                  data-size="1920x1080"
                  data-origin-src={variants[1].image || undefined}
                  className="image__img"
                  id="i6qd50zxn_0"
                />
              </div>
              <div data-tt-skip className="div section-colors__content-wrapper div--u-il18j45dh" id="il18j45dh_0">
                <div className="div section-colors__text-wrapper div--u-ic35b724k" id="ic35b724k_0">
                  <p className="text large-text--3 text--u-ianjavuah tc--main-white" id="ianjavuah_0">
                    <span className="text-block-wrap-div">{variants[1].name}</span>
                  </p>
                </div>
                <div className="div div--u-idwuqrfaj section-colors__text-wrapper2" id="idwuqrfaj_0">
                  <p className="text large-text--3 text--u-i5ppijgfm tc--main-white" id="i5ppijgfm_0">
                    <span className="text-block-wrap-div">{variants[1].tagline}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Variant 3 — Mist Blue */}
            <div className="div section-colors__wrapper-blue div--u-izopkj036" id="izopkj036_0">
              <div data-tt-skip className="image image--u-inkrb08oy section-colors__img-wrapper--static" id="inkrb08oy_0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variants[2].image || undefined}
                  alt="Blue smart fountain pen"
                  title=""
                  data-size="1920x1080"
                  data-origin-src={variants[2].image || undefined}
                  className="image__img"
                  id="iqifg9qnc_0"
                />
              </div>
              <div data-tt-skip className="div section-colors__content-wrapper div--u-iqogndg22" id="iqogndg22_0">
                <div className="div section-colors__text-wrapper div--u-ioksphuuu" id="ioksphuuu_0">
                  <p className="text large-text--3 text--u-i6yskbyol tc--main-white" id="i6yskbyol_0">
                    <span className="text-block-wrap-div">{variants[2].name}</span>
                  </p>
                </div>
                <div className="div div--u-i6a1f2e8d section-colors__text-wrapper2" id="i6a1f2e8d_0">
                  <p className="text large-text--3 text--u-i8iwdu1iu tc--main-white" id="i8iwdu1iu_0">
                    <span className="text-block-wrap-div">{variants[2].tagline}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Variant 4 — Precision Red */}
            <div className="div section-colors__wrapper-red div--u-irsyqy74z" id="irsyqy74z_0">
              <div data-tt-skip className="image image--u-iwd7fdw96 section-colors__img-wrapper--static" id="iwd7fdw96_0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variants[3].image || undefined}
                  alt="Red smart fountain pen"
                  title=""
                  data-size="1920x1080"
                  data-origin-src={variants[3].image || undefined}
                  className="image__img"
                  id="igrnroo20_0"
                />
              </div>
              <div data-tt-skip className="div section-colors__content-wrapper div--u-iunzn1r8v" id="iunzn1r8v_0">
                <div className="div section-colors__text-wrapper div--u-i268597yp" id="i268597yp_0">
                  <p className="text large-text--3 text--u-ipc7zrb48 tc--main-white" id="ipc7zrb48_0">
                    <span className="text-block-wrap-div">{variants[3].name}</span>
                  </p>
                </div>
                <div className="div div--u-iksibpwke section-colors__text-wrapper2" id="iksibpwke_0">
                  <p className="text large-text--3 text--u-ih1uhw8vd tc--main-white" id="ih1uhw8vd_0">
                    <span className="text-block-wrap-div">
                      <span style={{ whiteSpace: "pre" }}>{variants[3].tagline}</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Variant 5 — Bright Orange */}
            <div className="div section-colors__wrapper-orange div--u-ifuxi7sp3" id="ifuxi7sp3_0">
              <div data-tt-skip className="image image--u-i44lvqr6l section-colors__img-wrapper--static" id="i44lvqr6l_0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variants[4].image || undefined}
                  alt="Orange smart fountain pen"
                  title=""
                  data-size="1920x1080"
                  data-origin-src={variants[4].image || undefined}
                  className="image__img"
                  id="ivk1zk7bz_0"
                />
              </div>
              <div data-tt-skip className="div section-colors__content-wrapper div--u-i9yml8q3k" id="i9yml8q3k_0">
                <div className="div section-colors__text-wrapper div--u-iicoczyfb" id="iicoczyfb_0">
                  <p className="text large-text--3 text--u-iwbejcwiy tc--violet" id="iwbejcwiy_0">
                    <span className="text-block-wrap-div">{variants[4].name}</span>
                  </p>
                </div>
                <div className="div div--u-irmhl1qmd section-colors__text-wrapper2" id="irmhl1qmd_0">
                  <p className="text large-text--3 text--u-ieiat7plc" id="ieiat7plc_0">
                    <span className="text-block-wrap-div">{variants[4].tagline}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pagination — one dot per variant, driven by the timeline */}
            <div className="div section-colors__paginations-wrapper div--u-ihwbns9u0" id="ihwbns9u0_0">
              <div data-tt-skip className="div pagination-dot1 div--u-ingm9j6ml bc--white-40" id="ingm9j6ml_0" />
              <div data-tt-skip className="div pagination-dot2 div--u-iuyp5b57e bc--white-40" id="iuyp5b57e_0" />
              <div data-tt-skip className="div div--u-ijiw4belh pagination-dot3 bc--white-40" id="ijiw4belh_0" />
              <div data-tt-skip className="div div--u-ivuwyi94b pagination-dot4 bc--white-40" id="ivuwyi94b_0" />
              <div data-tt-skip className="div pagination-dot5 div--u-iz9ohs15z bc--white-40" id="iz9ohs15z_0" />
            </div>
          </div>
        </div>
      </div>
  );
}
