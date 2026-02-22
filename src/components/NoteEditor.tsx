import { useState, useEffect } from "react";
import { CreateNoteDTO, Note } from "@/lib/types";

interface NoteEditorProps {
  onClose: () => void;
  onSave: (note: CreateNoteDTO) => Promise<void>;
  initialData?: Note;
}

export default function NoteEditor({ onClose, onSave, initialData }: NoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tagsStr, setTagsStr] = useState(initialData?.tags.join(", ") || "");
  const [mediaStr, setMediaStr] = useState(initialData?.media?.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setMediaStr(prev => prev ? `${prev}, ${data.url}` : data.url);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsSubmitting(false);
      e.target.value = ""; // Reset input so same file can be selected again
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsedTags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);
      const parsedMedia = mediaStr.split(",").map(m => m.trim()).filter(Boolean);

      const newNote: CreateNoteDTO = {
        title: title || "", // empty string allows the API to use the default date
        content,
        tags: parsedTags,
        media: parsedMedia,
        date: new Date().toISOString(),
      };

      await onSave(newNote);
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <div className="editor-header">
          <h2>{initialData ? "Edit Note" : "Create New Note"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Title (optional, defaults to date)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input title-input"
            />
          </div>

          <div className="form-group content-group">
            <textarea
              placeholder="What's on your mind? (Required)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="glass-input content-textarea"
            />
          </div>

          <div className="advanced-options">
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Next.js, Ideas"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="form-group media-upload-group">
              <label>Media URLs (comma separated) or Upload</label>
              <div className="upload-input-row">
                <input
                  type="text"
                  placeholder="e.g. https://example.com/image.jpg"
                  value={mediaStr}
                  onChange={(e) => setMediaStr(e.target.value)}
                  className="glass-input flex-1"
                />
                <label className="upload-btn btn-secondary glass">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                    className="hidden-file-input"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="editor-footer">
            <button type="button" className="btn-secondary glass" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .editor-modal {
          width: 90%;
          max-width: 1000px;
          height: 90vh;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-hover);
          background: var(--bg-color);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--card-border);
        }

        .editor-header h2 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--text-main);
        }

        .close-btn {
          font-size: 2rem;
          color: var(--text-muted);
          line-height: 1;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-main);
        }

        .editor-form {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          overflow-y: auto;
          gap: 1.5rem;
          flex: 1;
          min-height: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .glass-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          font-size: 1rem;
          transition: var(--transition);
        }

        .glass-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .title-input {
          font-size: 1.25rem;
          font-weight: 600;
          padding: 1rem;
        }

        .content-group {
          flex: 1;
          min-height: 0;
        }

        .content-textarea {
          flex: 1;
          min-height: 100px;
          resize: none;
          font-family: var(--font-inter);
          overflow-y: auto;
        }

        .advanced-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.02);
          border-radius: var(--radius-md);
          border: 1px dashed var(--card-border);
        }

        .editor-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-secondary:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .media-upload-group {
           display: flex;
           flex-direction: column;
        }
        
        .upload-input-row {
           display: flex;
           gap: 0.5rem;
           align-items: center;
        }

        .flex-1 {
           flex: 1;
        }

        .upload-btn {
           cursor: pointer;
           display: inline-flex;
           align-items: center;
           justify-content: center;
           margin: 0;
           font-size: 0.9rem;
        }

        .upload-btn[disabled] {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .hidden-file-input {
           display: none;
        }
      `}</style>
    </div>
  );
}
