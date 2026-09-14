#!/usr/bin/env bash
# Re-download the scraped reference media into public/media.
#
# Strapi content references these assets by their /media/... relative path,
# and the frontend serves them from public/. Media is git-ignored on purpose;
# in production it must be mounted onto the Railway volume (see RAILWAY.md).
#
# Usage:
#   scripts/scrape-media.sh              # full scrape
#   scripts/scrape-media.sh --check      # verify every referenced file exists
set -euo pipefail

BASE="https://nota.uprock.pro"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media"

# urlplus <local-path-relative-to-public> <remote-path>
url() { # local, remote
  mkdir -p "$(dirname "$OUT/$1")"
  if [ ! -f "$OUT/$1" ]; then
    echo "fetch  $2"
    curl -fsS --retry 3 -o "$OUT/$1" "$BASE$2"
  else
    echo "skip   $1 (exists)"
  fi
}

if [ -f "$OUT/hero/cover.lottie.json" ] && [ "${1:-}" != "--check" ] && [ -t 0 ]; then
  echo "Media already present. Use --check to verify completeness or delete the dir first."
  exit 0
fi

url hero/hero.png            /media/hero/hero.png
url hero/cover.lottie.json   /media/hero/cover.lottie.json
url specs/pen.png            /media/specs/pen.png
url specs/pen-768.webp       /media/specs/pen-768.webp
url specs/pen-480.webp       /media/specs/pen-480.webp
url paper/media/paper-01.jpg /media/paper/media/paper-01.jpg
url paper/media/paper-02.jpg /media/paper/media/paper-02.jpg
url paper/media/paper-03.jpg /media/paper/media/paper-03.jpg
url paper/media/paper-04.jpg /media/paper/media/paper-04.jpg
url paper/mobile/41_block.jpg /media/paper/mobile/41_block.jpg
url paper/mobile/42_block.jpg /media/paper/mobile/42_block.jpg
url paper/mobile/43_block.jpg /media/paper/mobile/43_block.jpg
url paper/mobile/41_block1212.png /media/paper/mobile/41_block1212.png
url inside/set-wide.jpg      /media/inside/set-wide.jpg
url inside/set.jpg           /media/inside/set.jpg
url inside/pen.jpg           /media/inside/pen.jpg
url inside/pen-hover.jpg     /media/inside/pen-hover.jpg
url inside/adapter.jpg       /media/inside/adapter.jpg
url details/cap.jpg          /media/details/cap.jpg
url details/cap-color.jpg    /media/details/cap-color.jpg
url details/pen-nib.jpg      /media/details/pen-nib.jpg
url details/body.jpg         /media/details/body.jpg
url details/card-5.png       /media/details/card-5.png
url colors/color-01.jpg      /media/colors/color-01.jpg
url colors/color-02.jpg      /media/colors/color-02.jpg
url colors/color-03.jpg      /media/colors/color-03.jpg
url colors/color-04.jpg      /media/colors/color-04.jpg
url colors/color-05.jpg      /media/colors/color-05.jpg
url videos/who.mp4           /media/videos/who.mp4
url videos/details.mp4       /media/videos/details.mp4
url popup/order-pen.png      /media/popup/order-pen.png
url icons/logo.svg           /media/icons/logo.svg
url opengraph.jpg            /media/opengraph.jpg

echo "OK — media directory: $OUT"
du -sh "$OUT" 2>/dev/null || true