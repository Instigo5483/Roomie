import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);

  if (!isLoggedIn && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/rooms";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
