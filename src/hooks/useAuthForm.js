/**
 * useAuthForm.js — Bhavnoor's Task (PE2 Feature 1)
 *
 * Custom hook that owns form state + validation logic for the AuthModal.
 * Validation strategies:
 *   • Email  — RFC-compliant regex
 *   • Name   — 2-50 chars, letters & spaces only
 *   • Password — min 8 chars, ≥1 uppercase, ≥1 digit, ≥1 special char
 *   • Confirm — must match password field
 *
 * Returns controlled fields, per-field errors, touched flags, and a
 * `validate()` function that can be called before submission.
 */

import { useState, useCallback } from 'react';

// ── Validation patterns ───────────────────────────────────────────────────────
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const NAME_REGEX     = /^[a-zA-Z\s]{2,50}$/;

// ── Per-field validators ──────────────────────────────────────────────────────
function validateEmail(val) {
  if (!val.trim())          return 'Email is required.';
  if (!EMAIL_REGEX.test(val)) return 'Please enter a valid email address.';
  return '';
}

function validatePassword(val) {
  if (!val)                      return 'Password is required.';
  if (!PASSWORD_REGEX.test(val)) return 'Min 8 chars with 1 uppercase, 1 number & 1 special character.';
  return '';
}

function validateName(val) {
  if (!val.trim())             return 'Full name is required.';
  if (!NAME_REGEX.test(val))   return 'Name must be 2-50 letters and spaces only.';
  return '';
}

function validateConfirm(val, password) {
  if (!val)           return 'Please confirm your password.';
  if (val !== password) return 'Passwords do not match.';
  return '';
}

// ── Hook ─────────────────────────────────────────────────────────────────────
function useAuthForm(mode /* 'login' | 'register' */) {
  const [fields, setFields] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
  });

  const [errors, setErrors] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
  });

  const [touched, setTouched] = useState({
    name:     false,
    email:    false,
    password: false,
    confirm:  false,
  });

  /** Update a single field and re-validate it on the fly */
  const handleChange = useCallback((field) => (e) => {
    const val = e.target.value;
    setFields(prev => ({ ...prev, [field]: val }));

    // Only show inline errors after the field has been touched
    setTouched(prev => {
      if (!prev[field]) return prev;
      return prev; // keep existing touched map
    });

    // Live validation after first touch
    setErrors(prev => {
      if (!touched[field]) return prev;
      let err = '';
      if (field === 'name')     err = validateName(val);
      if (field === 'email')    err = validateEmail(val);
      if (field === 'password') err = validatePassword(val);
      if (field === 'confirm')  err = validateConfirm(val, fields.password);
      return { ...prev, [field]: err };
    });
  }, [touched, fields.password]);

  /** Mark field as touched (on blur) so inline errors become visible */
  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => {
      let err = '';
      if (field === 'name')     err = validateName(fields.name);
      if (field === 'email')    err = validateEmail(fields.email);
      if (field === 'password') err = validatePassword(fields.password);
      if (field === 'confirm')  err = validateConfirm(fields.confirm, fields.password);
      return { ...prev, [field]: err };
    });
  }, [fields]);

  /** Run full validation before submit. Returns true if all fields are valid. */
  const validate = useCallback(() => {
    const newErrors = {
      name:    mode === 'register' ? validateName(fields.name)                          : '',
      email:   validateEmail(fields.email),
      password: validatePassword(fields.password),
      confirm: mode === 'register' ? validateConfirm(fields.confirm, fields.password)  : '',
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirm: true });
    return Object.values(newErrors).every(e => e === '');
  }, [fields, mode]);

  const reset = useCallback(() => {
    setFields({ name: '', email: '', password: '', confirm: '' });
    setErrors({ name: '', email: '', password: '', confirm: '' });
    setTouched({ name: false, email: false, password: false, confirm: false });
  }, []);

  return { fields, errors, touched, handleChange, handleBlur, validate, reset };
}

export default useAuthForm;
