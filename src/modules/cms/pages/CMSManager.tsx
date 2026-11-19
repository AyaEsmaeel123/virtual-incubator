import { useState, useEffect } from 'react';
import { getHomeLayout, updateHomeLayout, getFooterData, updateFooterData } from '../api/cmsApi';
import { Save } from 'lucide-react';
import styles from './CMSManager.module.css';

export default function CMSManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [activeTab, setActiveTab] = useState('hero');
  const [originalLayout, setOriginalLayout] = useState<any>(null);
  const [originalFooter, setOriginalFooter] = useState<any>(null);

  // States for forms
  const [hero, setHero] = useState({ title: '', subtitle: '' });
  const [services, setServices] = useState<any[]>([]);
  const [ad, setAd] = useState({ headline: '', description: '' });
  const [mentor, setMentor] = useState({ title: '', description: '', image_url: '' }); // حالة جديدة للمرشد
  const [footer, setFooter] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const layoutData = await getHomeLayout('en');
        const footerData = await getFooterData('en');
        
        setOriginalLayout(layoutData);
        setOriginalFooter(footerData);

        // استخراج البيانات الحالية وتعبئتها
        setHero(layoutData.modules.find((m: any) => m.type === 'hero_slider')?.content?.slides[0] || { title: '', subtitle: '' });
        setServices(layoutData.modules.find((m: any) => m.type === 'our_services')?.content?.services || []);
        setAd(layoutData.modules.find((m: any) => m.type === 'inaugural_cohort_countdown')?.content || { headline: '', description: '' });
        setFooter(footerData);

        // استخراج بيانات المرشد من موديول الأدوار
        const rolesModule = layoutData.modules.find((m: any) => m.type === 'user_roles_showcase');
        if (rolesModule && rolesModule.content.roles) {
          const mentorData = rolesModule.content.roles.find((r: any) => r.role_key === 'MENTOR');
          if (mentorData) setMentor(mentorData);
        }

      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to load CMS data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedModules = originalLayout.modules.map((m: any) => {
        if (m.type === 'hero_slider') m.content.slides[0] = { ...m.content.slides[0], ...hero };
        if (m.type === 'our_services') m.content.services = services;
        if (m.type === 'inaugural_cohort_countdown') m.content = { ...m.content, ...ad };
        
        // تحديث بيانات المرشد داخل موديول الأدوار
        if (m.type === 'user_roles_showcase' && m.content.roles) {
          m.content.roles = m.content.roles.map((r: any) => 
            r.role_key === 'MENTOR' ? { ...r, ...mentor } : r
          );
        }
        return m;
      });

      await updateHomeLayout({ ...originalLayout, modules: updatedModules });
      await updateFooterData(footer);

      setMessage({ type: 'success', text: 'All CMS content updated successfully!' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update CMS.' });
    } finally {
      setSaving(false);
    }
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading CMS Data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>CMS - Landing Page Manager</h1>
      </div>

      {message.text && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${activeTab === 'hero' ? styles.active : ''}`} onClick={() => setActiveTab('hero')}>Hero Section</button>
        <button className={`${styles.tabBtn} ${activeTab === 'services' ? styles.active : ''}`} onClick={() => setActiveTab('services')}>Services</button>
        <button className={`${styles.tabBtn} ${activeTab === 'ad' ? styles.active : ''}`} onClick={() => setActiveTab('ad')}>Ad Banner</button>
        <button className={`${styles.tabBtn} ${activeTab === 'mentor' ? styles.active : ''}`} onClick={() => setActiveTab('mentor')}>Mentor Section</button>
        <button className={`${styles.tabBtn} ${activeTab === 'footer' ? styles.active : ''}`} onClick={() => setActiveTab('footer')}>Footer</button>
      </div>

      <form onSubmit={handleSave}>
        {/* Tab 1: Hero */}
        {activeTab === 'hero' && (
          <div>
            <div className={styles.formGroup}>
              <label>Main Title (Hero)</label>
              <input type="text" value={hero.title} onChange={e => setHero({...hero, title: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Subtitle (Hero)</label>
              <textarea rows={3} value={hero.subtitle} onChange={e => setHero({...hero, subtitle: e.target.value})} />
            </div>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeTab === 'services' && (
          <div>
            {services.map((service, index) => (
              <div key={index} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Service {index + 1}</h3>
                <div className={styles.formGroup}>
                  <label>Service Title</label>
                  <input type="text" value={service.title} onChange={e => handleServiceChange(index, 'title', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Service Summary</label>
                  <textarea rows={2} value={service.summary} onChange={e => handleServiceChange(index, 'summary', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Ad Banner */}
        {activeTab === 'ad' && (
          <div>
            <div className={styles.formGroup}>
              <label>Ad Headline</label>
              <input type="text" value={ad.headline} onChange={e => setAd({...ad, headline: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Ad Description</label>
              <textarea rows={3} value={ad.description} onChange={e => setAd({...ad, description: e.target.value})} />
            </div>
          </div>
        )}

        {/* Tab 4: Mentor Showcase */}
        {activeTab === 'mentor' && (
          <div>
            <div className={styles.formGroup}>
              <label>Mentor Section Title</label>
              <input type="text" value={mentor.title} onChange={e => setMentor({...mentor, title: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Mentor Description</label>
              <textarea rows={3} value={mentor.description} onChange={e => setMentor({...mentor, description: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Mentor Image URL (e.g., /uploads/mentor.png)</label>
              <input type="text" value={mentor.image_url} onChange={e => setMentor({...mentor, image_url: e.target.value})} />
            </div>
          </div>
        )}

        {/* Tab 5: Footer */}
        {activeTab === 'footer' && (
          <div>
            <div className={styles.formGroup}>
              <label>Company Brief (Footer text)</label>
              <textarea rows={3} value={footer.company_brief || ''} onChange={e => setFooter({...footer, company_brief: e.target.value})} />
            </div>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input type="email" value={footer.contact_us?.email || ''} onChange={e => setFooter({...footer, contact_us: {...footer.contact_us, email: e.target.value}})} />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Phone</label>
                <input type="text" value={footer.contact_us?.phone || ''} onChange={e => setFooter({...footer, contact_us: {...footer.contact_us, phone: e.target.value}})} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Copyright Text</label>
              <input type="text" value={footer.copyright_text || ''} onChange={e => setFooter({...footer, copyright_text: e.target.value})} />
            </div>
          </div>
        )}

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          <Save size={20} /> {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}