import { Note } from "@/lib/types";
import { useEffect, useState } from "react";
import Image from "next/image";

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

  // Tumblr-Style Layout Pattern Logic
  const mediaCount = note.media ? note.media.length : 0;

  return (
    <div className="viewer-overlay" onClick={handleBackdropClick}>
      <div
        className="viewer-modal animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
      >
        <div className="viewer-header-wrapper">
          <div className="viewer-header-meta">
            <span className="note-date">{formattedDate}</span>
            {note.tags && note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="note-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="viewer-header">
            <h2 id="viewer-title" className="viewer-title text-balance">
              {note.title}
            </h2>
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close Note Viewer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="viewer-content-area">
          {/* Strict Tumblr-Style Photoset */}
          {note.media && mediaCount > 0 && (
            <div className={`tumblr-gallery tumblr-layout-${Math.min(mediaCount, 4)}`}>
              {mediaCount === 1 ? (
                <div className="tumblr-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={note.media[0].startsWith('http') ? note.media[0] : (note.media[0].startsWith('/') ? note.media[0] : `/${note.media[0]}`)}
                    alt={`Media attachment 1`}
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image failed to load:", note.media[0]);
                      (e.target as HTMLElement).style.opacity = '0.5';
                    }}
                    onClick={() => setSelectedImage(note.media[0].startsWith('http') ? note.media[0] : (note.media[0].startsWith('/') ? note.media[0] : `/${note.media[0]}`))}
                  />
                </div>
              ) : (
                note.media.slice(0, 4).map((url, idx) => {
                  const srcPath = url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`);
                  return (
                    <div key={idx} className="tumblr-photo">
                      <Image 
                        src={srcPath} 
                        alt={`Media gallery attachment ${idx + 1} of ${mediaCount}`} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onError={(e) => { (e.target as HTMLElement).style.opacity = '0.5'; }}
                        onClick={() => setSelectedImage(srcPath)} 
                      />
                      {idx === 3 && mediaCount > 4 && (
                        <div className="more-overlay" onClick={() => setSelectedImage(srcPath)}>
                          <span>+{mediaCount - 4}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Editor-First Read-Layout (Scheme A) */}

          <div className="note-text-content read-layout">
            {note.content}
          </div>
        </div>

        <div className="viewer-footer">
          <div className="note-meta-status">
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="full-image-overlay" onClick={() => setSelectedImage(null)}>
          <Image 
            src={selectedImage} 
            alt="Full size media" 
            fill
            style={{ objectFit: 'contain' }}
            className="full-image" 
          />
        </div>
      )}

      <style jsx>{`
        .viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1.5rem;
          overflow: hidden;
        }

        .viewer-modal {
          width: 100%;
          max-width: 860px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          box-shadow: var(--shadow-xl);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
        }

        .viewer-header-wrapper {
          padding: 1.5rem 2rem 1rem;
          background: var(--card-bg);
          border-bottom: 1px solid var(--card-border);
          z-index: 10;
        }

        .viewer-header-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .note-date {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .viewer-title {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: var(--text-main);
          margin: 0;
        }

        .close-btn {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          cursor: pointer;
          padding: 0.5rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(90deg);
        }

        .viewer-content-area {
          flex: 1;
          overflow-y: auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          scrollbar-width: thin;
          scrollbar-color: var(--card-border) transparent;
        }

        /* Note Text Content */

        .note-text-content {
          font-size: 1.05rem;
          line-height: 1.75;
          letter-spacing: -0.011em;
          color: var(--text-secondary);
          white-space: pre-wrap;
          font-family: inherit;
          word-break: break-word;
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          font-variant-numeric: proportional-nums;
          text-rendering: optimizeLegibility;
        }

        .viewer-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .note-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .note-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.725rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        @media (max-width: 640px) {
          .viewer-overlay { padding: 0; }
          .viewer-modal {
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            border: none;
          }
          .viewer-header-wrapper { padding: 1.5rem 1.5rem 1rem; }
          .viewer-content-area { padding: 1.5rem; }
          .viewer-title { font-size: 1.5rem; }
        }

        .full-image-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          cursor: zoom-out;
        }

        .full-image {
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
          border-radius: var(--radius-md);
          box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
