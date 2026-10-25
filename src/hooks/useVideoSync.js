/**
 * useVideoSync.js — Shiv's Task (PE2 Feature 4)
 *
 * Custom hook that syncs an HTML5 <video> element's current timestamp to
 * the user's Firestore document using a debounce / throttle strategy.
 *
 * Strategy: "Throttle-then-debounce"
 *   • A throttle interval (default: 7 seconds) gates how often we write to
 *     Firestore during active playback — prevents database overload.
 *   • An additional debounced flush fires 2 seconds after the user stops
 *     interacting (pause, seek, unmount) to capture the final position.
 *
 * On mount: reads the saved timestamp from Firestore and seeks the video
 * to that position before the first play.
 *
 * @param {React.RefObject} videoRef    - Ref attached to the <video> element
 * @param {string}          courseId    - Firestore doc key for this course
 * @param {string}          uid         - Authenticated user's UID (null = no sync)
 * @param {number}          [syncInterval=7000] - Throttle window in milliseconds
 */

import { useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function useVideoSync(videoRef, courseId, uid, syncInterval = 7000) {
  const lastSyncTimeRef   = useRef(0);      // epoch ms of last Firestore write
  const debounceTimerRef  = useRef(null);   // debounce flush timer
  const hasSeekedRef      = useRef(false);  // prevent double-seek on mount
  const isMountedRef      = useRef(true);

  // ── Firestore write helper ─────────────────────────────────────────────────
  const writeTimestamp = useCallback(async (timestamp) => {
    if (!uid || !courseId) return;
    try {
      const ref = doc(db, 'users', uid, 'enrolledCourses', courseId);
      await updateDoc(ref, {
        videoTimestamp: timestamp,
        lastWatchedAt: serverTimestamp(),
      });
    } catch (err) {
      // Non-fatal: silently log. The next sync interval will retry.
      console.warn('[useVideoSync] Firestore write failed:', err.message);
    }
  }, [uid, courseId]);

  // ── Debounced flush (fires after user stops interacting) ───────────────────
  const scheduleDebouncedFlush = useCallback(() => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && isMountedRef.current) {
        writeTimestamp(Math.floor(video.currentTime));
      }
    }, 2000);
  }, [videoRef, writeTimestamp]);

  // ── Throttled sync handler (attached to timeupdate event) ─────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;

    const now = Date.now();
    if (now - lastSyncTimeRef.current >= syncInterval) {
      lastSyncTimeRef.current = now;
      writeTimestamp(Math.floor(video.currentTime));
    }
  }, [videoRef, syncInterval, writeTimestamp]);

  // ── Resume playback from saved timestamp on mount ──────────────────────────
  useEffect(() => {
    if (!uid || !courseId) return;

    let cancelled = false;

    async function resumeFromSaved() {
      try {
        const ref      = doc(db, 'users', uid, 'enrolledCourses', courseId);
        const snapshot = await getDoc(ref);
        if (cancelled || hasSeekedRef.current) return;

        const saved = snapshot.exists() ? (snapshot.data().videoTimestamp ?? 0) : 0;

        // Wait for the video element to be ready before seeking
        const trySeek = () => {
          const video = videoRef.current;
          if (!video) return;
          if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
            if (saved > 0 && saved < video.duration - 5) {
              video.currentTime = saved;
            }
            hasSeekedRef.current = true;
          } else {
            video.addEventListener('loadedmetadata', trySeek, { once: true });
          }
        };
        trySeek();
      } catch (err) {
        console.warn('[useVideoSync] Could not restore timestamp:', err.message);
      }
    }

    resumeFromSaved();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, courseId]); // intentionally omit videoRef — it's a stable ref object

  // ── Attach event listeners to the video element ───────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !uid) return;

    isMountedRef.current = true;

    // Throttled sync during playback
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Debounced flush on pause / seek / end
    const flush = () => scheduleDebouncedFlush();
    video.addEventListener('pause',  flush);
    video.addEventListener('seeked', flush);
    video.addEventListener('ended',  flush);

    return () => {
      isMountedRef.current = false;

      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause',      flush);
      video.removeEventListener('seeked',     flush);
      video.removeEventListener('ended',      flush);

      // Final flush on unmount (e.g. user navigates away)
      clearTimeout(debounceTimerRef.current);
      if (video) {
        writeTimestamp(Math.floor(video.currentTime));
      }
    };
  }, [videoRef, uid, handleTimeUpdate, scheduleDebouncedFlush, writeTimestamp]);
}

export default useVideoSync;
