import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import useFetch from '../hooks/useFetch';
import './Home.css';

// ── Category list derived from data ─────────────────────────
const ALL = 'All';

function Home({ onLoginClick }) {
  const { data: courses, loading, error } = useFetch('/data/data.json');
  const location = useLocation();

  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState(ALL);

  // Show auth-required toast if redirected here from a protected route
  const [showAuthToast, setShowAuthToast] = useState(
    location.state?.authRequired === true
  );

  useEffect(() => {
    if (showAuthToast) {
      const timer = setTimeout(() => setShowAuthToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showAuthToast]);

  // Derive unique categories from loaded data
  const categories = useMemo(() => {
    if (!courses) return [ALL];
    const cats = [...new Set(courses.map(c => c.category))].sort();
    return [ALL, ...cats];
  }, [courses]);

  // Filter courses by search + category
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    const q = search.toLowerCase().trim();
    return courses.filter(course => {
      const matchCat = category === ALL || course.category === category;
      const matchSearch = !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        course.tags?.some(t => t.toLowerCase().includes(q)) ||
        course.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [courses, search, category]);

  const handleSearch = useCallback((e) => setSearch(e.target.value), []);
  const handleCategory = useCallback((cat) => setCategory(cat), []);

  return (
    <div className="home-page page-enter">
      {/* ── Auth Toast ── */}
      {showAuthToast && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed', top: 'calc(var(--nav-height) + 16px)',
            left: '50%', transform: 'translateX(-50%)',
            zIndex: 2000, background: 'rgba(239,68,68,0.95)',
            color: '#fff', padding: '0.8rem 1.6rem',
            borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          🔒 Please log in to access the Dashboard
        </div>
      )}

      {/* ══════════════════════════════════
          HERO SECTION
         ══════════════════════════════════ */}
      <section className="hero" aria-labelledby="hero-heading">
        {/* Animated blobs */}
        <div className="hero__blob hero__blob--1" aria-hidden="true" />
        <div className="hero__blob hero__blob--2" aria-hidden="true" />
        <div className="hero__blob hero__blob--3" aria-hidden="true" />

        <div className="container hero__content">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            10 Expert-led Courses · Fully Free
          </p>

          <h1 id="hero-heading" className="hero__title">
            Master In-Demand Skills
            <br />
            <span className="hero__title-gradient">Faster Than Ever</span>
          </h1>

          <p className="hero__subtitle">
            Structured video courses, interactive notes, and a curated curriculum
            designed to take you from zero to job-ready in weeks.
          </p>

          <div className="hero__cta-group">
            <Link to="#catalogue" className="hero__cta-primary" onClick={() => {
              document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Browse Courses →
            </Link>
            <button className="hero__cta-secondary" onClick={onLoginClick}>
              ▶ Start Learning Free
            </button>
          </div>

          {/* Stats */}
          <div className="hero__stats" aria-label="Platform statistics">
            <div className="hero__stat">
              <span className="hero__stat-value">150k+</span>
              <span className="hero__stat-label">Students</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">10</span>
              <span className="hero__stat-label">Courses</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">4.8★</span>
              <span className="hero__stat-label">Avg Rating</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">100%</span>
              <span className="hero__stat-label">Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          COURSE CATALOGUE
         ══════════════════════════════════ */}
      <section id="catalogue" className="catalogue" aria-labelledby="catalogue-heading">
        <div className="container">
          <header className="section-header">
            <p className="section-tag">📚 Course Library</p>
            <h2 id="catalogue-heading" className="section-title">Explore All Courses</h2>
            <p className="section-subtitle">
              Browse our curated library of expert-led courses. Filter by category or search by topic.
            </p>
          </header>

          {/* Search + Category Filters */}
          {!loading && !error && (
            <div className="catalogue__controls">
              {/* Search */}
              <div className="catalogue__search-wrapper">
                <span className="catalogue__search-icon" aria-hidden="true">🔍</span>
                <input
                  id="course-search"
                  type="search"
                  className="catalogue__search"
                  placeholder="Search by title, instructor, or tag..."
                  value={search}
                  onChange={handleSearch}
                  aria-label="Search courses"
                  autoComplete="off"
                />
              </div>

              {/* Category Pills */}
              <nav className="catalogue__category-filters" aria-label="Filter by category">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`catalogue__filter-btn${category === cat ? ' active' : ''}`}
                    onClick={() => handleCategory(cat)}
                    aria-pressed={category === cat}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Result Count */}
          {!loading && !error && (
            <p className="catalogue__result-count" aria-live="polite">
              Showing <strong>{filteredCourses.length}</strong> of <strong>{courses?.length ?? 0}</strong> courses
            </p>
          )}

          {/* States */}
          {loading && (
            <div className="loader-wrapper" role="status" aria-label="Loading courses">
              <div className="spinner" aria-hidden="true" />
              <p>Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              ⚠️ Failed to load courses: {error}
            </div>
          )}

          {/* Course Grid */}
          {!loading && !error && (
            <div
              className="catalogue__grid"
              role="list"
              aria-label="Course catalogue"
            >
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <div key={course.id} role="listitem">
                    <CourseCard {...course} />
                  </div>
                ))
              ) : (
                <div className="catalogue__no-results">
                  <span className="catalogue__no-results-icon" aria-hidden="true">😕</span>
                  <h3>No courses found</h3>
                  <p>Try a different search term or category.</p>
                  <button
                    className="btn btn-outline"
                    onClick={() => { setSearch(''); setCategory(ALL); }}
                    style={{ marginTop: '0.5rem' }}
                    type="button"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;