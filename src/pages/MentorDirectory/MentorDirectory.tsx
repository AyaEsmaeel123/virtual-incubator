import { useState, useEffect } from 'react';
import styles from './MentorDirectory.module.css';
import api from '../../api/axios';

interface Mentor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  expertiseDomain: string;
  yearsOfExperience: string;
}

export default function MentorDirectory() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // جلب المستخدمين اللي دورهم MENTOR من الباك إند
        const response = await api.get('/management/users?role=MENTOR');
        // بناخد الداتا ونفلترها عشان نتأكد إننا بنجيب المرشدين بس
        const mentorUsers = response.data.data.filter((u: any) => u.role === 'MENTOR');
        
        // استخراج الحقول الديناميكية (مجال الخبرة وسنوات الخبرة)
        const formattedMentors = mentorUsers.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          expertiseDomain: u.submittedFields?.expertiseDomain || 'General',
          yearsOfExperience: u.submittedFields?.yearsOfExperience || '5+',
        }));

        setMentors(formattedMentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
        // بيانات وهمية في حال كان الباك إند واقف أو مافي مرشدين مسجلين
        setMentors([
          { id: 1, firstName: 'Sarah', lastName: 'Al-Harbi', email: 'sarah@vis.com', expertiseDomain: 'B2B SaaS', yearsOfExperience: '10' },
          { id: 2, firstName: 'Ahmed', lastName: 'Al-Shami', email: 'ahmed@vis.com', expertiseDomain: 'Legal', yearsOfExperience: '8' },
          { id: 3, firstName: 'Omar', lastName: 'Farooq', email: 'omar@vis.com', expertiseDomain: 'Tech Architecture', yearsOfExperience: '12' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (loading) return <div>Loading mentors...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Find a Mentor 🧭</h1>
        <p>Browse experienced professionals and book a session to guide your startup.</p>
      </div>

      <div className={styles.grid}>
        {mentors.map((mentor) => (
          <div key={mentor.id} className={styles.card}>
            <div className={styles.header}>
              <div className={styles.avatar}>
                {mentor.firstName.charAt(0)}
              </div>
              <div>
                <div className={styles.name}>{mentor.firstName} {mentor.lastName}</div>
                <div className={styles.role}>Verified Mentor</div>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Expertise</span>
                <span className={styles.detailValue}>{mentor.expertiseDomain}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Experience</span>
                <span className={styles.detailValue}>{mentor.yearsOfExperience} Years</span>
              </div>
              <div className={styles.detailRow} style={{ borderBottom: 'none' }}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{mentor.email}</span>
              </div>
            </div>

            <button className={styles.bookBtn}>
              Book a Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}