import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "ENDPOINT_DISABLED" },
    { status: 410 }
  );
}

