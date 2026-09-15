/**
 * Inside transition — the white circle that scales up to flood the viewport
 * and hands the page over from the NŌTA story to the "Inside the box"
 * section.
 *
 * Ported 1:1 from `.reference/sections/_full_body.html`
 * (`section.inside__transition`, id `inmw53la5_0`). The circle
 * (`idiquhjyq_0`) and the title wrapper (`io3h12ptc_0`) are both driven by
 * `spec.json` through the Taptop engine, so this component only has to keep
 * the reference element tree (classes + ids) intact.
 *
 * The reference hard-codes the two-line "Inside / the box" title (first word
 * grey #999, second line black); the CMS has no field for it.
 */
export default function InsideTransition() {
  return (
    <section className="section inside__transition section--u-inmw53la5" id="inmw53la5_0">
      <div className="container inside__transition-camera" id="i4mr8cdnm_0">
        <div
          className="div inside__transition-circle bc--main-white div--u-idiquhjyq"
          id="idiquhjyq_0"
        ></div>
        <div className="div inside__title-wrapper tc--main-black div--u-io3h12ptc" id="io3h12ptc_0">
          <h2 className="text headline--2 text-align--center" id="isuxd4kv8_0">
            <span className="text-block-wrap-div">
              <span style={{ color: "rgb(153, 153, 153)" }}>Inside</span>
              <br />
              the box
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
