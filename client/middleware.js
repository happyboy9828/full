import { NextResponse } from "next/server";

const LOGIN_PATH = "/kingdome/login";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_session")?.value;

  if (pathname.startsWith("/kingdome") && pathname !== LOGIN_PATH) {
    if (!token) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kingdome/:path*"],
};
