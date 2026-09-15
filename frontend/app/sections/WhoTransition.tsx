/**
 * Who transition — the four black "curtain" divs that wipe in over the
 * specs section and reveal the `who` section underneath.
 *
 * The whole behaviour is data-driven: the ids below (`iljeh1gyu_0`,
 * `i2yp53gej_0`, `iau8pv8gr_0`, `i9xno42x2_0`, `ibfuwp6xz_0`) are looked
 * up by `lib/taptop/engine.ts` and animated from the spec
 * (`SIZE` 0% → 100% width, staggered). Nothing to wire by hand — this
 * file only has to reproduce the reference element tree, ids and classes
 * verbatim (see `.reference/sections/_full_body.html`, id `iljeh1gyu_0`).
 */
export default function WhoTransition() {
  return (
    <section className="section who-transition section--u-iljeh1gyu" id="iljeh1gyu_0">
      <div className="container who-transition__camera container--u-iak0nqsvx" id="iak0nqsvx_0">
        <div className="div who-transition__curtains-wrapper div--u-iyhl3cmzl" id="iyhl3cmzl_0">
          <div className="div div--u-i2yp53gej bc--main-black who-transition__curtain--top" id="i2yp53gej_0"></div>
          <div className="div div--u-iau8pv8gr bc--main-black who-transition__curtain" id="iau8pv8gr_0"></div>
          <div className="div div--u-i9xno42x2 bc--main-black who-transition__curtain" id="i9xno42x2_0"></div>
          <div className="div div--u-ibfuwp6xz bc--main-black who-transition__curtain" id="ibfuwp6xz_0"></div>
        </div>
      </div>
    </section>
  );
}
