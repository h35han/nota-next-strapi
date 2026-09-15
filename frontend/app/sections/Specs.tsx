import type { Product, SpecItem } from "../../lib/api";

/**
 * Specifications — faithful port of the reference's desktop `section specs`
 * (inside the sticky wrapper `ixh1v63v5_0`) plus its mobile `section
 * specs--static`. The vendored CSS toggles the two families at 991px.
 *
 * Animations are handled automatically by `lib/taptop/engine.ts`, which
 * looks the element ids up in `spec.json`, so the ids below must stay:
 *   ig5resaoj_0  ixb5fk6ut_0  i9b3n0vje_0  imaomcjy4_0
 *   izt89q94t_0  ihn3af3jk_0  iqu0h75s7_0
 */

/** Per-position ids/classes the reference declares for the three cards. */
const CARD_META: { id: string; u: string }[] = [
  { id: "izt89q94t_0", u: "div--u-izt89q94t" },
  { id: "ihn3af3jk_0", u: "div--u-ihn3af3jk" },
  { id: "iqu0h75s7_0", u: "div--u-iqu0h75s7" }
];

/** Same, for the static (≤ 991px) family. */
const STATIC_CARD_META: { id: string; u: string }[] = [
  { id: "iezuu53gp_0", u: "div--u-iezuu53gp" },
  { id: "iazylkn9w_0", u: "div--u-iazylkn9w" },
  { id: "iciehuxta_0", u: "div--u-iciehuxta" }
];

export default function Specs({ product, specs }: { product: Product; specs: SpecItem[] }) {
  const tagline = product.tagline || product.name;

  return (
    <>
      <section className="section specs section--u-ig5resaoj" id="ig5resaoj_0">
        <div className="div div--u-i34o078vy" id="i34o078vy_0"></div>
        <div className="container specs__camera" id="io4jf4ysb_0">
            <div
              className="div specs__content div--u-ixb5fk6ut bc--main-white"
              id="ixb5fk6ut_0"
            >
              <div
                className="div specs__content-text-wrapper div--u-i9b3n0vje"
                id="i9b3n0vje_0"
              >
                <h2 className="text headline--1 tc--gray" id="ir5c0gacs_0">
                  <span className="text-block-wrap-div">{tagline}</span>
                </h2>
                <h2 className="text headline--1 tc--main-black" id="ikcxjydut_0">
                  <span className="text-block-wrap-div">Specifications</span>
                </h2>
              </div>
              <div
                className="div specs-content__img-wrapper div--u-imaomcjy4"
                id="imaomcjy4_0"
              >
                <div
                  className="image specs__content--img image--u-ixy050e5m"
                  id="ixy050e5m_0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.specsImage || undefined}
                    alt="Black smart pen"
                    title=""
                    data-size="233x734"
                    data-origin-src={product.specsImage || undefined}
                    className="image__img image__img--s2-i2aatmykv"
                    id="i2aatmykv_0"
                  />
                </div>
              </div>
              <div className="div specs-pack__list" id="ingz5hdf9_0">
                {specs.map((spec, i) => {
                  const card = CARD_META[i];
                  return (
                    <div
                      key={spec.title}
                      className={`div specs-list__card${card ? ` ${card.u}` : ""}`}
                      id={card?.id}
                    >
                      <div className="div specs-card__top-content bc--black-2 effect--glass">
                        <h3 className="text headline--3">
                          <span className="text-block-wrap-div">{spec.title}</span>
                        </h3>
                      </div>
                      <div className="div specs-card__bottom-content bc--black-2 effect--glass">
                        {spec.items.map((item, j) => (
                          <div
                            key={j}
                            className={
                              j === spec.items.length - 1
                                ? "div specs-card__bottom-info--last"
                                : "div specs-card__bottom-info bc--black-10"
                            }
                          >
                            <div className="div specs-card__bottom-wrapper">
                              <p className="text card-text specs-card__bottom-text">
                                <span className="text-block-wrap-div">{item}</span>
                              </p>
                              <div className="div specs-card__bottom-dot bc--black-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      <section className="section specs--static section--u-i9uqhe1cp" id="i9uqhe1cp_0">
        <div className="container container--primary" id="ip07sfqld_0">
          <div className="div specs__content--static" id="i7jk8zulu_0">
            <div className="div specs-content__text-wrapper--static" id="irv6cx8mg_0">
              <h2 className="text headline--1 tc--gray" id="ir01h6qr3_0">
                <span className="text-block-wrap-div">{tagline}</span>
              </h2>
              <h2 className="text headline--1 tc--main-black" id="iwd5hqlta_0">
                <span className="text-block-wrap-div">Specifications</span>
              </h2>
            </div>
            <div className="image specs-content__mobile-img--static" id="iivj6t60b_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.specsImageMobile || undefined}
                alt="scene2-adaptive480-ezgif.com-png-to-webp-converter"
                title=""
                data-size="896x141"
                data-origin-src={product.specsImageMobile || undefined}
                className="image__img"
                id="iofpk87n7_0"
              />
            </div>
            <div className="div specs-bottom-content--static" id="iu6ydntgo_0">
              <div className="div specs__pack-list--static" id="i6u5b0o3x_0">
                {specs.map((spec, i) => {
                  const card = STATIC_CARD_META[i];
                  return (
                    <div
                      key={spec.title}
                      className={`div specs-list__card--static${card ? ` ${card.u}` : ""}`}
                      id={card?.id}
                    >
                      <div className="div specs-card__top-content--static effect--glass">
                        <h3 className="text headline--3">
                          <span className="text-block-wrap-div">{spec.title}</span>
                        </h3>
                      </div>
                      <div className="div specs-card__bottom-content--static effect--glass">
                        {spec.items.map((item, j) => (
                          <div
                            key={j}
                            className={
                              j === spec.items.length - 1
                                ? "div bc--black-10 specs-card__bottom-info-last--static"
                                : "div specs-card__bottom-info--static bc--black-10"
                            }
                          >
                            <div className="div specs-card__bottom-wrapper--static">
                              <p className="text specs-card-__bottom-text--static card-text">
                                <span className="text-block-wrap-div">{item}</span>
                              </p>
                              <div className="div specs-card__bottom-dot--static bc--black-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="div specs-content--static__img-wrapper div--u-i2l0a0iax"
                id="i2l0a0iax_0"
              >
                <div
                  className="image specs-content--static__img image--u-ipzilxnpg"
                  id="ipzilxnpg_0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.specsImageTablet || undefined}
                    alt="Black smart pen"
                    title=""
                    data-size="471x2052"
                    data-origin-src={product.specsImageTablet || undefined}
                    className="image__img"
                    id="igv47q2nv_0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
