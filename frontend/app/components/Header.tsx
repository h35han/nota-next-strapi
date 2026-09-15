"use client";

import { useEffect, useRef } from "react";
import type { Product } from "../../lib/api";
import { useOrder } from "./chrome";
import { scrollToId } from "../../lib/smooth";
import { Burger, Logo, Wordmark } from "./icons";

/**
 * Header — fixed navigation bar.
 *
 * Three behaviours are ported verbatim from the reference:
 *
 *  · **Auto-hide** (`.reference/scripts/inline_10.js`) — the bar slides out
 *    (`translateY(-101%)`, 350 ms ease) once the page is past 6 % and the
 *    user scrolls down by more than 5 px; any upward scroll of more than
 *    5 px brings it back.
 *  · **Colour flip on desktop** (`.reference/scripts/inline_08.js`) — the
 *    links, icons and logo are white while the scroll percentage falls in
 *    `0–8.17`, `20.51–37.58`, `40.83–58.60` or `≥ 76.29`, and black
 *    otherwise (i.e. while the light specs / inside sections sit behind the
 *    bar).
 *  · **Colour flip below 992 px** (`.reference/scripts/inline_09.js`) — the
 *    colour follows whichever `*-static` section currently crosses the
 *    header's bottom edge.
 *
 * The nav labels carry `.scramble-text`, so `lib/scramble.ts` decodes them on
 * load exactly like the reference.
 */
const LINKS: { label: string; id: string; anchorId: string; className: string }[] = [
  {
    label: "Specifications",
    id: "ikei6u3qu_0",
    anchorId: "i34o078vy_0",
    className: "menu-link scramble-text link--u-ikei6u3qu"
  },
  {
    label: "Who it's for",
    id: "itgpeq6gb_0",
    anchorId: "i2hggnt58_0",
    className: "menu-link scramble-text"
  },
  {
    label: "About",
    id: "i5wbs4wm4_0",
    anchorId: "i0oeetgkk_0",
    className: "menu-link scramble-text link--u-i5wbs4wm4"
  },
  {
    label: "Inside the box",
    id: "i4btkcmr4_0",
    anchorId: "iyv5tgngp_0",
    className: "menu-link scramble-text link--u-i4btkcmr4"
  }
];

const WHITE = "#ffffff";
const BLACK = "#000000";

