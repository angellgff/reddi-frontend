import { updateSession } from "@/src/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("[root-mw] ->", request.method, request.nextUrl.pathname);
  try {
    // Hard redirect legacy route to new 3-step checkout
    if (request.nextUrl.pathname === "/user/payment") {
      const url = request.nextUrl.clone();
      url.pathname = "/user/checkout/payment";
      return NextResponse.redirect(url);
    }

    const res = await updateSession(request);
    // Mark response so we can confirm middleware ran from the browser devtools
    try {
      res.headers.set("x-mw", "root-hit");
    } catch {}
    const authCookies = res.cookies
      .getAll()
      .filter((c) => c.name.includes("auth"));
    console.log("[root-mw] <- allow", request.nextUrl.pathname, {
      authCookies: authCookies.map((c) => c.name),
      status: (res as any).status || 200,
    });
    return res;
  } catch (e) {
    const err = e as Error;
    console.error("[root-mw] error", request.nextUrl.pathname, err?.message);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
