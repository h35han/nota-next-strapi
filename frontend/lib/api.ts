import { getStrapiMedia } from "./strapi";

export type SpecItem = {
  title: string;
  items: string[];
};

export type Audience = {
  title: string;
  description: string;
};

export type Feature = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageMobile: string;
};

export type ColorVariant = {
  name: string;
  tagline: string;
  image: string;
  accent: "light" | "violet";
};

export type BoxItem = {
  title: string;
  description: string;
  image: string;
  imageHover: string;
};

export type DetailCard = {
  title: string;
  image: string;
  video: string;
};

export type TeamMember = {
  name: string;
  telegram: string;
};

export type Product = {
  name: string;
  heading: string;
  subheading: string;
  tagline: string;
  description: string;
  about: string;
  whoForIntro: string;
  ctaLabel: string;
  ctaPrice: string;
  availability: string;
  year: number;
  team: string;
  designCredit: string;
  builtCredit: string;
  coverImage: string;
  coverLottie: string;
  specsImage: string;
  specsImageTablet: string;
  specsImageMobile: string;
  whoVideo: string;
  popupImage: string;
  popupLogo: string;
};

export type Homepage = {
  insideCompleteHeading: string;
  insideCompleteText: string;
  insideIntro: string;
  insideSetImage: string;
  detailsVideo: string;
  popupHeading: string;
  popupText: string;
  popupInputPlaceholder: string;
  popupButton: string;
  popupSuccess: string;
  popupError: string;
  popupClose: string;
  footerCopyright: string;
  footerMadeIn: string;
  footerBuiltBy: string;
  footerDesignedBy: string;
  madeInUrl: string;
  designedUrl: string;
  uprockUrl: string;
};

export type HomeData = {
  product: Product;
  specs: SpecItem[];
  audiences: Audience[];
  features: Feature[];
  colorVariants: ColorVariant[];
  boxItems: BoxItem[];
  detailCards: DetailCard[];
  teamMembers: TeamMember[];
  homepage: Homepage;
};

