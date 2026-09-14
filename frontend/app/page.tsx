import { getHomeData } from "../lib/api";
import Preloader from "./components/Preloader";
import { OrderProvider } from "./components/chrome";
import Hero from "./sections/Hero";
import Specs from "./sections/Specs";
import Who from "./sections/Who";
import Paper from "./sections/Paper";
import Inside from "./sections/Inside";
import Details from "./sections/Details";
import Colors from "./sections/Colors";

import Header from "./components/Header";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getHomeData();

  return (
    <>
      <Preloader />
      <OrderProvider homepage={data.homepage} product={data.product}>
        <Header orderLabel={data.product.ctaLabel || "Order"} />
        <main>
          <Hero product={data.product} />
          <Specs product={data.product} specs={data.specs} />
          <Who product={data.product} audiences={data.audiences} />
          <Paper features={data.features} />
          <Inside items={data.boxItems} homepage={data.homepage} />
          <Details cards={data.detailCards} homepage={data.homepage} />
          <Colors colors={data.colorVariants} />
          <Footer product={data.product} homepage={data.homepage} team={data.teamMembers} />
        </main>
      </OrderProvider>
    </>
  );
}
