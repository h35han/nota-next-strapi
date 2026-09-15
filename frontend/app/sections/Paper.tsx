"use client";

/* The reference markup uses plain <img> elements (see PORTING.md). */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type PointerEvent } from "react";
import type { Feature } from "../../lib/api";

/**
 * Paper — "Works with smart paper".
 *
 * Faithful port of the reference's desktop `section paper` (600vh scroll
 * driver containing a sticky `paper__camera`) plus its mobile twin
 * `section paper--static`.
 *
 * Desktop: every animation (curtain SIZE/MOVE, cover BACKGROUND_COLOR, the
 * four slides' SCALE/OPACITY, the pagination BACKGROUND_COLOR) is declared in
 * `lib/taptop/spec.json`, so the automatic engine drives it as long as the
 * element ids are untouched. The section lives inside `sticky-wrapper`
 * (`i0oeetgkk_0`) because `position: sticky` on `.paper` is bounded by its
 * containing block — dropping the wrapper would let the 600vh section follow
 * the rest of the page.
 *
 * Mobile: `section paper--static` toggles on below 992px via CSS. The
 * reference drives it with Taptop's `tt_slider` (Swiper, config 2698024087:
 * `effect: "slide"`, `easing: "linear"`, `speed: 500`, `loop: true` at
 * ≤991px, `allowTouchMove: true`). We reproduce that with a plain index state
 * — translate the `.slider__list` track 100% per slide, wrap around at the
 * ends, and drive it from the pagination dots, the (CSS-hidden) arrows and a
 * horizontal swipe. No Swiper.
 */

/** The reference is authored for exactly four slides / four pagination items. */
const SLIDE_COUNT = 4;

/** `tt_slider` speed (ms) / easing. */
const SLIDE_DURATION_MS = 500;

/** Minimum horizontal drag that counts as a page swipe. */
const SWIPE_THRESHOLD_PX = 40;

/** Stand-in for a missing Strapi entry, so short arrays never crash the markup. */
const EMPTY_FEATURE: Feature = {
  eyebrow: "",
  title: "",
  body: "",
  image: "",
  imageMobile: ""
};

/* Reference `alt` texts, kept verbatim (the CMS has no alt field). */
const STATIC_IMAGE_ALT = ["4.1 block", "4.2 block", "4.3 block", "4.1 block1212"];
const STATIC_IMAGE_480_ALT = [
  "Black smart notebook with an elastic band",
  "Open smart notebook",
  "Open notebook with handwritten notes and sketches",
  "4.1 block1212"
];
const STATIC_IMAGE_320_ALT = [
  "4.1 block - mobile 1",
  "4.1 block - mobile 2",
  "4.1 block - mobile 4",
  "4.1 block - mobile 3"
];

