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

export type HtmlMetadata = {
  title: string;
  description: string;
  ogImage: string;
};

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const API_URL = process.env.STRAPI_API_URL ?? "http://localhost:1337/api";
const TOKEN = process.env.STRAPI_API_TOKEN;

type ManyResponse<T> = { data: T[] };

type Entry = Record<string, unknown> & { id: number; documentId: string };

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Normalize a populated Strapi media object (or plain path) to a URL string. */
function mediaToUrl(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const url = (value as { url?: unknown }).url;
  return typeof url === "string" ? (getStrapiMedia(url) ?? "") : "";
}

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response | null = null;
  for (let attempt = 1; ; attempt += 1) {
    try {
      res = await fetch(`${API_URL}${path}`, {
        cache: "no-store",
        ...(TOKEN ? { headers: { Authorization: `Bearer ${TOKEN}` } } : {})
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

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapProduct(entry: Entry | undefined): Product {
  return {
    name: str(entry?.name),
    heading: str(entry?.heading),
    subheading: str(entry?.subheading),
    tagline: str(entry?.tagline),
    description: str(entry?.description),
    about: str(entry?.about),
    whoForIntro: str(entry?.who_for_intro),
    ctaLabel: str(entry?.cta_label),
    ctaPrice: str(entry?.cta_price),
    availability: str(entry?.availability),
    year: typeof entry?.year === "number" ? entry.year : 2026,
    team: str(entry?.team),
    designCredit: str(entry?.design_credit),
    builtCredit: str(entry?.built_credit),
    coverImage: mediaToUrl(entry?.cover_image),
    coverLottie: mediaToUrl(entry?.cover_lottie),
    specsImage: mediaToUrl(entry?.specs_image),
    specsImageTablet: mediaToUrl(entry?.specs_image_tablet),
    specsImageMobile: mediaToUrl(entry?.specs_image_mobile),
    whoVideo: mediaToUrl(entry?.who_video),
    popupImage: mediaToUrl(entry?.popup_image),
    popupLogo: mediaToUrl(entry?.popup_logo)
  };
}

function mapHomepage(entry: Entry | null | undefined): Homepage {
  return {
    insideCompleteHeading: str(entry?.inside_complete_heading),
    insideCompleteText: str(entry?.inside_complete_text),
    insideIntro: str(entry?.inside_intro),
    insideSetImage: mediaToUrl(entry?.inside_set_image),
    detailsVideo: mediaToUrl(entry?.details_video),
    popupHeading: str(entry?.popup_heading),
    popupText: str(entry?.popup_text),
    popupInputPlaceholder: str(entry?.popup_input_placeholder),
    popupButton: str(entry?.popup_button),
    popupSuccess: str(entry?.popup_success),
    popupError: str(entry?.popup_error),
    popupClose: str(entry?.popup_close),
    footerCopyright: str(entry?.footer_copyright),
    footerMadeIn: str(entry?.footer_made_in),
    footerBuiltBy: str(entry?.footer_built_by),
    footerDesignedBy: str(entry?.footer_designed_by),
    madeInUrl: str(entry?.made_in_url),
    designedUrl: str(entry?.designed_url),
    uprockUrl: str(entry?.uprock_url)
  };
}

const DEFAULT_METADATA: HtmlMetadata = {
  title: "NŌTA | Writing Infrastructure for Modern Thinking",
  description:
    "NŌTA is a smart writing system that combines a precision smart pen, intelligent paper, and real-time digital sync. Designed for people who think better by hand, it captures handwriting instantly, organizes notes automatically, and turns analog writing into structured, searchable digital knowledge.",
  ogImage: "/opengraph.jpg"
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getHomeData(): Promise<HomeData> {
  const [products, specs, audiences, features, colors, box, details, team, homepageRaw] = await Promise.all([
    fetchJson<ManyResponse<Entry>>("/products?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/specs?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/audiences?sort=order:asc"),
    fetchJson<ManyResponse<Entry>>("/features?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/color-variants?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/box-items?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/detail-cards?sort=order:asc&populate=*"),
    fetchJson<ManyResponse<Entry>>("/team-members?sort=order:asc"),
    fetchJson<Entry>("/homepage?populate=*")
  ]);

  const homepage = mapHomepage(homepageRaw.data as unknown as Entry | null);

  return {
    product: mapProduct(products.data[0]),
    specs: (specs.data ?? []).map((s) => ({
      title: str(s.title),
      items: Array.isArray(s.items) ? (s.items as string[]) : []
    })),
    audiences: (audiences.data ?? []).map((a) => ({
      title: str(a.title),
      description: str(a.description)
    })),
    features: (features.data ?? []).map((f) => ({
      eyebrow: str(f.eyebrow),
      title: str(f.title),
      body: str(f.body),
      image: mediaToUrl(f.image),
      imageMobile: mediaToUrl(f.image_mobile) || mediaToUrl(f.image)
    })),
    colorVariants: (colors.data ?? []).map((c) => ({
      name: str(c.name),
      tagline: str(c.tagline),
      image: mediaToUrl(c.image),
      accent: c.accent === "violet" ? "violet" : "light"
    })),
    boxItems: (box.data ?? []).map((b) => ({
      title: str(b.title),
      description: str(b.description),
      image: mediaToUrl(b.image),
      imageHover: mediaToUrl(b.image_hover)
    })),
    detailCards: (details.data ?? []).map((d) => ({
      title: str(d.title),
      image: mediaToUrl(d.image),
      video: mediaToUrl(d.video)
    })),
    teamMembers: (team.data ?? []).map((t) => ({
      name: str(t.name),
      telegram: str(t.telegram)
    })),
    homepage
  };
}

export async function getHtmlMetadata(): Promise<HtmlMetadata> {
  try {
    const raw = await fetchJson<Entry>("/homepage?populate=*");
    const h = raw.data as unknown as Entry | null;
    return {
      title: str(h?.meta_title) || DEFAULT_METADATA.title,
      description: str(h?.meta_description) || DEFAULT_METADATA.description,
      ogImage: mediaToUrl(h?.og_image) || DEFAULT_METADATA.ogImage
    };
  } catch {
    return DEFAULT_METADATA;
  }
}
