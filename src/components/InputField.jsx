/**
 * InputField.jsx — Bhavnoor's Task (PE2 Feature 1)
 *
 * Reusable, fully-controlled form input component.
 * Supports: text, email, password (with reveal toggle), search, etc.
 * Renders accessible error messages linked by aria-describedby.
 */

import { useState, useId } from 'react';
import './InputField.css';

/**
 * InputField
 * @param {string}   id          – Optional explicit id (auto-generated if omitted)
 * @param {string}   label       – Visible label text
 * @param {string}   type        – Input type ('text'|'email'|'password'|…)
 * @param {string}   value       – Controlled value
 * @param {function} onChange    – Change handler
 * @param {string}   error       – Validation error message (empty = no error)
 * @param {string}   placeholder – Placeholder text
 * @param {boolean}  required    – Mark field as required
 * @param {string}   autoComplete– HTML autocomplete hint
 * @param {string}   icon        – Optional emoji/icon displayed inside the field
 */
function InputField({
  id: externalId,
  label,
  type = 'text',
  value,
  onChange,
  error = '',
  placeholder = '',
  required = false,
  autoComplete,
  icon,
  ...rest
}) {
  const autoId        = useId();
  const fieldId       = externalId || autoId;
  const errorId       = `${fieldId}-error`;
  const [showPwd, setShowPwd] = useState(false);

  const isPassword    = type === 'password';
  const resolvedType  = isPassword ? (showPwd ? 'text' : 'password') : type;
  const hasError      = error.length > 0;

  return (
    <div className={`input-field${hasError ? ' input-field--error' : ''}`}>
      <label htmlFor={fieldId} className="input-field__label">
        {label}
        {required && <span className="input-field__required" aria-hidden="true"> *</span>}
      </label>

      <div className="input-field__wrapper">
        {icon && (
          <span className="input-field__icon" aria-hidden="true">{icon}</span>
        )}

        <input
          id={fieldId}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`input-field__input${icon ? ' input-field__input--has-icon' : ''}`}
          {...rest}
        />

        {/* Password reveal toggle */}
        {isPassword && (
          <button
            type="button"
            className="input-field__toggle"
            onClick={() => setShowPwd(v => !v)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {hasError && (
        <p id={errorId} className="input-field__error" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
