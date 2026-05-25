import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Enrutamiento según el rol del usuario
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    if (pathname.startsWith("/game")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: ["/game/:path*", "/admin/:path*"],
};
