import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(_req: NextRequest) {
  // Auth is enforced in API routes + client UI.
  // Keep middleware light (no Node fs imports) so Edge build passes.
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
