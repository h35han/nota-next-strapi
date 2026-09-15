#!/usr/bin/env python3
"""
Regenerate frontend/lib/taptop/spec.json from the captured Taptop page.

The spec is a per-element, per-breakpoint resolution of Taptop's animation
data. Two rules matter and are easy to get wrong:

1. Inheritance is Taptop's `R()` — a `mergeWith` whose customiser keeps the
   existing value when the incoming one is `null`. Keyframe arrays merge
   *index-wise*, so a `(min-width: 1440px)` layer can override just
   `keyframes[1].y` and leave `x`/`z` inherited.
2. **Hold keyframes are load-bearing.** An effect whose two keyframes are
   identical (e.g. `y: 140% → 140%` over keyframes 0→25) is not a no-op: it
   parks the element below the fold before the reveal, and provides the
   `from` value the next effect animates away from. Dropping them makes the
   specs cards start at `translateY(0)` and visibly drop before rising.

Run from the repo root:  python3 scripts/gen-taptop-spec.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".reference/scripts/inline_13.js")
OUT = os.path.join(ROOT, "frontend/lib/taptop/spec.json")

# Taptop's `O.Ay` (see do.section.js) with `O.Yb` = index of "screen".
BPS = [
    "(min-width: 1920px)",
    "(min-width: 1440px)",
    "(min-width: 1280px)",
    "screen",
    "(max-width: 991px)",
    "(max-width: 767px)",
    "(max-width: 479px)",
]
BASE = BPS.index("screen")


def _merge(dst, src):
    """lodash `mergeWith` with a customiser that ignores incoming `null`."""
    for key, value in src.items():
        if value is None:
            continue  # null means "keep what the base layer had"
        current = dst.get(key)
        if isinstance(value, dict) and isinstance(current, dict):
            dst[key] = _merge(dict(current), value)
        elif isinstance(value, list) and isinstance(current, list):
            merged = list(current) + [None] * max(0, len(value) - len(current))
            for i, item in enumerate(value):
                if item is None:
                    continue
                if isinstance(item, dict) and isinstance(merged[i], dict):
                    merged[i] = _merge(dict(merged[i]), item)
                else:
                    merged[i] = item
            dst[key] = merged
        else:
            dst[key] = value
    return dst


def resolve(index, keyed_by_breakpoint):
    """Apply Taptop's `R(index, params)`."""
    if index < BASE:
        chain = list(range(index, BASE + 1))
    else:
        chain = list(range(index, BASE - 1, -1))
    chain.reverse()  # base first, most specific last
    out = {}
    for i in chain:
        layer = keyed_by_breakpoint.get(BPS[i])
        if isinstance(layer, dict):
            out = _merge(out, layer)
    return out


def build_effect(effect, index):
    resolved = resolve(index, effect)
    if not resolved:
        return None
    keyframes = resolved.get("keyframes") or []
    if len(keyframes) < 2:
        return None
    options = resolved.get("options") or {}
    eff = {"n": resolved.get("name"), "k": keyframes}
    for key, short in (
        ("ease", "e"),
        ("startKeyframe", "s"),
        ("endKeyframe", "x"),
        ("delay", "d"),
        ("duration", "u"),
    ):
        if options.get(key) is not None:
            eff[short] = options[key]
    return eff




def main():
    data = json.load(open(SRC, encoding="utf-8"))
    mapping = data["data"]["tt_animation"]
    params = data["params"]

    anims = {}
    element_map = {}

    for element_id, anim_id in mapping.items():
        if anim_id not in params:
            continue
        try:
            cfg = json.loads(params[anim_id])
        except Exception:
            continue
        if "animations" not in cfg:
            continue
        element_map[element_id] = anim_id

        if anim_id in anims:
            continue

        definitions = []
        for anim in cfg["animations"].values():
            media = anim.get("mediaParams", {})
            effects = cfg.get("effects") or {}

            resolved_base = resolve(BASE, media)
            if not resolved_base:
                continue
            effect_ids = resolved_base.get("effectIds") or []
            base_effects = [build_effect(effects[e], BASE) for e in effect_ids if e in effects]
            base_effects = [e for e in base_effects if e]

            base_params = {
                "off": bool(resolved_base.get("disabled")),
                "t": resolved_base.get("triggerElement") or "",
                "sp": resolved_base.get("startPosition"),
                "ep": resolved_base.get("endPosition"),
                "so": resolved_base.get("startOffset"),
                "eo": resolved_base.get("endOffset"),
                "sso": resolved_base.get("scrollerStartOffset"),
                "seo": resolved_base.get("scrollerEndOffset"),
                "sm": resolved_base.get("smoothing"),
                "sa": resolved_base.get("stageOfAppear"),
                "it": resolved_base.get("iterations"),
                "lp": resolved_base.get("loop"),
                "f": base_effects,
            }

            # Sparse per-breakpoint selection: `None` means "same as base".
            sel = [None] * len(BPS)
            sel[BASE] = base_params
            for i in range(len(BPS)):
                if i == BASE:
                    continue
                resolved = resolve(i, media)
                if not resolved:
                    continue
                ids = resolved.get("effectIds") or []
                effs = [build_effect(effects[e], i) for e in ids if e in effects]
                effs = [e for e in effs if e]
                candidate = {
                    "off": bool(resolved.get("disabled")),
                    "t": resolved.get("triggerElement") or "",
                    "sp": resolved.get("startPosition"),
                    "ep": resolved.get("endPosition"),
                    "so": resolved.get("startOffset"),
                    "eo": resolved.get("endOffset"),
                    "sso": resolved.get("scrollerStartOffset"),
                    "seo": resolved.get("scrollerEndOffset"),
                    "sm": resolved.get("smoothing"),
                    "sa": resolved.get("stageOfAppear"),
                    "it": resolved.get("iterations"),
                    "lp": resolved.get("loop"),
                    "f": effs,
                }
                if candidate != base_params:
                    sel[i] = candidate

            definitions.append({"id": anim.get("id"), "tr": anim.get("triggerName"), "sel": sel})

        anims[anim_id] = {"a": definitions}

    payload = {"bp": BPS, "base": BASE, "m": element_map, "a": anims}
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, separators=(",", ":"))

    holds = 0
    for entry in anims.values():
        for definition in entry["a"]:
            for slot in definition["sel"]:
                if not slot:
                    continue
                for eff in slot["f"]:
                    if len(eff["k"]) >= 2 and eff["k"][0] == eff["k"][-1]:
                        holds += 1
    print(
        f"wrote {OUT} ({os.path.getsize(OUT)} bytes) — "
        f"{len(anims)} animations, {len(element_map)} elements, {holds} hold effects kept"
    )


if __name__ == "__main__":
    main()
