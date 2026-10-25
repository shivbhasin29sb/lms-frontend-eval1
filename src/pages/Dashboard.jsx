import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LessonNotes from '../components/LessonNotes';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// --- NEW FIREBASE IMPORTS ---
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
// ----------------------------

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🚀', name: 'Fast Starter', desc: 'Completed first lesson', unlocked: true },
  { id: 'a2', icon: '🔥', name: 'On a Streak', desc: '7-day learning streak', unlocked: true },
  { id: 'a3', icon: '📚', name: 'Bookworm', desc: 'Saved 5 bookmarks', unlocked: false },
  { id: 'a4', icon: '🏆', name: 'Course Champion', desc: 'Complete any course', unlocked: false },
];

function Dashboard() {
  const { user } = useAuth();

  // --- NEW: REAL-TIME FIRESTORE SYNC ---
  const [fsEnrolled, setFsEnrolled] = useState([]);
  const [fsLoading, setFsLoading] = useState(true);
  const [fsError, setFsError] = useState(false);
  const [fsErrorMsg, setFsErrorMsg] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setFsEnrolled([]);
      setFsLoading(false);
      return;
    }

    setFsLoading(true);
    const userRef = doc(db, 'users', user.uid);

    // onSnapshot creates a live socket to your database
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const courses = data.enrolledCourses || [];
        // Map the simple string IDs into the object format Gurnaaz's UI expects
        const formattedCourses = courses.map(id => ({ courseId: id, progress: 0 }));
        setFsEnrolled(formattedCourses);
      } else {
        setFsEnrolled([]);
      }
      setFsLoading(false);
      setFsError(false);
    }, (err) => {
      console.error("Dashboard Firebase Error:", err);
      setFsError(true);
      setFsErrorMsg(err.message);
      setFsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const refetch = () => window.location.reload();
  // -------------------------------------

  // ── Static course metadata (title, thumbnail, etc.) ───────────────────────
  const { data: allCourses, loading: catalogLoading } = useFetch('/data/data.json');

  // ── Bookmarks from localStorage ───────────────────────────────────────────
  const bookmarkedIds = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('lms_bookmarks') || '[]'); }
    catch { return []; }
  }, []);

  // ── Merge Firestore progress with static catalog data ─────────────────────
  const enrolledWithMeta = useMemo(() => {
    if (!allCourses || !fsEnrolled.length) return [];
    return fsEnrolled.map(enrollment => {
      const meta = allCourses.find(c => c.id === enrollment.courseId) ?? {};
      return { ...meta, ...enrollment, id: enrollment.courseId };
    });
  }, [allCourses, fsEnrolled]);

  const bookmarkedCourses = useMemo(() => {
    if (!allCourses) return [];
    return allCourses.filter(c => bookmarkedIds.includes(c.id));
  }, [allCourses, bookmarkedIds]);

  const totalHours = useMemo(() => {
    if (!enrolledWithMeta.length) return '0';
    return enrolledWithMeta.reduce((acc, c) => {
      const h = parseFloat(c.duration) || 0;
      return acc + (h * (c.progress || 0)) / 100;
    }, 0).toFixed(1);
  }, [enrolledWithMeta]);

  const isPageLoading = fsLoading || catalogLoading;

  return (
    <main className="dashboard-page page-enter">
      {/* ── Hero Banner ── */}
      <header className="dashboard__hero">
        <div className="container dashboard__hero-inner">
          <p className="dashboard__greeting">Welcome back 👋</p>
          <h1 className="dashboard__username">
            {user?.displayName
              ? <>{user.displayName.split(' ')[0]}&apos;s <span>Dashboard</span></>
              : <>Student <span>Dashboard</span></>
            }
          </h1>
          <p className="dashboard__subtitle">
            Keep up the great work! You're making fantastic progress.
          </p>
        </div>
      </header>

      <div className="container">
        {/* ── Stats Row ── */}
        <section aria-label="Learning statistics">
          <div className="dashboard__stats">
            <div className="stat-card">
              <span className="stat-card__icon" aria-hidden="true">📚</span>
              <span className="stat-card__value">
                {isPageLoading ? '—' : fsEnrolled.length}
              </span>
              <span className="stat-card__label">Enrolled</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon" aria-hidden="true">⏱️</span>
              <span className="stat-card__value">{totalHours}h</span>
              <span className="stat-card__label">Hours Learned</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon" aria-hidden="true">🔖</span>
              <span className="stat-card__value">{bookmarkedIds.length}</span>
              <span className="stat-card__label">Bookmarks</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon" aria-hidden="true">🏅</span>
              <span className="stat-card__value">2</span>
              <span className="stat-card__label">Badges</span>
            </div>
          </div>
        </section>

        {/* ── Dashboard Grid ── */}
        <div className="dashboard__grid">

          {/* ── Enrolled Courses ── */}
          <section className="dashboard__full-width" aria-labelledby="enrolled-heading">
            <h2 className="dashboard__section-title" id="enrolled-heading">
              <span aria-hidden="true">🎓</span> My Courses
            </h2>

            {/* Loading state */}
            {isPageLoading && (
              <div className="loader-wrapper" style={{ minHeight: '150px' }} role="status" aria-label="Loading courses">
                <div className="spinner" aria-hidden="true" />
                <p>Loading your courses…</p>
              </div>
            )}

            {/* Error state */}
            {!isPageLoading && fsError && (
              <div className="dashboard__fetch-error" role="alert">
                <span aria-hidden="true">⚠️</span>
                <p>{fsErrorMsg}</p>
                <button
                  id="dashboard-retry-btn"
                  className="btn btn-outline"
                  onClick={refetch}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem' }}
                  type="button"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Success state */}
            {!isPageLoading && !fsError && (
              enrolledWithMeta.length > 0 ? (
                <ul className="enrolled-courses__list" role="list">
                  {enrolledWithMeta.map(course => {
                    const pct = course.progress || 0;
                    return (
                      <li key={course.id}>
                        <Link
                          to={`/course/${course.id}`}
                          className="enrolled-item"
                          aria-label={`Continue ${course.title || course.id} — ${pct}% complete`}
                        >
                          <div className="enrolled-item__thumb">
                            <img
                              src={course.thumbnail}
                              alt={course.title || 'Course'}
                              loading="lazy"
                              onError={e => { e.target.src = 'https://placehold.co/80x52/1a1a3a/7c3aed?text=📚'; }}
                            />
                          </div>
                          <div className="enrolled-item__info">
                            <p className="enrolled-item__title">{course.title || course.id}</p>
                            <div className="enrolled-item__progress-bar-wrapper">
                              <div
                                className="enrolled-item__progress-bar"
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div className="enrolled-item__progress-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="enrolled-item__progress-pct">{pct}%</span>
                            </div>
                          </div>
                          <span className="enrolled-item__arrow" aria-hidden="true">›</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="lesson-notes__empty" style={{ padding: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '2.5rem', opacity: 0.4 }} aria-hidden="true">🎓</span>
                  <p style={{ fontSize: '0.9rem' }}>You haven't enrolled in any courses yet.</p>
                  <Link to="/" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
                    Browse Courses
                  </Link>
                </div>
              )
            )}
          </section>

          {/* ── LessonNotes ── */}
          <section aria-labelledby="notes-heading">
            <h2 className="dashboard__section-title sr-only" id="notes-heading">Lesson Notes</h2>
            <LessonNotes />
          </section>

          {/* ── Bookmarks ── */}
          <section aria-labelledby="bookmarks-heading">
            <h2 className="dashboard__section-title" id="bookmarks-heading">
              <span aria-hidden="true">🔖</span> Saved Courses
            </h2>
            {catalogLoading ? (
              <div className="loader-wrapper" style={{ minHeight: '100px' }}>
                <div className="spinner" aria-hidden="true" />
              </div>
            ) : bookmarkedCourses.length > 0 ? (
              <ul className="bookmarks__grid" role="list">
                {bookmarkedCourses.map(c => (
                  <li key={c.id}>
                    <Link to={`/course/${c.id}`} className="bookmark-item">
                      <span className="bookmark-item__icon" aria-hidden="true">📌</span>
                      <div>
                        <p className="bookmark-item__title">{c.title}</p>
                        <p className="bookmark-item__category">{c.category}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="lesson-notes__empty" style={{ padding: 'var(--space-xl)' }}>
                <span style={{ fontSize: '2.5rem', opacity: 0.4 }} aria-hidden="true">📭</span>
                <p style={{ fontSize: '0.9rem' }}>
                  No bookmarks yet. Click 📌 on a course page to save it here.
                </p>
                <Link to="/" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
                  Browse Courses
                </Link>
              </div>
            )}
          </section>

          {/* ── Achievements ── */}
          <section aria-labelledby="achievements-heading">
            <h2 className="dashboard__section-title" id="achievements-heading">
              <span aria-hidden="true">🏆</span> Achievements
            </h2>
            <ul className="achievements__grid" role="list">
              {ACHIEVEMENTS.map(a => (
                <li key={a.id}>
                  <div
                    className={`achievement-item${a.unlocked ? '' : ' locked'}`}
                    aria-label={`${a.name}: ${a.desc}${!a.unlocked ? ' (locked)' : ''}`}
                  >
                    <span className="achievement-item__icon" aria-hidden="true">{a.icon}</span>
                    <span className="achievement-item__name">{a.name}</span>
                    <span className="achievement-item__desc">{a.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;