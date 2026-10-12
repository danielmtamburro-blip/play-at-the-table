import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase auth session cookie for dashboard pages. */
export async function middleware(request: NextRequest) {
  // Auth emails fall back to the Site URL root (/?code=...) if the callback URL isn't allow-listed.
  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.pathname === "/" && code) {
    const to = request.nextUrl.clone();
    to.pathname = "/auth/callback";
    return NextResponse.redirect(to);
  }
  if (request.nextUrl.pathname === "/") return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ["/", "/dashboard/:path*", "/login", "/auth/:path*"] };
