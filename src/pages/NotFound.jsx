import { Link } from 'react-router-dom';
import './NotFound.css';

// Generates a stable list of particles for the background decoration
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size:  `${10 + (i * 17) % 30}px`,
  top:   `${(i * 71) % 90}%`,
  left:  `${(i * 47) % 90}%`,
  delay: `${(i * 0.6) % 5}s`,
  dur:   `${5 + (i * 0.7) % 5}s`,
}));

/**
 * NotFound — Custom 404 page rendered for any unmatched route (*).
 */
function NotFound() {
  return (
    <div className="not-found-page">
      {/* Floating particles background */}
      <div className="not-found__particles" aria-hidden="true">
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="not-found__particle"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              '--delay': p.delay,
              '--duration': p.dur,
            }}
          />
        ))}
      </div>

      <main className="not-found__content" aria-labelledby="not-found-heading">
        <span className="not-found__emoji" aria-hidden="true">🚀</span>
        <h1 className="not-found__code" aria-label="404">404</h1>
        <h2 id="not-found-heading" className="not-found__title">
          Page Not Found
        </h2>
        <p className="not-found__subtitle">
          Looks like this page drifted into deep space. The URL might be wrong,
          or this page no longer exists.
        </p>

        <nav className="not-found__actions" aria-label="Recovery options">
          <Link to="/" className="btn btn-primary">
            ← Back to Courses
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </nav>
      </main>
    </div>
  );
}

export default NotFound;