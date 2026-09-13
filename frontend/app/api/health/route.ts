import { NextResponse } from "next/server";
import { STRAPI_API_URL, STRAPI_URL } from "@/lib/strapi";

export const dynamic = "force-dynamic";

const check = async (url: string) => {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: process.env.STRAPI_API_TOKEN
        ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
        : undefined,
    });
    return { reachable: true, status: res.status };
  } catch {
    return { reachable: false, status: 0 };
  }
};

export async function GET() {
  const started = Date.now();

  const [server, api] = await Promise.all([
    check(STRAPI_URL),
    check(STRAPI_API_URL),
  ]);

  const ok = server.reachable && api.reachable;

  return NextResponse.json(
    {
      ok,
      service: "strapi",
      latencyMs: Date.now() - started,
      endpoints: {
        server: { url: STRAPI_URL, ...server },
        api: { url: STRAPI_API_URL, ...api },
      },
    },
    { status: ok ? 200 : 502 }
  );
}