import { NextResponse } from "next/server";

const LOGIN_PATH = "/kingdome/login";

/**
 * Edge middleware for the admin area.
 *
 * This is a *fast path* only: it bounces visitors who have no `admin_session`
 * cookie straight to the login page so the dashboard never renders its shell
 * for anonymous users. It deliberately does not validate the cookie — the
 * server checks the session on every request, and the client `AdminShell`
 * performs the real redirect after `/api/auth/me` responds 401.
 */
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
