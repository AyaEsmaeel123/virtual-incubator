import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './VerifyEmail.module.css';
import api from '../../api/axios';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in the URL.');
        return;
      }

      try {
        // إرسال التوكن للباك إند
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been successfully verified!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired verification link.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={`${styles.iconWrapper} ${
        status === 'loading' ? styles.iconLoading : 
        status === 'success' ? styles.iconSuccess : styles.iconError
      }`}>
        {status === 'loading' && <Loader2 size={40} className={styles.spin} />}
        {status === 'success' && <CheckCircle2 size={40} />}
        {status === 'error' && <XCircle size={40} />}
      </div>

      <h2>
        {status === 'loading' && 'Verifying...'}
        {status === 'success' && 'Email Verified!'}
        {status === 'error' && 'Verification Failed'}
      </h2>

      <p>{message}</p>

      {/* زر العودة لتسجيل الدخول يظهر فقط بعد انتهاء التحميل */}
      {status !== 'loading' && (
        <Link to="/login" className={styles.btn}>
          Go to Login
        </Link>
      )}
    </div>
  );
}