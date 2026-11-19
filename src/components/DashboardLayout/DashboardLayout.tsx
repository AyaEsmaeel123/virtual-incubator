import type { ReactNode } from 'react';
import styles from './DashboardLayout.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
      console.log('Logout API failed, ignoring...');
    } finally {
      logoutUser();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const firstLetter = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  const displayName = user?.firstName ? user.firstName : 'User';

  // تحديد اسم مساحة العمل حسب الدور
  const getWorkspaceName = () => {
    if (user?.role === 'ADMIN') return 'Admin Portal';
    if (user?.role === 'MANAGER') return 'Manager Portal';
    if (user?.role === 'MENTOR') return 'Mentor Workspace';
    if (user?.role === 'LEARNER') return 'Learner Workspace';
    return 'Venture Workspace';
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>VIS.</div>
        
        <nav className={styles.navMenu}>
          {/* القائمة للمؤسس والمتعلم */}
          {(user?.role === 'VENTURE' || user?.role === 'LEARNER') && (
            <>
              <button className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`} onClick={() => navigate('/dashboard')}>
                <span>📊</span> Dashboard
              </button>
              <button className={`${styles.navItem} ${isActive('/company-profile') ? styles.active : ''}`} onClick={() => navigate('/company-profile')}>
                <span>🏢</span> Company Profile
              </button>
              <button className={`${styles.navItem} ${isActive('/mentors') ? styles.active : ''}`} onClick={() => navigate('/mentors')}>
                <span>🧭</span> Find Mentors
              </button>
            </>
          )}

          {/* زر إدارة الفريق - يظهر فقط لرائد الأعمال (Venture) */}
          {user?.role === 'VENTURE' && (
            <button className={`${styles.navItem} ${isActive('/team') ? styles.active : ''}`} onClick={() => navigate('/team')}>
              <span>👥</span> My Team
            </button>
          )}

          {/* القائمة للمدير والأدمن */}
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <>
              <button className={`${styles.navItem} ${isActive('/manager-dashboard') ? styles.active : ''}`} onClick={() => navigate('/manager-dashboard')}>
                <span>👥</span> User Management
              </button>
              <button className={`${styles.navItem} ${isActive('/cms') ? styles.active : ''}`} onClick={() => navigate('/cms')}>
                <span>⚙️</span> CMS Settings
              </button>
            </>
          )}

          {/* القائمة للمرشد */}
          {user?.role === 'MENTOR' && (
            <button className={`${styles.navItem} ${isActive('/mentor-dashboard') ? styles.active : ''}`} onClick={() => navigate('/mentor-dashboard')}>
              <span>📅</span> My Sessions
            </button>
          )}

          {/* زر الجلسات للمؤسس والمتعلم */}
          {(user?.role === 'VENTURE' || user?.role === 'LEARNER') && (
            <button className={`${styles.navItem} ${isActive('/sessions') ? styles.active : ''}`} onClick={() => navigate('/sessions')}>
              <span>📅</span> My Sessions
            </button>
          )}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{getWorkspaceName()}</h2>
          </div>
          
          <div className={styles.userInfo}>
            <button onClick={toggleTheme} className={styles.themeToggleBtn}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className={styles.avatar}>{firstLetter}</div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
              {displayName}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Log out
            </button>
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}