"use client";

import { useState, type HTMLAttributes, type MouseEvent } from "react";
import type { Homepage, Product, TeamMember } from "../../lib/api";
import { scrollToId } from "../../lib/smooth";
import FooterPopup from "./FooterPopup";
import { Ellipse } from "./icons";

/**
 * Footer — reference block `i6xdke8ib_0`
 * (`.reference/index.html` lines 1739-1827, pretty slice in
 * `.reference/sections/i6xdke8ib_0__section-footer-bc--main-black.html`).
 *
 * Every id and class is kept verbatim; the copy that the CMS holds is bound
 * (`footer_copyright`, `footer_designed_by`/`designed_url`/`uprock_url`,
 * `footer_made_in`/`made_in_url`, `footer_built_by`, `product.year`,
 * `product.team`, `product.description`) and the team list lives in the
 * footer popup that the "Builded by NōtaTeam" action opens (the reference
 * `link` with `data-action-element='i8n40m1el_0'`).
 */

/** Taptop renders action targets as `<div href="/" role="button">`; React's
 *  types don't accept `href` on a div, so it is spread in loosely to keep the
 *  DOM identical to the reference. */
const actionTarget = (action: string, onClick: () => void) =>
  ({ href: "/", "data-action-element": action, onClick }) as unknown as HTMLAttributes<HTMLDivElement>;

type NavLink = { label: string; target: string; anchorId: string; className: string };

/** `footer__links` — the desktop anchors (desktop section ids). */
const NAV_LINKS: NavLink[] = [
  {
    label: "Specifications",
    target: "i34o078vy_0",
    anchorId: "ijhefpktb_0",
    className: "link footer__link-wrapper footer-link--white link--u-ijhefpktb"
  },
  {
    label: "Who it's for",
    target: "i2hggnt58_0",
    anchorId: "i86baiktq_0",
    className: "link footer__link-wrapper footer-link--white"
  },
  {
    label: "About",
    target: "i0oeetgkk_0",
    anchorId: "il4ztycyw_0",
    className: "link footer__link-wrapper footer-link--white"
  },
  {
    label: "Inside the box",
    target: "iyv5tgngp_0",
    anchorId: "iha6r5yst_0",
    className: "link footer__link-wrapper footer-link--white"
  }
];

/** `footer__links--static` — the ≤991px anchors (the `*-static` sections). */
const NAV_LINKS_STATIC: NavLink[] = [
  {
    label: "Specifications",
    target: "i9uqhe1cp_0",
    anchorId: "iql4v8ebw_0",
    className: "link footer__link-wrapper footer-link--white link--u-iql4v8ebw"
  },
  {
    label: "Who it's for",
    target: "icu3mt31j_0",
    anchorId: "ivage8l8q_0",
    className: "link footer__link-wrapper footer-link--white"
  },
  {
    label: "About",
    target: "ixv7fgfun_0",
    anchorId: "i3l5fe0zn_0",
    className: "link footer__link-wrapper footer-link--white"
  },
  {
    label: "Inside the box",
    target: "ipavj5rd0_0",
    anchorId: "ir1q310gm_0",
    className: "link footer__link-wrapper footer-link--white"
  }
];

