import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, UserPlus, X } from 'lucide-react';
import styles from './TeamManagement.module.css';

export default function TeamManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchData = async () => {
    try {
      const membersRes = await api.get('/venture/employees');
      const invitationsRes = await api.get('/venture/employees/invitations');
      setMembers(membersRes.data.data || []);
      setInvitations(invitationsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load team data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post('/venture/employees/invite', { email: inviteEmail, jobTitle });
      alert('Invitation sent successfully!');
      setIsModalOpen(false);
      setInviteEmail('');
      setJobTitle('');
      fetchData(); // تحديث القوائم
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await api.delete(`/venture/employees/invitations/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to revoke invitation.');
    }
  };

  if (loading) return <div>Loading team data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Team Management</h1>
        <button className={styles.inviteBtn} onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} /> Invite Employee
        </button>
      </div>

      {/* جدول الأعضاء الحاليين */}
      <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Current Members</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Job Title</th>
            <th>Joined At</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No team members yet.</td></tr>
          ) : (
            members.map(m => (
              <tr key={m.id}>
                <td>{m.firstName} {m.lastName}</td>
                <td>{m.email}</td>
                <td>{m.jobTitle || 'N/A'}</td>
                <td>{new Date(m.joinedAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* جدول الدعوات المعلقة */}
      <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Pending Invitations</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Job Title</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invitations.filter(i => i.status === 'PENDING').length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No pending invitations.</td></tr>
          ) : (
            invitations.filter(i => i.status === 'PENDING').map(inv => (
              <tr key={inv.id}>
                <td>{inv.email}</td>
                <td>{inv.jobTitle}</td>
                <td><span style={{ color: '#eab308', fontWeight: 'bold' }}>{inv.status}</span></td>
                <td>
                  <button className={styles.revokeBtn} onClick={() => handleRevoke(inv.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal دعوة موظف */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Invite Employee</h2>
              <X style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleInvite}>
              <div className={styles.formGroup}>
                <label>Employee Email</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="employee@company.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Job Title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required placeholder="e.g. Frontend Developer" />
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}