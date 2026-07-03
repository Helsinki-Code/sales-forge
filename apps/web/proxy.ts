import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items: { name:string; value:string; options:CookieOptions }[]) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const bearer = request.headers.get("authorization")?.startsWith("Bearer ");
  const launchEnabled=process.env.PUBLIC_LAUNCH_ENABLED==="true",isProduction=process.env.NODE_ENV==="production",allowlist=(process.env.LAUNCH_ALLOWLIST_EMAILS||"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean),isInternal=Boolean(user?.email&&allowlist.includes(user.email.toLowerCase()));
  if(isProduction&&!launchEnabled&&!isInternal&&(request.nextUrl.pathname.startsWith("/dashboard")||request.nextUrl.pathname.startsWith("/api/v1"))){if(request.nextUrl.pathname.startsWith("/api/"))return NextResponse.json({error:{code:"launch_gated",message:"SEOForge is still behind production launch gates"}},{status:503});const url=request.nextUrl.clone();url.pathname="/login";url.searchParams.set("launch","gated");return NextResponse.redirect(url)}
  if (!user && !bearer && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/api/v1"))) {
    if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: { code: "unauthorized", message: "Authentication required" } }, { status: 401 });
    const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/api/v1/:path*", "/auth/:path*"] };
