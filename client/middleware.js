import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith("/kingdome/dashboard")) {
    const token = request.cookies.get("admin_session")?.value;
    
    if (!token) {
      const loginUrl = new URL("/kingdome/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  if (pathname === "/kingdome/login") {
    const token = request.cookies.get("admin_session")?.value;
    
    if (token) {
      const redirect = request.nextUrl.searchParams.get("redirect") || "/kingdome/dashboard";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/kingdome/:path*"],
};