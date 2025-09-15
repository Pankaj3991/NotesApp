import { NextResponse } from "next/server";

// GET /api/health
export async function GET() {
  try {
    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
