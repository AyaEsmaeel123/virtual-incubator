import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Target, ArrowRight, Sparkles, Sun, Moon, Globe, Share2, MessageCircle, Mail, Phone, MapPin, Briefcase, BarChart3, TrendingUp } from 'lucide-react';
import styles from './LandingPage.module.css';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'rocket': return <Rocket size={32} />;
    case 'globe': return <Globe size={32} />;
    case 'chart': return <BarChart3 size={32} />;
    case 'target': return <Target size={32} />;
    case 'trend': return <TrendingUp size={32} />;
    default: return <Sparkles size={32} />;
  }
};

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'linkedin': return <Briefcase size={18} />; 
    case 'x': return <Share2 size={18} />;
    case 'whatsapp': return <MessageCircle size={18} />;
    default: return <Globe size={18} />;
  }
};

const fixImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('/uploads/seed/', '/uploads/');
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [cmsData, setCmsData] = useState<any>(null);
  const [footerData, setFooterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); 
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeImage, setActiveImage] = useState('');

  const storiesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const [isStoriesVisible, setIsStoriesVisible] = useState(false);
  const [isTeamVisible, setIsTeamVisible] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const cmsRes = await api.get('/cms/home', { headers: { 'Accept-Language': lang } });
        setCmsData(cmsRes.data.data);

        const footerRes = await api.get('/cms/footer', { headers: { 'Accept-Language': lang } });
        setFooterData(footerRes.data.data);

        const interactive = cmsRes.data.data.modules.find((m: any) => m.type === 'why_vis_interactive');
        if (interactive && interactive.content.bullets.length > 0) {
          setActiveImage(interactive.content.bullets[0].image);
        }
      } catch (error: any) {
        setErrorMsg('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [lang]);

  useEffect(() => {
    if (!cmsData) return;
    const hero = cmsData.modules.find((m: any) => m.type === 'hero_slider')?.content?.slides[0];
    if (!hero || !hero.bg_images) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hero.bg_images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [cmsData]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === storiesRef.current && entry.isIntersecting) setIsStoriesVisible(true);
        if (entry.target === teamRef.current && entry.isIntersecting) setIsTeamVisible(true);
      });
    }, { threshold: 0.15 });

    if (storiesRef.current) observer.observe(storiesRef.current);
    if (teamRef.current) observer.observe(teamRef.current);

    return () => observer.disconnect();
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
    document.documentElement.dir = lang === 'en' ? 'rtl' : 'ltr';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh', color: 'var(--text-main)' }}>Loading...</div>;
  if (errorMsg || !cmsData || !footerData) return <div style={{ textAlign: 'center', marginTop: '20vh', color: '#ef4444' }}>{errorMsg}</div>;

  const heroModule = cmsData.modules.find((m: any) => m.type === 'hero_slider')?.content?.slides[0];
  const successStories = cmsData.modules.find((m: any) => m.type === 'success_stories')?.content?.stories;
  const stats = cmsData.modules.find((m: any) => m.type === 'statistics')?.content?.items;
  const cubes = cmsData.modules.find((m: any) => m.type === 'why_vis_cubes')?.content?.cubes;
  const interactive = cmsData.modules.find((m: any) => m.type === 'why_vis_interactive')?.content?.bullets;
  const teamMembers = cmsData.modules.find((m: any) => m.type === 'team_members')?.content?.members;
  const partnersData = cmsData.modules.find((m: any) => m.type === 'strategic_partners_tech_stack')?.content;

  return (
    <div className={styles.pageWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>VIS.</div>
        <div className={styles.navActions}>
          <button onClick={toggleLanguage} className={styles.iconBtn}><Globe size={22} /> <span>{lang === 'en' ? 'AR' : 'EN'}</span></button>
          <button onClick={toggleTheme} className={styles.iconBtn}>{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
          <button onClick={() => navigate('/login')} className={styles.btnGhost}>{lang === 'en' ? 'Log In' : 'تسجيل دخول'}</button>
          <button onClick={() => navigate('/signup')} className={styles.btnPrimary}>{lang === 'en' ? 'Get Started' : 'ابدأ الآن'}</button>
        </div>
      </nav>

      <header className={styles.hero}>
        {heroModule?.bg_images?.map((img: string, i: number) => (
          <div key={i} className={`${styles.heroBg} ${i === currentSlide ? styles.activeBg : ''}`} style={{ backgroundImage: `url(${img})` }}></div>
        ))}
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.badge}><Sparkles size={16} /> {lang === 'en' ? 'The Premier Virtual Incubator' : 'الحاضنة الافتراضية الأولى'}</div>
            <h1>{heroModule?.title}</h1>
            <p>{heroModule?.subtitle}</p>
            <button onClick={() => navigate(heroModule?.cta_link || '/signup')} className={styles.btnLarge}>
              {lang === 'en' ? 'Start Your Journey' : 'ابدأ رحلتك'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </header>

      <section className={styles.successStories} ref={storiesRef}>
        <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Success Stories' : 'قصص النجاح'}</h2>
        <div className={styles.swiperWrapper}>
          {successStories?.map((story: any, i: number) => (
            <div key={i} className={`${styles.storyCard} ${isStoriesVisible ? styles.showCard : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className={styles.storyIcon}>{getIcon(story.icon)}</div>
              <h3>{story.title}</h3>
              <p>{story.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats?.map((stat: any, i: number) => (
            <div key={i} className={styles.statItem}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cubesSection}>
        <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Everything You Need to Succeed' : 'كل ما تحتاجه للنجاح'}</h2>
        <div className={styles.cubesGrid}>
          {cubes?.map((cube: any, i: number) => (
            <div key={i} className={styles.flipbox}>
              <div className={styles.flipboxInner}>
                <div className={`${styles.flipboxFront} ${styles.flipboxFace}`}>
                  <h3>{cube.frontTitle}</h3>
                  <ArrowRight size={24} style={{ marginTop: '1rem', color: 'var(--accent-primary)' }} />
                </div>
                <div className={`${styles.flipboxBack} ${styles.flipboxFace}`}>
                  <h4>{cube.backTitle}</h4>
                  <p>{cube.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.interactiveSection}>
        <div className={styles.interactiveContainer}>
          <div className={styles.interactiveList}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>{lang === 'en' ? 'Why VIS?' : 'لماذا VIS؟'}</h2>
            {interactive?.map((item: any, i: number) => (
              <div key={i} className={`${styles.bulletItem} ${activeImage === item.image ? styles.activeBullet : ''}`} onMouseEnter={() => setActiveImage(item.image)}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.interactiveImageWrapper}>
            <img src={activeImage} alt="Interactive" className={styles.interactiveImage} />
          </div>
        </div>
      </section>

      {teamMembers && (
        <section className={styles.teamSection} ref={teamRef}>
          <div className={styles.teamTitleWrapper}>
            <h2 className={`${styles.teamTitleLeft} ${isTeamVisible ? styles.slideLeft : ''}`}>{lang === 'en' ? 'Meet Our' : 'تعرف على'}</h2>
            <h2 className={`${styles.teamTitleRight} ${isTeamVisible ? styles.slideRight : ''}`}>{lang === 'en' ? 'Team' : 'فريقنا'}</h2>
          </div>
          <div className={styles.teamGrid}>
            {teamMembers.map((member: any, i: number) => (
              <div key={i} className={styles.teamMember}>
                <div className={styles.teamImageWrapper}>
                  <img src={member.image} alt={member.name} className={styles.teamImage} />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {partnersData && (
        <section className={styles.partnersSection}>
          <div className={styles.partnersHeader}>
            <h2>{partnersData.section_title}</h2>
            <p>{partnersData.subtitle}</p>
          </div>
          <div className={styles.partnersGrid}>
            {partnersData.partners.map((partner: any, i: number) => (
              <a key={i} href={partner.website_url} target="_blank" rel="noreferrer" className={styles.partnerCard}>
                <img src={fixImageUrl(partner.logo_url)} alt={partner.name} className={styles.partnerLogo} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.add(styles.showText); }} />
                <span className={styles.fallbackText}>{partner.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ==================== الفوتر (مطابق للصورة) ==================== */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          {/* اللوجو */}
          <div className={styles.footerLogo}>VIS.</div>
          
          {/* الوصف (مركز) */}
          <div className={styles.footerTagline}>{footerData.company_brief}</div>
          
          {/* الروابط والسوشيال (يمين) */}
          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              {footerData.support_links.map((link: any, i: number) => (
                <Fragment key={i}>
                  <a href={link.url}>{link.label}</a>
                  {i < footerData.support_links.length - 1 && <span className={styles.divider}>|</span>}
                </Fragment>
              ))}
            </div>
            <div className={styles.footerSocials}>
              {footerData.contact_us.social_links.map((social: any, i: number) => (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles[social.platform.toLowerCase()] || styles.socialDefault}`}>
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* الشريط الأسود */}
        <div className={styles.footerBottom}>
          <p>{footerData.copyright_text}</p>
        </div>
      </footer>
    </div>
  );
}