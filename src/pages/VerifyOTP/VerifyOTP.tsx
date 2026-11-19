import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import styles from './VerifyOTP.module.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // بنجيب الإيميل واللغة اللي مررناهم من صفحة التسجيل
  const identifier = location.state?.email || '';
  const channel = location.state?.channel || 'EMAIL';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!identifier) {
      // لو حد دخل الرابط مباشرة بدون تسجيل
      navigate('/signup');
    }
  }, [identifier, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/otp/verify', {
        identifier,
        otpCode,
        channel,
        purpose: 'REGISTRATION'
      });

      const { token, role, status, userId, email } = response.data.data;
      
      localStorage.setItem('token', token);
      loginUser({ id: userId, email: email, firstName: email.split('@')[0], lastName: '', role });
      
      setSuccess('Account verified successfully! Redirecting...');
      
      setTimeout(() => {
        if (role === 'ADMIN') navigate('/admin-dashboard');
        else if (role === 'MANAGER') navigate('/manager-dashboard');
        else if (role === 'MENTOR') navigate('/mentor-dashboard');
        else if (role === 'LEARNER') navigate('/learner-dashboard');
        else navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('Sending new code...');
    try {
      await api.post('/auth/otp/send', {
        identifier,
        channel,
        purpose: 'REGISTRATION'
      });
      setSuccess('A new code has been sent to your email.');
    } catch (err: any) {
      setError('Failed to resend code. Please try again later.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <ShieldCheck size={40} />
      </div>
      
      <h2>Check your email</h2>
      <p>We've sent a 6-digit verification code to <strong>{identifier}</strong>. Please enter it below to activate your account.</p>

      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div style={{ color: '#22c55e', marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleVerify}>
        <input 
          type="text" 
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // أرقام بس
          className={styles.otpInput}
          placeholder="000000"
          required
        />
        <button type="submit" className={styles.btn} disabled={loading || otpCode.length !== 6}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <button onClick={handleResend} className={styles.resendBtn}>
        Didn't receive the code? Resend
      </button>
      
      <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: 'var(--text-muted)' }}>Back to Login</Link>
      </div>
    </div>
  );
}