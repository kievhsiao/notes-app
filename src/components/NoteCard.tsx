import { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

export default function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  // Extract first few lines of content for the preview
  const previewLines = note.content
    ? note.content.split("\n").slice(0, 3).join("\n")
    : "No content";

  const formattedDate = new Date(note.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(note);
    }
  };

  return (
    <div
      className="glass-panel note-card"
      onClick={() => onClick(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(note);
        }
      }}
    >
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
      </div>
      <div className="note-card-body">
        <p className="note-preview">{previewLines}</p>
      </div>
      <div className="note-card-footer">
        <span className="note-date">{formattedDate}</span>
        <div className="note-card-actions">
          {onEdit && (
            <button className="action-btn edit-btn" onClick={handleEdit} title="Edit Note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          )}
          {onDelete && (
            <button className="action-btn delete-btn" onClick={handleDelete} title="Delete Note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      </div>
      {note.tags.length > 0 && (
        <div className="note-tags-preview">
          {note.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="note-tag">{tag}</span>
          ))}
          {note.tags.length > 2 && <span className="note-tag-more">+{note.tags.length - 2}</span>}
        </div>
      )}

      <style jsx>{`
        .note-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 200px;
          padding: 1.5rem;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .note-card:hover {
          box-shadow: var(--shadow-hover);
        }

        .note-card-header {
          margin-bottom: 1rem;
        }

        .note-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-card-body {
          flex-grow: 1;
          margin-bottom: 1rem;
        }

        .note-preview {
          font-size: 0.95rem;
          color: var(--text-muted);
          white-space: pre-wrap;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .note-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid var(--card-border);
          padding-top: 1rem;
          margin-top: auto;
        }

        .note-tags-preview {
          display: flex;
          gap: 0.25rem;
        }

        .note-tag, .note-tag-more {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-color);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .note-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-main);
        }

        .delete-btn:hover {
          color: var(--error-color, #ef4444);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
