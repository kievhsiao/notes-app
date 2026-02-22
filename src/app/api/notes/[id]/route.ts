import { NextRequest, NextResponse } from "next/server";
import { deleteNote, updateNote } from "@/lib/db";
import { CreateNoteDTO } from "@/lib/types";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const success = await deleteNote(id);

        if (!success) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        // Validate and process the updated data
        // Just extract fields we care about
        const noteData: CreateNoteDTO = {
            title: body.title || "",
            date: body.date || new Date().toISOString(),
            tags: Array.isArray(body.tags) ? body.tags : [],
            media: Array.isArray(body.media) ? body.media : [],
            content: body.content || "",
        };

        const updatedNote = await updateNote(id, noteData);

        if (!updatedNote) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json({ note: updatedNote });
    } catch (error) {
        console.error("API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    }
}
