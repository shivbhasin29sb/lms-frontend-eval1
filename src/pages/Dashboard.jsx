import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: courses } = useFetch('/data/data.json');

  // Clean default stats (reset to 0.0h and 0% for presentation)
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('learnforge_user_stats');
    return savedStats ? JSON.parse(savedStats) : {
      enrolledCount: 2,
      hoursLearned: 0.0,
      bookmarksCount: 0,
      badgesCount: 2,
      courses: [
        {
          id: '1',
          title: 'Advanced CSS3: Flexbox, Grid & Animations',
          progress: 0,
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: '2',
          title: 'Node.js & Express: REST API Masterclass',
          progress: 0,
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80'
        }
      ]
    };
  });

  // Save changes to localStorage whenever stats update
  useEffect(() => {
    localStorage.setItem('learnforge_user_stats', JSON.stringify(stats));
  }, [stats]);

  return (
    <div className="dashboard-container" style={{ padding: '40px 60px', background: '#0a0b10', color: '#fff', minHeight: '100vh' }}>

      {/* Welcome Banner */}
      <div style={{ marginBottom: '35px' }}>
        <p style={{ color: '#a0aec0', fontSize: '15px', marginBottom: '8px' }}>Welcome back 👋</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display, sans-serif)' }}>
          Spider's <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
        </h1>
        <p style={{ color: '#8c92ac', marginTop: '6px', fontSize: '15px' }}>Keep up the great work! You're making fantastic progress.</p>
      </div>

      {/* Top Stat Cards with Icons */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '45px' }}>

        {/* Enrolled Card */}
        <div className="stat-card" style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b', position: 'relative' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>📚</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.enrolledCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>ENROLLED</p>
        </div>

        {/* Hours Learned Card */}
        <div className="stat-card" style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b', position: 'relative' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>⏱️</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.hoursLearned}h</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>HOURS LEARNED</p>
        </div>

        {/* Bookmarks Card */}
        <div className="stat-card" style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b', position: 'relative' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>🔖</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.bookmarksCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>BOOKMARKS</p>
        </div>

        {/* Badges Card */}
        <div className="stat-card" style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b', position: 'relative' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.badgesCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>BADGES</p>
        </div>

      </div>

      {/* My Courses Section Header */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🎓</span> My Courses
      </h2>

      {/* Courses List */}
      <div className="courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stats.courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            style={{
              background: '#141622',
              padding: '18px 24px',
              borderRadius: '16px',
              border: '1px solid #23263b',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#23263b'}
          >
            {/* Top row: Thumbnail + Title + Progress % + Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ width: '64px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #23263b' }}
                />
                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#fff' }}>{course.title}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#8c92ac', fontSize: '0.9rem', fontWeight: '600' }}>{course.progress}%</span>
                <span style={{ color: '#8c92ac', fontSize: '1.1rem' }}>›</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: '#1e2235', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
              <div style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}