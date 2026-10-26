import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();

  // Full 10-lesson syllabus matching your curriculum list
  const lessons = [
    { id: 1, title: 'Introduction & Setup', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
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
  const [activeTitle, setActiveTitle] = useState(lessons[0].title);

  // Function called when a student clicks a lesson from the syllabus
  const handleSelectLesson = (lesson) => {
    setActiveVideo(lesson.videoUrl);
    setActiveTitle(lesson.title);
  };

  return (
    <div style={{ display: 'flex', background: '#0a0b10', color: '#fff', minHeight: '100vh', padding: '30px', gap: '20px' }}>

      {/* Left: Interactive Video Player */}
      <div style={{ flex: 2 }}>
        <h2 style={{ marginBottom: '15px' }}>Now Playing: {activeTitle}</h2>
        <video
          controls
          autoPlay
          src={activeVideo}
          style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '450px', outline: 'none', border: '1px solid #23263b' }}
        />
        <p style={{ marginTop: '10px', color: '#a0aec0' }}>Status: Stable React component media stream active.</p>
      </div>

      {/* Right: Clickable Syllabus Curriculum */}
      <div style={{ flex: 1, background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>Course Curriculum</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              style={{
                padding: '12px 15px',
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
              <span style={{ fontSize: '14px' }}>▶ {lesson.title}</span>
              <span style={{ color: '#8c92ac', fontSize: '12px' }}>10:00</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}