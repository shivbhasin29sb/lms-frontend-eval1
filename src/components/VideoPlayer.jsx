import { useState, useRef } from 'react';
import './VideoPlayer.css';

/**
 * VideoPlayer — Renders a responsive YouTube iframe embed.
 * Props:
 *   videoUrl   {string}  — YouTube embed URL
 *   title      {string}  — Video/course title shown in controls bar
 *   courseId   {string}  — Used for bookmarking state (localStorage key)
 */
function VideoPlayer({ videoUrl, title, courseId }) {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lms_bookmarks') || '[]');
      return saved.includes(courseId);
    } catch {
      return false;
    }
  });

  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef(null);

  const handleBookmark = () => {
    setIsBookmarked(prev => {
      const next = !prev;
      try {
        const saved = JSON.parse(localStorage.getItem('lms_bookmarks') || '[]');
        const updated = next
          ? [...new Set([...saved, courseId])]
          : saved.filter(id => id !== courseId);
        localStorage.setItem('lms_bookmarks', JSON.stringify(updated));
      } catch (err) {
        console.error('Bookmark save failed:', err);
      }
      return next;
    });
  };

  const handleLike = () => setIsLiked(prev => !prev);

  // Build a proper embed URL with privacy-enhanced mode
  const embedUrl = videoUrl
    ? `${videoUrl}?rel=0&modestbranding=1&enablejsapi=1`
    : null;

  return (
    <section className="video-player" aria-label={`Video player: ${title}`}>
      {/* Thin progress bar (decorative — simulates "35% watched") */}
      <div className="video-player__progress" aria-hidden="true">
        <div className="video-player__progress-fill"></div>
      </div>

      {/* iFrame embed */}
      <div className="video-player__frame-wrapper">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            className="video-player__iframe"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
            No video available
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="video-player__controls">
        <h2 className="video-player__title">{title}</h2>
        <div className="video-player__actions">
          <button
            className={`video-player__action-btn${isLiked ? ' active' : ''}`}
            onClick={handleLike}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Unlike this course' : 'Like this course'}
          >
            {isLiked ? '❤️' : '🤍'} {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            className={`video-player__action-btn${isBookmarked ? ' active' : ''}`}
            onClick={handleBookmark}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this course'}
          >
            {isBookmarked ? '🔖' : '📌'} {isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default VideoPlayer;
