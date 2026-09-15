"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CoverMedia — the hero's frame-by-frame scroll-scrubbed animation.
 *
 * The Product schema exposes exactly one hero media field,
 * `hero_cover_video`, which holds an **animated WebP** (`nota_lottie.webp`,
 * 76 frames) — the Taptop-exported render of the cover animation. The
 * reference plays the same animation from a Lottie document; with no schema
 * field for that file we decode the WebP instead, which gives the identical
 * frame-by-frame behaviour:
 *
 *   · `ImageDecoder` decodes frame `i` on demand and we blit it to a canvas
 *     with a cover fit (Chromium / Edge / Safari 16.4+);
 *   · otherwise the all-keyframe `.mp4` sibling of the Strapi URL is scrubbed
 *     through `<video>.currentTime`;
 *   · otherwise `cover_image` is shown still.
 *
 * The scroll mapping is the reference's own (`inline_03.js`): walk up from
 * this element to the first ancestor taller than the viewport — the cover is
 * `position: sticky`, so that ancestor is `black-bg__wrapper` — and map
 * `(scrollY − ancestorTop) / (ancestorHeight − viewportHeight)` onto the
 * frame range. Ticking only happens while at least 30% of the element is on
 * screen, which is the reference's `checkActivation` gate.
 */

const WEBP_RE = /\.webp(\?.*)?$/i;
const VIDEO_RE = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

/**
 * Hard cap on cached bitmaps. Frames decode at the source resolution
 * (1920×1080), so the cache is deliberately small — scrubbing only ever
 * needs the current frame plus the few we prefetch around it.
 */
const MAX_CACHED_FRAMES = 10;

type Mode = "webp" | "video" | "image";

