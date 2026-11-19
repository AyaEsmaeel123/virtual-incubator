import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      // المحاولة الأولى: بوابة الزوار والمستخدمين (Ecosystem)
      try {
        response = await api.post('/v1/auth/login', { email, password });
      } catch (err: any) {
        // إذا كان المستخدم موظف (أدمن أو مدير)، الباك إند بيرفض ويطلب بوابة الموظفين
        if (err.response?.data?.message?.includes('staff portal')) {
          response = await api.post('/admin/auth/login', { email, password });
        } else {
          // إذا كان الخطأ لأي سبب آخر (باسوورد غلط)، نمرره للـ catch الرئيسي
          throw err;
        }
      }
      
      // استخراج البيانات (نفس الشكل في النظامين)
      const { token, role, status, userId } = response.data.data;
      
      localStorage.setItem('token', token);

      if (status === 'ACTIVE') {
        const mockFirstName = email.split('@')[0];
        
        loginUser({
          id: userId,
          email,
          firstName: mockFirstName, 
          lastName: '',
          role
        });

        // التوجيه الذكي حسب الدور
        if (role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (role === 'MANAGER') {
          navigate('/manager-dashboard');
        } else if (role === 'MENTOR') {
          navigate('/mentor-dashboard'); 
        } else if (role === 'LEARNER') {
          navigate('/learner-dashboard'); 
        } else {
          navigate('/dashboard'); 
        }
        
      } else {
        setError(`Your account status is: ${status.replace(/_/g, ' ')}. Please contact support.`);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>Welcome back 👋</h2>
        <p>Log in to continue to the VIS platform</p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <span 
              className={styles.togglePassword} 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        <Link to="/forgot-password" className={styles.forgotPassword}>Forgot your password?</Link>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className={styles.divider}>OR</div>

      <div className={styles.socialLogin}>
        <button className={styles.socialBtn}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
          Google
        </button>
        <button className={styles.socialBtn}>
          <img src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width="20" />
          LinkedIn
        </button>
      </div>

      <div className={styles.footer}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}