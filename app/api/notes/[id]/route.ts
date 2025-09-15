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

// PUT /notes/:id - update note
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
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

// DELETE /notes/:id - delete note
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenantId");
  const role = req.headers.get("x-user-role");

  try {
    const { params } = context;
    const { id } = await params; // <-- await here
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
