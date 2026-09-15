"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import type { BoxItem, Homepage } from "../../lib/api";

/* ------------------------------------------------------------------ *
 * Scratch-built behaviour (the reference's inline_12.js).
 *
 * `.inside__text--animation` paragraphs are split into one <span> per
 * character and each character's colour is scrubbed from #DDDDDD to
 * #000000 as the paragraph travels up the viewport:
 *
 *   start = 0.8 * vh ; end = 0.3 * vh
 *   rect.top >= start              → every char #DDDDDD
 *   rect.top + rect.height < end   → every char #000000
 *   else progress = 1 - (rect.top - end) / (start - end)
 *        char i = progress > i / chars.length ? #000000 : #DDDDDD
 *
 * The reference also forces #DDDDDD while the page is still at scrollY 0.
 * ------------------------------------------------------------------ */
const CHAR_CLASS = "inside__text--animation-child";

/** One <span> per character (spaces keep the reference's `space-char`). */
function AnimatedChars({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {Array.from(line).map((char, charIndex) => (
            <span
              key={charIndex}
              className={char === " " ? `${CHAR_CLASS} space-char` : CHAR_CLASS}
            >
              {char}
            </span>
          ))}
        </Fragment>
      ))}
    </>
  );
}

/** Reference `<br>` keeps two copy blocks apart — CMS fields use newlines. */
function LineBreaks({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/** Mobile family collapses the copy to a single run of text (no <br>). */
const flatten = (text: string) => text.replace(/\s*\n\s*/g, " ");

/**
 * The two "blinds" rows of the reference source, transcribed verbatim.
 * Every blind is a `div` whose `div--u-<id>` class is the "before" state
 * (`animations.css`) of a spec-driven reveal, so id + class must match.
 */
const COMPLETE_BLINDS = [
  "iubiyw8gc",
  "iqwfxd0it",
  "idkyr8p9i",
  "i9iiylrqn",
  "i65hllmhe",
  "iroxbluix",
  "id5xzbwox",
  "izc1urmte",
  "idbltwkwj",
  "iurryzigl",
  "ibm7gvmwz",
  "i2v9av24b",
  "ixtvffj2q",
  "id6dkpi77",
  "iwmxobxza",
  "i2qavlh4z",
  "iyiag1qyf",
  "ih6thm4d4",
  "ignnlpx4o",
  "is3jdei5y",
  "ijjogmpqf",
  "i5m7ocygv",
  "ik1n1n2jz",
  "iugpwlfgd",
  "it84q1dbc"
];

const PEN_BLINDS = [
  "iza1g1zch",
  "i9lrjqlgl",
  "igohklwm7",
  "if1guf805",
  "i13nidlwp",
  "i23p3s9bz",
  "i6sf11xre",
  "i99a2e00j",
  "imf736q28",
  "ibmq2m57s",
  "ivv1a70qu",
  "ipwdo8vyy",
  "i3l1osgzw",
  "iyjlcbe9n",
  "i5e5dr21w",
  "i1gj4byhj",
  "ietzqv3rt",
  "inawl422p",
  "imi04zfnl",
  "ihq3pfhn9",
  "iw0dg97r1",
  "io4vu2037",
  "icjy9c26m",
  "i0bjsyo7l",
  "innwoggjj"
];

const ADAPTER_BLINDS = [
  "iffjpgw30",
  "iy27qxc44",
  "iybht2iai",
  "iw05b4qi5",
  "i2tkf3bhw",
  "in2agr0mq",
  "i96plyaxx",
  "i9i4sqhmw",
  "i43qqoign",
  "iki0aitvv",
  "iu30ezur0",
  "isyrxy8fh",
  "igwjctebx",
  "i7zq7hqw4",
  "ii4fc0oke",
  "iitn9vt23",
  "inoho70gl",
  "ifdfsqpka",
  "iujn3e3e2",
  "irdvei02h",
  "isiz0a4sj",
  "i9zobzorp",
  "ip411p6fa",
  "is00rxj96",
  "iiyzlh9s2"
];

/** CMS media → the reference's CSS `background-image` slots. */
function bg(url: string | undefined) {
  return url ? { backgroundImage: `url("${url}")` } : undefined;
}

function Blinds({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map((id) => (
        <div key={id} className={`div inside__blind div--u-${id}`} id={`${id}_0`}></div>
      ))}
    </>
  );
}

/**
 * Inside — the "Inside the box" section.
 *
 * Ported 1:1 from `.reference/sections/_full_body.html`: both the desktop
 * `section.inside` (`ir9soeuwq_0`, 25-blind rows + the character-scrub
 * paragraph) and the mobile `section.inside--static` (`ipavj5rd0_0`) family.
 * The white "complete set" tile comes from the homepage single type; the two
 * device tiles come from the `box-items` collection.
 */
export default function Inside({
  items,
  homepage
}: {
  items: BoxItem[];
  homepage: Homepage;
}) {
  const section = useRef<HTMLElement>(null);

  // `insideIntro` may hold more than one paragraph, separated by a blank line.
  const intro = useMemo(() => {
    const text = homepage.insideIntro.trim();
    if (!text) return [""];
    return text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [homepage.insideIntro]);

  const complete = items[0];
  const adapter = items[1];

  // Character colour scrub — port of the reference's inline_12.js.
  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const paragraphs = Array.from(
      root.querySelectorAll<HTMLElement>(".inside__text--animation")
    );
    if (paragraphs.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      paragraphs.forEach((paragraph) => {
        paragraph.querySelectorAll<HTMLElement>("span").forEach((char) => {
          char.style.color = "#000000";
        });
      });
      return;
    }

    const paint = () => {
      const vh = window.innerHeight;
      const start = 0.8 * vh;
      const end = 0.3 * vh;

      paragraphs.forEach((paragraph) => {
        const chars = Array.from(paragraph.querySelectorAll<HTMLElement>("span"));
        if (chars.length === 0) return;

        const rect = paragraph.getBoundingClientRect();

        if ((window.scrollY === 0 && rect.top >= 0) || rect.top >= start) {
          chars.forEach((char) => {
            char.style.color = "#DDDDDD";
          });
          return;
        }

        if (rect.top + rect.height < end) {
          chars.forEach((char) => {
            char.style.color = "#000000";
          });
          return;
        }

        const progress = 1 - (rect.top - end) / (start - end);
        chars.forEach((char, index) => {
          char.style.color = progress > index / chars.length ? "#000000" : "#DDDDDD";
        });
      });
    };

    paint();
    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      window.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
    };
  }, [intro]);

  return (
    <>
      {/* ------------------------------- desktop ------------------------------- */}
      <section ref={section} className="section inside" id="ir9soeuwq_0">
        <div className="div div--u-iyv5tgngp" id="iyv5tgngp_0"></div>
        <div className="container container--primary bc--main-white" id="inanvef3l_0">
          <div className="div inside__content" id="i7tlh3c8n_0">
            <div className="div inside__complete-wrapper" id="iwhqwaa1s_0">
              <div className="div inside__blinds-item" id="i4k67759u_0">
                <div
                  className="div inside__blinds-image div--u-ihi4nv6i2"
                  id="ihi4nv6i2_0"
                  style={bg(homepage.insideSetImage)}
                ></div>
                <div className="div inside__blinds-blinds div--u-i3i40edji" id="i3i40edji_0">
                  <Blinds ids={COMPLETE_BLINDS} />
                </div>
                <div
                  className="div inside__blinds-content div--u-i1az1ixbn"
                  id="i1az1ixbn_0"
                >
                  <h3 className="text tc--main-black headline--3" id="iyrfz9ra3_0">
                    <span className="text-block-wrap-div">
                      {homepage.insideCompleteHeading}
                    </span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-ion2lwxr8 inside__blinds-text"
                    id="ion2lwxr8_0"
                  >
                    <span className="text-block-wrap-div">
                      <LineBreaks text={homepage.insideCompleteText} />
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="div inside__text-wrapper" id="i7kq3jmxj_0">
              {intro.map((paragraph, index) => (
                <p
                  key={index}
                  className="text large-text--1 text-align--center inside__text--animation"
                  id={index === 0 ? "iwep58hh2_0" : undefined}
                >
                  <AnimatedChars text={paragraph} />
                </p>
              ))}
            </div>

            <div className="div inside__device-wrapper" id="igdkd86jj_0">
              <div className="div inside__blinds-item" id="iulndzmma_0">
                <div
                  className="div inside__blinds-image div--u-i2xmb33eu"
                  id="i2xmb33eu_0"
                  style={bg(complete?.image)}
                ></div>
                <div className="div inside__blinds-blinds" id="i3qwy3mnr_0">
                  <Blinds ids={PEN_BLINDS} />
                </div>
                <div
                  className="div inside__blinds-content div--u-i2u8xuh3a"
                  id="i2u8xuh3a_0"
                >
                  <h3 className="text tc--main-black headline--3" id="inkm7uss2_0">
                    <span className="text-block-wrap-div">{complete?.title}</span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-isnluiouk inside__blinds-text"
                    id="isnluiouk_0"
                  >
                    <span className="text-block-wrap-div">
                      <LineBreaks text={complete?.description ?? ""} />
                    </span>
                  </p>
                </div>
              </div>

              <div className="div inside__blinds-item div--u-ifmw3aplw" id="ifmw3aplw_0">
                <div
                  className="div inside__blinds-image div--u-i2akf28ho"
                  id="i2akf28ho_0"
                  style={bg(adapter?.image)}
                ></div>
                <div
                  className="div div--u-ibc1svgzy inside__blinds-image--hover"
                  id="ibc1svgzy_0"
                  style={bg(adapter?.imageHover)}
                ></div>
                <div className="div inside__blinds-blinds" id="iks99fm3h_0">
                  <Blinds ids={ADAPTER_BLINDS} />
                </div>
                <div
                  className="div inside__blinds-content div--u-i1yvvz55z"
                  id="i1yvvz55z_0"
                >
                  <h3 className="text tc--main-black headline--3" id="i0igg4zit_0">
                    <span className="text-block-wrap-div">{adapter?.title}</span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-idroksc7z inside__blinds-text"
                    id="idroksc7z_0"
                  >
                    <span className="text-block-wrap-div">
                      <LineBreaks text={adapter?.description ?? ""} />
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- mobile ------------------------------- */}
      <section className="section inside--static" id="ipavj5rd0_0">
        <div className="container container--primary" id="iv35er95h_0">
          <div className="div inside__content--static" id="iqldr5bx9_0">
            <div
              className="div tc--main-black div--u-icty6qooh inside__title-wrapper--static bc--main-white"
              id="icty6qooh_0"
            >
              <h2 className="text headline--2 text-align--center" id="ike3aix17_0">
                <span className="text-block-wrap-div">
                  <span style={{ color: "rgb(153, 153, 153)" }}>Inside</span>
                  <br />
                  the box
                </span>
              </h2>
            </div>

            <div className="div inside__complete-wrapper--static" id="im9d1koc6_0">
              <div className="div inside__blinds-item--static" id="iwj6153em_0">
                <div
                  className="div div--u-i3d9cpjj8 inside__blinds-image--static"
                  id="i3d9cpjj8_0"
                  style={bg(homepage.insideSetImage)}
                ></div>
                <div
                  className="div div--u-ifx260a3t inside__blinds-content--static"
                  id="ifx260a3t_0"
                >
                  <h3 className="text tc--main-black headline--3" id="ire6nsuii_0">
                    <span className="text-block-wrap-div">
                      {homepage.insideCompleteHeading}
                    </span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-iacc0r9f0 inside__blinds-text"
                    id="iacc0r9f0_0"
                  >
                    <span className="text-block-wrap-div">
                      {flatten(homepage.insideCompleteText)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="div inside__text-wrapper--static" id="i76bqyr8k_0">
              {intro.map((paragraph, index) => (
                <p
                  key={index}
                  className="text large-text--1 text-align--center inside__text--static"
                  id={index === 0 ? "i20h3u4xy_0" : undefined}
                >
                  <span className="text-block-wrap-div">{paragraph}</span>
                </p>
              ))}
            </div>

            <div className="div inside__device-wrapper--static" id="iq2yndxt8_0">
              <div
                className="div inside__blinds-item--static inside__blinds-item--device"
                id="i5aillvnl_0"
              >
                <div
                  className="div div--u-i93xllkxc inside__blinds-image--static"
                  id="i93xllkxc_0"
                  style={bg(complete?.image)}
                ></div>
                <div
                  className="div div--u-isky28793 inside__blinds-content--static inside__blinds-content--device"
                  id="isky28793_0"
                >
                  <h3 className="text tc--main-black headline--3" id="izdlzz8ms_0">
                    <span className="text-block-wrap-div">{complete?.title}</span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-iybsk8gsv inside__blinds-text--device"
                    id="iybsk8gsv_0"
                  >
                    <span className="text-block-wrap-div">
                      {flatten(complete?.description ?? "")}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className="div div--u-i5em1uvbc inside__blinds-item--static inside__blinds-item--device"
                id="i5em1uvbc_0"
              >
                <div
                  className="div div--u-igacnl13m inside__blinds-image--static"
                  id="igacnl13m_0"
                  style={bg(adapter?.image)}
                ></div>
                <div
                  className="div div--u-is3cfudbu inside__blinds-content--static inside__blinds-content--device"
                  id="is3cfudbu_0"
                >
                  <h3 className="text tc--main-black headline--3" id="izcfdh2fm_0">
                    <span className="text-block-wrap-div">{adapter?.title}</span>
                  </h3>
                  <p
                    className="text tc--main-black main-text text--u-i9581mcla inside__blinds-text--device"
                    id="i9581mcla_0"
                  >
                    <span className="text-block-wrap-div">
                      {flatten(adapter?.description ?? "")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
