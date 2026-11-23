import { useState, useEffect, ChangeEvent } from 'react';
import { getHomeLayout, updateHomeLayout, getFooterData, updateFooterData, uploadImage } from '../api/cmsApi';
import { Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import styles from './CMSManager.module.css';

export default function CMSManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [activeTab, setActiveTab] = useState('hero');
  const [layout, setLayout] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const layoutData = await getHomeLayout('en');
        const footerData = await getFooterData('en');
        setLayout(layoutData);
        setFooter(footerData);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to load CMS data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // دالة مساعدة للوصول للموديول وتعديله
  const getModule = (type: string) => layout?.modules?.find((m: any) => m.type === type)?.content;
  
  const updateModuleContent = (type: string, newContent: any) => {
    setLayout((prev: any) => {
      const updatedModules = prev.modules.map((m: any) => {
        if (m.type === type) return { ...m, content: newContent };
        return m;
      });
      return { ...prev, modules: updatedModules };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateHomeLayout(layout);
      await updateFooterData(footer);
      setMessage({ type: 'success', text: 'All CMS content updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update CMS.' });
    } finally {
      setSaving(false);
    }
  };

  // مكون رفع الصور (يستخدم في كل مكان)
  const ImageUploader = ({ currentUrl, onUpload }: { currentUrl: string, onUpload: (url: string) => void }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setIsUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        onUpload(url);
      } catch (error) {
        alert("فشل رفع الصورة، تأكد من إعدادات الباك إند.");
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className={styles.imageUploader}>
        {currentUrl && <img src={currentUrl} alt="Preview" className={styles.imagePreview} />}
        <label className={styles.uploadBtn}>
          {isUploading ? 'Uploading...' : <><Upload size={16} /> Change Image</>}
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        <input type="text" value={currentUrl || ''} onChange={(e) => onUpload(e.target.value)} placeholder="Or enter image URL..." className={styles.urlInput} />
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading CMS Data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>CMS - Landing Page Manager</h1>
      </div>

      {message.text && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

      <div className={styles.tabs}>
        {['hero', 'quick_links', 'services', 'why_vis', 'stats', 'team', 'partners', 'footer'].map(tab => (
          <button 
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className={styles.formContent}>
        
        {/* 1. HERO SECTION */}
        {activeTab === 'hero' && (
          <div>
            {getModule('hero_slider')?.slides?.map((slide: any, index: number) => (
              <div key={index} className={styles.card}>
                <h3>Hero Slide {index + 1}</h3>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input type="text" value={slide.title} onChange={(e) => {
                    const newSlides = [...getModule('hero_slider').slides];
                    newSlides[index].title = e.target.value;
                    updateModuleContent('hero_slider', { ...getModule('hero_slider'), slides: newSlides });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Subtitle</label>
                  <textarea rows={2} value={slide.subtitle} onChange={(e) => {
                    const newSlides = [...getModule('hero_slider').slides];
                    newSlides[index].subtitle = e.target.value;
                    updateModuleContent('hero_slider', { ...getModule('hero_slider'), slides: newSlides });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Background Image</label>
                  <ImageUploader 
                    currentUrl={slide.bg_image} 
                    onUpload={(url) => {
                      const newSlides = [...getModule('hero_slider').slides];
                      newSlides[index].bg_image = url;
                      updateModuleContent('hero_slider', { ...getModule('hero_slider'), slides: newSlides });
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. QUICK LINKS */}
        {activeTab === 'quick_links' && (
          <div>
             <div className={styles.formGroup}>
                <label>Section Title</label>
                <input type="text" value={getModule('quick_links')?.title} onChange={(e) => updateModuleContent('quick_links', { ...getModule('quick_links'), title: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Section Subtitle</label>
                <textarea rows={2} value={getModule('quick_links')?.subtitle} onChange={(e) => updateModuleContent('quick_links', { ...getModule('quick_links'), subtitle: e.target.value })} />
              </div>
            {getModule('quick_links')?.links?.map((link: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Link {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newLinks = getModule('quick_links').links.filter((_: any, i: number) => i !== index);
                    updateModuleContent('quick_links', { ...getModule('quick_links'), links: newLinks });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Label</label>
                    <input type="text" value={link.label} onChange={(e) => {
                      const newLinks = [...getModule('quick_links').links];
                      newLinks[index].label = e.target.value;
                      updateModuleContent('quick_links', { ...getModule('quick_links'), links: newLinks });
                    }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Color (Hex)</label>
                    <input type="color" value={link.color} onChange={(e) => {
                      const newLinks = [...getModule('quick_links').links];
                      newLinks[index].color = e.target.value;
                      updateModuleContent('quick_links', { ...getModule('quick_links'), links: newLinks });
                    }} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea rows={2} value={link.description} onChange={(e) => {
                    const newLinks = [...getModule('quick_links').links];
                    newLinks[index].description = e.target.value;
                    updateModuleContent('quick_links', { ...getModule('quick_links'), links: newLinks });
                  }} />
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => {
              const newLinks = [...(getModule('quick_links')?.links || []), { label: '', description: '', color: '#0ea5e9', icon: 'book', url: '' }];
              updateModuleContent('quick_links', { ...getModule('quick_links'), links: newLinks });
            }}><Plus size={18} /> Add New Link</button>
          </div>
        )}

        {/* 3. SERVICES */}
        {activeTab === 'services' && (
          <div>
            {getModule('our_services')?.services?.map((service: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Service {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newServices = getModule('our_services').services.filter((_: any, i: number) => i !== index);
                    updateModuleContent('our_services', { services: newServices });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input type="text" value={service.title} onChange={(e) => {
                    const newServices = [...getModule('our_services').services];
                    newServices[index].title = e.target.value;
                    updateModuleContent('our_services', { services: newServices });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Summary</label>
                  <textarea rows={2} value={service.summary} onChange={(e) => {
                    const newServices = [...getModule('our_services').services];
                    newServices[index].summary = e.target.value;
                    updateModuleContent('our_services', { services: newServices });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Icon Image</label>
                  <ImageUploader 
                    currentUrl={service.icon} 
                    onUpload={(url) => {
                      const newServices = [...getModule('our_services').services];
                      newServices[index].icon = url;
                      updateModuleContent('our_services', { services: newServices });
                    }} 
                  />
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => {
              const newServices = [...(getModule('our_services')?.services || []), { title: 'New Service', summary: '', icon: '', details_url: '' }];
              updateModuleContent('our_services', { services: newServices });
            }}><Plus size={18} /> Add New Service</button>
          </div>
        )}

        {/* 4. WHY VIS */}
        {activeTab === 'why_vis' && (
          <div>
             <div className={styles.formGroup}>
                <label>Section Title</label>
                <input type="text" value={getModule('why_vis_interactive')?.section_title || ''} onChange={(e) => updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), section_title: e.target.value })} />
              </div>
            {getModule('why_vis_interactive')?.bullets?.map((bullet: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Bullet Point {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newBullets = getModule('why_vis_interactive').bullets.filter((_: any, i: number) => i !== index);
                    updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), bullets: newBullets });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input type="text" value={bullet.title} onChange={(e) => {
                    const newBullets = [...getModule('why_vis_interactive').bullets];
                    newBullets[index].title = e.target.value;
                    updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), bullets: newBullets });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea rows={2} value={bullet.description} onChange={(e) => {
                    const newBullets = [...getModule('why_vis_interactive').bullets];
                    newBullets[index].description = e.target.value;
                    updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), bullets: newBullets });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Image</label>
                  <ImageUploader 
                    currentUrl={bullet.image} 
                    onUpload={(url) => {
                      const newBullets = [...getModule('why_vis_interactive').bullets];
                      newBullets[index].image = url;
                      updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), bullets: newBullets });
                    }} 
                  />
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => {
              const newBullets = [...(getModule('why_vis_interactive')?.bullets || []), { title: 'New Bullet', description: '', image: '' }];
              updateModuleContent('why_vis_interactive', { ...getModule('why_vis_interactive'), bullets: newBullets });
            }}><Plus size={18} /> Add Bullet</button>
          </div>
        )}

        {/* 5. STATS */}
        {activeTab === 'stats' && (
          <div>
            <div className={styles.grid2}>
            {getModule('statistics')?.items?.map((stat: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Stat {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newItems = getModule('statistics').items.filter((_: any, i: number) => i !== index);
                    updateModuleContent('statistics', { items: newItems });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.formGroup}>
                  <label>Value (e.g. 95%)</label>
                  <input type="text" value={stat.value} onChange={(e) => {
                    const newItems = [...getModule('statistics').items];
                    newItems[index].value = e.target.value;
                    updateModuleContent('statistics', { items: newItems });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Label</label>
                  <input type="text" value={stat.label} onChange={(e) => {
                    const newItems = [...getModule('statistics').items];
                    newItems[index].label = e.target.value;
                    updateModuleContent('statistics', { items: newItems });
                  }} />
                </div>
              </div>
            ))}
            </div>
            <button type="button" className={styles.addBtn} onClick={() => {
              const newItems = [...(getModule('statistics')?.items || []), { value: '', label: '' }];
              updateModuleContent('statistics', { items: newItems });
            }}><Plus size={18} /> Add Stat</button>
          </div>
        )}

        {/* 6. TEAM */}
        {activeTab === 'team' && (
          <div>
            <div className={styles.formGroup}>
              <label>Section Title</label>
              <input type="text" value={getModule('team_members')?.section_title || ''} onChange={(e) => updateModuleContent('team_members', { ...getModule('team_members'), section_title: e.target.value })} />
            </div>
            {getModule('team_members')?.members?.map((member: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Member {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newMembers = getModule('team_members').members.filter((_: any, i: number) => i !== index);
                    updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Name</label>
                    <input type="text" value={member.name} onChange={(e) => {
                      const newMembers = [...getModule('team_members').members];
                      newMembers[index].name = e.target.value;
                      updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
                    }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <input type="text" value={member.role} onChange={(e) => {
                      const newMembers = [...getModule('team_members').members];
                      newMembers[index].role = e.target.value;
                      updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
                    }} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Info (Bio)</label>
                  <textarea rows={2} value={member.info} onChange={(e) => {
                    const newMembers = [...getModule('team_members').members];
                    newMembers[index].info = e.target.value;
                    updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Image</label>
                  <ImageUploader 
                    currentUrl={member.image} 
                    onUpload={(url) => {
                      const newMembers = [...getModule('team_members').members];
                      newMembers[index].image = url;
                      updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
                    }} 
                  />
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => {
              const newMembers = [...(getModule('team_members')?.members || []), { name: '', role: '', info: '', image: '' }];
              updateModuleContent('team_members', { ...getModule('team_members'), members: newMembers });
            }}><Plus size={18} /> Add Team Member</button>
          </div>
        )}

        {/* 7. PARTNERS */}
        {activeTab === 'partners' && (
          <div>
             <div className={styles.formGroup}>
                <label>Section Title</label>
                <input type="text" value={getModule('strategic_partners_tech_stack')?.section_title || ''} onChange={(e) => updateModuleContent('strategic_partners_tech_stack', { ...getModule('strategic_partners_tech_stack'), section_title: e.target.value })} />
              </div>
            {getModule('strategic_partners_tech_stack')?.partners?.map((partner: any, index: number) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Partner {index + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => {
                    const newPartners = getModule('strategic_partners_tech_stack').partners.filter((_: any, i: number) => i !== index);
                    updateModuleContent('strategic_partners_tech_stack', { ...getModule('strategic_partners_tech_stack'), partners: newPartners });
                  }}><Trash2 size={18} /></button>
                </div>
                <div className={styles.formGroup}>
                  <label>Partner Name</label>
                  <input type="text" value={partner.name} onChange={(e) => {
                    const newPartners = [...getModule('strategic_partners_tech_stack').partners];
                    newPartners[index].name = e.target.value;
                    updateModuleContent('strategic_partners_tech_stack', { ...getModule('strategic_partners_tech_stack'), partners: newPartners });
                  }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Website URL</label>
                  <input type="text" value={partner.website_url} onChange={(e) => {
                    const newPartners = [...getModule('strategic_partners_tech_stack').partners];
                    newPartners[index].website_url = e.target.value;
                    updateModuleContent('strategic_partners_tech_stack', { ...getModule('strategic_partners_tech_stack'), partners: newPartners });
                  }} />
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => {
              const newPartners = [...(getModule('strategic_partners_tech_stack')?.partners || []), { name: '', website_url: '', logo_url: '', category: 'ECOSYSTEM_PARTNER' }];
              updateModuleContent('strategic_partners_tech_stack', { ...getModule('strategic_partners_tech_stack'), partners: newPartners });
            }}><Plus size={18} /> Add Partner</button>
          </div>
        )}

        {/* 8. FOOTER */}
        {activeTab === 'footer' && (
          <div>
            <div className={styles.formGroup}>
              <label>Company Brief (Footer text)</label>
              <textarea rows={3} value={footer?.company_brief || ''} onChange={e => setFooter({...footer, company_brief: e.target.value})} />
            </div>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input type="email" value={footer?.contact_us?.email || ''} onChange={e => setFooter({...footer, contact_us: {...footer.contact_us, email: e.target.value}})} />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Phone</label>
                <input type="text" value={footer?.contact_us?.phone || ''} onChange={e => setFooter({...footer, contact_us: {...footer.contact_us, phone: e.target.value}})} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Copyright Text</label>
              <input type="text" value={footer?.copyright_text || ''} onChange={e => setFooter({...footer, copyright_text: e.target.value})} />
            </div>
          </div>
        )}

        {/* زر الحفظ */}
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          <Save size={20} /> {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </form>
    </div>
  );
}