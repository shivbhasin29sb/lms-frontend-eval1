import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import CourseCard from '../components/CourseCard';
import useFetch from '../hooks/useFetch';
import './CoursePage.css';

// ── Mock curriculum lessons ───────────────────────────────────
function generateCurriculum(lessonCount) {
  const topics = [
    'Introduction & Setup', 'Core Concepts', 'Deep Dive: Part 1',
    'Deep Dive: Part 2', 'Practical Project', 'Advanced Techniques',
    'Real-World Patterns', 'Performance & Optimization', 'Testing',
    'Deployment & CI/CD',
  ];
  const count = Math.min(lessonCount, 10);
  return Array.from({ length: count }, (_, i) => ({
    num: i + 1,
    title: topics[i % topics.length],
    duration: `${8 + (i * 3) % 15}:${String((i * 7) % 60).padStart(2, '0')}`,
    isPreview: i === 0,
  }));
}

/**
 * CoursePage — Dynamic route: /course/:id
 * Fetches all courses, finds the matching one by :id param.
 */
function CoursePage() {
  const { id } = useParams();
  const { data: courses, loading, error } = useFetch('/data/data.json');
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Find the current course
  const course = useMemo(() => {
    if (!courses) return null;
    return courses.find(c => c.id === id) ?? null;
  }, [courses, id]);

  // Check enrollment status when the course loads
  useEffect(() => {
    if (course) {
      const storedEnrolled = JSON.parse(localStorage.getItem('enrolledCourses')) || [];
      setIsEnrolled(storedEnrolled.includes(course.id));
    }
  }, [course]);

  // Handle enrolling in the course
  const handleEnroll = () => {
    if (!course) return;
    const storedEnrolled = JSON.parse(localStorage.getItem('enrolledCourses')) || [];
    if (!storedEnrolled.includes(course.id)) {
      const updated = [...storedEnrolled, course.id];
      localStorage.setItem('enrolledCourses', JSON.stringify(updated));
      setIsEnrolled(true);
    }
  };

  // Related courses (same category, excluding current)
  const relatedCourses = useMemo(() => {
    if (!courses || !course) return [];
    return courses.filter(c => c.category === course.category && c.id !== id).slice(0, 3);
  }, [courses, course, id]);

  const curriculum = useMemo(() => {
    if (!course) return [];
    return generateCurriculum(course.lessons);
  }, [course]);

  const initials = course
    ? course.instructor.split(' ').map(n => n[0]).slice(0, 2).join('')
    : '';

  /* ── Render states ── */
  if (loading) {
    return (
      <div className="course-page page-enter">
        <div className="container" style={{ paddingTop: 'var(--nav-height)' }}>
          <div className="loader-wrapper">
            <div className="spinner" aria-hidden="true" />
            <p>Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-page page-enter">
        <div className="container">
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-page page-enter">
        <div className="container">
          <div className="course-not-found">
            <span className="course-not-found__icon" aria-hidden="true">🔍</span>
            <h2>Course Not Found</h2>
            <p>We couldn't find a course with ID: <code>{id}</code></p>
            <Link to="/" className="btn btn-primary">Back to Catalogue</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="course-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="course-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="course-page__breadcrumb-sep" aria-hidden="true">›</span>
          <Link to="/">Courses</Link>
          <span className="course-page__breadcrumb-sep" aria-hidden="true">›</span>
          <span className="course-page__breadcrumb-current">{course.title}</span>
        </nav>

        {/* Main layout: player + info | sidebar */}
        <div className="course-page__layout">

          {/* ── Main column ── */}
          <div className="course-page__main">
            {/* Video Player */}
            <VideoPlayer
              videoUrl={course.videoUrl}
              title={course.title}
              courseId={course.id}
            />

            {/* Course Info */}
            <article className="course-info">
              <span className="course-info__category">{course.category}</span>
              <h1 className="course-info__title">{course.title}</h1>
              <p className="course-info__description">{course.description}</p>

              {/* Meta grid */}
              <div className="course-info__meta-grid">
                <div className="course-info__meta-item">
                  <span className="course-info__meta-label">Rating</span>
                  <span className="course-info__meta-value">⭐ {course.rating}</span>
                </div>
                <div className="course-info__meta-item">
                  <span className="course-info__meta-label">Students</span>
                  <span className="course-info__meta-value">
                    {course.enrolled >= 1000 ? `${(course.enrolled / 1000).toFixed(1)}k` : course.enrolled}
                  </span>
                </div>
                <div className="course-info__meta-item">
                  <span className="course-info__meta-label">Duration</span>
                  <span className="course-info__meta-value">{course.duration}</span>
                </div>
                <div className="course-info__meta-item">
                  <span className="course-info__meta-label">Lessons</span>
                  <span className="course-info__meta-value">{course.lessons}</span>
                </div>
              </div>
            </article>

            {/* Instructor */}
            <div className="course-instructor" aria-label="Instructor information">
              <span className="course-instructor__avatar" aria-hidden="true">{initials}</span>
              <div className="course-instructor__info">
                <p className="course-instructor__label">Instructor</p>
                <p className="course-instructor__name">{course.instructor}</p>
                <p className="course-instructor__rating">⭐ {course.rating} · {course.lessons} lessons</p>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="course-page__sidebar" aria-label="Course details sidebar">
            {/* Enroll Card */}
            <div className="enroll-card">
              <p className="enroll-card__price enroll-card__free">Free</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>
                Full lifetime access
              </p>
              <ul className="enroll-card__features" role="list">
                {[
                  `${course.lessons} lessons`,
                  course.duration + ' of content',
                  'Certificate of completion',
                  'Downloadable resources',
                  'Mobile access',
                ].map(f => (
                  <li key={f} className="enroll-card__feature">
                    <span className="enroll-card__feature-icon" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              
              {/* Dynamic Enroll Button */}
              {isEnrolled ? (
                <button 
                  className="enroll-card__btn" 
                  type="button"
                  style={{ backgroundColor: '#10b981', color: '#fff', cursor: 'default' }}
                  disabled
                >
                  ✓ Enrolled — Continue Learning
                </button>
              ) : (
                <button 
                  className="enroll-card__btn" 
                  type="button"
                  onClick={handleEnroll}
                >
                  Enroll Now — It's Free
                </button>
              )}

            </div>

            {/* Curriculum */}
            <div className="curriculum-card">
              <header className="curriculum-card__header">
                <span aria-hidden="true">📋</span> Course Curriculum
              </header>
              <ul className="curriculum-card__list" role="list">
                {curriculum.map(lesson => (
                  <li key={lesson.num} className="curriculum-card__item">
                    <span className="curriculum-card__item-icon" aria-hidden="true">
                      {lesson.isPreview ? '▶' : `${lesson.num}`}
                    </span>
                    <span className="curriculum-card__item-text">
                      {lesson.title}
                      {lesson.isPreview && (
                        <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>
                          Preview
                        </span>
                      )}
                    </span>
                    <span className="curriculum-card__item-duration">{lesson.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="related-courses" aria-labelledby="related-heading">
            <header className="section-header">
              <p className="section-tag">🎯 More Like This</p>
              <h2 id="related-heading" className="section-title">Related Courses</h2>
            </header>
            <div className="related-courses__grid">
              {relatedCourses.map(c => (
                <CourseCard key={c.id} {...c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default CoursePage;