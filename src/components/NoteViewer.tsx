import { Note } from "@/lib/types";
import { useEffect, useState } from "react";

interface NoteViewerProps {
  note: Note;
  onClose: () => void;
}

export default function NoteViewer({ note, onClose }: NoteViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formattedDate = new Date(note.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="viewer-overlay" onClick={handleBackdropClick}>
      <div
        className="viewer-modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
      >
        <div className="viewer-header">
          <h2 id="viewer-title" className="viewer-title">
            {note.title}
          </h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close Note Viewer"
          >
            &times;
          </button>
        </div>

        <div className="viewer-content-area">
          <div className="note-text-content">
            {note.content}
          </div>

          {note.media && note.media.length > 0 && (
            <div className="note-media-grid">
              {note.media.map((url, idx) => (
                <div key={idx} className="media-item">
                  {/* Assuming image URLs for now based on requirement. A robust implementation might check MIME types. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Media attachment ${idx + 1}`}
                    loading="lazy"
                    onClick={() => setSelectedImage(url)}
                    style={{ cursor: "zoom-in" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="viewer-footer">
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.map((tag) => (
                <span key={tag} className="note-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="note-meta">
            <span className="note-date">Last edited: {formattedDate}</span>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="full-image-overlay" onClick={() => setSelectedImage(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedImage} alt="Full size media" className="full-image" />
        </div>
      )}

      <style jsx>{`
        .viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .viewer-modal {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-color);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* very subtle separator */
        }

        .viewer-title {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--text-main);
          margin: 0;
          padding-right: 1rem;
        }

        .close-btn {
          font-size: 2rem;
          color: var(--text-muted);
          line-height: 1;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.1);
        }

        .viewer-content-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .note-text-content {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-main);
          white-space: pre-wrap;
          font-family: var(--font-inter);
          word-break: break-word;
        }

        .note-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .media-item {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--card-border);
        }

        .media-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .media-item img:hover {
          transform: scale(1.05);
        }

        .viewer-footer {
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .note-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .note-tag {
          background: var(--accent-color);
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .note-meta {
          display: flex;
          justify-content: flex-end;
        }

        .note-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 600px) {
          .viewer-modal {
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            border: none;
          }
          
          .viewer-overlay {
            padding: 0;
          }
        }

        .full-image-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          cursor: zoom-out;
          animation: fadeIn 0.2s ease-out;
        }

        .full-image {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