export default function Header({ product }: { product: Product }) {
  const header = useRef<HTMLElement>(null);
  const { openOrder, openMenu } = useOrder();

  useEffect(() => {
    const root = header.current;
    if (!root) return;

    const wrapper = root.querySelector<HTMLElement>(".header__wrapper");
    const links = Array.from(root.querySelectorAll<HTMLElement>(".menu-link"));
    const icons = Array.from(root.querySelectorAll<HTMLElement>(".header__icon"));
    const burger = root.querySelector<HTMLElement>(".header__burger");
    const logo = root.querySelector<HTMLElement>(".header__logo-icon");

    // --- auto hide / show -------------------------------------------
    let lastScroll = window.scrollY;
    let ticking = false;
    root.style.transition = "transform 0.35s ease";
    root.style.willChange = "transform";
    root.style.transform = "translateY(0)";

    const scrollPercent = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      return span <= 0 ? 0 : (window.scrollY / span) * 100;
    };

    const showHeader = () => {
      root.style.transform = "translateY(0)";
    };
    const hideHeader = () => {
      root.style.transform = "translateY(-101%)";
    };

    // --- desktop colour ---------------------------------------------
    const setDesktopColor = (color: string) => {
      document.documentElement.style.setProperty("--header-color", color);
      links.forEach((el) => (el.style.color = color));
      icons.forEach((el) => (el.style.color = color));
      if (logo) logo.style.color = color;
    };

    const desktopUpdate = () => {
      if (window.innerWidth <= 991) return;
      const p = scrollPercent();
      const white =
        (p >= 0 && p < 8.17) ||
        (p >= 20.51 && p < 37.58) ||
        (p >= 40.83 && p < 58.6) ||
        p >= 76.29;
      setDesktopColor(white ? WHITE : BLACK);
    };

    // --- tablet / mobile colour -------------------------------------
    const SECTIONS: { selector: string; color: string }[] = [
      { selector: ".specs--static", color: BLACK },
      { selector: ".who--static", color: WHITE },
      { selector: ".paper__cover--static", color: BLACK },
      { selector: ".paper__slider--static", color: WHITE },
      { selector: ".inside--static", color: BLACK },
      { selector: ".details--static", color: WHITE }
    ];
    const sections = SECTIONS.map((s) => ({
      el: document.querySelector<HTMLElement>(s.selector),
      color: s.color
    })).filter((s): s is { el: HTMLElement; color: string } => Boolean(s.el));

    let activeIndex = -1;

    const setMobileColor = (color: string, borderColor: string) => {
      icons.forEach((el) => (el.style.color = color));
      if (burger) burger.style.color = color;
      if (logo) logo.style.color = color;
      if (wrapper) wrapper.style.borderBottom = `1px solid ${borderColor}`;
    };

    const mobileUpdate = () => {
      if (window.innerWidth > 991 || !wrapper) return;
      const headerBottom = wrapper.getBoundingClientRect().bottom;
      const first = sections[0];
      if (first && headerBottom < first.el.getBoundingClientRect().top) {
        setMobileColor(WHITE, "rgba(255,255,255,0.2)");
        activeIndex = -1;
        return;
      }
      for (let i = 0; i < sections.length; i += 1) {
        const sec = sections[i];
        const next = sections[i + 1];
        const secTop = sec.el.getBoundingClientRect().top;
        const nextTop = next ? next.el.getBoundingClientRect().top : Infinity;
        if (headerBottom >= secTop && headerBottom < nextTop) {
          if (activeIndex !== i) {
            activeIndex = i;
            const border = sec.color === WHITE ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
            setMobileColor(sec.color, border);
          }
          break;
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        const percent = scrollPercent();

        if (percent < 6) {
          showHeader();
          lastScroll = currentScroll;
        } else {
          const diff = currentScroll - lastScroll;
          if (diff > 5) hideHeader();
          if (diff < -5) showHeader();
          lastScroll = currentScroll;
        }

        desktopUpdate();
        mobileUpdate();
        ticking = false;
      });
    };

    desktopUpdate();
    mobileUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header ref={header} className="section header section--u-ibwupc86g" id="ibwupc86g_0">
      <div className="container container--primary" id="irdxjfsxx_0">
        <div className="div header__wrapper div--u-inievofhq" id="inievofhq_0">
          <div className="div header__links" id="i9vecdd1u_0">
            <a
              href="#ir47l3u8h_0"
              className="link-block header__logo-link"
              id="itm2drrwy_0"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("ir47l3u8h_0");
              }}
            >
              <span
                className="svg-icon tc--main-white svg-icon--u-ifd61r0si header__icon"
                id="ifd61r0si_0"
              >
                <Wordmark />
              </span>
            </a>

            <div
              className="div button__mobile-menu"
              id="inv6md7ga_0"
              role="button"
              tabIndex={0}
              aria-label="Open menu"
              onClick={openMenu}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openMenu();
              }}
            >
              <span className="svg-icon svg-icon--u-i2be27qt9 header__burger" id="i2be27qt9_0">
                <Burger />
              </span>
            </div>

            <nav className="div header__menu" id="ivqe1o6ff_0">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  id={link.id}
                  href={`#${link.anchorId}`}
                  target="_self"
                  className={`link ${link.className}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(link.anchorId);
                  }}
                >
                  <span className="text-block-wrap-div">{link.label}</span>
                </a>
              ))}
            </nav>

            <div className="div button__logo" id="ipx5ox8k5_0">
              <span className="svg-icon svg-icon--u-inhzxs3i0 header__logo-icon" id="inhzxs3i0_0">
                <Logo />
              </span>
            </div>
          </div>

          <div
            className="button button--primary button--u-ibmyrsh3u"
            id="ibmyrsh3u_0"
            role="button"
            tabIndex={0}
            onClick={openOrder}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openOrder();
            }}
          >
            <div className="image button-order__logo" id="iaop3qq35_0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/d/order-logo.svg" alt="logo" className="image__img" id="iizle9q6u_0" />
            </div>
            <div className="div button-order__content div--u-i36a30ugn" id="i36a30ugn_0">
              <div className="div button-order__texts div--u-ih8sf86nh" id="ih8sf86nh_0">
                <div className="text button-title tc--main-white" id="i0foueqdg_0">
                  <span className="text-block-wrap-div">{product.ctaLabel || "Order"}&nbsp;</span>
                </div>
                <div className="text button-title tc--main-white-40" id="i4vkozi9y_0">
                  <span className="text-block-wrap-div">{product.name || "Nota One"}</span>
                </div>
              </div>
              <div className="div button__separator bc--main-white" id="iiw8s1mv9_0" />
              <div className="text button-title tc--main-white" id="i5pk49g9e_0">
                <span className="text-block-wrap-div">{product.ctaPrice || "$300"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
