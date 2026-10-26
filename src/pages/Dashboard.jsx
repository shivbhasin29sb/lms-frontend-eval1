import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // Clean default stats (reset to 0 for evaluation presentation)
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('learnforge_user_stats');
    return savedStats ? JSON.parse(savedStats) : {
      enrolledCount: 2,
      hoursLearned: 0.0,
      bookmarksCount: 0,
      badgesCount: 2,
      courses: [
        { id: 1, title: 'Advanced CSS3: Flexbox, Grid & Animations', progress: 0 },
        { id: 2, title: 'Node.js & Express: REST API Masterclass', progress: 0 }
      ]
    };
  });

  // Save changes to localStorage whenever stats update
  useEffect(() => {
    localStorage.setItem('learnforge_user_stats', JSON.stringify(stats));
  }, [stats]);

  return (
    <div className="dashboard-container" style={{ padding: '30px', background: '#0a0b10', color: '#fff', minHeight: '100vh' }}>
      <h1>Student Dashboard</h1>
      <p style={{ color: '#a0aec0' }}>Keep up the great work! You're making fantastic progress.</p>

      {/* Top Stat Counters */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '30px 0' }}>
        <div className="stat-card" style={{ background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b' }}>
          <h3>{stats.enrolledCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '14px' }}>ENROLLED</p>
        </div>
        <div className="stat-card" style={{ background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b' }}>
          <h3>{stats.hoursLearned}h</h3>
          <p style={{ color: '#8c92ac', fontSize: '14px' }}>HOURS LEARNED</p>
        </div>
        <div className="stat-card" style={{ background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b' }}>
          <h3>{stats.bookmarksCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '14px' }}>BOOKMARKS</p>
        </div>
        <div className="stat-card" style={{ background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b' }}>
          <h3>{stats.badgesCount}</h3>
          <p style={{ color: '#8c92ac', fontSize: '14px' }}>BADGES</p>
        </div>
      </div>

      <h2>My Courses</h2>
      <div className="courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
        {stats.courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            style={{ background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '500' }}>{course.title}</span>
              <span style={{ color: '#8c92ac' }}>{course.progress}%</span>
            </div>
            {/* Progress Bar */}
            <div style={{ background: '#23263b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}