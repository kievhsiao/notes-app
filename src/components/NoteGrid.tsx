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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          width: 100%;
          padding: 1rem 0;
        }

        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
          background: var(--card-bg);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-lg);
          border: 2px dashed var(--card-border);
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .empty-state p {
          font-size: 1.1rem;
          font-weight: 500;
        }
      `}</style>
        </div>
    );
}
