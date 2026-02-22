import { NextRequest, NextResponse } from "next/server";
import { getNotes, addNote } from "@/lib/db";
import { CreateNoteDTO } from "@/lib/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const query = searchParams.get("q") || undefined;
        const archiveYear = searchParams.has("year") ? parseInt(searchParams.get("year") as string) : undefined;
        const archiveMonth = searchParams.has("month") ? parseInt(searchParams.get("month") as string) : undefined;

        const result = await getNotes({ page, limit, query, archiveYear, archiveMonth });
        return NextResponse.json(result);
    } catch (error) {
        console.error("API GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Process default values
        const now = new Date();
        const isoDate = now.toISOString(); // e.g., 2022-04-05T22:45:00.000Z
        const yyyyMmDd = now.toISOString().split("T")[0]; // e.g., 2022-04-05

        const noteData: CreateNoteDTO = {
            title: body.title?.trim() || yyyyMmDd,
            date: body.date || isoDate,
            tags: Array.isArray(body.tags) ? body.tags : [],
            media: Array.isArray(body.media) ? body.media : [],
            content: body.content || "",
        };

        const newNote = await addNote(noteData);
        return NextResponse.json({ note: newNote }, { status: 201 });
    } catch (error) {
        console.error("API POST Error:", error);
        return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    }
}
