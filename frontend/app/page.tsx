import { getHomeData, FALLBACK_HOME_DATA } from "../lib/api";
import Preloader from "./components/Preloader";
import { OrderProvider } from "./components/chrome";
import Hero from "./sections/Hero";
import Transition1 from "./sections/Transition1";
import Specs from "./sections/Specs";
import Transition2 from "./sections/Transition2";
import Who from "./sections/Who";
import Paper from "./sections/Paper";
import Transition3 from "./sections/Transition3";
import Inside from "./sections/Inside";
import Colors from "./sections/Colors";

import Header from "./components/Header";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

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
        <main>
          <Hero product={data.product} />
          <Transition1 />
          <Specs product={data.product} specs={data.specs} />
          <Transition2 product={data.product} />
          <Who product={data.product} audiences={data.audiences} />
          <Paper features={data.features} />
          <Transition3 />
          <Inside items={data.boxItems} homepage={data.homepage} cards={data.detailCards} />
          <Colors colors={data.colorVariants} />
          <Footer product={data.product} homepage={data.homepage} team={data.teamMembers} />
        </main>
      </OrderProvider>
    </>
  );
}