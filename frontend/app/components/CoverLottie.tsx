"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CoverLottie — the hero's frame-by-frame scroll-scrubbed animation.
 *
 * The reference (`nota.uprock.pro`) plays this as a **Lottie** document and
 * seeks it frame by frame from the scroll position (see
 * `.reference/scripts/inline_03.js`). We reproduce that exactly:
 *
 *   · the Lottie is mounted with `autoplay: false, loop: false`;
 *   · on every scroll tick we walk up from this container to the first
 *     ancestor taller than the viewport — `.cover__camera` is
 *     `position: sticky`, so that ancestor is the `black-bg__wrapper`
 *     that holds the cover *and* the specs transition;
 *   · progress = (scrollY − ancestorTop) / (ancestorHeight − viewportHeight);
 *   · frame = round((totalFrames − 1) × progress), applied with
 *     `goToAndStop(frame, true)`.
 *
 * The animation only ticks while at least 30% of the container is on screen,
 * which is what the reference's `checkActivation` gate does.
 *
 * Fallbacks, in order: Lottie JSON → all-keyframe MP4 scrub → still image.
 */

type LottieAnim = {
  totalFrames: number;
  goToAndStop: (value: number, isFrame?: boolean) => void;
  destroy: () => void;
  addEventListener: (name: string, cb: () => void) => void;
};

export default function CoverLottie({
  src,
  videoSrc,
  fallback,
  id,
  className = ""
}: {
  src: string;
  videoSrc?: string;
  fallback?: string;
  id?: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const playerHost = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animRef = useRef<LottieAnim | null>(null);
  const frameCount = useRef(0);
  const lastFrame = useRef(-1);
  const active = useRef(false);
  const [failed, setFailed] = useState(false);

  const useVideo = failed && Boolean(videoSrc);
  const useImage = failed && !videoSrc && Boolean(fallback);

  // ------------------------------------------------------------------
  // Lottie
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!src || failed) return;
    let disposed = false;

    void (async () => {
      try {
        const mod = await import("lottie-web");
        const lottie = mod.default;
        if (disposed || !playerHost.current) return;
        const anim = lottie.loadAnimation({
          container: playerHost.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          path: src,
          // lottie-player's default — the reference does not override it.
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
        }) as unknown as LottieAnim;
        animRef.current = anim;
        anim.addEventListener("DOMLoaded", () => {
          if (disposed) return;
          frameCount.current = anim.totalFrames;
          anim.goToAndStop(0, true);
        });
        anim.addEventListener("data_failed", () => {
          if (!disposed) setFailed(true);
        });
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      animRef.current?.destroy();
      animRef.current = null;
      frameCount.current = 0;
      lastFrame.current = -1;
    };
  }, [src, failed]);

  // ------------------------------------------------------------------
  // Scroll → frame
  // ------------------------------------------------------------------
  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** First ancestor taller than the viewport — the scroll "camera". */
    const findScroller = (): HTMLElement => {
      let node: HTMLElement | null = container.parentElement;
      while (node && node !== document.body) {
        if (node.offsetHeight > window.innerHeight) break;
        node = node.parentElement;
      }
      return node && node !== document.body ? node : document.body;
    };

    const seekTo = (frame: number) => {
      animRef.current?.goToAndStop(frame, true);
    };

    const checkActivation = (): boolean => {
      const rect = container.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const ratio = Math.max(0, visibleBottom - visibleTop) / (rect.height || 1);
      if (ratio >= 0.3) {
        if (!active.current) {
          active.current = true;
          lastFrame.current = -1;
          seekTo(0);
        }
        return true;
      }
      if (active.current) {
        active.current = false;
        lastFrame.current = -1;
        seekTo(0);
      }
      return false;
    };

    const progressFor = (scroller: HTMLElement): number => {
      const scrollY = window.scrollY;
      const scrollerTop = scrollY + scroller.getBoundingClientRect().top;
      const span = scroller.offsetHeight - window.innerHeight;
      if (span <= 0) return 0;
      return Math.max(0, Math.min(1, (scrollY - scrollerTop) / span));
    };

    const update = () => {
      if (!checkActivation()) return;
      const progress = progressFor(findScroller());

      if (frameCount.current > 0) {
        const frame = Math.round(progress * (frameCount.current - 1));
        if (frame !== lastFrame.current) {
          lastFrame.current = frame;
          seekTo(frame);
        }
      } else if (videoRef.current && videoRef.current.readyState >= 1) {
        const v = videoRef.current;
        if (Number.isFinite(v.duration) && v.duration > 0) v.currentTime = progress * v.duration;
      }
    };

    if (reduced) {
      // Stay on the final frame; no scroll coupling.
      const settle = window.setInterval(() => {
        const anim = animRef.current;
        if (anim && anim.totalFrames > 0) {
          anim.goToAndStop(anim.totalFrames - 1, true);
          window.clearInterval(settle);
        }
      }, 120);
      return () => window.clearInterval(settle);
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    const settle = window.setInterval(() => {
      if (frameCount.current > 0) {
        window.clearInterval(settle);
        update();
      }
    }, 100);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearInterval(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [useVideo, useImage]);

  return (
    <div ref={host} id={id} className={className}>
      {!useVideo && !useImage && (
        <div ref={playerHost} className="nota-lottie-host" aria-hidden />
      )}
      {useVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          className="nota-lottie-video"
        />
      )}
      {useImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fallback} alt="" className="nota-lottie-image" />
      )}
    </div>
  );
}
