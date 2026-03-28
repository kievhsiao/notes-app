import { Note } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface NoteViewerProps {
  note: Note;
  onClose: () => void;
}

export default function NoteViewer({ note, onClose }: NoteViewerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
  const normalizedMedia = (note.media || []).map(url => 
    url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`)
  );

  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && normalizedMedia.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % normalizedMedia.length);
    }
  }, [selectedImageIndex, normalizedMedia.length]);

  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && normalizedMedia.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + normalizedMedia.length) % normalizedMedia.length);
    }
  }, [selectedImageIndex, normalizedMedia.length]);

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      
      if (e.key === "ArrowRight") { e.stopImmediatePropagation(); goNext(); }
      if (e.key === "ArrowLeft") { e.stopImmediatePropagation(); goPrev(); }
      // stopImmediatePropagation prevents the parent page.tsx Escape handler
      // from also closing the NoteViewer when user only wants to close Lightbox
      if (e.key === "Escape") { e.stopImmediatePropagation(); closeLightbox(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, goNext, goPrev, closeLightbox]);

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
          {normalizedMedia.length > 0 && (
            <div className={`tumblr-gallery tumblr-layout-${Math.min(normalizedMedia.length, 4)}`}>
              {normalizedMedia.length === 1 ? (
                <div className="tumblr-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizedMedia[0]}
                    alt={`Media attachment 1`}
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image failed to load:", normalizedMedia[0]);
                      (e.target as HTMLElement).style.opacity = '0.5';
                    }}
                    onClick={() => setSelectedImageIndex(0)}
                  />
                </div>
              ) : (
                normalizedMedia.slice(0, 4).map((url, idx) => {
                  const totalCount = normalizedMedia.length;
                  return (
                    <div key={idx} className="tumblr-photo">
                      <Image 
                        src={url} 
                        alt={`Media gallery attachment ${idx + 1} of ${totalCount}`} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLElement).style.opacity = '0.5'; }}
                        onClick={() => setSelectedImageIndex(idx)} 
                      />
                      {idx === 3 && totalCount > 4 && (
                        <div className="more-overlay" onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(3); }}>
                          <span>+{totalCount - 4}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="note-text-content read-layout">
            {note.content}
          </div>
        </div>

        <div className="viewer-footer">
          <div className="note-meta-status">
          </div>
        </div>
      </div>

      {/* Enhanced Lightbox */}
      {selectedImageIndex !== null && (
        <div className="lightbox-container" onClick={closeLightbox}>
          <button className="lightbox-close-btn" onClick={closeLightbox} aria-label="Close Lightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="lightbox-main">
            {normalizedMedia.length > 1 && (
              <button className="lightbox-nav-btn lightbox-nav-prev" onClick={goPrev} aria-label="Previous Image">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}

            <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
              <Image 
                src={normalizedMedia[selectedImageIndex]} 
                alt={`Full size media ${selectedImageIndex + 1}`} 
                fill
                style={{ objectFit: 'contain' }}
                className="lightbox-image" 
                priority
              />
            </div>

            {normalizedMedia.length > 1 && (
              <button className="lightbox-nav-btn lightbox-nav-next" onClick={goNext} aria-label="Next Image">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )}
          </div>

          <div className="lightbox-footer">
            <div className="lightbox-counter">
              {selectedImageIndex + 1} / {normalizedMedia.length}
            </div>
            
            {normalizedMedia.length > 1 && (
              <div className="lightbox-thumbnails">
                {normalizedMedia.map((url, idx) => (
                  <img 
                    key={idx}
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`lightbox-thumb ${selectedImageIndex === idx ? 'lightbox-thumb-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                  />
                ))}
              </div>
            )}
          </div>
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
          box-shadow: var(--shadow-lg);
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
      `}</style>
    </div>
  );
}

