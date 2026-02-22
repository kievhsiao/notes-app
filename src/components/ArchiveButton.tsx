import { useState, useRef, useEffect } from "react";

interface ArchiveButtonProps {
    onSelect: (date: { year: number; month: number } | null) => void;
    selectedDate: { year: number; month: number } | null;
}

export default function ArchiveButton({ onSelect, selectedDate }: ArchiveButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.year : new Date().getFullYear());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleMonthClick = (month: number) => {
        if (selectedDate && selectedDate.year === viewYear && selectedDate.month === month) {
            // Deselect if clicking the already selected month
            onSelect(null);
        } else {
            onSelect({ year: viewYear, month });
        }
        setIsOpen(false);
    };

    return (
        <div className="archive-btn-container" ref={dropdownRef}>
            <button
                className={`archive-btn glass ${selectedDate ? "active" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedDate ? `Archive: ${selectedDate.year}年${selectedDate.month}月` : "Archive"}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="archive-dropdown glass">
                    <div className="year-selector">
                        <button className="year-nav" onClick={() => setViewYear(y => y - 1)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <span className="current-year">{viewYear}</span>
                        <button className="year-nav" onClick={() => setViewYear(y => y + 1)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                    <div className="month-grid">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                            const isSelected = selectedDate?.year === viewYear && selectedDate?.month === month;
                            return (
                                <button
                                    key={month}
                                    className={`month-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleMonthClick(month)}
                                >
                                    {month}月
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx>{`
                .archive-btn-container {
                    position: relative;
                }

                .archive-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    font-weight: 600;
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition);
                    white-space: nowrap;
                }

                .archive-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }

                .archive-btn.active {
                    background: var(--accent-color);
                    color: white;
                    border-color: var(--accent-color);
                }

                .archive-btn svg {
                    transition: transform 0.2s ease;
                }

                .archive-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    width: 250px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-md);
                    z-index: 1000;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .year-selector {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    background: rgba(0, 0, 0, 0.02);
                }

                .current-year {
                    font-weight: bold;
                    font-size: 1.1rem;
                    color: var(--text-main);
                }

                .year-nav {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                }

                .year-nav:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: var(--text-main);
                }

                .month-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    padding: 1rem;
                }

                .month-btn {
                    padding: 0.5rem;
                    background: none;
                    border: 1px solid transparent;
                    border-radius: var(--radius-sm);
                    color: var(--text-main);
                    cursor: pointer;
                    text-align: center;
                    transition: var(--transition);
                }

                .month-btn:hover {
                    background: rgba(0, 0, 0, 0.03);
                }

                .month-btn.selected {
                    background: var(--accent-color);
                    color: white;
                    font-weight: bold;
                    border-color: var(--accent-color);
                }
            `}</style>
        </div>
    );
}
