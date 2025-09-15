import { NextResponse } from "next/server";

// GET /api/health
export async function GET() {
  try {
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Health check error:", err.message);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
