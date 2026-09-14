import { useState, useCallback, useMemo } from 'react';
import './LessonNotes.css';

const STORAGE_KEY = 'lms_lesson_notes';
const MAX_CHARS = 300;
const FILTERS = ['All', 'Active', 'Completed'];

/**
 * Read initial notes from localStorage safely.
 */
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Persist notes array to localStorage.
 */
function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('LessonNotes: failed to save to localStorage', err);
  }
}

/**
 * LessonNotes — A "Lesson Notes / To-Do" component.
 * Features:
 *   - Controlled textarea input
 *   - Add / delete / complete notes
 *   - Filter (All / Active / Completed)
 *   - Persisted to localStorage
 *   - Character counter
 */
function LessonNotes() {
  // Initialise state lazily from localStorage
  const [notes, setNotes] = useState(loadNotes);
  const [input, setInput]   = useState('');
  const [filter, setFilter] = useState('All');

  // Update notes & persist in one helper
  const updateNotes = useCallback((updater) => {
    setNotes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveNotes(next);
      return next;
    });
  }, []);

  // ── Add note ──────────────────────────────────────────────
  const handleAdd = useCallback((e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newNote = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    updateNotes(prev => [newNote, ...prev]);
    setInput('');
  }, [input, updateNotes]);

  // ── Toggle completed ──────────────────────────────────────
  const handleToggle = useCallback((id) => {
    updateNotes(prev =>
      prev.map(n => n.id === id ? { ...n, completed: !n.completed } : n)
    );
  }, [updateNotes]);

  // ── Delete single note ────────────────────────────────────
  const handleDelete = useCallback((id) => {
    updateNotes(prev => prev.filter(n => n.id !== id));
  }, [updateNotes]);

  // ── Clear all completed ───────────────────────────────────
  const handleClearCompleted = useCallback(() => {
    updateNotes(prev => prev.filter(n => !n.completed));
  }, [updateNotes]);

  // ── Filtered notes (memoised) ─────────────────────────────
  const filteredNotes = useMemo(() => {
    if (filter === 'Active')    return notes.filter(n => !n.completed);
    if (filter === 'Completed') return notes.filter(n => n.completed);
    return notes;
  }, [notes, filter]);

  const completedCount = useMemo(() => notes.filter(n => n.completed).length, [notes]);

  // ── Character count helpers ───────────────────────────────
  const charCount    = input.length;
  const charClass    = charCount > MAX_CHARS * 0.9 ? (charCount >= MAX_CHARS ? 'danger' : 'warn') : '';

  // ── Format timestamp ──────────────────────────────────────
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="lesson-notes" aria-label="Lesson Notes">
      {/* Header */}
      <header className="lesson-notes__header">
        <h2 className="lesson-notes__title">
          <span className="lesson-notes__title-icon" aria-hidden="true">📝</span>
          Lesson Notes
        </h2>
        <span className="lesson-notes__count" aria-label={`${notes.length} notes total`}>
          {notes.length}
        </span>
      </header>

      {/* Add Form */}
      <form className="lesson-notes__form" onSubmit={handleAdd} aria-label="Add a new note">
        <div className="lesson-notes__input-row">
          <textarea
            id="note-input"
            className="lesson-notes__textarea"
            value={input}
            onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Jot down a key insight or task from this lesson..."
            rows={3}
            aria-label="Note text"
            aria-describedby="char-counter"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            id="char-counter"
            className={`lesson-notes__char-count ${charClass}`}
            aria-live="polite"
          >
            {charCount}/{MAX_CHARS}
          </span>
          <button
            type="submit"
            className="lesson-notes__add-btn"
            disabled={!input.trim() || charCount > MAX_CHARS}
            aria-label="Add note"
          >
            ＋ Add Note
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <nav className="lesson-notes__filters" aria-label="Filter notes">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`lesson-notes__filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f}
            {f === 'Completed' && completedCount > 0 && ` (${completedCount})`}
            {f === 'Active'    && (notes.length - completedCount) > 0 && ` (${notes.length - completedCount})`}
            {f === 'All'       && notes.length > 0 && ` (${notes.length})`}
          </button>
        ))}
      </nav>

      {/* Notes List */}
      <ul className="lesson-notes__list" role="list" aria-label="Notes list" aria-live="polite">
        {filteredNotes.length === 0 ? (
          <li>
            <div className="lesson-notes__empty" role="status">
              <span className="lesson-notes__empty-icon" aria-hidden="true">
                {filter === 'Completed' ? '✅' : '📭'}
              </span>
              <p>
                {filter === 'Completed'
                  ? 'No completed notes yet.'
                  : filter === 'Active'
                  ? 'No active notes. Add one above!'
                  : 'No notes yet. Start capturing key insights!'}
              </p>
            </div>
          </li>
        ) : (
          filteredNotes.map(note => (
            <li key={note.id}>
              <article className={`note-item${note.completed ? ' completed' : ''}`}>
                {/* Checkbox */}
                <button
                  className="note-item__checkbox"
                  onClick={() => handleToggle(note.id)}
                  aria-label={note.completed ? `Mark "${note.text.slice(0, 20)}..." as active` : `Mark as complete`}
                  aria-pressed={note.completed}
                  type="button"
                >
                  {note.completed && '✓'}
                </button>

                {/* Content */}
                <div className="note-item__content">
                  <p className="note-item__text">{note.text}</p>
                  <div className="note-item__meta">
                    <time className="note-item__time" dateTime={note.createdAt}>
                      {formatTime(note.createdAt)}
                    </time>
                    {note.completed && (
                      <span className="note-item__tag">Done</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="note-item__actions">
                  <button
                    className="note-item__btn delete"
                    onClick={() => handleDelete(note.id)}
                    aria-label={`Delete note: ${note.text.slice(0, 20)}`}
                    type="button"
                  >
                    🗑
                  </button>
                </div>
              </article>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      <footer className="lesson-notes__footer">
        <p className="lesson-notes__stats">
          <span>{notes.length - completedCount}</span> active ·&nbsp;
          <span>{completedCount}</span> done
        </p>
        {completedCount > 0 && (
          <button
            className="lesson-notes__clear-btn"
            onClick={handleClearCompleted}
            type="button"
            aria-label="Clear all completed notes"
          >
            Clear completed
          </button>
        )}
      </footer>
    </section>
  );
}

export default LessonNotes;