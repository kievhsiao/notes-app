"use client";

import { useState, useEffect, useMemo } from "react";
import { Note, CreateNoteDTO } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ArchiveButton from "@/components/ArchiveButton";
import NoteGrid from "@/components/NoteGrid";
import NoteEditor from "@/components/NoteEditor";
import NoteViewer from "@/components/NoteViewer";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveDate, setArchiveDate] = useState<{ year: number; month: number } | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notes or when filters change
  useEffect(() => {
    async function fetchFirstPage() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", "1");
        queryParams.set("limit", "50");
        if (searchQuery.trim()) queryParams.set("q", searchQuery.trim());
        if (archiveDate) {
          queryParams.set("year", archiveDate.year.toString());
          queryParams.set("month", archiveDate.month.toString());
        }

        const res = await fetch(`/api/notes?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setNotes(data.notes || []);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchFirstPage();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, archiveDate]);

  // Load more notes handler
  const loadMoreNotes = async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const queryParams = new URLSearchParams();
      queryParams.set("page", nextPage.toString());
      queryParams.set("limit", "50");
      if (searchQuery.trim()) queryParams.set("q", searchQuery.trim());
      if (archiveDate) {
        queryParams.set("year", archiveDate.year.toString());
        queryParams.set("month", archiveDate.month.toString());
      }

      const res = await fetch(`/api/notes?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setNotes((prev) => {
        const newNotes: Note[] = data.notes || [];
        const existingIds = new Set(prev.map(n => n.id));
        const uniqueNewNotes = newNotes.filter(n => !existingIds.has(n.id));
        return [...prev, ...uniqueNewNotes];
      });
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more notes:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
        loadMoreNotes();
      }
    }, { rootMargin: '200px' });

    const target = document.querySelector('#infinite-scroll-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoading, isLoadingMore, page, searchQuery, archiveDate]);

  // Group notes by month using useMemo to avoid recalcs on state change
  const groupedNotes = useMemo(() => {
    const groups: { monthLabel: string; notes: Note[] }[] = [];

    notes.forEach(note => {
      const date = new Date(note.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = `${year}年${month}月`;

      const existingGroup = groups.find(g => g.monthLabel === label);
      if (existingGroup) {
        existingGroup.notes.push(note);
      } else {
        groups.push({ monthLabel: label, notes: [note] });
      }
    });

    return groups;
  }, [notes]);

  const handleSaveNote = async (noteData: CreateNoteDTO) => {
    try {
      if (editingNote) {
        // Edit existing note
        const res = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!res.ok) throw new Error("Failed to update note");

        const updatedNoteRes = await res.json();

        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === editingNote.id ? updatedNoteRes.note : note))
        );
      } else {
        // Create new note
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!res.ok) throw new Error("Failed to save note");

        const newNoteRes = await res.json();

        // Update local state by adding the new note to the beginning
        setNotes((prevNotes) => [newNoteRes.note, ...prevNotes]);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      // Close editor and clear editing state whether success or failure
      setIsEditorOpen(false);
      setEditingNote(null);
    }
  };

  const handleNoteClick = (note: Note) => {
    setViewingNote(note);
    setIsViewerOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  return (
    <main className="app-container">
      <header className="app-header glass">
        <div className="header-content">
          <h1 className="logo">Notes<span>.</span></h1>
          <div className="header-actions">
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />
            <ArchiveButton selectedDate={archiveDate} onSelect={setArchiveDate} />
            <button
              className="create-btn"
              onClick={() => {
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New Note</span>
            </button>
          </div>
        </div>
      </header>

      <section className="app-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your notes...</p>
          </div>
        ) : (
          <div>
            {/* If we have an archive selected or just generally we want to group by month */}
            {groupedNotes.map(group => (
              <div key={group.monthLabel} className="month-group">
                <h2 className="month-header">{group.monthLabel}</h2>
                <NoteGrid
                  notes={group.notes}
                  onNoteClick={handleNoteClick}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
              </div>
            ))}
            {notes.length === 0 && (
              <div className="empty-state">
                <p>No notes found. Create your first note!</p>
              </div>
            )}

            {hasMore && (
              <div id="infinite-scroll-trigger" className="loading-more">
                <div className="spinner-small"></div>
                <span>Loading more notes...</span>
              </div>
            )}
          </div>
        )}
      </section>

      {isEditorOpen && (
        <NoteEditor
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
          initialData={editingNote || undefined}
        />
      )}

      {isViewerOpen && viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => {
            setIsViewerOpen(false);
            setViewingNote(null);
          }}
        />
      )}

      <style jsx>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .app-header {
          position: sticky;
          top: 1rem;
          z-index: 100;
          padding: 1rem 2rem;
          border-radius: var(--radius-lg);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .logo {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.05em;
        }
        
        .logo span {
          color: var(--accent-color);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-grow: 1;
          justify-content: flex-end;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent-color);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: var(--transition);
          white-space: nowrap;
        }

        .create-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .app-content {
          flex-grow: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: var(--text-muted);
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2rem;
          color: var(--text-muted);
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .month-group {
          margin-bottom: 3rem;
        }

        .month-header {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .app-container {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .create-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
