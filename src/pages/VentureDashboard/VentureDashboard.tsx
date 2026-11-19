import { useState, useEffect } from 'react';
import styles from './VentureDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function VentureDashboard() {
  const { user } = useAuth(); 
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // جلب البيانات الحقيقية من الباك إند
        const response = await api.get('/user/profile'); 
        setProfile(response.data.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayName = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) 
    : 'Founder';

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  // التحقق من حالة الحساب عشان نلون الشارة
  const isPending = profile?.status === 'PENDING_MANAGER_APPROVAL' || profile?.status === 'PENDING_EMAIL_VERIFICATION';
  const isActive = profile?.status === 'ACTIVE';

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Welcome back, {displayName}! 👋</h1>
        <p>Here is the current status of your venture.</p>
      </div>

      <div className={styles.companyCard}>
        <div className={styles.companyInfo}>
          <div 
            className={styles.statusBadge}
            style={{
              backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : (isPending ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
              color: isActive ? '#22c55e' : (isPending ? '#eab308' : '#ef4444'),
              border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.3)' : (isPending ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)')}`
            }}
          >
            ● {profile?.status?.replace(/_/g, ' ') || 'UNKNOWN'}
          </div>
          
          {/* جلب اسم الشركة من الحقول الديناميكية */}
          <h2>{profile?.submittedFields?.companyName || 'Your Company'}</h2>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Funding Stage</div>
              <div className={styles.metricValue}>{profile?.submittedFields?.fundingStage || 'Not Set'}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Team Size</div>
              <div className={styles.metricValue}>{profile?.submittedFields?.teamSize || '0'} Members</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Profile Score</div>
              <div className={styles.metricValue}>85%</div>
            </div>
          </div>
        </div>
      </div>

      {/* نعرض التنبيه الأصفر فقط إذا كان الحساب قيد المراجعة */}
      {isPending && (
        <div className={styles.pendingAlert}>
          <span>⏳</span>
          <p>
            Your venture profile is currently under review by the incubator management. 
            Some features like booking mentors will be available once your account is activated.
          </p>
        </div>
      )}
      
      {/* نعرض رسالة نجاح إذا كان الحساب نشط */}
      {isActive && (
        <div className={styles.pendingAlert} style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e' }}>
          <span>✅</span>
          <p style={{ color: '#166534' }}>
            Your account is active! You can now use all features of the platform, including booking mentors.
          </p>
        </div>
      )}
    </div>
  );
}