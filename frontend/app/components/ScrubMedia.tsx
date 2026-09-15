"use client";

import { useEffect, useRef } from "react";

const WEBP_RE = /\.webp(\?.*)?$/i;
const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

function isVideoUrl(url: string): boolean {
  return VIDEO_RE.test(url);
}

function isWebpUrl(url: string): boolean {
  return WEBP_RE.test(url);
}

/**
 * Scroll-scrubbed hero media.
 *
 * Priority:
 *  1. MP4 / WebM → a muted `<video>` whose `currentTime` is driven by scroll.
 *  2. Animated WebP → decoded frame-by-frame via WebCodecs `ImageDecoder`,
 *     drawn onto a canvas with responsive cover-fit offsets (Chrome/Edge).
 *  3. Static images → plain `<img>`.
 *
 * `videoSrc` (when provided) is tried first via `<video>` — giving us a
 * reliable scrub in every browser.  If the video fails to load the component
 * falls through to the animated-WebP ImageDecoder path, then the static
 * fallback image.
 */
export default function ScrubMedia({
  src,
  videoSrc,
  fallback,
  cover = true,
  className = "",
  onReady
}: {
  src: string;
  videoSrc?: string;
  fallback?: string;
  cover?: boolean;
  className?: string;
  onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const frames = useRef<ImageBitmap[]>([]);
  const frameCount = useRef(0);
  const lastIndex = useRef(-1);
  const progress = useRef(0);
  const decoderRef = useRef<ImageDecoder | null>(null);
  const modeRef = useRef<"video" | "webp" | "img">("img");
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // ------------------------------------------------------------------
  // Canvas helpers (WebP path)
  // ------------------------------------------------------------------

  function drawCover(canvas: HTMLCanvasElement | null, index: number) {
    if (!canvas) return;
    const frame = frames.current[index];
    const hostEl = host.current;
    if (!frame || !hostEl) return;

    const w = Math.max(1, Math.round(hostEl.clientWidth));
    const h = Math.max(1, Math.round(hostEl.clientHeight));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!cover) {
      ctx.drawImage(frame, 0, 0, w, h);
      return;
    }

    const fw = frame.width;
    const fh = frame.height;
    const scale = Math.max(w / fw, h / fh);
    const sw = fw * scale;
    const sh = fh * scale;
    ctx.drawImage(frame, (w - sw) / 2, (h - sh) / 2, sw, sh);
  }

  function redraw() {
    if (modeRef.current !== "webp") return;
    const idx = Math.min(frameCount.current - 1, Math.max(0, lastIndex.current));
    if (idx >= 0) drawCover(canvasRef.current, idx);
  }

  // ------------------------------------------------------------------
  // Core effect — attempts video → webP decode → static image
  // ------------------------------------------------------------------

  useEffect(() => {
    const hostEl = host.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const img = imgRef.current;
    if (!hostEl || !video || !src) return;

    let disposed = false;

    const showCanvas = () => {
      if (!canvas || !img) return;
      canvas.style.display = "block";
      img.style.display = "none";
      if (video) video.style.display = "none";
    };

    const showVideo = () => {
      if (!video) return;
      video.style.display = "block";
      if (canvas) canvas.style.display = "none";
      if (img) img.style.display = "none";
    };

    const showImg = () => {
      if (!img) return;
      img.style.display = "block";
      if (canvas) canvas.style.display = "none";
      if (video) video.style.display = "none";
    };

    const rasterize = (index: number) => {
      if (disposed) return;
      if (frames.current[index]) {
        drawCover(canvas, index);
        return;
      }
      decoderRef.current
        ?.decode({ frameIndex: index })
        .then(async (res) => {
          if (disposed) {
            res.image.close();
            return;
          }
          const bitmap = await createImageBitmap(res.image);
          res.image.close();
          if (disposed) {
            bitmap.close();
            return;
          }
          frames.current[index] = bitmap;
          if (lastIndex.current === index) {
            showCanvas();
            drawCover(canvas, index);
          }
        })
        .catch(() => {});
    };

    const initWebP = async () => {
      if (!("ImageDecoder" in window)) return false;
      try {
        const res = await fetch(src);
        const buffer = await res.arrayBuffer();
        const decoder = new ImageDecoder({ data: buffer, type: "image/webp" });
        decoderRef.current = decoder;
        await decoder.tracks.ready;
        const count = decoder.tracks.selectedTrack?.frameCount ?? 0;
        if (count === 0 || disposed) return false;
        frameCount.current = count;
        modeRef.current = "webp";
        lastIndex.current = 0;
        rasterize(0);
        onReadyRef.current?.();
        return true;
      } catch {
        return false;
      }
    };

    // ---- 1. Preferred: MP4 / WebM video scrub --------------------------------

    const tryVideo = (url: string) => {
      if (!video) return;
      modeRef.current = "video";
      video.src = url;
      showVideo();
      video.load();
    };

    if (videoSrc && isVideoUrl(videoSrc)) {
      const onVideoError = () => {
        video.removeEventListener("error", onVideoError);
        if (disposed) return;
        // fall through to WebP or static image
        modeRef.current = "img";
        if (img) showImg();
        if (isWebpUrl(src)) {
          void initWebP();
        }
      };
      video.addEventListener("error", onVideoError, { once: true });

      const onMeta = () => {
        video.removeEventListener("error", onVideoError);
        video.removeEventListener("loadedmetadata", onMeta);
        if (disposed) return;
        video.pause();
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = progress.current * video.duration;
        }
        onReadyRef.current?.();
      };
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      tryVideo(videoSrc);
    }
    // ---- 2. Fallback: animated WebP via WebCodecs ----------------------------
    else if (isWebpUrl(src)) {
      void initWebP();
    }
    // ---- 3. Static image ----------------------------------------------------
    else {
      modeRef.current = "img";
      onReadyRef.current?.();
    }

    // ---- scrub callback (set on host element by Hero) -----------------------

    const setScrubProgress = (p: number) => {
      progress.current = p;

      if (modeRef.current === "video" && video && video.readyState >= 1) {
        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) {
          video.currentTime = p * duration;
        }
      } else if (modeRef.current === "webp") {
        const n = frameCount.current;
        if (n === 0) return;
        const index = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
        if (index === lastIndex.current) return;
        lastIndex.current = index;
        rasterize(index);
      }
    };

    const onResize = () => redraw();
    window.addEventListener("resize", onResize);
    (hostEl as HTMLElement & { setScrubProgress?: (p: number) => void }).setScrubProgress = setScrubProgress;

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      frames.current.forEach((b) => b.close());
      frames.current = [];
      frameCount.current = 0;
      decoderRef.current?.close();
      decoderRef.current = null;
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      if (hostEl) {
        delete (hostEl as HTMLElement & { setScrubProgress?: (p: number) => void }).setScrubProgress;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, videoSrc]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div ref={host} className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: "none" }} />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ display: "none" }}
        muted
        playsInline
        preload="auto"
      />
      {(fallback || src) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={fallback || src}
          alt=""
          className={`absolute inset-0 h-full w-full ${cover ? "object-cover" : "object-contain"}`}
        />
      )}
    </div>
  );
}