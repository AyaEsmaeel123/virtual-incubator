import { useState } from 'react';
import styles from './MentorDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Video, CheckCircle } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  
  // بيانات وهمية (Mock Data) للتجربة
  const [sessions] = useState([
    { id: 1, ventureName: 'Alpha AI Labs', founder: 'Sarah', date: '2026-11-05', time: '14:00', agenda: 'Looking for advice on Go-To-Market strategy for our B2B SaaS.', status: 'UPCOMING' },
    { id: 2, ventureName: 'TechNova', founder: 'Ahmed', date: '2026-11-07', time: '10:00', agenda: 'Need help structuring our pre-seed pitch deck.', status: 'UPCOMING' },
    { id: 3, ventureName: 'EcoSolutions', founder: 'Lina', date: '2026-10-25', time: '16:00', agenda: 'Discussing pricing models.', status: 'COMPLETED' },
  ]);

  const upcomingSessions = sessions.filter(s => s.status === 'UPCOMING');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Welcome back, {user?.firstName}! 🧭</h1>
        <p>Here is an overview of your mentoring sessions.</p>
      </div>

      {/* كروت الإحصائيات */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-primary)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3>{upcomingSessions.length}</h3>
            <p>Upcoming Sessions</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3>{completedSessions.length}</h3>
            <p>Completed Sessions</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <Users size={24} />
          </div>
          <div>
            <h3>5</h3>
            <p>Total Mentees</p>
          </div>
        </div>
      </div>

      {/* جدول الجلسات */}
      <div className={styles.tableSection}>
        <h2>Upcoming Sessions</h2>
        
        {upcomingSessions.length === 0 ? (
          <p className={styles.emptyState}>No upcoming sessions booked yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Venture</th>
                  <th>Date & Time</th>
                  <th>Agenda</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div className={styles.ventureInfo}>
                        <strong>{session.ventureName}</strong>
                        <span>{session.founder}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateInfo}>
                        <span>{session.date}</span>
                        <span>{session.time}</span>
                      </div>
                    </td>
                    <td>
                      <p className={styles.agendaText}>"{session.agenda}"</p>
                    </td>
                    <td>
                      <button className={styles.joinBtn}>
                        <Video size={16} /> Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}