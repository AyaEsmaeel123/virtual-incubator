import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import api from '../../api/axios';
import { Edit2, Power } from 'lucide-react';

interface DynamicField {
  id: number;
  targetRole: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  active: boolean;
}

export default function AdminDashboard() {
  const [selectedRole, setSelectedRole] = useState('VENTURE');
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states للإضافة
  const [formData, setFormData] = useState({
    targetRole: 'VENTURE',
    fieldKey: '',
    label: '',
    fieldType: 'TEXT',
    required: false,
  });

  // جلب الحقول
  const fetchFields = async (role: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/cms/forms/${role}/all`);
      setFields(res.data.data);
    } catch (error) {
      console.error('Error fetching fields', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields(selectedRole);
  }, [selectedRole]);

  // إضافة حقل
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cms/forms', { ...formData, targetRole: selectedRole });
      alert('Field added successfully!');
      setFormData({ ...formData, fieldKey: '', label: '' });
      fetchFields(selectedRole); // تحديث الجدول
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add field');
    }
  };

  // تفعيل/تعطيل حقل
  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/cms/forms/${id}/toggle`);
      fetchFields(selectedRole); // تحديث الجدول
    } catch (error) {
      alert('Failed to toggle field');
    }
  };

  // تعديل حقل (نسخة مبسطة مؤقتاً)
  const handleEdit = async (field: DynamicField) => {
    const newLabel = prompt('Enter new label:', field.label);
    if (newLabel && newLabel !== field.label) {
      try {
        await api.put(`/cms/forms/${field.id}`, { ...field, label: newLabel });
        fetchFields(selectedRole);
      } catch (error) {
        alert('Failed to update field');
      }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Admin CMS - Form Builder 🛠️</h1>

      {/* اختيار الدور */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', color: 'var(--text-main)' }}>Select Role:</label>
        <select 
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}
        >
          <option value="VENTURE">Venture</option>
          <option value="LEARNER">Learner</option>
          <option value="MENTOR">Mentor</option>
          <option value="INVESTOR">Investor</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* جدول الحقول */}
        <div style={{ flex: 2, minWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Existing Fields</h2>
          {loading ? <p>Loading...</p> : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Field Key</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(f => (
                  <tr key={f.id}>
                    <td><code>{f.fieldKey}</code></td>
                    <td>{f.label}</td>
                    <td>{f.fieldType}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem',
                        background: f.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: f.active ? '#22c55e' : '#ef4444'
                      }}>
                        {f.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleToggle(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem', color: f.active ? '#ef4444' : '#22c55e' }}>
                        <Power size={18} />
                      </button>
                      <button onClick={() => handleEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}>
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* فورم إضافة حقل جديد */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className={styles.formWrapper}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Add New Field</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.formGroup}>
                <label>Field Key (English)</label>
                <input type="text" value={formData.fieldKey} onChange={e => setFormData({...formData, fieldKey: e.target.value})} placeholder="e.g. websiteUrl" required />
              </div>
              <div className={styles.formGroup}>
                <label>Field Label</label>
                <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="e.g. Company Website" required />
              </div>
              <div className={styles.formGroup}>
                <label>Field Type</label>
                <select value={formData.fieldType} onChange={e => setFormData({...formData, fieldType: e.target.value})}>
                  <option value="TEXT">Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="URL">URL</option>
                  <option value="SELECT">Select</option>
                </select>
              </div>
              <button type="submit" className={styles.submitBtn}>Add Field</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}