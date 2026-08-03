// Runtime API proxy — forwards /api/* to the backend.
// Unlike next.config rewrites (baked at build time), API_INTERNAL_URL is
// resolved per-request so one image works in any environment (dev/Dokploy).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:8000";
  const target = new URL(`/api/${path.join("/")}`, base);
  const incoming = new URL(req.url);
  target.search = incoming.search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  const isBodyless = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
  const body = isBodyless ? undefined : await req.arrayBuffer();

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(25_000),
  });

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");
  resHeaders.delete("transfer-encoding");
  resHeaders.set("cache-control", "no-store");

  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
