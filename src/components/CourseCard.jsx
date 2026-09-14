import { Link } from 'react-router-dom';
import './CourseCard.css';

// ── Helper: render star rating ───────────────────────────────
function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="course-card__rating" aria-label={`Rating: ${rating} out of 5`}>
      {'★'.repeat(full)}
      {half && '½'}
      {'☆'.repeat(empty)}
      <span>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Helper: level → badge variant ────────────────────────────
const LEVEL_VARIANT = {
  Beginner:     'badge-success',
  Intermediate: 'badge-primary',
  Advanced:     'badge-warning',
};

/**
 * CourseCard — Reusable card displaying a course summary.
 * Props come directly from the data.json course object shape.
 */
function CourseCard({ id, title, instructor, category, duration, thumbnail, rating, enrolled, lessons, level, tags }) {
  // Initials for avatar
  const initials = instructor
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');

  const enrolledFormatted = enrolled >= 1000
    ? `${(enrolled / 1000).toFixed(1)}k`
    : enrolled;

  return (
    <Link
      to={`/course/${id}`}
      className="course-card"
      aria-label={`View course: ${title}`}
    >
      {/* Thumbnail */}
      <div className="course-card__thumb">
        <img
          src={thumbnail}
          alt={`${title} thumbnail`}
          className="course-card__img"
          loading="lazy"
          onError={e => {
            e.target.src = `https://placehold.co/600x338/1a1a3a/7c3aed?text=${encodeURIComponent(category)}`;
          }}
        />
        <div className="course-card__overlay" aria-hidden="true">
          <span className="course-card__play-btn">▶</span>
        </div>
        <div className="course-card__level-badge">
          <span className={`badge ${LEVEL_VARIANT[level] ?? 'badge-primary'}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Body */}
      <article className="course-card__body">
        <span className="course-card__category" aria-label={`Category: ${category}`}>
          {category}
        </span>
        <h3 className="course-card__title">{title}</h3>
        <p className="course-card__instructor">
          <span className="course-card__instructor-avatar" aria-hidden="true">
            {initials}
          </span>
          {instructor}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <ul className="course-card__tags" aria-label="Course tags" role="list">
            {tags.slice(0, 3).map(tag => (
              <li key={tag} className="course-card__tag">{tag}</li>
            ))}
          </ul>
        )}
      </article>

      {/* Footer */}
      <footer className="course-card__footer">
        <StarRating rating={rating} />
        <div className="course-card__meta" aria-label="Course details">
          <span className="course-card__meta-item" title="Duration">
            🕐 {duration}
          </span>
          <span className="course-card__meta-item" title="Lessons">
            📖 {lessons} lessons
          </span>
          <span className="course-card__meta-item" title="Enrolled students">
            👥 {enrolledFormatted}
          </span>
        </div>
      </footer>
    </Link>
  );
}

export default CourseCard;