import { Note } from "@/lib/types";
import NoteCard from "./NoteCard";

interface NoteGridProps {
    notes: Note[];
    onNoteClick: (note: Note) => void;
    onEditNote?: (note: Note) => void;
    onDeleteNote?: (id: string) => void;
}

export default function NoteGrid({ notes, onNoteClick, onEditNote, onDeleteNote }: NoteGridProps) {
    if (notes.length === 0) {
        return (
            <div className="empty-state">
                <p>No notes found. Create your first note!</p>
            </div>
        );
    }

    return (
        <div className="note-grid">
            {notes.map((note) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    onClick={onNoteClick}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                />
            ))}

            <style jsx>{`
        .note-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--card-border);
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
