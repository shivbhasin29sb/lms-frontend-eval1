import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('learnforge_user_stats');
    return savedStats ? JSON.parse(savedStats) : {
      enrolledCount: 2,
      hoursLearned: 0.0,
      bookmarksCount: 0,
      badgesCount: 2,
      courses: [
        { id: '1', title: 'Advanced CSS3: Flexbox, Grid & Animations', progress: 0 },
        { id: '2', title: 'Node.js & Express: REST API Masterclass', progress: 0 }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('learnforge_user_stats', JSON.stringify(stats));
  }, [stats]);

  return (
    <div className="dashboard-container" style={{ padding: '40px 60px', background: '#0a0b10', color: '#fff', minHeight: '100vh' }}>
      
      {/* Welcome Banner */}
      <div style={{ marginBottom: '35px' }}>
        <p style={{ color: '#a0aec0', fontSize: '15px', marginBottom: '8px' }}>Welcome back 👋</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
          Spider's <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
        </h1>
        <p style={{ color: '#8c92ac', marginTop: '6px', fontSize: '15px' }}>Keep up the great work! You're making fantastic progress.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '45px' }}>
        <div style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>📚</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.enrolledCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600' }}>ENROLLED</p>
        </div>
        <div style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>⏱️</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.hoursLearned}h</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600' }}>HOURS LEARNED</p>
        </div>
        <div style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>🔖</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.bookmarksCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600' }}>BOOKMARKS</p>
        </div>
        <div style={{ background: '#141622', padding: '24px', borderRadius: '16px', border: '1px solid #23263b' }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{stats.badgesCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '12px', fontWeight: '600' }}>BADGES</p>
        </div>
      </div>

      {/* Courses Header */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🎓</span> My Courses
      </h2>

      {/* Courses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stats.courses.map((course, idx) => (
          <div 
            key={course.id} 
            onClick={() => navigate(`/course/${course.id}`)}
            style={{ 
              background: '#141622', 
              padding: '20px 24px', 
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '42px', height: '42px', background: '#1e2235', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid #323854' }}>
                  {idx === 0 ? '💻' : '⚡'}
                </div>
                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#fff' }}>{course.title}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#8c92ac', fontSize: '0.9rem', fontWeight: '600' }}>{course.progress}%</span>
                <span style={{ color: '#8c92ac', fontSize: '1.1rem' }}>›</span>
              </div>
            </div>

            <div style={{ background: '#1e2235', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
              <div style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}