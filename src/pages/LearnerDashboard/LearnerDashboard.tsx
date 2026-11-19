import { useAuth } from '../../context/AuthContext';
import { BookOpen, GraduationCap, Award, PlayCircle } from 'lucide-react';
import styles from './LearnerDashboard.module.css';

export default function LearnerDashboard() {
  const { user } = useAuth();

  // كورسات وهمية (Mock Data)
  const courses = [
    { id: 1, title: 'Introduction to Lean Startup', progress: 75, category: 'Entrepreneurship' },
    { id: 2, title: 'Product-Market Fit Masterclass', progress: 30, category: 'Product' },
    { id: 3, title: 'Financial Modeling for Startups', progress: 0, category: 'Finance' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Welcome back, {user?.firstName}! 🎓</h1>
        <p>Continue your learning journey and track your progress.</p>
      </div>

      {/* كروت الإحصائيات */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3>3</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Award size={24} />
          </div>
          <div>
            <h3>1</h3>
            <p>Certificates Earned</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h3>15</h3>
            <p>Hours Learned</p>
          </div>
        </div>
      </div>

      {/* قائمة الكورسات */}
      <div className={styles.coursesSection}>
        <h2>Your Courses</h2>
        <div className={styles.coursesGrid}>
          {courses.map(course => (
            <div key={course.id} className={styles.courseCard}>
              <div className={styles.courseHeader}>
                <span className={styles.category}>{course.category}</span>
                <PlayCircle size={32} className={styles.playIcon} />
              </div>
              <h3>{course.title}</h3>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span>{course.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}