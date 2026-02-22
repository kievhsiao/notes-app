export interface Note {
    id: string; // MD5 hash of content, date, and title
    title: string; // Defaults to current date (YYYY-MM-DD)
    date: string; // Last edit time (ISO 8601 string recommended)
    tags: string[]; // Category tags, defaults to []
    media: string[]; // Attachment image/video URLs, defaults to []
    content: string;
}

export type CreateNoteDTO = Omit<Note, "id">;
