import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Note from "../../models/Notes";
import Tenant from "../../models/Tenant";

// POST /notes - create note
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenantId");

  try {
    await connectDB();
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    const notes = await Note.find({ tenantId: tenantId });
    if (notes.length >= 3 && tenant.subscription == "free") {
      return NextResponse.json(
        {
          error:
            "Free version can create only 3 notes, Ask admin to upgrade to pro. If admin, got to mynotes>upgrade to pro",
        },
        { status: 429 }
      );
    }

    const { title, content } = await req.json();

    const note = await Note.create({
      title,
      content,
      tenantId,
      userId,
    });
    return NextResponse.json({ note });
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

// GET /notes - list all notes for tenant
export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenantId");

  try {
    await connectDB();
    const notes = await Note.find({ tenantId: tenantId });
    const uniqueUserIds = await Note.distinct("userId", { tenantId: tenantId });
    const totalUsers = uniqueUserIds.length;

    return NextResponse.json({ notes, total: notes.length, totalUsers });
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