export default function CoverMedia({
  webpSrc,
  videoSrc,
  fallback,
  id,
  className = ""
}: {
  /** `product.heroCoverVideo` — the Strapi-bound animated WebP. */
  webpSrc: string;
  /** Derived `.mp4` sibling of `webpSrc`, used when ImageDecoder is absent. */
  videoSrc?: string;
  /** `product.coverImage` — always-present still. */
  fallback?: string;
  id?: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = useRef<((p: number) => void) | null>(null);
  /**
   * The active source. Kept in a ref as well as state: the media effect is
   * created once, so its closure must read the *current* mode rather than
   * the value captured on the first render.
   */
  const modeRef = useRef<Mode>("image");
  const [mode, setModeState] = useState<Mode>("image");
  const setMode = (next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  };
  const [decoded, setDecoded] = useState(false);

  // ------------------------------------------------------------------
  // Media source
  // ------------------------------------------------------------------
  useEffect(() => {
    const hostEl = host.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!hostEl || !canvas) return;

    let disposed = false;
    let decoder: ImageDecoder | null = null;
    let frameCount = 0;
    let lastIndex = -1;
    let progress = 0;

    const cache = new Map<number, ImageBitmap>();

    const decodeSize = () => {
      // Decode at display size rather than 1920×1080 — it roughly quarters
      // the per-frame bitmap cost with no visible difference.
      const w = Math.min(1920, Math.max(1, Math.round(hostEl.clientWidth)));
      const h = Math.min(1080, Math.max(1, Math.round(hostEl.clientHeight)));
      return { w, h };
    };

    const draw = (bitmap: ImageBitmap) => {
      const { w, h } = decodeSize();
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const scale = Math.max(w / bitmap.width, h / bitmap.height);
      const dw = bitmap.width * scale;
      const dh = bitmap.height * scale;
      ctx.drawImage(bitmap, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const evict = (keep: number) => {
      if (cache.size <= MAX_CACHED_FRAMES) return;
      const keys = [...cache.keys()].sort((a, b) => Math.abs(b - keep) - Math.abs(a - keep));
      while (cache.size > MAX_CACHED_FRAMES && keys.length) {
        const k = keys.shift()!;
        if (k === keep) continue;
        cache.get(k)?.close();
        cache.delete(k);
      }
    };

    const rasterize = (index: number) => {
      if (disposed || index < 0 || index >= frameCount) return;
      const cached = cache.get(index);
      if (cached) {
        draw(cached);
        setDecoded(true);
        return;
      }
      decoder
        ?.decode({ frameIndex: index })
        .then(async (res) => {
          const bitmap = await createImageBitmap(res.image);
          res.image.close();
          if (disposed) {
            bitmap.close();
            return;
          }
          cache.set(index, bitmap);
          evict(index);
          if (lastIndex === index) {
            draw(bitmap);
            setDecoded(true);
          }
        })
        .catch(() => {
          /* frame not ready / decoder closed — the next tick retries */
        });
    };

    const setScrubProgress = (p: number) => {
      progress = p;
      if (modeRef.current === "webp") {
        if (frameCount === 0) return;
        const index = Math.min(frameCount - 1, Math.max(0, Math.round(p * (frameCount - 1))));
        if (index === lastIndex) return;
        // Claim the index *before* decoding, so the async callback knows the
        // frame it produced is still the one on screen.
        lastIndex = index;
        rasterize(index);
        // Prefetch the next few frames so scrubbing stays smooth.
        for (let ahead = 1; ahead <= 3; ahead += 1) {
          const next = index + ahead;
          if (next < frameCount && !cache.has(next)) rasterize(next);
        }
      } else if (modeRef.current === "video" && video && video.readyState >= 1) {
        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) video.currentTime = p * duration;
      }
    };
    ready.current = setScrubProgress;

    void (async () => {
      // 1. Preferred: the animated WebP, decoded frame by frame.
      if (webpSrc && WEBP_RE.test(webpSrc) && "ImageDecoder" in window) {
        try {
          const res = await fetch(webpSrc);
          if (!res.ok) throw new Error(String(res.status));
          const buffer = await res.arrayBuffer();
          if (disposed) return;
          // Decode at the source resolution: asking the decoder to scale
          // produces visibly blocky frames on this asset.
          decoder = new ImageDecoder({ data: buffer, type: "image/webp" });
          await decoder.tracks.ready;
          const count = decoder.tracks.selectedTrack?.frameCount ?? 0;
          if (disposed) return;
          if (count > 0) {
            frameCount = count;
            setMode("webp");
            progress = 0;
            lastIndex = 0;
            rasterize(0);
            return;
          }
        } catch {
          /* fall through */
        }
      }
      if (disposed) return;

      // 2. The all-keyframe MP4 sibling.
      if (videoSrc && VIDEO_RE.test(videoSrc) && video) {
        setMode("video");
        return;
      }

      // 3. The still cover image.
      setMode("image");
    })();

    // Re-decode at the new size on resize.
    const onResize = () => {
      cache.forEach((bitmap) => bitmap.close());
      cache.clear();
      lastIndex = -1;
      setScrubProgress(progress);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      cache.forEach((bitmap) => bitmap.close());
      cache.clear();
      decoder?.close();
      decoder = null;
      ready.current = null;
    };
  }, [webpSrc, videoSrc]);

  // ------------------------------------------------------------------
  // Scroll → progress
  // ------------------------------------------------------------------
  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = false;

    /** First ancestor taller than the viewport — the scroll "camera". */
    const findScroller = (): HTMLElement => {
      let node: HTMLElement | null = container.parentElement;
      while (node && node !== document.body) {
        if (node.offsetHeight > window.innerHeight) break;
        node = node.parentElement;
      }
      return node && node !== document.body ? node : document.body;
    };

    /** Mirrors the reference's `checkActivation` (≥ 30% on screen). */
    const checkActivation = (): boolean => {
      const rect = container.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const ratio = Math.max(0, visibleBottom - visibleTop) / (rect.height || 1);
      if (ratio >= 0.3) {
        if (!active) {
          active = true;
          ready.current?.(0);
        }
        return true;
      }
      if (active) {
        active = false;
        ready.current?.(0);
      }
      return false;
    };

    const tick = () => {
      if (!checkActivation()) return;
      const scroller = findScroller();
      const scrollY = window.scrollY;
      const top = scrollY + scroller.getBoundingClientRect().top;
      const span = scroller.offsetHeight - window.innerHeight;
      const progress = span <= 0 ? 0 : Math.max(0, Math.min(1, (scrollY - top) / span));
      ready.current?.(progress);
    };

    if (reduced) {
      ready.current?.(1);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };

    // The WebP frames arrive asynchronously; keep ticking until they're in.
    const settle = window.setInterval(tick, 150);

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearInterval(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={host} id={id} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallback || undefined}
        alt=""
        aria-hidden
        className="nota-cover-image"
        style={{ opacity: mode === "image" || !decoded ? 1 : 0 }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="nota-cover-canvas"
        style={{ opacity: mode === "webp" && decoded ? 1 : 0 }}
      />
      {mode === "video" && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="nota-cover-video"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.pause();
            ready.current?.(0);
          }}
        />
      )}
    </div>
  );
}
