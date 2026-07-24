import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  applySecurityHeaders(response.headers, process.env.NODE_ENV === "development");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // These were previously asserted non-null. On a deployment without Supabase
  // configured, createServerClient throws and every /auth and /app request
  // returns a 500. Treat missing config as "no session" instead: sign-in can't
  // work without Supabase anyway, but the routes still render.
  const user = supabaseUrl && supabaseAnonKey
    ? await getUser(request, supabaseUrl, supabaseAnonKey, (r) => { response = r; })
    : null;

  const isAppRoute = request.nextUrl.pathname.startsWith("/app");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(url);
    applySecurityHeaders(redirect.headers, process.env.NODE_ENV === "development");
    return redirect;
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    const redirect = NextResponse.redirect(url);
    applySecurityHeaders(redirect.headers, process.env.NODE_ENV === "development");
    return redirect;
  }

  return response;
}

async function getUser(
  request: NextRequest,
  supabaseUrl: string,
  supabaseAnonKey: string,
  onResponse: (r: NextResponse) => void
) {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          const next = NextResponse.next({ request: { headers: request.headers } });
          next.cookies.set({ name, value, ...options });
          applySecurityHeaders(next.headers, process.env.NODE_ENV === "development");
          onResponse(next);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          const next = NextResponse.next({ request: { headers: request.headers } });
          next.cookies.set({ name, value: "", ...options });
          applySecurityHeaders(next.headers, process.env.NODE_ENV === "development");
          onResponse(next);
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // A misconfigured or unreachable Supabase project must not 500 the site.
    return null;
  }
}

export const config = {
  matcher: ["/app/:path*", "/auth", "/auth/:path*"],
};
