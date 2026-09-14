import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar — Fixed top navigation bar with mobile hamburger menu.
 * Props:
 *   isLoggedIn {boolean} — drives auth button label & protected link visibility
 *   onLoginToggle {function} — toggles mock auth state (lifted up from App)
 */
function Navbar({ isLoggedIn, onLoginToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add shadow + bg to navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change (link click)
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeMenu]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const getNavLinkClass = ({ isActive }) =>
    `navbar__nav-link${isActive ? ' active' : ''}`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `navbar__mobile-link${isActive ? ' active' : ''}`;

  return (
    <>
      <header>
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
          <div className="container navbar__inner">

            {/* Logo */}
            <Link to="/" className="navbar__logo" onClick={closeMenu} aria-label="LearnForge Home">
              <span className="navbar__logo-icon" aria-hidden="true">⚡</span>
              <span className="navbar__logo-text">
                Learn<span>Forge</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="navbar__nav" aria-label="Desktop navigation">
              <ul className="navbar__nav-list" role="list">
                <li>
                  <NavLink to="/" className={getNavLinkClass} end>
                    Courses
                  </NavLink>
                </li>
                {isLoggedIn && (
                  <li>
                    <NavLink to="/dashboard" className={getNavLinkClass}>
                      Dashboard
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>

            {/* Desktop Auth Actions */}
            <div className="navbar__actions" aria-label="Authentication actions">
              {isLoggedIn ? (
                <>
                  <NavLink to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    <span className="navbar__auth-dot" aria-hidden="true"></span>
                    My Dashboard
                  </NavLink>
                  <button className="btn btn-ghost" onClick={onLoginToggle} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost" onClick={onLoginToggle} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    Log In
                  </button>
                  <button className="btn btn-primary" onClick={onLoginToggle} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <NavLink to="/" className={getMobileNavLinkClass} onClick={closeMenu} end>
          📚 Courses
        </NavLink>
        {isLoggedIn && (
          <NavLink to="/dashboard" className={getMobileNavLinkClass} onClick={closeMenu}>
            🎓 My Dashboard
          </NavLink>
        )}
        <div className="navbar__mobile-divider" role="separator" />
        <div className="navbar__mobile-actions">
          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={() => { onLoginToggle(); closeMenu(); }} style={{ width: '100%' }}>
              Log Out
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => { onLoginToggle(); closeMenu(); }} style={{ width: '100%' }}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => { onLoginToggle(); closeMenu(); }} style={{ width: '100%' }}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;