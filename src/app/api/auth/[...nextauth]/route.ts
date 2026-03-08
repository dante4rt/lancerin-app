import NextAuthImport from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params?: Promise<{ nextauth?: string[] | string }> | { nextauth?: string[] | string };
}

interface ApiLikeRequest {
  query: Record<string, string | string[]>;
  body?: Record<string, unknown> | string;
  cookies: Record<string, string>;
  headers: Record<string, string>;
  method: string;
}

class ApiLikeResponse {
  private statusCode = 200;
  private headers = new Map<string, string | string[]>();
  private payload: string | Record<string, unknown> | null = null;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  setHeader(key: string, value: string | string[]): this {
    this.headers.set(key.toLowerCase(), value);
    return this;
  }

  getHeader(key: string): string | string[] | undefined {
    return this.headers.get(key.toLowerCase());
  }

  json(value: Record<string, unknown>): this {
    this.setHeader("content-type", "application/json");
    this.payload = value;
    return this;
  }

  send(value: string | Record<string, unknown>): this {
    this.payload = value;
    return this;
  }

  end(value?: string): this {
    this.payload = value ?? null;
    return this;
  }

  toResponse(): Response {
    const responseHeaders = new Headers();
    for (const [key, value] of this.headers.entries()) {
      if (Array.isArray(value)) {
        for (const item of value) {
          responseHeaders.append(key, item);
        }
      } else {
        responseHeaders.set(key, value);
      }
    }

    let body: string | null = null;
    if (typeof this.payload === "string") {
      body = this.payload;
    } else if (this.payload && responseHeaders.get("content-type") === "application/json") {
      body = JSON.stringify(this.payload);
    } else if (this.payload) {
      body = JSON.stringify(this.payload);
    }

    return new Response(body, {
      status: this.statusCode,
      headers: responseHeaders,
    });
  }
}

type NextAuthHandlerFactory = typeof import("next-auth")["default"];
type NextAuthApiHandler = (req: ApiLikeRequest, res: ApiLikeResponse) => Promise<unknown>;

function resolveNextAuthFactory(mod: unknown): NextAuthHandlerFactory {
  if (typeof mod === "function") {
    return mod as NextAuthHandlerFactory;
  }

  const firstDefault = (mod as { default?: unknown } | undefined)?.default;
  if (typeof firstDefault === "function") {
    return firstDefault as NextAuthHandlerFactory;
  }

  const secondDefault = (
    firstDefault as { default?: unknown } | undefined
  )?.default;
  if (typeof secondDefault === "function") {
    return secondDefault as NextAuthHandlerFactory;
  }

  throw new TypeError("Unable to resolve NextAuth handler factory");
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const name = trimmed.slice(0, idx);
    const raw = trimmed.slice(idx + 1);
    try {
      out[name] = decodeURIComponent(raw);
    } catch {
      out[name] = raw;
    }
  }
  return out;
}

function extractNextAuthFromPath(pathname: string): string[] {
  const marker = "/api/auth/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) {
    return [];
  }

  const tail = pathname.slice(idx + marker.length);
  return tail.split("/").filter(Boolean);
}

async function buildApiRequest(req: Request, context?: RouteContext): Promise<ApiLikeRequest> {
  const url = new URL(req.url);
  const params = context?.params ? await context.params : undefined;

  const query: Record<string, string | string[]> = {};
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value;
  }

  const nextauthParam = params?.nextauth;
  if (Array.isArray(nextauthParam)) {
    query.nextauth = nextauthParam;
  } else if (typeof nextauthParam === "string") {
    query.nextauth = [nextauthParam];
  }

  if (!query.nextauth) {
    const fromPath = extractNextAuthFromPath(url.pathname);
    if (fromPath.length) {
      query.nextauth = fromPath;
    }
  }

  const headersObj = Object.fromEntries(req.headers.entries());

  let body: ApiLikeRequest["body"];
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, unknown>;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text).entries());
    } else {
      body = await req.text();
    }
  }

  const cookies = parseCookies(req.headers.get("cookie") ?? "");

  return {
    query,
    body,
    cookies,
    headers: headersObj,
    method: req.method,
  };
}

const NextAuth = resolveNextAuthFactory(NextAuthImport);
const handler = NextAuth(authOptions) as unknown as NextAuthApiHandler;

async function run(req: Request, context?: RouteContext): Promise<Response> {
  const apiReq = await buildApiRequest(req, context);
  const apiRes = new ApiLikeResponse();
  await handler(apiReq, apiRes);
  return apiRes.toResponse();
}

export async function GET(req: Request, context: RouteContext): Promise<Response> {
  return run(req, context);
}

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  return run(req, context);
}
