import { getHomeData } from "../lib/api";
import Preloader from "./components/Preloader";
import { OrderProvider } from "./components/chrome";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Specs from "./components/sections/Specs";
import Who from "./components/sections/Who";
import Paper from "./components/sections/Paper";
import Inside from "./components/sections/Inside";
import Details from "./components/sections/Details";
import Colors from "./components/sections/Colors";
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
