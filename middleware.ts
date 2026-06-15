import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const domain = host.split(":")[0]; // strip port for localhost:3002

  const response = NextResponse.next();
  response.headers.set("X-Store-Domain", domain);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - API routes (already have their own handling)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