export default function Footer({
  product,
  homepage,
  team
}: {
  product: Product;
  homepage: Homepage;
  team: TeamMember[];
}) {
  const [teamOpen, setTeamOpen] = useState(false);

  const year = product.year || new Date().getFullYear();
  const description =
    product.description;

  const scroll = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    scrollToId(target);
  };

  return (
    <>
      <footer className="section footer bc--main-black tc--main-white" id="i6xdke8ib_0">
        <div className="container container--primary" id="i7a0ah6sw_0">
          <div className="div footer__content" id="imdte2051_0">
            <div className="div footer__content-top" id="i57w7t0iv_0">
              <div className="div footer__description-wrapper div--u-i9qhsq5hn" id="i9qhsq5hn_0">
                <p className="text footer-text footer__description text--u-isfw00xlm" id="isfw00xlm_0">
                  <span className="text-block-wrap-div">{description}</span>
                </p>
                <p className="text footer-text footer__description text--u-ihtsnorgm" id="ihtsnorgm_0">
                  <span className="text-block-wrap-div">{description}</span>
                </p>
              </div>
              <div className="div footer__info-wrapper" id="i2on3wzy1_0">
                <div className="div footer__menu" id="i9mtfzl2p_0">
                  <h2 className="text footer-title tc--main-white-55" id="io3nhjq8y_0">
                    <span className="text-block-wrap-div">Navigation</span>
                  </h2>
                  <div className="div footer__links" id="i8m8vibqq_0">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.anchorId}
                        href={`#${link.target}`}
                        data-action-element=""
                        target="_self"
                        rel="nofollow"
                        className={link.className}
                        id={link.anchorId}
                        onClick={(event) => scroll(event, link.target)}
                      >
                        <span className="text-block-wrap-div">{link.label}</span>
                      </a>
                    ))}
                  </div>
                  <div className="div footer__links--static" id="i0oh18fok_0">
                    {NAV_LINKS_STATIC.map((link) => (
                      <a
                        key={link.anchorId}
                        href={`#${link.target}`}
                        data-action-element=""
                        target="_self"
                        rel="nofollow"
                        className={link.className}
                        id={link.anchorId}
                        onClick={(event) => scroll(event, link.target)}
                      >
                        <span className="text-block-wrap-div">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="div footer__year" id="it31khk6c_0">
                  <h3 className="text footer-title tc--main-white-55" id="itsee6t8m_0">
                    <span className="text-block-wrap-div">Year</span>
                  </h3>
                  <p className="text footer__year-text" id="ik07wvusu_0">
                    <span className="text-block-wrap-div">{year}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="div footer__content-bottom" id="iers039h0_0">
              <p className="text footer__copyright footer-title tc--main-white-50" id="iwqnz2xi6_0">
                <span className="text-block-wrap-div">{homepage.footerCopyright}</span>
              </p>
              <div className="div footer__team-wrapper" id="il774jhmo_0">
                {/* `aria-label` is the one addition to the reference node: it is
                    where `product.team` ("NŌTA Team") lands — the reference
                    footer has no visible slot for the team's own name. */}
                <div className="div footer__team" id="ijim6lty4_0" aria-label={product.team}>
                  <div className="div footer__link-wrapper" id="i59lstgrf_0">
                    <a
                      href={homepage.madeInUrl}
                      data-action-element=""
                      target="_blank"
                      className="link footer-link--gray"
                      id="i6zco9f6s_0"
                    >
                      <span className="text-block-wrap-div">{homepage.footerMadeIn}</span>
                    </a>
                  </div>
                  <div className="image footer__team-icon image--u-iak699zx6" id="iak699zx6_0">
                    {/* The credits divider is pure design chrome with no CMS
                        field, so it is an inlined SVG rather than a local
                        image file. */}
                    <span className="image__img" id="inop2608n_0">
                      <Ellipse />
                    </span>
                  </div>
                  <div className="div footer__link-wrapper" id="i959q48t3_0">
                    <div
                      {...actionTarget("i8n40m1el_0", () => setTeamOpen(true))}
                      role="button"
                      className="link footer-link--gray"
                      id="ioayzm2vy_0"
                    >
                      <span className="text-block-wrap-div">{homepage.footerBuiltBy}</span>
                    </div>
                  </div>
                </div>
                <div className="div footer__design-team" id="i0nnjl6yp_0">
                  <a
                    href={homepage.designedUrl}
                    data-action-element=""
                    target="_blank"
                    className="link footer-link--gray"
                    id="ibcdu08c9_0"
                  >
                    <span className="text-block-wrap-div">
                      <span style={{ whiteSpace: "pre" }}>{homepage.footerDesignedBy}</span>
                    </span>
                  </a>
                  <a
                    href={homepage.uprockUrl}
                    data-action-element=""
                    target="_blank"
                    className="link footer-link--gray"
                    id="ibsr4v1iu_0"
                  >
                    <span className="text-block-wrap-div">
                      <span style={{ whiteSpace: "pre" }}>& UPROCK Studio</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <FooterPopup open={teamOpen} onClose={() => setTeamOpen(false)} homepage={homepage} team={team} />
    </>
  );
}
