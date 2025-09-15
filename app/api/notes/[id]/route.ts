import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Note from "../../../models/Notes";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // must await
    await connectDB();
    const tenantId = req.headers.get("x-tenantId");
    const note = await Note.findOne({ _id: id, tenantId: tenantId });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error("Get single note error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /notes/:id - update note
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // must await
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenantId");
  const role = req.headers.get("x-user-role");
  try {
    await connectDB();
    const { title, content } = await req.json();
    const note = await Note.findOne({ _id: id, tenantId: tenantId });
    if (role != "admin" && note.userId != userId) {
      return NextResponse.json(
        { error: "You are not allowed to edit" },
        { status: 401 }
      );
    }

    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    return NextResponse.json({ note });
  } catch (err: any) {
    console.error("Update note error:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /notes/:id - delete note
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenantId");
  const role = req.headers.get("x-user-role");

  try {
    const { id } = await params; // must await
    await connectDB();
    const note = await Note.findOne({ _id: id, tenantId: tenantId });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    if (role != "admin" && note.userId != userId) {
      return NextResponse.json(
        { error: "You are not allowed to edit" },
        { status: 401 }
      );
    }

    await Note.deleteOne({ _id: id });
    return NextResponse.json({ message: "Note deleted" });
  } catch (err: any) {
    console.error("Delete note error:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
