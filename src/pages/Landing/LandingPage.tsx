import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sun, Moon, Globe, Share2, MessageCircle, Briefcase, ArrowRight, BookOpen, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import styles from './LandingPage.module.css';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

// صورة افتراضية في حال فشل تحميل أي صورة
const FALLBACK_IMG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop";
const FALLBACK_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'book': return <BookOpen size={28} />;
    case 'calendar': return <Calendar size={28} />;
    case 'users': return <Users size={28} />;
    case 'message-circle': return <MessageCircle size={28} />;
    case 'dollar-sign': return <DollarSign size={28} />;
    case 'trending-up': return <TrendingUp size={28} />;
    default: return <Rocket size={28} />;
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

// تحسين دالة مسار الصور
const fixImageUrl = (url: string) => {
  if (!url) return FALLBACK_IMG; // إرجاع صورة افتراضية إذا كان الرابط فارغ
  if (url.startsWith('http')) return url; // إذا كان رابط كامل (مثل Unsplash)
  return url.replace('/uploads/seed/', '/uploads/');
};

const AnimatedSplitTitle = ({
  text,
  className,
  style,
  as: Tag = 'h2',
  lang = 'en'
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h2' | 'p';
  lang?: 'en' | 'ar';
}) => {
  const ref = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // قللنا النسبة عشان تظهر أسرع
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const words = text ? text.trim().split(/\s+/) : [];
  const mid = Math.ceil(words.length / 2);
  const firstPart = words.slice(0, mid).join(' ');
  const secondPart = words.slice(mid).join(' ');

  return (
    <Tag
      ref={ref}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${className || ''} ${styles.splitTitleContainer}`}
      style={style}
    >
      <span className={`${styles.splitFirst} ${isVisible ? styles.splitVisible : ''}`}>
        {firstPart}
      </span>
      {secondPart && (
        <span className={`${styles.splitSecond} ${isVisible ? styles.splitVisible : ''}`}>
          {secondPart}
        </span>
      )}
    </Tag>
  );
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
  const [activeBullet, setActiveBullet] = useState(0);

  const quickLinksRef = useRef<HTMLDivElement>(null);
  const [isQuickLinksVisible, setIsQuickLinksVisible] = useState(false);

  const partnersGridRef = useRef<HTMLDivElement>(null);
  const [isPartnersVisible, setIsPartnersVisible] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const cmsRes = await api.get('/cms/home', { headers: { 'Accept-Language': lang } });
        setCmsData(cmsRes.data.data);
        const footerRes = await api.get('/cms/footer', { headers: { 'Accept-Language': lang } });
        setFooterData(footerRes.data.data);
      } catch (error: any) {
        setErrorMsg('Failed to load data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [lang]);

  const getModule = (type: string) => cmsData?.modules.find((m: any) => m.type === type)?.content;
  
  // تأمين السلايدر عشان ما يعلق إذا البيانات لسا ما وصلت
  const heroSlides = (getModule('hero_slider')?.slides || []).map((s: any) => ({
    ...s,
    bg_image: fixImageUrl(s.bg_image)
  }));

  // تصفير السلايدر إذا تغيرت اللغة أو البيانات
  useEffect(() => {
    setCurrentSlide(0);
  }, [lang, cmsData]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        // حماية عشان ما يطلع عن النطاق
        if (prev >= heroSlides.length - 1) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // تأخير الـ Observer شوي عشان يلحق يلاقي العناصر
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      const observerQL = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setIsQuickLinksVisible(true); observerQL.disconnect(); }
      }, { threshold: 0.05 });
      if (quickLinksRef.current) observerQL.observe(quickLinksRef.current);

      const observerPartners = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setIsPartnersVisible(true); observerPartners.disconnect(); }
      }, { threshold: 0.2 });
      if (partnersGridRef.current) observerPartners.observe(partnersGridRef.current);
      
      return () => { observerQL.disconnect(); observerPartners.disconnect(); };
    }, 300); // انتظار 300ms

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <div className={styles.centerScreen}>Loading...</div>;
  if (errorMsg || !cmsData || !footerData) return <div className={styles.centerScreenError}>{errorMsg || 'No data available'}</div>;

  const quickLinksData = getModule('quick_links');
  const services = getModule('our_services')?.services || [];
  const whyVisData = getModule('why_vis_interactive'); 
  const statsData = getModule('statistics')?.items;
  const teamData = getModule('team_members');
  const partnersData = getModule('strategic_partners_tech_stack');

  return (
    <div className={styles.pageWrapper}>
      
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>VIS.</div>
        <div className={styles.navActions}>
          <button onClick={() => setLang(prev => prev === 'en' ? 'ar' : 'en')} className={styles.iconBtn}>
            <Globe size={22} /> <span>{lang === 'en' ? 'AR' : 'EN'}</span>
          </button>
          <button onClick={toggleTheme} className={styles.iconBtn}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button onClick={() => navigate('/login')} className={styles.btnGhost}>{lang === 'en' ? 'Log In' : 'تسجيل دخول'}</button>
          <button onClick={() => navigate('/signup')} className={styles.btnPrimary}>{lang === 'en' ? 'Get Started' : 'ابدأ الآن'}</button>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <header className={styles.hero}>
        {heroSlides.map((slide: any, i: number) => (
          <div 
            key={`hero-${i}`} 
            className={`${styles.heroBg} ${i === currentSlide ? styles.activeBg : ''}`} 
            style={{ backgroundImage: `url(${slide.bg_image})` }}
          ></div>
        ))}
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.badge}><Rocket size={16} /> {lang === 'en' ? 'The Premier Virtual Incubator' : 'الحاضنة الافتراضية الأولى'}</div>
            <h1>{heroSlides[currentSlide]?.title || "Build, Scale, and Succeed"}</h1>
            <p>{heroSlides[currentSlide]?.subtitle || "The ultimate virtual ecosystem."}</p>
            <button onClick={() => navigate(heroSlides[currentSlide]?.cta_link || '/signup')} className={styles.btnLarge}>
              {lang === 'en' ? 'Start Your Journey' : 'ابدأ رحلتك'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
        {heroSlides.length > 1 && (
          <div className={styles.heroDots}>
            {heroSlides.map((_: any, i: number) => (
              <button key={`dot-${i}`} className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ''}`} onClick={() => setCurrentSlide(i)} />
            ))}
          </div>
        )}
      </header>

      {/* QUICK LINKS */}
      <section className={styles.quickLinksSection} ref={quickLinksRef}>
        <div className={styles.sectionHeadingBlock}>
          <AnimatedSplitTitle
            lang={lang}
            text={quickLinksData?.title || "Everything You Need to Succeed"}
            className={styles.sectionTitle}
          />
          <AnimatedSplitTitle
            as="p"
            lang={lang}
            text={quickLinksData?.subtitle || ""}
            className={styles.sectionSubtitleSplit}
          />
        </div>
        <div className={styles.quickLinksGrid}>
          {quickLinksData?.links?.map((link: any, i: number) => (
            <a key={`link-${i}`} href={link.url} className={`${styles.quickLinkCard} ${isQuickLinksVisible ? styles.showCard : ''}`} style={{ '--delay': `${i * 0.18}s` } as React.CSSProperties}>
              <div className={styles.quickLinkIconWrapper} style={{ backgroundColor: link.color || '#0ea5e9', color: link.color || '#0ea5e9' }}>{getIcon(link.icon)}</div>
              <h3>{link.label}</h3>
              <p>{link.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className={styles.servicesSection}>
        <div className={styles.sectionHeadingBlock}>
          <AnimatedSplitTitle
            lang={lang}
            text={lang === 'en' ? 'Our Services' : 'خدماتنا'}
            className={styles.sectionTitle}
          />
        </div>
        <div className={styles.servicesGrid}>
          {/* تأكدنا هنا إنه بيعرض 4 عناصر بس، وإذا كان في أقل راح يعرضهم كلهم */}
          {services.slice(0, 4).map((service: any, i: number) => (
            <div key={`service-${i}`} className={styles.cubeContainer} onClick={(e) => e.currentTarget.classList.toggle(styles.flipped)}>
              <div className={styles.cubeInner}>
                <div className={`${styles.cubeFace} ${styles.cubeFront}`}>
                  <img 
                    src={fixImageUrl(service.icon)} 
                    alt={service.title} 
                    className={styles.serviceIconImg} 
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} // حماية الصورة
                  />
                  <h3>{service.title}</h3>
                  <div className={styles.flipHint}><ArrowRight size={18} /></div>
                </div>
                <div className={`${styles.cubeFace} ${styles.cubeBack}`}>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                  <a href={service.details_url} className={styles.serviceLink} onClick={(e) => e.stopPropagation()}>
                    {lang === 'en' ? 'Learn More' : 'اقرأ المزيد'} <ArrowRight size={16} />
                  </a>
                </div>
                <div className={`${styles.cubeFace} ${styles.cubeRight}`} />
                <div className={`${styles.cubeFace} ${styles.cubeLeft}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY VIS */}
      {whyVisData && (
        <section className={styles.whyVisSection}>
          <div className={styles.whyVisHeadingWrapper}>
            <AnimatedSplitTitle
              lang={lang}
              text={whyVisData.section_title}
              className={styles.sectionTitle}
              style={{ textAlign: 'center', justifyContent: 'center' }}
            />
          </div>
          <div className={styles.whyVisContainer}>
            <div className={styles.whyVisList}>
              {whyVisData.bullets?.map((item: any, i: number) => (
                <div key={`why-${i}`} className={`${styles.bulletItem} ${activeBullet === i ? styles.activeBullet : ''}`} onMouseEnter={() => setActiveBullet(i)}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <div className={styles.whyVisImageWrapper}>
              {whyVisData.bullets?.map((item: any, i: number) => (
                <img 
                  key={`why-img-${i}`} 
                  src={fixImageUrl(item.image)} 
                  alt={item.title} 
                  className={`${styles.whyVisImage} ${activeBullet === i ? styles.imageActive : ''}`} 
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATISTICS */}
      {statsData && (
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {statsData.map((stat: any, i: number) => (
              <div key={`stat-${i}`} className={styles.statCard}>
                <h3 className={styles.statValue}>{stat.value}</h3>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MEET OUR TEAM */}
      {teamData && (
        <section className={styles.teamSection}>
          <div className={styles.sectionHeadingBlock}>
            <AnimatedSplitTitle
              lang={lang}
              text={teamData.section_title}
              className={styles.sectionTitle}
            />
          </div>
          <div className={styles.teamGrid}>
            {teamData.members?.map((member: any, i: number) => (
              <div key={`team-${i}`} className={styles.teamCard}>
                <div className={styles.teamMemberCore}>
                  <div className={styles.teamImageContainer}>
                    <img 
                      src={fixImageUrl(member.image)} 
                      alt={member.name} 
                      className={styles.teamImage} 
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }} // صورة فريق افتراضية
                    />
                  </div>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                </div>
                <div className={styles.teamSideInfo}>
                  <p>{member.info}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PARTNERS */}
      {partnersData && (
        <section className={styles.partnersSection}>
          <div className={styles.sectionHeadingBlock}>
            <AnimatedSplitTitle
              lang={lang}
              text={partnersData.section_title}
              className={styles.sectionTitle}
              style={{ fontSize: '2.2rem' }}
            />
            <AnimatedSplitTitle
              as="p"
              lang={lang}
              text={partnersData.subtitle}
              className={styles.partnersSubtitleSplit}
            />
          </div>
          <div className={styles.partnersGrid} ref={partnersGridRef}>
            {partnersData.partners.map((partner: any, i: number) => (
              <a
                key={`partner-${i}`}
                href={partner.website_url}
                target="_blank"
                rel="noreferrer"
                className={`${styles.partnerCloud} ${isPartnersVisible ? styles.cloudVisible : ''}`}
                style={{ '--delay': `${i * 0.35}s` } as React.CSSProperties}
              >
                <span className={styles.partnerName}>{partner.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerLogo}>VIS.</div>
          <div className={styles.footerTagline}>{footerData.company_brief}</div>
          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              {footerData.support_links.map((link: any, i: number) => (
                <Fragment key={`footer-link-${i}`}>
                  <a href={link.url}>{link.label}</a>
                  {i < footerData.support_links.length - 1 && <span className={styles.divider}>|</span>}
                </Fragment>
              ))}
            </div>
            <div className={styles.footerSocials}>
              {footerData.contact_us.social_links.map((social: any, i: number) => (
                <a key={`social-${i}`} href={social.url} target="_blank" rel="noreferrer" className={`${styles.socialBtn} ${styles[social.platform.toLowerCase()] || styles.socialDefault}`}>
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>{footerData.copyright_text}</p>
        </div>
      </footer>
    </div>
  );
}