/**
 * VideoPlayer.jsx — Shiv's Task (PE2 Feature 4) — UPDATED
 *
 * HTML5 <video> player controlled via useRef.
 * • Syncs currentTime to Firestore every 5-10 s via useVideoSync (throttle + debounce).
 * • Restores the saved timestamp on mount so the user resumes exactly where they left off.
 * • Falls back to a YouTube iframe embed when no direct .mp4 / .webm src is available.
 * • Custom play/pause, mute/unmute, and progress bar via refs — no 3rd-party player lib.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth }    from '../context/AuthContext';
import useVideoSync   from '../hooks/useVideoSync';
import './VideoPlayer.css';

/**
 * Props:
 *   videoUrl  {string} — Direct video URL (mp4/webm) OR YouTube embed URL
 *   title     {string} — Accessible label / display title
 *   courseId  {string} — Firestore / localStorage key
 */
function VideoPlayer({ videoUrl, title, courseId }) {
  const { user } = useAuth();
  const videoRef  = useRef(null);

  // ── useVideoSync: throttle-then-debounce Firestore writes ─────────────────
  // Only active when user is logged in AND a direct video src exists.
  const isDirectVideo = videoUrl && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl);
  useVideoSync(videoRef, courseId, isDirectVideo ? user?.uid : null, 7000);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isMuted,      setIsMuted]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lms_bookmarks') || '[]').includes(courseId);
    } catch { return false; }
  });
  const [isLiked, setIsLiked] = useState(false);

  // ── Playback controls ──────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const handleSeek = useCallback((e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(ratio * duration, duration));
  }, [duration]);

  // ── Sync video events → local state ───────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay     = () => setIsPlaying(true);
    const onPause    = () => setIsPlaying(false);
    const onTimeUpd  = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
    };
    const onLoaded   = () => setDuration(v.duration || 0);

    v.addEventListener('play',          onPlay);
    v.addEventListener('pause',         onPause);
    v.addEventListener('timeupdate',    onTimeUpd);
    v.addEventListener('loadedmetadata',onLoaded);

    return () => {
      v.removeEventListener('play',          onPlay);
      v.removeEventListener('pause',         onPause);
      v.removeEventListener('timeupdate',    onTimeUpd);
      v.removeEventListener('loadedmetadata',onLoaded);
    };
  }, []);

  // ── Format seconds → mm:ss ─────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  // ── Bookmark handler ───────────────────────────────────────────────────────
  const handleBookmark = () => {
    setIsBookmarked(prev => {
      const next = !prev;
      try {
        const saved   = JSON.parse(localStorage.getItem('lms_bookmarks') || '[]');
        const updated = next
          ? [...new Set([...saved, courseId])]
          : saved.filter(id => id !== courseId);
        localStorage.setItem('lms_bookmarks', JSON.stringify(updated));
      } catch (err) { console.error('Bookmark save failed:', err); }
      return next;
    });
  };

  // ── Render: YouTube iframe fallback ────────────────────────────────────────
  if (!isDirectVideo) {
    const embedUrl = videoUrl
      ? `${videoUrl}?rel=0&modestbranding=1&enablejsapi=1`
      : null;

    return (
      <section className="video-player" aria-label={`Video player: ${title}`}>
        <div className="video-player__progress" aria-hidden="true">
          <div className="video-player__progress-fill" />
        </div>
        <div className="video-player__frame-wrapper">
          {embedUrl ? (
            <iframe
              className="video-player__iframe"
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="video-player__no-video">No video available</div>
          )}
        </div>
        <div className="video-player__controls">
          <h2 className="video-player__title">{title}</h2>
          <div className="video-player__actions">
            <button
              className={`video-player__action-btn${isLiked ? ' active' : ''}`}
              onClick={() => setIsLiked(p => !p)}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '❤️' : '🤍'} {isLiked ? 'Liked' : 'Like'}
            </button>
            <button
              className={`video-player__action-btn${isBookmarked ? ' active' : ''}`}
              onClick={handleBookmark}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarked ? '🔖' : '📌'} {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Render: Native HTML5 video with custom controls ───────────────────────
  return (
    <section className="video-player" aria-label={`Video player: ${title}`}>

      {/* ── Sync indicator (shown when user is logged in) ── */}
      {user && (
        <div className="video-player__sync-badge" aria-live="polite" aria-atomic="true">
          ☁ Progress syncing
        </div>
      )}

      {/* ── Video element ── */}
      <div className="video-player__frame-wrapper video-player__frame-wrapper--native">
        <video
          ref={videoRef}
          className="video-player__native"
          src={videoUrl}
          preload="metadata"
          aria-label={title}
          onClick={togglePlay}
        >
          Your browser does not support the video element.
        </video>

        {/* Large play/pause overlay */}
        <button
          className={`video-player__overlay-btn${isPlaying ? ' playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          type="button"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* ── Custom controls bar ── */}
      <div className="video-player__custom-controls">
        {/* Progress / Seek bar */}
        <div
          className="video-player__seek"
          role="slider"
          aria-label="Video progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          onClick={handleSeek}
          tabIndex={0}
          onKeyDown={(e) => {
            const v = videoRef.current;
            if (!v) return;
            if (e.key === 'ArrowRight') v.currentTime = Math.min(v.currentTime + 5, duration);
            if (e.key === 'ArrowLeft')  v.currentTime = Math.max(v.currentTime - 5, 0);
          }}
        >
          <div className="video-player__seek-fill" style={{ width: `${progress}%` }} />
          <div className="video-player__seek-thumb" style={{ left: `${progress}%` }} />
        </div>

        {/* Buttons row */}
        <div className="video-player__ctrl-row">
          <div className="video-player__ctrl-left">
            <button
              id="video-play-btn"
              className="video-player__ctrl-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              type="button"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              id="video-mute-btn"
              className="video-player__ctrl-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              type="button"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <span className="video-player__time">
              {fmt(videoRef.current?.currentTime)} / {fmt(duration)}
            </span>
          </div>

          <div className="video-player__ctrl-right">
            <button
              className={`video-player__action-btn${isLiked ? ' active' : ''}`}
              onClick={() => setIsLiked(p => !p)}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
            <button
              className={`video-player__action-btn${isBookmarked ? ' active' : ''}`}
              onClick={handleBookmark}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarked ? '🔖' : '📌'}
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="video-player__controls">
        <h2 className="video-player__title">{title}</h2>
      </div>
    </section>
  );
}

export default VideoPlayer;
