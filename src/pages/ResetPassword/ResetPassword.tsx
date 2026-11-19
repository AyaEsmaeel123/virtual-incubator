import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import styles from './ResetPassword.module.css';
import api from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // بنجيب التوكن من الرابط
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid or missing reset token.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      
      setMessage({ type: 'success', text: response.data.message || 'Password successfully reset!' });
      
      // بعد 3 ثواني، ننقله لصفحة الدخول
      setTimeout(() => navigate('/login'), 3000);

    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password. The link may have expired.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>Create New Password</h2>
        <p>Your new password must be different from previous used passwords.</p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.9rem',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>New Password</label>
          <div className={styles.passwordWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
            <span className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Confirm Password</label>
          <div className={styles.passwordWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className={styles.footer}>
        Back to <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}