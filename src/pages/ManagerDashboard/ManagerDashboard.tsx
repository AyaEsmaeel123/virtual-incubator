import { useState, useEffect } from 'react';
import styles from './ManagerDashboard.module.css';
import api from '../../api/axios';
import { Search } from 'lucide-react'; // أيقونة البحث

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export default function ManagerDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // حالة البحث الجديدة

  const fetchUsers = async () => {
    try {
      const response = await api.get('/management/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // دالة الموافقة
  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.patch(`/management/users/${id}/approve`);
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: 'ACTIVE' } : user
      ));
    } catch (error) {
      alert('Failed to approve user.');
    } finally {
      setActionLoading(null);
    }
  };

  // دالة الإيقاف
  const handleDeactivate = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    
    setActionLoading(id);
    try {
      await api.patch(`/management/users/${id}/deactivate`);
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: 'DEACTIVATED' } : user
      ));
    } catch (error) {
      alert('Failed to deactivate user.');
    } finally {
      setActionLoading(null);
    }
  };

  // فلترة المستخدمين حسب كلمة البحث
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>User Management 👥</h1>
        <p>Review, approve, and manage platform users.</p>
      </div>

      {/* شريط البحث الجديد */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by name, email, or role..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.875rem 1rem 0.875rem 3rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-light)',
            background: 'var(--input-bg)',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* نستخدم filteredUsers بدل users */}
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found matching your search.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td><span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{user.role}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      user.status === 'ACTIVE' ? styles.statusActive : 
                      user.status === 'DEACTIVATED' ? styles.statusDeactivated : 
                      styles.statusPending
                    }`}>
                      {user.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {user.status === 'PENDING_MANAGER_APPROVAL' && (
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          style={{ background: '#22c55e' }}
                        >
                          {actionLoading === user.id ? 'Approving...' : 'Approve'}
                        </button>
                      )}

                      {user.status === 'ACTIVE' && (
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => handleDeactivate(user.id)}
                          disabled={actionLoading === user.id}
                          style={{ background: '#ef4444' }}
                        >
                          {actionLoading === user.id ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      )}

                      {(user.status === 'DEACTIVATED' || user.status === 'PENDING_EMAIL_VERIFICATION') && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No action</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}