import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';
import api from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

type Role = 'LEARNER' | 'VENTURE' | 'MENTOR' | 'INVESTOR';

interface DynamicField {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  selectOptionsJson: string | null;
}

export default function Signup() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // حالات خاصة بالدول والهاتف
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState('+963'); 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '', 
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  // جلب مفاتيح الدول من الباك إند
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get('/v1/common/country-prefixes');
        setCountries(res.data.data);
      } catch (error) {
        console.error('Failed to fetch countries, using mock data');
        setCountries([
          { code: 'SY', dialCode: '+963', flag: '🇸🇾' },
          { code: 'SA', dialCode: '+966', flag: '🇸🇦' },
          { code: 'AE', dialCode: '+971', flag: '🇦🇪' },
          { code: 'US', dialCode: '+1', flag: '🇺🇸' },
        ]);
      }
    };
    fetchCountries();
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinueToFields = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/v1/cms/forms/${selectedRole}`);
      const fields = response.data.data;
      
      if (fields.length === 0) {
        handleFinalSubmit(); 
      } else {
        setDynamicFields(fields);
        setStep(3);
      }
    } catch (err: any) {
      setError('Failed to load form fields. Please check your connection or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicChange = (key: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [key]: value }));
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullPhoneNumber = `${selectedPrefix}${formData.phoneNumber}`;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: fullPhoneNumber, 
        role: selectedRole,
        dynamicFields: dynamicValues,
      };

      // 1. إنشاء الحساب
      await api.post('/v1/auth/register', payload);
      
      // 2. طلب إرسال كود الـ OTP للإيميل (عشان يشتغل نظام التحقق)
      try {
        await api.post('/auth/otp/send', {
          identifier: formData.email,
          channel: 'EMAIL',
          purpose: 'REGISTRATION'
        });
      } catch (otpError) {
        console.warn("OTP send failed, but user is registered.", otpError);
      }

      // 3. التوجيه لصفحة الـ OTP مع تمرير الإيميل
      navigate('/verify-otp', { state: { email: formData.email, channel: 'EMAIL' } }); 

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

      {/* ================= الخطوة 1 ================= */}
      {step === 1 && (
        <>
          <div className={styles.header}>
            <h2>Create an account</h2>
            <p>Join VIS and start your journey today</p>
          </div>
          <form onSubmit={handleNext}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" required />
            </div>
            
            {/* حقل الهاتف مع مفتاح الدولة */}
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={selectedPrefix} 
                  onChange={(e) => setSelectedPrefix(e.target.value)}
                  style={{ 
                    width: '120px', 
                    padding: '0.875rem', 
                    borderRadius: '0.75rem', 
                    background: 'var(--input-bg)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border-light)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.dialCode}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleInputChange} 
                  placeholder="123456789" 
                  required 
                  pattern="^[0-9]{7,12}$" 
                  title="Please enter a valid phone number (7 to 12 digits without the prefix)"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder="••••••••" 
                  required 
                  minLength={6} 
                />
                <span 
                  className={styles.togglePassword} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Continue</button>
          </form>
          <div className={styles.footer}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </>
      )}

      {/* ================= الخطوة 2 ================= */}
      {step === 2 && (
        <>
          <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
          <div className={styles.header}>
            <h2>How do you want to start?</h2>
            <p>Select the role that best describes you</p>
          </div>
          
          <div className={styles.rolesGrid}>
            <div className={`${styles.roleCard} ${selectedRole === 'LEARNER' ? styles.selected : ''}`} onClick={() => handleRoleSelect('LEARNER')}>
              <div className={styles.roleIcon}>🎓</div>
              <div className={styles.roleTitle}>Learner</div>
            </div>
            <div className={`${styles.roleCard} ${selectedRole === 'VENTURE' ? styles.selected : ''}`} onClick={() => handleRoleSelect('VENTURE')}>
              <div className={styles.roleIcon}>🚀</div>
              <div className={styles.roleTitle}>Venture</div>
            </div>
            <div className={`${styles.roleCard} ${selectedRole === 'MENTOR' ? styles.selected : ''}`} onClick={() => handleRoleSelect('MENTOR')}>
              <div className={styles.roleIcon}>🧭</div>
              <div className={styles.roleTitle}>Mentor</div>
            </div>
            <div className={`${styles.roleCard} ${selectedRole === 'INVESTOR' ? styles.selected : ''}`} onClick={() => handleRoleSelect('INVESTOR')}>
              <div className={styles.roleIcon}>💼</div>
              <div className={styles.roleTitle}>Investor</div>
            </div>
          </div>

          <button 
            className={styles.submitBtn} 
            disabled={!selectedRole || loading}
            onClick={handleContinueToFields}
            style={{ opacity: selectedRole ? 1 : 0.5, cursor: selectedRole ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Loading fields...' : 'Continue'}
          </button>
        </>
      )}

      {/* ================= الخطوة 3 ================= */}
      {step === 3 && (
        <>
          <button className={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
          <div className={styles.header}>
            <h2>Profile Details</h2>
            <p>Tell us more about your {selectedRole?.toLowerCase()}</p>
          </div>
          
          <form onSubmit={handleFinalSubmit}>
            {dynamicFields.map((field) => {
              const options = field.selectOptionsJson ? JSON.parse(field.selectOptionsJson) : [];

              return (
                <div className={styles.formGroup} key={field.fieldKey}>
                  <label>{field.label} {field.required && '*'}</label>
                  
                  {field.fieldType === 'SELECT' ? (
                    <select 
                      required={field.required}
                      value={dynamicValues[field.fieldKey] || ''}
                      onChange={(e) => handleDynamicChange(field.fieldKey, e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem', 
                        borderRadius: '0.75rem', 
                        background: 'var(--input-bg)',
                        color: 'var(--text-main)',      
                        border: '1px solid var(--border-light)',
                        outline: 'none'
                      }}
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
                      value={dynamicValues[field.fieldKey] || ''}
                      onChange={(e) => handleDynamicChange(field.fieldKey, e.target.value)}
                    />
                  )}
                </div>
              );
            })}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}