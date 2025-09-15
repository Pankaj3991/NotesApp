import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Note from "../../models/Notes";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  try {
    await connectDB();
    const notes = await Note.find({ userId: userId });
    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error("Get my notes error:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}