const API_URL = process.env.STRAPI_API_URL ?? "http://localhost:1337/api";
const TOKEN = process.env.STRAPI_API_TOKEN;

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response | null = null;
  for (let attempt = 1; ; attempt += 1) {
    try {
      res = await fetch(`${API_URL}${path}`, {
        cache: "no-store",
        ...(TOKEN ? { headers: { Authorization: `Bearer ${TOKEN}` } } : {}),
      });
      break;
    } catch (err) {
      // The backend may still be booting (npm run dev starts both services
      // in parallel) — retry connection failures with short backoff.
      if (attempt >= 8) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  if (!res || !res.ok) {
    throw new Error(`[api] GET ${API_URL}${path} → ${res?.status ?? "no response"} ${res?.statusText ?? ""}`);
  }
  return res.json() as Promise<T>;
}

type ManyResponse<T> = { data: T[] };

type Entry = Record<string, unknown> & { id: number; documentId: string };

/** Normalize a populated Strapi media object (or plain path) to a URL string. */
function mediaToUrl(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const url = (value as { url?: unknown }).url;
  return typeof url === "string" ? (getStrapiMedia(url) ?? "") : "";
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export async function getHomeData(): Promise<HomeData> {
  const [productRaw, specsRaw, audiencesRaw, featuresRaw, colorsRaw, boxRaw, detailsRaw, teamRaw, homepageRaw] =
    await Promise.all([
      fetchJson<ManyResponse<Entry>>("/products?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/specs?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/audiences?sort=order:asc"),
      fetchJson<ManyResponse<Entry>>("/features?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/color-variants?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/box-items?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/detail-cards?sort=order:asc&populate=*"),
      fetchJson<ManyResponse<Entry>>("/team-members?sort=order:asc"),
      fetchJson<Entry>("/homepage?populate=*"),
    ]);

  const p = productRaw.data[0];
  const product: Product = {
    name: str(p?.name),
    heading: str(p?.heading),
    subheading: str(p?.subheading),
    tagline: str(p?.tagline),
    description: str(p?.description),
    about: str(p?.about),
    whoForIntro: str(p?.who_for_intro),
    ctaLabel: str(p?.cta_label),
    ctaPrice: str(p?.cta_price),
    availability: str(p?.availability),
    year: typeof p?.year === "number" ? p.year : 2026,
    team: str(p?.team),
    designCredit: str(p?.design_credit),
    builtCredit: str(p?.built_credit),
    coverImage: mediaToUrl(p?.cover_image),
    coverLottie: mediaToUrl(p?.cover_lottie),
    specsImage: mediaToUrl(p?.specs_image),
    specsImageTablet: mediaToUrl(p?.specs_image_tablet),
    specsImageMobile: mediaToUrl(p?.specs_image_mobile),
    whoVideo: mediaToUrl(p?.who_video),
    popupImage: mediaToUrl(p?.popup_image),
    popupLogo: mediaToUrl(p?.popup_logo),
  };

  const specs: SpecItem[] = (specsRaw.data ?? []).map((s) => ({
    title: str(s.title),
    items: Array.isArray(s.items) ? (s.items as string[]) : [],
  }));

  const audiences: Audience[] = (audiencesRaw.data ?? []).map((a) => ({
    title: str(a.title),
    description: str(a.description),
  }));

  const features: Feature[] = (featuresRaw.data ?? []).map((f) => ({
    eyebrow: str(f.eyebrow),
    title: str(f.title),
    body: str(f.body),
    image: mediaToUrl(f.image),
    imageMobile: mediaToUrl(f.image_mobile) || mediaToUrl(f.image),
  }));

  const colorVariants: ColorVariant[] = (colorsRaw.data ?? []).map((c) => ({
    name: str(c.name),
    tagline: str(c.tagline),
    image: mediaToUrl(c.image),
    accent: c.accent === "violet" ? "violet" : "light",
  }));

  const boxItems: BoxItem[] = (boxRaw.data ?? []).map((b) => ({
    title: str(b.title),
    description: str(b.description),
    image: mediaToUrl(b.image),
    imageHover: mediaToUrl(b.image_hover),
  }));

  const detailCards: DetailCard[] = (detailsRaw.data ?? []).map((d) => ({
    title: str(d.title),
    image: mediaToUrl(d.image),
    video: mediaToUrl(d.video),
  }));

  const teamMembers: TeamMember[] = (teamRaw.data ?? []).map((t) => ({
    name: str(t.name),
    telegram: str(t.telegram),
  }));

  const h = homepageRaw.data as unknown as Entry | null;
  const homepage: Homepage = {
    insideCompleteHeading: str(h?.inside_complete_heading),
    insideCompleteText: str(h?.inside_complete_text),
    insideIntro: str(h?.inside_intro),
    insideSetImage: mediaToUrl(h?.inside_set_image),
    detailsVideo: mediaToUrl(h?.details_video),
    popupHeading: str(h?.popup_heading),
    popupText: str(h?.popup_text),
    popupInputPlaceholder: str(h?.popup_input_placeholder),
    popupButton: str(h?.popup_button),
    popupSuccess: str(h?.popup_success),
    popupError: str(h?.popup_error),
    popupClose: str(h?.popup_close),
    footerCopyright: str(h?.footer_copyright),
    footerMadeIn: str(h?.footer_made_in),
    footerBuiltBy: str(h?.footer_built_by),
    footerDesignedBy: str(h?.footer_designed_by),
    madeInUrl: str(h?.made_in_url),
    designedUrl: str(h?.designed_url),
    uprockUrl: str(h?.uprock_url),
  };

  return { product, specs, audiences, features, colorVariants, boxItems, detailCards, teamMembers, homepage };
}

export type SeoMetadata = {
  title: string;
  description: string;
  ogImage: string;
};

const DEFAULT_SEO: SeoMetadata = {
  title: "NŌTA — Smart pen for real thinking",
  description:
    "NŌTA creates tools that respect the way people think and write. Natural handwriting, quietly connected to digital structure.",
  ogImage: "/opengraph.jpg",
};

export async function getSeoMetadata(): Promise<SeoMetadata> {
  try {
    const raw = await fetchJson<Entry>("/homepage?populate=*");
    const h = raw.data as unknown as Entry | null;
    return {
      title: str(h?.meta_title) || DEFAULT_SEO.title,
      description: str(h?.meta_description) || DEFAULT_SEO.description,
      ogImage: mediaToUrl(h?.og_image) || DEFAULT_SEO.ogImage,
    };
  } catch {
    return DEFAULT_SEO;
  }
}