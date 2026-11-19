import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.layout}>
      {/* زر تبديل الثيم في الزاوية */}
      <button onClick={toggleTheme} className={styles.themeToggleBtn}>
        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <div className={styles.formSide}>
        {children}
      </div>

      <div className={styles.brandSide}>
        <div className={styles.brandLogo}>VIS.</div>
        <p className={styles.brandText}>
          The premier ecosystem for founders, mentors, and investors.
        </p>
        <p className={styles.brandSubText}>
          Turn your vision into a scalable venture with our virtual incubator platform.
        </p>
      </div>
    </div>
  );
}