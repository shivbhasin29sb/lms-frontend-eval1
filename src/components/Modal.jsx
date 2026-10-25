/**
 * Modal.jsx — Piyush's Task (PE2 Feature 2)
 *
 * Generic, accessible Modal component.
 * • Traps focus within the dialog while open.
 * • Closes on Escape key or backdrop click.
 * • Uses a CSS `data-open` attribute for smooth enter/exit animations
 *   without needing a JS animation library.
 *
 * Props:
 *   isOpen   {boolean}  – controls visibility
 *   onClose  {function} – called when user dismisses the modal
 *   title    {string}   – dialog title (shown in header + aria-labelledby)
 *   children {ReactNode}– modal body content
 *   size     {'sm'|'md'|'lg'} – max-width preset (default: 'md')
 */

import { useEffect, useRef } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const dialogRef = useRef(null);

  // ── Keyboard + focus management ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last  = focusable?.[focusable.length - 1];

    // Focus first focusable element
    first?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap: Tab / Shift+Tab cycles within the dialog
      if (e.key === 'Tab') {
        if (focusable.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal modal--${size}`}
        data-open={isOpen}
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
