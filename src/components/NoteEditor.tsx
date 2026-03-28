import { useState, useEffect, useRef, useCallback } from "react";
import { CreateNoteDTO, Note } from "@/lib/types";
import styles from "./NoteEditor.module.css";

interface NoteEditorProps {
  onClose: () => void;
  onSave: (note: CreateNoteDTO) => Promise<void>;
  initialData?: Note;
}

interface FormState {
  title: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
}

export default function NoteEditor({ onClose, onSave, initialData }: NoteEditorProps) {
  const [form, setForm] = useState<FormState>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    mediaUrls: initialData?.media || [],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dropCounter = useRef(0);

  // Focus Title on open
  useEffect(() => {
    if (titleInputRef.current) {
       titleInputRef.current.focus();
    }
  }, []);

  // Robust Auto-expand textarea
  const adjustTextareaHeight = useCallback(() => {
    const tx = textareaRef.current;
    if (tx) {
      tx.style.height = "auto";
      tx.style.height = `${tx.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [form.content, adjustTextareaHeight]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, [adjustTextareaHeight]);

  const updateForm = (updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const filesToUpload = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (filesToUpload.length === 0) return;

    setUploadingCount(prev => prev + filesToUpload.length);
    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append("file", file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      // API returns { url, urls }
      const newUrls: string[] = data.urls || [data.url];
      // Use functional updater to avoid stale closure on form.mediaUrls
      setForm(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, ...newUrls] }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image(s).");
    } finally {
      setUploadingCount(prev => Math.max(0, prev - filesToUpload.length));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
    e.target.value = ""; 
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCounter.current--;
    if (dropCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dropCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      updateForm({ tags: [...form.tags, trimmed] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateForm({ tags: form.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;

    setIsSubmitting(true);
    try {
      const newNote: CreateNoteDTO = {
        title: form.title, 
        content: form.content,
        tags: form.tags,
        media: form.mediaUrls,
        date: new Date().toISOString(),
      };

      await onSave(newNote);
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["editor-overlay"]} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div 
        className={styles["editor-modal"]}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className={styles["drop-zone-overlay"]}>
            <div className={styles["drop-zone-message"]}>
              <div className={styles["drop-icon"]}>📸</div>
              <div className={styles["drop-text"]}>Drop to upload images</div>
            </div>
          </div>
        )}

        <header className={styles["fixed-header"]}>
           <div className={styles["header-top"]}>
              <span className={styles["modal-label"]}>{initialData ? "Edit" : "New"} Note</span>
              <button className={styles["close-icon-btn"]} onClick={onClose} aria-label="Close">
                &times;
              </button>
           </div>
           <input
              ref={titleInputRef}
              type="text"
              placeholder="Untitled Post"
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              className={styles["header-title-input"]}
            />
        </header>

        <main className={styles["editor-scroll-area"]}>
          <div className={styles["viewport"]}>
            <textarea
              ref={textareaRef}
              placeholder="Write something amazing..."
              value={form.content}
              onChange={(e) => updateForm({ content: e.target.value })}
              required
              className={styles["main-textarea"]}
              rows={1}
            />
          </div>

          <section className={styles["metadata-stack"]}>
            {/* Tags Section */}
            <div className={styles["meta-section"]}>
              <label className={styles["section-title"]}>Tags</label>
              <div className={styles["tags-container"]}>
                {form.tags.map(tag => (
                   <span key={tag} className={styles["tag-chip"]}>
                     {tag}
                     <button type="button" onClick={() => removeTag(tag)} className={styles["remove-tag"]}>&times;</button>
                   </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                       e.preventDefault();
                       handleAddTag();
                    }
                  }}
                  onBlur={handleAddTag}
                  className={styles["tag-input-field"]}
                />
              </div>
            </div>

            {/* Media Section */}
            <div className={styles["meta-section"]}>
              <label className={styles["section-title"]}>Media</label>
              <div className={styles["media-gallery"]}>
                {form.mediaUrls.map((url, idx) => (
                  <div key={idx} className={styles["media-thumb-container"]}>
                    {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                       <img src={url} alt={`Media ${idx}`} className={styles["media-thumb"]} />
                    ) : (
                       <div className={styles["media-file-icon"]}>📎 {url.split('/').pop()?.substring(0, 10)}</div>
                    )}
                    <button
                      type="button"
                      className={styles["remove-thumb"]}
                      onClick={() => updateForm({ mediaUrls: form.mediaUrls.filter(u => u !== url) })}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                
                {uploadingCount > 0 && Array.from({ length: uploadingCount }).map((_, i) => (
                  <div key={`uploading-${i}`} className={styles["uploading-indicator"]}>
                    <div className={styles["spinner-mini"]}></div>
                    <span>Uploading...</span>
                  </div>
                ))}

                <label className={styles["add-media-btn"]}>
                  <div className={styles["plus-icon"]}>+</div>
                  <span>Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isSubmitting || uploadingCount > 0}
                    multiple
                    className={styles["hidden-file-input"]}
                  />
                </label>
              </div>
              <div className={styles["url-input-row"]}>
                 <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  className={styles["url-direct-input"]}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const url = e.currentTarget.value.trim();
                      if (url) {
                        updateForm({ mediaUrls: [...form.mediaUrls, url] });
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </section>
        </main>

        <footer className={styles["editor-actions"]}>
           <button type="button" className={styles["btn-cancel"]} onClick={onClose} disabled={isSubmitting}>
             Cancel
           </button>
           <button 
             type="button" 
             className={styles["btn-save"]} 
             onClick={handleSubmit} 
             disabled={isSubmitting || !form.content.trim()}
           >
             {isSubmitting ? "Saving..." : "Save Note"}
           </button>
        </footer>
      </div>
    </div>
  );
}

