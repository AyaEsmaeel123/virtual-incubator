import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from './AcceptInvitation.module.css';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing invitation token.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/invitation/accept', {
        token,
        ...formData
      });
      
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <h2>Invalid Invitation</h2>
        <p>The invitation link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Join the Team</h2>
      <p>You've been invited to join a venture. Complete your profile to get started.</p>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Create Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating Account...' : 'Accept Invitation'}
        </button>
      </form>
    </div>
  );
}