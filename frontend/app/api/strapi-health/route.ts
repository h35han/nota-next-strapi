import { client, STRAPI_API_URL } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await client.fetch("/", { method: "GET" });
    return Response.json({
      ok: res.ok,
      status: res.status,
      apiUrl: STRAPI_API_URL,
      data: res.ok ? await res.json() : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      { ok: false, apiUrl: STRAPI_API_URL, message },
      { status: 502 }
    );
  }
}