import { NextResponse } from "next/server";
import { COOKIE, verifySession } from "./lib/auth";

// Mọi trang (trừ trang đăng nhập) đều yêu cầu mật khẩu.
export async function middleware(request) {
  const name = await verifySession(request.cookies.get(COOKIE)?.value);
  if (name) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse("Chưa đăng nhập", { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
