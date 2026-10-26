import React, { useState } from 'react';

export default function VideoPlayer({ videoUrl, title }) {
  // Full 10-lesson syllabus matching your curriculum
  const lessons = [
    { id: 1, title: 'Introduction & Setup', videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, title: 'Core Concepts & Architecture', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 3, title: 'Deep Dive: Part 1', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 4, title: 'Deep Dive: Part 2', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 5, title: 'Practical Project', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 6, title: 'Advanced Techniques', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 7, title: 'Real-World Patterns', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 8, title: 'Performance & Optimization', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 9, title: 'Testing', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 10, title: 'Deployment & CI/CD', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  ];

  const [activeVideo, setActiveVideo] = useState(lessons[0].videoUrl);
  const [activeTitle, setActiveTitle] = useState(title || lessons[0].title);

  const handleSelectLesson = (lesson) => {
    setActiveVideo(lesson.videoUrl);
    setActiveTitle(lesson.title);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', marginBottom: '25px' }}>

      {/* Left: Interactive Video Player */}
      <div style={{ flex: 2, minWidth: '300px' }}>
        <h2 style={{ marginBottom: '12px', fontSize: '1.25rem', color: '#fff' }}>Now Playing: {activeTitle}</h2>
        <video
          controls
          autoPlay
          src={activeVideo}
          style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '420px', outline: 'none', border: '1px solid #23263b' }}
        />
        <p style={{ marginTop: '8px', color: '#a0aec0', fontSize: '0.85rem' }}>Status: Stable React component media stream active.</p>
      </div>

      {/* Right: Clickable Lesson Syllabus Stream */}
      <div style={{ flex: 1, minWidth: '250px', background: '#141622', padding: '16px', borderRadius: '12px', border: '1px solid #23263b', maxHeight: '420px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px' }}>Course Curriculum</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              style={{
                padding: '10px 12px',
                background: activeTitle === lesson.title ? '#1e2235' : '#141622',
                borderRadius: '8px',
                cursor: 'pointer',
                border: activeTitle === lesson.title ? '1px solid #6366f1' : '1px solid #23263b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>▶ {lesson.title}</span>
              <span style={{ color: '#8c92ac', fontSize: '0.75rem' }}>10:00</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}