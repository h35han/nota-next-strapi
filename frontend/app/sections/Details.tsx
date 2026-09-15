"use client";

import { useEffect, useMemo, useRef } from "react";
import type { DetailCard, Homepage } from "../../lib/api";

/** CMS media → the reference's CSS `background-image` slots. */
function bg(url: string | undefined) {
  return url ? { backgroundImage: `url("${url}")` } : undefined;
}

/**
 * Details — the macro close-ups of the pen (cap, colourways, nib, body…).
 *
 * Ported 1:1 from `.reference/sections/_full_body.html`: both the desktop
 * `section.details` (`ivurrxt0z_0`, five `details__card-image` tiles + the
 * `details__video` circle) and the mobile `section.details--static`
 * (`ig94w137t_0`) family.
 *
 * The CMS `detail-cards` collection is seeded in the reference's order:
 * cap, cap colourway, colourways, the nib video, the aluminium body, the
 * adapter. The video card drives `details__video`; the other five drive the
 * still tiles. The mobile family reorders the same stills so the two
 * caption-less tiles land third and last (as in the reference).
 */
export default function Details({
  homepage,
  cards
}: {
  homepage: Homepage;
  cards: DetailCard[];
}) {
  const desktop = useRef<HTMLElement>(null);
  const mobile = useRef<HTMLElement>(null);

  const { stills, videoCard } = useMemo(() => {
    const videoIndex = cards.findIndex((card) => card.video);
    if (videoIndex < 0) {
      return { stills: cards, videoCard: undefined as DetailCard | undefined };
    }
    return {
      stills: cards.filter((_, index) => index !== videoIndex),
      videoCard: cards[videoIndex]
    };
  }, [cards]);

  const videoSrc = videoCard?.video || homepage.detailsVideo;

  // `tt_video.viewportAutoPlay` — play the muted loop while it is on screen.
  useEffect(() => {
    const roots = [desktop.current, mobile.current].filter(
      (root): root is HTMLElement => root !== null
    );
    if (roots.length === 0) return;
    const videos = roots.flatMap((root) =>
      Array.from(root.querySelectorAll<HTMLVideoElement>("video"))
    );
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const played = video.play();
            if (played) played.catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  // Mobile `details--static` runs the stills in the reference's own order:
  // cap, colourways, cap colourway, aluminium body, adapter.
  const mobileStills = [stills[0], stills[2], stills[1], stills[3], stills[4]];

  return (
    <>
      {/* ------------------------------- desktop ------------------------------- */}
      <section
        ref={desktop}
        className="section details bc--main-black section--u-ivurrxt0z"
        id="ivurrxt0z_0"
      >
        <div className="container container--primary" id="i7q2k37ve_0">
          <div className="div details__wrapper" id="ih15jvoxg_0">
            <div
              className="div details__content-wrapper details__content-wrapper--center"
              id="irarh8eb2_0"
            >
              <div className="div details__cards-wrapper div--u-ix98b40hx" id="ix98b40hx_0">
                <div className="div details__card div--u-ibse0xeyi" id="ibse0xeyi_0">
                  <div
                    className="div details__card-image div--u-itz251722"
                    id="itz251722_0"
                    style={bg(stills[0]?.image)}
                  ></div>
                  {stills[0]?.title ? (
                    <div
                      className="div details__text-wrapper border-radius--100 bc--black-30"
                      id="ibizvwdhe_0"
                    >
                      <p className="text tc--main-white headline--4" id="ixxboj193_0">
                        <span className="text-block-wrap-div">{stills[0].title}</span>
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="div details__card div--u-iy1a2ewax" id="iy1a2ewax_0">
                  <div
                    className="div details__card-image div--u-iywzagw5d"
                    id="iywzagw5d_0"
                    style={bg(stills[1]?.image)}
                  ></div>
                </div>
              </div>

              <div className="div details__card div--u-ibhan0z9o" id="ibhan0z9o_0">
                <div
                  className="div details__card-image div--u-iwwfiweuo"
                  id="iwwfiweuo_0"
                  style={bg(stills[2]?.image)}
                ></div>
                {stills[2]?.title ? (
                  <div
                    className="div details__text-wrapper border-radius--100 bc--black-30"
                    id="irvtkxh1q_0"
                  >
                    <p className="text tc--main-white headline--4" id="ii6rn0y1i_0">
                      <span className="text-block-wrap-div">{stills[2].title}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="div div--u-iiwj1801p details__video-wrapper" id="iiwj1801p_0">
              <div className="div details__video-content" id="iw3xh0sot_0">
                <video
                  src={videoSrc || undefined}
                  poster=""
                  preload="metadata"
                  loop
                  muted
                  playsInline
                  className="video details__video video--u-i5q39xkfn video--s2-i5q39xkfn"
                  id="i5q39xkfn_0"
                ></video>
                <div
                  className="div details__text-wrapper border-radius--100 bc--black-30"
                  id="ibxge5rcd_0"
                >
                  <p className="text tc--main-white headline--4" id="iv912uwub_0">
                    <span className="text-block-wrap-div">{videoCard?.title}</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className="div details__content-wrapper details__content-wrapper--top"
              id="i4i9p4hrx_0"
            >
              <div className="div details__card div--u-ipvhtnm7z" id="ipvhtnm7z_0">
                <div
                  className="div details__card-image div--u-icegagtko"
                  id="icegagtko_0"
                  style={bg(stills[3]?.image)}
                ></div>
                {stills[3]?.title ? (
                  <div
                    className="div details__text-wrapper border-radius--100 bc--black-30"
                    id="i9ovuv4q1_0"
                  >
                    <p className="text tc--main-white headline--4" id="i4ptea0oi_0">
                      <span className="text-block-wrap-div">{stills[3].title}</span>
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="div details__card div--u-ifrpgpcbn" id="ifrpgpcbn_0">
                <div
                  className="div details__card-image div--u-ig4bod1u2"
                  id="ig4bod1u2_0"
                  style={bg(stills[4]?.image)}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- mobile ------------------------------- */}
      <section ref={mobile} className="section details--static bc--main-black" id="ig94w137t_0">
        <div className="container container--primary" id="izb08y6i7_0">
          <div className="div details__wrapper--static" id="iz87tp8nj_0">
            <div className="div div--u-itzd5kwkl details__card--static" id="itzd5kwkl_0">
              <div
                className="div div--u-ists3j8gk details__card-image--static"
                id="ists3j8gk_0"
                style={bg(mobileStills[0]?.image)}
              ></div>
              {mobileStills[0]?.title ? (
                <div
                  className="div border-radius--100 bc--black-30 details__text-wrapper--static"
                  id="iov2x2cyq_0"
                >
                  <p className="text tc--main-white headline--4" id="ia1z8vzca_0">
                    <span className="text-block-wrap-div">{mobileStills[0].title}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="div div--u-isipir8pr details__card--static" id="isipir8pr_0">
              <div
                className="div div--u-i2we3huyf details__card-image--static"
                id="i2we3huyf_0"
                style={bg(mobileStills[1]?.image)}
              ></div>
              {mobileStills[1]?.title ? (
                <div
                  className="div border-radius--100 bc--black-30 details__text-wrapper--static"
                  id="idxm0piz8_0"
                >
                  <p className="text tc--main-white headline--4" id="iaclgmxdx_0">
                    <span className="text-block-wrap-div">{mobileStills[1].title}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="div div--u-ib428i287 details__card--static" id="ib428i287_0">
              <div
                className="div div--u-i67dwgpd0 details__card-image--static"
                id="i67dwgpd0_0"
                style={bg(mobileStills[2]?.image)}
              ></div>
            </div>

            <div className="div div--u-i30jzlafl details__video-wrapper--static" id="i30jzlafl_0">
              <div className="div details__video-content--static" id="ijy19jm9y_0">
                <video
                  src={videoSrc || undefined}
                  poster=""
                  preload="metadata"
                  loop
                  muted
                  playsInline
                  className="video video--u-izt2oeojl details__video--static video--s2-izt2oeojl"
                  id="izt2oeojl_0"
                ></video>
                <div
                  className="div border-radius--100 bc--black-30 details__text-wrapper--static"
                  id="iy9q5h0c0_0"
                >
                  <p className="text tc--main-white headline--4" id="i3pv1gb0e_0">
                    <span className="text-block-wrap-div">{videoCard?.title}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="div div--u-ib0wdny9s details__card--static" id="ib0wdny9s_0">
              <div
                className="div div--u-id49akgir details__card-image--static"
                id="id49akgir_0"
                style={bg(mobileStills[3]?.image)}
              ></div>
              {mobileStills[3]?.title ? (
                <div
                  className="div border-radius--100 bc--black-30 details__text-wrapper--static"
                  id="i5qnb2uwc_0"
                >
                  <p className="text tc--main-white headline--4" id="is4j41k1b_0">
                    <span className="text-block-wrap-div">{mobileStills[3].title}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="div div--u-i76g5rzma details__card--static" id="i76g5rzma_0">
              <div
                className="div div--u-iba5g0p9y details__card-image--static"
                id="iba5g0p9y_0"
                style={bg(mobileStills[4]?.image)}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
