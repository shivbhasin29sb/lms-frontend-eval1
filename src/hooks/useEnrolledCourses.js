/**
 * useEnrolledCourses.js — Gurnaaz's Task (PE2 Feature 3)
 *
 * Custom hook that connects the Student Dashboard to Cloud Firestore.
 *
 * Firestore data model:
 *   Collection: users/{uid}/enrolledCourses
 *   Document  : {courseId}
 *   Fields    : courseId, enrolledAt, progress (0-100), lastWatchedAt, videoTimestamp
 *
 * State machine:  idle → loading → success | error
 *
 * Returns:
 *   enrolledCourses  {Array}   – fetched enrollment documents
 *   status           {string}  – 'idle' | 'loading' | 'success' | 'error'
 *   error            {string}  – human-readable error message
 *   refetch          {function}– manually re-trigger the fetch
 *   updateProgress   {function}– update progress for a specific course
 *   enrollCourse     {function}– add a new enrollment document
 *   unenrollCourse   {function}– remove an enrollment document
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ── Status constants ──────────────────────────────────────────────────────────
const STATUS = {
  IDLE:    'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR:   'error',
};

function useEnrolledCourses(uid) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [status, setStatus]                   = useState(STATUS.IDLE);
  const [error, setError]                     = useState('');
  const fetchCountRef = useRef(0); // used to ignore stale fetches

  // ── Fetch enrolled courses from Firestore ─────────────────────────────────
  const fetchCourses = useCallback(async () => {
    if (!uid) {
      setEnrolledCourses([]);
      setStatus(STATUS.IDLE);
      return;
    }

    const fetchId = ++fetchCountRef.current;
    setStatus(STATUS.LOADING);
    setError('');

    try {
      const colRef  = collection(db, 'users', uid, 'enrolledCourses');
      const snapshot = await getDocs(colRef);

      if (fetchId !== fetchCountRef.current) return; // stale fetch — discard

      const courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEnrolledCourses(courses);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      if (fetchId !== fetchCountRef.current) return;
      console.error('[useEnrolledCourses] fetch failed:', err);
      setError('Failed to load your courses. Please check your connection and try again.');
      setStatus(STATUS.ERROR);
    }
  }, [uid]);

  // Auto-fetch when uid changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Enroll a course ───────────────────────────────────────────────────────
  const enrollCourse = useCallback(async (courseId) => {
    if (!uid) throw new Error('User not authenticated.');
    const ref = doc(db, 'users', uid, 'enrolledCourses', courseId);
    await setDoc(ref, {
      courseId,
      enrolledAt:     serverTimestamp(),
      progress:       0,
      videoTimestamp: 0,
      lastWatchedAt:  null,
    }, { merge: true });
    // Optimistic local update
    setEnrolledCourses(prev => {
      if (prev.some(c => c.id === courseId)) return prev;
      return [...prev, { id: courseId, courseId, progress: 0, videoTimestamp: 0 }];
    });
  }, [uid]);

  // ── Update progress ───────────────────────────────────────────────────────
  const updateProgress = useCallback(async (courseId, progress) => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'enrolledCourses', courseId);
    await updateDoc(ref, { progress, lastWatchedAt: serverTimestamp() });
    setEnrolledCourses(prev =>
      prev.map(c => c.id === courseId ? { ...c, progress } : c)
    );
  }, [uid]);

  // ── Unenroll a course ─────────────────────────────────────────────────────
  const unenrollCourse = useCallback(async (courseId) => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'enrolledCourses', courseId);
    await deleteDoc(ref);
    setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
  }, [uid]);

  return {
    enrolledCourses,
    status,
    isLoading: status === STATUS.LOADING,
    isError:   status === STATUS.ERROR,
    isSuccess: status === STATUS.SUCCESS,
    error,
    refetch: fetchCourses,
    enrollCourse,
    updateProgress,
    unenrollCourse,
  };
}

export default useEnrolledCourses;
