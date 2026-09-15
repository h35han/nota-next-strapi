import { getHomeData, FALLBACK_HOME_DATA } from "../lib/api";
import Preloader from "./components/Preloader";
import { OrderProvider } from "./components/chrome";
import Header from "./components/Header";
import Cover from "./sections/Cover";
import TransitionSpecs from "./sections/TransitionSpecs";
import Specs from "./sections/Specs";
import WhoTransition from "./sections/WhoTransition";
import Who from "./sections/Who";
import Paper from "./sections/Paper";
import InsideTransition from "./sections/InsideTransition";
import Inside from "./sections/Inside";
import Details from "./sections/Details";
import Colors from "./sections/Colors";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

/**
 * Home — the whole page.
 *
 * The wrapper tree is not decorative: the desktop experience is a
 * scrollytelling "camera" built from `position: sticky` sections, and each
 * section is bounded by its wrapper:
 *
 *   .black-bg__wrapper            (15502 px @ 900 px viewport)
 *     section.cover               270vh, sticky top -170vh
 *     section.transition-specs    180vh, sticky top 0, margin-top -100vh
 *     .sticky__wrapper            3690 px
 *       section.specs             300vh, sticky top -200vh, margin-top -100vh
 *       section.who-transition    180vh, margin-top -70vh
 *     section.who                 sticky top -300vh, margin-top -100vh
 *     .sticky-wrapper            6570 px
 *       section.paper             600vh, sticky top 0
 *       section.inside__transition 230vh, margin-top -100vh
 *   section.inside
 *   section.details
 *   …the `--static` variants below 992px…
 *   .scroll-wrapper
 *     section.section-colors      350vh
 *     footer.footer
 *
 * Getting a wrapper wrong changes every sticky offset after it, so keep the
 * nesting in sync with the reference (`.reference/sections/_full_body.html`).
 */
export default async function Home() {
  let data;
  try {
    data = await getHomeData();
  } catch {
    // Strapi unreachable — render a static default so the site never 500s.
    data = FALLBACK_HOME_DATA;
  }

  return (
    <>
      <Preloader />
      <OrderProvider homepage={data.homepage} product={data.product}>
        <Header product={data.product} />

        <div className="div black-bg__wrapper bc--main-black" id="i29ho25e1_0">
          <Cover product={data.product} />
          <TransitionSpecs />

          <div className="div sticky__wrapper div--u-ixh1v63v5" id="ixh1v63v5_0">
            <Specs product={data.product} specs={data.specs} />
            <WhoTransition />
          </div>

          <Who product={data.product} audiences={data.audiences} />

          <div className="div sticky-wrapper div--u-i0oeetgkk" id="i0oeetgkk_0">
            <Paper features={data.features} />
            <InsideTransition />
          </div>
        </div>

        <Inside items={data.boxItems} homepage={data.homepage} />
        <Details homepage={data.homepage} cards={data.detailCards} />

        <div className="div scroll-wrapper" id="itst048wh_0">
          <Colors colors={data.colorVariants} />
          <Footer product={data.product} homepage={data.homepage} team={data.teamMembers} />
        </div>
      </OrderProvider>
    </>
  );
}
