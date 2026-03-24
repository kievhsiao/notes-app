import { useState, useEffect, KeyboardEvent } from "react";

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with value from parent (e.g. when clearing search)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSearch = () => {
    onSearch(localValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <div className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search notes by title, content, or tags..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button className="search-btn" onClick={handleSearch} aria-label="Search">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      <style jsx>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
        }

        .search-input-wrapper {
          position: relative;
          flex-grow: 1;
        }

        .search-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.5rem;
          font-size: 1.05rem;
          color: var(--text-main);
          outline: none;
          transition: var(--transition);
          border-radius: 99px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          backdrop-filter: blur(8px);
        }

        .search-input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .search-input:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), var(--shadow-md);
        }

        .search-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          padding: 0;
          color: #ffffff;
          background: var(--accent-color);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }

        .search-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      `}</style>
    </div>
  );
}
