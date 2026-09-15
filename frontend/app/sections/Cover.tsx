import type { Product } from "../../lib/api";
import CoverLottie from "../components/CoverLottie";

/**
 * Cover — the hero.
 *
 * Faithful copy of the reference's `section.cover` (`#ir47l3u8h_0`):
 * a `position: sticky` `cover__camera` that pins for 170vh while the
 * Lottie pen animation is scrubbed frame by frame (see `CoverLottie`) and
 * the `transition-specs` curtains rise over it.
 *
 * The headline lives in `cover__headline-wrapper` and is set with the
 * reference's scramble-text intro (`lib/scramble.ts`).
 *
 * Below 992px the reference swaps in `section.cover--static`
 * (`#iyzjstuxs_0`) — a plain 100vh hero with a tall pen render — so both
 * families are rendered here and the vendored CSS toggles them.
 */
export default function Cover({ product }: { product: Product }) {
  return (
    <>
      <section className="section cover section--u-ir47l3u8h bc--main-radial" id="ir47l3u8h_0">
        <div className="container cover__camera container--u-i2lfv83sv" id="i2lfv83sv_0">
          <CoverLottie
            id="ikskfddht_0"
            className="div cover__lottie-pen div--u-ikskfddht"
            src={product.coverLottie}
            videoSrc={product.heroVideo || product.heroCoverVideo}
            fallback={product.coverImage}
          />
          <div className="div cover__wrapper" id="i9157cbsc_0">
            <div className="div cover__headline-wrapper" id="ie2dojnh3_0">
              <h1
                className="text tc--main-white headline--1 scramble-text text--u-it88tlt81"
                id="it88tlt81_0"
              >
                <span className="text-block-wrap-div">{product.heading || "Smart pen"}</span>
              </h1>
              <h1
                className="text tc--main-white headline--1 scramble-text text--u-i3rz6q624"
                id="i3rz6q624_0"
              >
                <span className="text-block-wrap-div">
                  {product.subheading || "for real thinking"}
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile hero (< 992px only — CSS toggles it). */}
      <section className="section cover--static bc--main-radial" id="iyzjstuxs_0">
        <div className="container container--primary" id="i4ig4m74q_0">
          <div className="div cover__wrapper--static" id="ipweesw9a_0">
            <div className="image image--u-ii49wtv8t cover__img--static" id="ii49wtv8t_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.coverImage || undefined}
                alt="Nota hero image"
                title=""
                data-size="364x1526"
                className="image__img image__img--s2-ibrgj9whz"
                id="ibrgj9whz_0"
              />
            </div>
            <div className="div cover__headline-wrapper--static" id="iattqicsd_0">
              <div className="text headline--1 scramble-text tc--main-white" id="iv9aj1gd1_0">
                <span className="text-block-wrap-div">{product.heading || "Smart pen"}</span>
              </div>
              <div className="text headline--1 scramble-text tc--main-white" id="irxswcv37_0">
                <span className="text-block-wrap-div">
                  {product.subheading || "for real thinking"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
