import { strapi } from "@strapi/client";

export const STRAPI_API_URL =
  process.env.STRAPI_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "";

export const STRAPI_URL =
  process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? "";

// The Strapi client factory — docs: https://docs.strapi.io/cms/api/client
// Uses native fetch, so it works in Server Components and Route Handlers.
export const client = strapi({
  baseURL: STRAPI_API_URL,
  auth: process.env.STRAPI_API_TOKEN,
});

// Resolve Strapi media (e.g. "/uploads/hero.png") to an absolute URL.
export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default client;