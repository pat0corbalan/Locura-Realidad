import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  return NextResponse.json(
    session ? { authenticated: true } : { authenticated: false },
    { status: session ? 200 : 401, headers: { "Cache-Control": "no-store" } }
  );
}
