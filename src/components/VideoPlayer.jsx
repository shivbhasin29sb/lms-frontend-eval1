import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();

  // Mock list of lessons with working sample video links
  const lessons = [
    { id: 1, title: 'Introduction & Setup', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, title: 'Core Concepts & Architecture', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 3, title: 'Advanced Implementation', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  ];

  const [activeVideo, setActiveVideo] = useState(lessons[0].videoUrl);
  const [completedLessons, setCompletedLessons] = useState([]);

  // Function called when a student clicks a lesson
  const handleSelectLesson = (lesson) => {
    setActiveVideo(lesson.videoUrl);
    
    // Live Tracking simulation: mark lesson as completed if not already
    if (!completedLessons.includes(lesson.id)) {
      const updatedCompleted = [...completedLessons, lesson.id];
      setCompletedLessons(updatedCompleted);

      // Update hours learned in localStorage instantly
      const savedStats = JSON.parse(localStorage.getItem('learnforge_user_stats')) || { hoursLearned: 18.0, courses: [] };
      savedStats.hoursLearned = Number((savedStats.hoursLearned + 0.5).toFixed(1)); // add 30 mins watch time live!
      
      // Update course progress percentage
      if(savedStats.courses.find(c => c.id == id)) {
        savedStats.courses.find(c => c.id == id).progress = Math.min(100, updatedCompleted.length * 35);
      }

      localStorage.setItem('learnforge_user_stats', JSON.stringify(savedStats));
    }
  };

  return (
    <div style={{ display: 'flex', background: '#0a0b10', color: '#fff', minHeight: '100vh', padding: '20px', gap: '20px' }}>
      
      {/* Left: Interactive Video Player */}
      <div style={{ flex: 2 }}>
        <h2>Active Lesson Stream</h2>
        <video 
          controls 
          autoPlay 
          src={activeVideo} 
          style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '450px', outline: 'none' }} 
        />
        <p style={{ marginTop: '10px', color: '#a0aec0' }}>Status: Streaming live through React component state.</p>
      </div>

      {/* Right: Clickable Syllabus Curriculum */}
      <div style={{ flex: 1, background: '#141622', padding: '20px', borderRadius: '12px', border: '1px solid #23263b' }}>
        <h3>Course Curriculum</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lessons.map((lesson) => (
            <li 
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              style={{ 
                padding: '12px 15px', 
                background: '#1e2235', 
                borderRadius: '8px', 
                cursor: 'pointer',
                border: '1px solid #323854',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>▶ {lesson.title}</span>
              {completedLessons.includes(lesson.id) && <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Watched</span>}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}