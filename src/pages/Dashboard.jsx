import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

// --- NEW FIREBASE IMPORTS ---
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// ----------------------------

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: courses } = useFetch('/data/data.json');
  
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(['1', '2']); // Fallback defaults
  const [stats, setStats] = useState({
    hoursLearned: 0.0,
    bookmarksCount: 0,
    badgesCount: 2,
  });

  // --- FETCH ENROLLED COURSES FROM FIREBASE & LOCALSTORAGE ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.enrolledCourses && data.enrolledCourses.length > 0) {
              setEnrolledCourseIds(data.enrolledCourses);
            }
          }
        } catch (err) {
          console.error("Error fetching user enrollments:", err);
        }
      } else {
        // Fallback to local storage bookmarks or default mock list if not logged in
        try {
          const localBookmarks = JSON.parse(localStorage.getItem('lms_bookmarks') || '[]');
          if (localBookmarks.length > 0) {
            setEnrolledCourseIds(localBookmarks);
          }
        } catch (e) {
          // keep default
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter courses catalogue to only show enrolled ones
  const userCourses = courses 
    ? courses.filter(c => enrolledCourseIds.includes(c.id))
    : [];

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
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{userCourses.length}</h3>
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
        {userCourses.length === 0 ? (
          <p style={{ color: '#8c92ac' }}>No courses enrolled yet. Go to the course catalogue and click enroll!</p>
        ) : (
          userCourses.map((course, idx) => (
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
                    {idx % 2 === 0 ? '💻' : '⚡'}
                  </div>
                  <span style={{ fontWeight: '600', initializer: '', fontSize: '1rem', color: '#fff' }}>{course.title}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#8c92ac', fontSize: '0.9rem', fontWeight: '600' }}>0%</span>
                  <span style={{ color: '#8c92ac', fontSize: '1.1rem' }}>›</span>
                </div>
              </div>

              <div style={{ background: '#1e2235', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
                <div style={{ width: '0%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}