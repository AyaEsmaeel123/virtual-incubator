import { useState, useEffect } from 'react';
import styles from './CompanyProfile.module.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface DynamicField {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  selectOptionsJson: string | null;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. جلب البيانات من الباك إند عند فتح الصفحة
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // جلب الحقول الخاصة بالمؤسس
        const fieldsRes = await api.get('/cms/forms/VENTURE');
        setFields(fieldsRes.data.data);

        // جلب بيانات المستخدم الحالية
        const profileRes = await api.get('/user/profile');
        const profileData = profileRes.data.data;
        
        setFirstName(profileData.firstName || '');
        setLastName(profileData.lastName || '');
        
        // تعبئة الحقول الديناميكية إذا كانت موجودة
        if (profileData.submittedFields) {
          setValues(profileData.submittedFields);
        }

      } catch (error) {
        console.error('Error fetching profile', error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // 2. حفظ التعديلات وإرسالها للباك إند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // تجهيز البيانات بالشكل اللي الباك إند يطلبه (FormData)
      const metadata = {
        firstName: firstName,
        lastName: lastName,
        dynamicFields: values
      };

      const formData = new FormData();
      formData.append('metadata', JSON.stringify(metadata));

      await api.put('/user/config', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Company Profile 🏢</h1>
        <p>Manage your startup's public information and pitch details.</p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '0.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          
          {/* حقول الاسم الأساسية */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
              <label>First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
              <label>Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* الحقول الديناميكية من الـ CMS */}
          {fields.map((field) => {
            const options = field.selectOptionsJson ? JSON.parse(field.selectOptionsJson) : [];
            
            return (
              <div className={styles.formGroup} key={field.fieldKey}>
                <label>{field.label} {field.required && '*'}</label>
                
                {field.fieldType === 'SELECT' ? (
                  <select 
                    required={field.required}
                    value={values[field.fieldKey] || ''}
                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'URL' ? 'url' : 'text'}
                    required={field.required}
                    value={values[field.fieldKey] || ''}
                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                  />
                )}
              </div>
            );
          })}

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}