export default function Paper({ features }: { features: Feature[] }) {
  const used = (features ?? []).slice(0, SLIDE_COUNT);

  /**
   * The desktop slides are authored in reverse CMS order: the first
   * `paper__slide` in the DOM is `paper__slide--4` while the spec reveals them
   * `--1` → `--4` (feature 1 → 4). Pad at the front so a short array still
   * opens on feature 1.
   */
  const desktopSlides: Feature[] = [
    ...Array.from({ length: SLIDE_COUNT - used.length }, () => EMPTY_FEATURE),
    ...used.slice().reverse()
  ];

  /** The mobile slider keeps the CMS order (`paper__slide--static` 1 → 4). */
  const staticSlides: Feature[] = Array.from(
    { length: SLIDE_COUNT },
    (_, i) => used[i] ?? EMPTY_FEATURE
  );

  const [index, setIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  const goTo = (next: number) => {
    setIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStartX.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStartX.current;
    swipeStartX.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    goTo(index + (delta < 0 ? 1 : -1));
  };

  const [d1, d2, d3, d4] = desktopSlides;

  return (
    <>
        <section className="section paper bc--main-black" id="ikrvtklue_0">
          <div className="container paper__camera" id="i4evx98ul_0">
            <div className="div paper__slide paper__slide--4 div--u-ipe5lbtjn" id="ipe5lbtjn_0">
              <div className="image paper__image image--u-ihgcmzlad" id="ihgcmzlad_0">
                <img
                  src={d1.image || undefined}
                  alt="Phone displaying synced handwritten notes from the notebook"
                  title=""
                  data-size="1920x1080"
                  className="image__img"
                  id="i0va68q2i_0"
                />
              </div>
              <div className="div div--u-i49r2h492 paper__slide-container" id="i49r2h492_0">
                <div className="div paper__heading div--u-ieqivdqhj" id="ieqivdqhj_0">
                  <div className="text large-text--1 tc--main-white" id="iaohh4ywt_0">
                    <span className="text-block-wrap-div">{d1.eyebrow}</span>
                  </div>
                </div>
                <div className="div paper__description div--u-ikqzz8tzw" id="ikqzz8tzw_0">
                  <div className="div paper__plate bc--white-5" id="iqbupb2hc_0">
                    <div className="text headline--3 tc--main-white" id="ijhjiyaqb_0">
                      <span className="text-block-wrap-div">{d1.title}</span>
                    </div>
                  </div>
                  <div className="div paper__plate bc--white-5" id="ikzl4w56s_0">
                    <div className="text card-text tc--main-white" id="iqdixlpn8_0">
                      <span className="text-block-wrap-div">{d1.body}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="div paper__slide paper__slide--3 div--u-iehaxnos6" id="iehaxnos6_0">
              <div className="image paper__image image--u-ifsklavzo" id="ifsklavzo_0">
                <img
                  src={d2.image || undefined}
                  alt="Open notebook with handwritten notes and sketches"
                  title=""
                  data-size="1920x1080"
                  className="image__img"
                  id="iyeibuswj_0"
                />
              </div>
              <div className="div div--u-iuyu8gpv4 paper__slide-container" id="iuyu8gpv4_0">
                <div className="div paper__heading" id="im3fk7nje_0">
                  <div className="text large-text--1 tc--main-white" id="ifeyrfz7i_0">
                    <span className="text-block-wrap-div">{d2.eyebrow}</span>
                  </div>
                </div>
                <div className="div paper__description div--u-i9vczkj21" id="i9vczkj21_0">
                  <div className="div paper__plate bc--white-5" id="i7pcp0z1p_0">
                    <div className="text headline--3 tc--main-white" id="i9fxb7ovn_0">
                      <span className="text-block-wrap-div">{d2.title}</span>
                    </div>
                  </div>
                  <div className="div paper__plate bc--white-5" id="isthz58ma_0">
                    <div className="text card-text tc--main-white" id="i01ao6e60_0">
                      <span className="text-block-wrap-div">{d2.body}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="div paper__slide paper__slide--2 div--u-i1ltszh8p" id="i1ltszh8p_0">
              <div className="image paper__image image--u-i0d5d95a8" id="i0d5d95a8_0">
                <img
                  src={d3.image || undefined}
                  alt="Open smart notebook"
                  title=""
                  data-size="1920x1080"
                  className="image__img"
                  id="i2e7gdcux_0"
                />
              </div>
              <div className="div div--u-i4j0kgate paper__slide-container" id="i4j0kgate_0">
                <div className="div paper__heading" id="inhgq9t41_0">
                  <div className="text large-text--1 tc--main-white" id="iweea9nu7_0">
                    <span className="text-block-wrap-div">{d3.eyebrow}</span>
                  </div>
                </div>
                <div className="div paper__description div--u-iz4rz8lpp" id="iz4rz8lpp_0">
                  <div className="div paper__plate bc--white-5" id="i9vkf83tr_0">
                    <div className="text headline--3 tc--main-white" id="io4be5szl_0">
                      <span className="text-block-wrap-div">{d3.title}</span>
                    </div>
                  </div>
                  <div className="div paper__plate bc--white-5" id="icjy010ov_0">
                    <div className="text card-text tc--main-white" id="i5e9zsogb_0">
                      <span className="text-block-wrap-div">{d3.body}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="div paper__slide paper__slide--1 div--u-ixw8g2wc0" id="ixw8g2wc0_0">
              <div className="image paper__image image--u-iujqjm4e2" id="iujqjm4e2_0">
                <img
                  src={d4.image || undefined}
                  alt="Black smart notebook with an elastic band"
                  title=""
                  data-size="1920x1080"
                  className="image__img"
                  id="iyffo5m7k_0"
                />
              </div>
              <div className="div div--u-ihloskvmt paper__slide-container" id="ihloskvmt_0">
                <div className="div paper__heading" id="icqvf2jv8_0">
                  <p className="text large-text--1 tc--main-white" id="ir5xcx8ty_0">
                    <span className="text-block-wrap-div">{d4.eyebrow}</span>
                  </p>
                </div>
                <div className="div paper__description div--u-ikv3t7d9n" id="ikv3t7d9n_0">
                  <div className="div paper__plate bc--white-5" id="i55pi1hp1_0">
                    <h3 className="text headline--3 tc--main-white" id="iw7znrvel_0">
                      <span className="text-block-wrap-div">{d4.title}</span>
                    </h3>
                  </div>
                  <div className="div paper__plate bc--white-5" id="invss5o4f_0">
                    <p className="text card-text tc--main-white" id="iii43ex99_0">
                      <span className="text-block-wrap-div">{d4.body}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="div paper__pagination div--u-i962yfedn" id="i962yfedn_0">
              <div className="div paper__pagination-item bc--main-white div--u-ivwgouzy8" id="ivwgouzy8_0"></div>
              <div className="div paper__pagination-item bc--main-white div--u-iegz5oz39" id="iegz5oz39_0"></div>
              <div className="div paper__pagination-item bc--main-white div--u-imzj2gymb" id="imzj2gymb_0"></div>
              <div className="div paper__pagination-item bc--main-white div--u-ijfa9fpi7" id="ijfa9fpi7_0"></div>
            </div>
            <div className="div paper__cover bc--main-white div--u-iwaxzr8k1" id="iwaxzr8k1_0">
              <div className="div page__heading div--u-is40k5vc6" id="is40k5vc6_0">
                <h2 className="text headline--2 tc--gray" id="iohcyiupo_0">
                  <span className="text-block-wrap-div">Works with</span>
                </h2>
                <h2 className="text headline--2 tc--main-black" id="iy27q2gxd_0">
                  <span className="text-block-wrap-div">smart paper</span>
                </h2>
              </div>
            </div>
            <div className="div paper__curtains" id="iz5e721ee_0">
              <div className="div paper__curtain bc--main-white div--u-i26awi0ku" id="i26awi0ku_0"></div>
              <div className="div paper__curtain bc--main-white div--u-io1veeqfj" id="io1veeqfj_0"></div>
              <div className="div paper__curtain bc--main-white div--u-ic79l92r0" id="ic79l92r0_0"></div>
              <div className="div paper__curtain bc--main-white div--u-i8s27vamu" id="i8s27vamu_0"></div>
              <div className="div paper__curtain bc--main-white div--u-ikjxporiu" id="ikjxporiu_0"></div>
              <div
                className="div paper__curtain paper__curtain--last bc--main-white div--u-ikawy67tt"
                id="ikawy67tt_0"
              ></div>
            </div>
          </div>
        </section>

      <section className="section paper--static" id="ixv7fgfun_0">
        <div className="container paper__cover--static" id="irlxty1yt_0">
          <div className="div paper__heading--static" id="ipcpsatcm_0">
            <h2 className="text headline--2 tc--gray" id="i5hmutjbx_0">
              <span className="text-block-wrap-div">Works with</span>
            </h2>
            <h2 className="text headline--2 tc--main-black" id="ir4dfzj7w_0">
              <span className="text-block-wrap-div">smart paper</span>
            </h2>
          </div>
        </div>
        <div
          className="slider paper__slider--static slider--u-igotnhv8e"
          id="igotnhv8e_0"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeStartX.current = null;
          }}
          onPointerLeave={() => {
            swipeStartX.current = null;
          }}
        >
          <div className="slider__wrapper paper__slider-wrapper--static" id="ih5e35t5e_0">
            <div
              className="slider__list slider__list--u-i4zg8rcbd paper__slider-list--static"
              id="i4zg8rcbd_0"
              style={{
                transform: `translate3d(${-index * 100}%, 0, 0)`,
                transition: `transform ${SLIDE_DURATION_MS}ms linear`
              }}
            >
              {staticSlides.map((slide, i) => {
                const image = slide.imageMobile || slide.image;
                return (
                  <div className="slider__slide paper__slide--static" id={`iq3g2vjde_${i}`} key={i}>
                    <div className="image paper__image--static image--u-iu29sx2ax" id={`iu29sx2ax_${i}`}>
                      <img
                        src={image || undefined}
                        alt={STATIC_IMAGE_ALT[i]}
                        title=""
                        className="image__img"
                        id={`i5h6k41f5_${i}`}
                      />
                    </div>
                    <div className="image paper__image-480--static" id={`idrnalwel_${i}`}>
                      <img
                        src={image || undefined}
                        alt={STATIC_IMAGE_480_ALT[i]}
                        title=""
                        className="image__img"
                        id={`inn234gqx_${i}`}
                      />
                    </div>
                    <div
                      className="image paper__image-320--static image--u-it2dmbdy5"
                      id={`it2dmbdy5_${i}`}
                    >
                      <img
                        src={image || undefined}
                        alt={STATIC_IMAGE_320_ALT[i]}
                        title=""
                        className="image__img"
                        id={`itn4cj22c_${i}`}
                      />
                    </div>
                    <div className="container paper__slide-container--static" id={`ib9us156f_${i}`}>
                      <div className="div paper__slider-heading--static" id={`iudvcxp2o_${i}`}>
                        <p
                          className="text large-text--1 tc--main-white text--u-is9qizqcd"
                          id={`is9qizqcd_${i}`}
                        >
                          <span className="text-block-wrap-div">{slide.eyebrow}</span>
                        </p>
                      </div>
                      <div className="div paper__description--static" id={`ibp8koz6z_${i}`}>
                        <div
                          className="div bc--white-5 paper__plate--static div--u-i5ocxninp"
                          id={`i5ocxninp_${i}`}
                        >
                          <h3
                            className="text headline--3 tc--main-white text--u-inwdf5pyb"
                            id={`inwdf5pyb_${i}`}
                          >
                            <span className="text-block-wrap-div">{slide.title}</span>
                          </h3>
                        </div>
                        <div className="div bc--white-5 paper__plate--static" id={`i06hfln8d_${i}`}>
                          <p className="text card-text tc--main-white" id={`in56y5aku_${i}`}>
                            <span className="text-block-wrap-div">{slide.body}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="slider__arrows paper__slider-controls--static" id="i1yjiwlpe_0">
              <button
                type="button"
                className="slider__arrow-prev slider__arrow-prev--u-inhqd844d paper__slider-control--static"
                id="inhqd844d_0"
                onClick={() => goTo(index - 1)}
              ></button>
              <div className="slider__pagination paper__pagination-container--static" id="i26t0tafr_0">
                <div className="slider__pages" id="ic9itv9ac_0">
                  <div className="slider__current-page" id="id5hdhj2d_0">
                    <span className="text-block-wrap-div">1</span>
                  </div>
                  <div className="slider__page-delimiter" id="i03jgiyc8_0">
                    <span className="text-block-wrap-div">/</span>
                  </div>
                  <div className="slider__page-count" id="i4lwttizu_0">
                    <span className="text-block-wrap-div">3</span>
                  </div>
                </div>
                <div className="slider__bullets paper__pagination--static" id="imjkp572o_0">
                  {staticSlides.map((_, i) => (
                    <div
                      role="button"
                      className={`slider__dot paper__pagination-item--static slider__dot--u-i2aem0o5x${
                        i === index ? " is-current" : ""
                      }`}
                      id={`i2aem0o5x_${i}`}
                      key={i}
                      onClick={() => goTo(i)}
                    ></div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="slider__arrow-next slider__arrow-next--u-izkcnu3ve paper__slider-control--static"
                id="izkcnu3ve_0"
                onClick={() => goTo(index + 1)}
              ></button>
            </div>
          </div>
          <div className="slider__thumbs-wrapper" id="i1feo4vej_0">
            <div className="slider__thumbs-list" id="iv1tycwno_0">
              {staticSlides.map((slide, i) => (
                <div className="slider__thumb" id={`icjw46k2f_${i}`} key={i}>
                  <div className="slider__thumb-image" id={`ijgy3jdpg_${i}`}>
                    <img
                      src={slide.image || slide.imageMobile || undefined}
                      alt={STATIC_IMAGE_ALT[i]}
                      title=""
                      className="image__img"
                      id={`ivebn1zu3_${i}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="slider__thumbs-arrows" id="i174hlgdq_0">
              <button type="button" className="slider__thumb-arrow-prev" id="io5hf7u8j_0"></button>
              <button type="button" className="slider__thumb-arrow-next" id="ioifgea5z_0"></button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
