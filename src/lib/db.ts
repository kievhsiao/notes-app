import { Note, CreateNoteDTO } from "./types";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "notes.jsonl");

// Ensure the database file and directory exist
async function ensureDbExists() {
    const dirPath = path.dirname(DB_PATH);
    try {
        await fs.mkdir(dirPath, { recursive: true });
        try {
            await fs.access(DB_PATH);
        } catch {
            await fs.writeFile(DB_PATH, "", "utf-8");
        }
    } catch (error) {
        console.error("Failed to initialize database:", error);
    }
}

export interface GetNotesParams {
    page?: number;
    limit?: number;
    query?: string;
    archiveYear?: number;
    archiveMonth?: number;
}

// Read all notes internally for updates (keeps oldest-to-newest order)
async function getAllNotes(): Promise<Note[]> {
    await ensureDbExists();
    try {
        const fileContent = await fs.readFile(DB_PATH, "utf-8");
        const lines = fileContent.split("\n").filter((line) => line.trim() !== "");
        return lines.map((line) => JSON.parse(line));
    } catch (error) {
        console.error("Error reading notes:", error);
        return [];
    }
}

// Read and paginate notes, sorted newest to oldest
export async function getNotes(params?: GetNotesParams): Promise<{ notes: Note[], hasMore: boolean, totalCount: number }> {
    await ensureDbExists();
    try {
        const fileContent = await fs.readFile(DB_PATH, "utf-8");
        const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

        const page = params?.page || 1;
        const limit = params?.limit || 50;

        if (params?.query || params?.archiveYear) {
            let allNotes: Note[] = lines.map((line) => JSON.parse(line));

            if (params.query) {
                const query = params.query.toLowerCase();
                allNotes = allNotes.filter(n =>
                    n.title.toLowerCase().includes(query) ||
                    n.content.toLowerCase().includes(query) ||
                    n.tags.some(t => t.toLowerCase().includes(query))
                );
            }

            if (params.archiveYear && params.archiveMonth) {
                const endOfMonth = new Date(params.archiveYear, params.archiveMonth, 0, 23, 59, 59, 999);
                allNotes = allNotes.filter(n => new Date(n.date) <= endOfMonth);
            }

            const totalCount = allNotes.length;

            // Reorder newest to oldest
            allNotes.reverse();

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            return {
                notes: allNotes.slice(startIndex, endIndex),
                hasMore: endIndex < totalCount,
                totalCount
            };
        } else {
            const totalCount = lines.length;

            const startIndex = Math.max(0, totalCount - page * limit);
            const endIndex = totalCount - (page - 1) * limit;

            if (startIndex >= endIndex) {
                return { notes: [], hasMore: false, totalCount };
            }

            const pageLines = lines.slice(startIndex, endIndex).reverse();
            const notes = pageLines.map((line) => JSON.parse(line));

            return {
                notes,
                hasMore: startIndex > 0,
                totalCount
            };
        }
    } catch (error) {
        console.error("Error reading paginated notes:", error);
        return { notes: [], hasMore: false, totalCount: 0 };
    }
}

// Generate MD5 hash based on content, date, and title
export function generateId(content: string, date: string, title: string): string {
    return crypto.createHash("md5").update(`${content}${date}${title}`).digest("hex");
}

// Add a new note to the JSONL file
export async function addNote(noteData: CreateNoteDTO): Promise<Note> {
    await ensureDbExists();

    const id = generateId(noteData.content, noteData.date, noteData.title);
    const newNote: Note = { id, ...noteData };

    const jsonlLine = JSON.stringify(newNote) + "\n";

    try {
        await fs.appendFile(DB_PATH, jsonlLine, "utf-8");
        return newNote;
    } catch (error) {
        console.error("Error saving note:", error);
        throw new Error("Failed to save note");
    }
}

// Delete a note by ID
export async function deleteNote(id: string): Promise<boolean> {
    await ensureDbExists();
    try {
        const notes = await getAllNotes();
        const initialLength = notes.length;
        const filteredNotes = notes.filter(n => n.id !== id);

        if (filteredNotes.length === initialLength) {
            return false; // Not found
        }

        // Overwrite file with remaining notes
        const content = filteredNotes.map(n => JSON.stringify(n)).join("\n") + (filteredNotes.length > 0 ? "\n" : "");
        await fs.writeFile(DB_PATH, content, "utf-8");
        return true;
    } catch (error) {
        console.error("Error deleting note:", error);
        throw new Error("Failed to delete note");
    }
}

// Update a note by ID
export async function updateNote(id: string, noteData: CreateNoteDTO): Promise<Note | null> {
    await ensureDbExists();
    try {
        const notes = await getAllNotes();
        const index = notes.findIndex(n => n.id === id);

        if (index === -1) {
            return null; // Not found
        }

        // We can either keep the old ID, but since ID is a hash of content/title/date,
        // if those change, the ID should ideally change. 
        // For simplicity and referential integrity for edit, let's just generate a new ID 
        // OR keep the same ID so the client doesn't get confused if it expects the same ID?
        // Let's generate a new ID based on the updated content, or keep the old one?
        // Let's keep the existing ID to maintain stable references, despite the hash logic. Or we can update the ID.
        // Usually, an edit changes the content. Let's keep the old ID for stability on the client side during edit.
        const updatedNote: Note = { ...notes[index], ...noteData, id };

        notes[index] = updatedNote;

        // Ensure notes are still sorted oldest to newest after update
        notes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Re-write all notes
        const content = notes.map(n => JSON.stringify(n)).join("\n") + "\n";
        await fs.writeFile(DB_PATH, content, "utf-8");

        return updatedNote;
    } catch (error) {
        console.error("Error updating note:", error);
        throw new Error("Failed to update note");
    }
}
