# NŌTA

A reimplementation of <https://nota.uprock.pro/>, originally built with
[Taptop](https://taptop.pro/), a visual constructor. It has been rebuilt as a
Next.js front end backed by Strapi. The goal was not "a site like the original"
but a faithful reproduction of it: same layout, same scroll choreography, same
transitions, with every word and every image served from the CMS.

The original is a scrollytelling page. The desktop experience runs about 27
screens tall, stitched together from `position: sticky` "camera" sections, a
frame-by-frame scrubbed hero, and roughly 160 declarative scroll animations.
Most of the work here went into reverse-engineering how it does that and
reproducing it exactly.

---

## Repository layout

```
frontend/            Next.js app (the site)
backend/             Strapi 5 CMS (content and media)
.reference/          captured copy of the original, used as the porting source
scripts/             spec generator and backend readiness probe
RAILWAY.md           deployment notes
```

`frontend/README.md` covers the porting architecture, `.reference/PORTING.md`
covers the porting rules, and `backend/README.md` covers the CMS.

---

## Framework choices, and why

**Next.js 16 (App Router) and React 19.** The page is entirely CMS-driven, so it
has to be fetched per request. Server components let it fetch once on the server
and hand a complete DOM to the browser. That matters more here than usual,
because the animation engine wires itself to elements by DOM id when it mounts.
Server-rendering the exact reference markup means every ScrollTrigger attaches
to the right node without a client-side render pass or a layout shift.

**Strapi 5** as the CMS. It was already the project's backend, and the brief was
explicit that the content model is the source of truth, so no local content and
no schema changes. SQLite through `better-sqlite3` is the local database for
zero-configuration setup. Setting `DATABASE_CLIENT` swaps in Postgres for
production.

**GSAP and ScrollTrigger.** The original is GSAP-driven. Taptop compiles its
constructor animations down to GSAP timelines with ScrollTrigger. Reusing the
same library is what made a faithful port possible instead of an approximation,
because the reference's own keyframe data could be replayed rather than
reinterpreted. `Draggable`, which is already part of GSAP, drives the mobile
colour carousel, so no extra carousel dependency was needed.

**Lenis** for smooth scrolling, because the original uses it, including its
exact options (`lerp: 0.08`, `duration: 1.2`, desktop only, started after the
preloader). Matching the config matters, because the scroll feel is part of the
design.

**Tailwind v4** is still installed, but mostly for its reset and its `@theme`
breakpoint tokens. The visual language comes from the original's own
stylesheets. See the trade-offs section below.

What I deliberately did not do: rewrite the design in Tailwind, or reinterpret
the animations with Framer Motion or CSS scroll-driven animations. Both would
have produced something similar-looking rather than something identical.

---

## Running it locally

Requirements: Node 20 to 26, and npm 10 or newer.

```bash
npm install          # installs both workspaces
npm run data:seed    # import backend/data/seed.tar.gz (content and media)
npm run dev          # Strapi on :1337, Next on :3000
```

`npm run dev` starts both services in parallel, but holds the front end until
the backend's Content API actually answers (`scripts/wait-for-backend.cjs`), so
the first request never races a booting CMS. Then open
<http://localhost:3000>.

`.env.local` is created from `.env.example` on install, through the `prepare`
script calling `env:setup`.

Commands available from the repo root:

- `npm run dev` starts Strapi and Next together.
- `npm run dev:backend` or `npm run dev:frontend` starts just one of them.
- `npm run build` and `npm run start` produce and serve a production build.
- `npm run data:export:seed` re-exports `backend/data/seed.tar.gz`.
- `npm run data:seed` builds the backend, then imports the seed.
- `npm run typecheck` and `npm run lint` run across both workspaces.

One environment gotcha: `better-sqlite3` is a native module. If you switch Node
major versions, run `npm rebuild better-sqlite3 --workspace backend` or Strapi
will fail with a `NODE_MODULE_VERSION` mismatch.

---

## Content model

There are nine content types, all editable in the Strapi admin. The front end
reads them through a single `getHomeData()` call in `frontend/lib/api.ts`.
Nothing is hard-coded.

**product** (collection, 1 entry). Fields: `name`, `heading`, `subheading`,
`tagline`, `description`, `about`, `who_for_intro`, `cta_label`, `cta_price`,
`availability`, `year`, `team`, `design_credit`, `built_credit`. Media:
`hero_cover_video`, `cover_image`, `specs_image`, `specs_image_tablet`,
`specs_image_mobile`, `who_video`, `popup_image`, `popup_logo`.

**homepage** (single type). Fields: `inside_complete_heading`,
`inside_complete_text`, `inside_intro`, `popup_heading`, `popup_text`,
`popup_input_placeholder`, `popup_button`, `popup_success`, `popup_error`,
`popup_close`, `footer_copyright`, `footer_made_in`, `footer_built_by`,
`footer_designed_by`, `made_in_url`, `designed_url`, `uprock_url`, `meta_title`,
`meta_description`. Media: `inside_set_image`, `details_video`, `og_image`.

**spec** (collection, 3 entries). Fields: `title`, `items` (a JSON array of
strings).

**audience** (collection, 3 entries). Fields: `title`, `description`.

**feature** (collection, 4 entries). Fields: `eyebrow`, `title`, `body`. Media:
`image`, `image_mobile`.

**color-variant** (collection, 5 entries). Fields: `name`, `tagline`, `accent`
(`light` or `violet`). Media: `image`.

**box-item** (collection, 2 entries). Fields: `title`, `description`. Media:
`image`, `image_hover`.

**detail-card** (collection, 6 entries). Fields: `title`. Media: `image`,
`video`.

**team-member** (collection, 9 entries). Fields: `name`, `telegram`.

Every collection has an `order` integer. The front end sorts on it, so the
carousel and the card orders are editor-controlled.

Two things are worth knowing about how the model maps onto the design.

Some labels have no field. The four nav links, the `Specifications` and
`Who it's for:` headings, the `Inside / the box` title, and the footer's
`Navigation` and `Year` column headers are design chrome rather than content.
Adding fields for them would be a schema change, so they remain constants in the
components. The same applies to `app/favicon.ico`.

Media is used exactly as authored. Where a title needs a line break, the break
has to live in the CMS string. This is why the paper heading currently wraps
differently from the original, as noted below.

---

## Key trade-offs

- Most of the code was AI-written to fit the build's time constraints; hand-wringing
  roughly 160 scroll animations, both responsive section families, the CMS
  integration and a bespoke animation runtime was not realistic. The cost is that
  it skipped a human review pass, so the hardest parts to verify by eye — the
  engine in `frontend/lib/taptop/engine.ts`, the spec generator in
  `scripts/gen-taptop-spec.py`, and the vendored stylesheets in
  `frontend/app/styles/reference/` — are worth reading closely before building on.

- The mobile view still has image loading and layout issues. The desktop
  experience is the primary target, and the phone experience has not had the
  same level of verification, so images can load late and element spacing can
  drift from the original on small screens.

---

## What I'd improve with more time

1. Close the remaining content-mapping gaps. The paper section's heading wraps
   differently from the original because the original hard-codes line breaks
   that the CMS string does not have, so adding newline to `<br>` support would
   let an editor reproduce it. The details tiles follow the CMS `detail-cards`
   order rather than the original's arrangement. `og_image`,
   `specs_image_tablet` and `specs_image_mobile` are empty in the CMS, and
   `box_items[1].image_hover` is null, so the adapter's hover layer never shows.
   All of these are data or small front-end conveniences, not structural
   problems.

2. Trim the animation spec. Around 121 KB of JSON is loaded for every visitor,
   but any given page only needs a fraction of it. Splitting it per section, or
   generating it at build time per route, would cut the bundle substantially.

3. Drop the unused `lottie-web` dependency. It is a leftover from the first hero
   implementation.

4. Automate visual regression. I verified this port by screenshotting the
   reference and the rebuild at matched scroll offsets and diffing them. That
   should be a committed test using Playwright and pixel comparison, rather than
   an ad-hoc process, so future changes cannot silently drift.

5. Reduce the footprint of `.reference/`. The captured HTML, CSS and scripts are
   what made the port possible and are worth keeping, but a re-capture script
   would be better than committing 1.2 MB of snapshots.

6. Consider a real carousel library if the colour slider grows beyond five
   slides and swipe. A hand-rolled GSAP track is the right size for what is
   there now, but it is not a foundation for autoplay, looping and lazy slides.

7. Do a performance pass on the hero. Decoding 1920x1080 frames on scroll is
   heavy, so pre-sized renditions or a properly encoded all-keyframe video would
   cut memory and decode time, especially on low-end phones.

8. Run an accessibility audit. The carousel, the menu popup and the order form
   have basic semantics, but they have not been driven with a screen reader or a
   keyboard-only pass, and the `prefers-reduced-motion` handling, while present,
   deserves a proper check across every section.

---

## AI tools used

**opencode (with Big Pickle)** bootstrapped the project: the Next.js and Strapi
monorepo scaffold, scraping the reference site's content and media, and
generating the seed scripts. Those seed scripts are intentionally not version
controlled. The plan is to ship the seed file itself after data propagation, so
`backend/data/seed.tar.gz` is the committed artifact.

**DeepSeek Harness (v4.1)** did the in-depth UI replication: capturing and
decompiling the original's animation spec, porting the section markup and
stylesheets, building the Taptop animation runtime, and verifying the result
against the live reference with automated screenshots and geometry and style
probes.
