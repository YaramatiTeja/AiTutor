import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  translations,
  languageOptions,
  normalizeLanguage,
  normalizeGrade,
  normalizeSubject
} from '../../services/translationService';

const initialSession = () => {
  try {
    const stored = localStorage.getItem('edureach-session');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        profileName: parsed.profileName || 'Guest',
        isGuest: parsed.isGuest !== false,
        language: normalizeLanguage(parsed.language),
        grade: normalizeGrade(parsed.grade),
        subject: normalizeSubject(parsed.subject),
      };
    }
    return {
      profileName: 'Guest',
      isGuest: true,
      language: 'en',
      grade: 'class6',
      subject: 'science',
    };
  } catch {
    return {
      profileName: 'Guest',
      isGuest: true,
      language: 'en',
      grade: 'class6',
      subject: 'science',
    };
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const [signInName, setSignInName] = useState('');
  const [session, setSession] = useState(initialSession);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemMessage, setSystemMessage] = useState({ type: 'info', key: 'messages.ready' });
  const signInCardRef = useRef(null);

  const language = normalizeLanguage(session.language);
  const copy = useMemo(() => translations[language] ?? translations.en, [language]);
  const messageText = copy.messages[systemMessage.key] ?? '';
  const onlineStateLabel = isOnline ? copy.status.online : copy.status.offline;
  const onlineStateClass = isOnline ? 'status-online' : 'status-offline';

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update document title
  useEffect(() => {
    document.title = `${copy.appTitle} | ${copy.landing.heroTitle}`;
  }, [copy]);

  // Sync session changes to localStorage
  useEffect(() => {
    localStorage.setItem('edureach-session', JSON.stringify(session));
  }, [session]);

  const updateSessionField = (field, value) => {
    setSession((current) => ({ ...current, [field]: value }));
    setSystemMessage(
      field === 'language' 
        ? { type: 'info', key: 'messages.languageChanged' } 
        : { type: 'info', key: 'messages.ready' }
    );
  };

  const openGuestExperience = () => {
    const guestSession = { ...session, profileName: 'Guest', isGuest: true, language };
    localStorage.setItem('edureach-session', JSON.stringify(guestSession));
    
    // Log login activity
    recordActivity('login', { detailKey: 'guest' });

    navigate('/dashboard');
  };

  const openSignedInExperience = () => {
    const name = signInName.trim();
    if (!name) {
      setSystemMessage({ type: 'error', key: 'messages.nameRequired' });
      return;
    }

    const userSession = {
      ...session,
      profileName: name || 'Student',
      isGuest: false,
      language,
    };
    localStorage.setItem('edureach-session', JSON.stringify(userSession));
    
    // Log login activity
    recordActivity('login', { detailText: name || 'Student' });

    navigate('/dashboard');
  };

  // Log activity helper
  const recordActivity = (kind, details = {}) => {
    try {
      const stored = localStorage.getItem('edureach-cache');
      const cache = stored ? JSON.parse(stored) : [];
      const updatedCache = [
        {
          id: `${kind}-${Date.now()}`,
          kind,
          detailKey: details.detailKey,
          detailText: details.detailText,
          timestamp: new Date().toLocaleString(),
          syncState: isOnline ? 'synced' : 'local',
        },
        ...cache,
      ];
      localStorage.setItem('edureach-cache', JSON.stringify(updatedCache));
    } catch (e) {
      console.error('Failed to log activity', e);
    }
  };

  const renderLanguageSelector = () => (
    <label className="language-selector" aria-label="Language selector">
      <span className="language-selector-icon">🌐</span>
      <select
        className="language-select"
        value={language}
        onChange={(event) => updateSessionField('language', event.target.value)}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="app-shell landing-shell">
      <nav className="topbar navbar navbar-expand-lg navbar-dark px-4 py-3">
        <div className="container-fluid px-0">
          <div className="brand-inline">
            <span className="brand-mark brand-mark-sm">E</span>
            <span className="navbar-brand fw-bold text-uppercase letter-spacing mb-0">{copy.appName}</span>
          </div>
          <div className="ms-auto topbar-actions">
            {renderLanguageSelector()}
            <span className={`status-chip ${onlineStateClass}`}>{onlineStateLabel}</span>
          </div>
        </div>
      </nav>

      <div className={`message-banner message-${systemMessage.type}`}>{messageText}</div>

      <main className="container-fluid p-0 landing-main">
        <section className="hero-card row g-0 overflow-hidden">
          <div className="col-lg-6 hero-photo-wrap">
            <img
              className="hero-photo"
              src="/image.png"
              alt="Rural students learning together in a village classroom setting"
            />
            <div className="hero-photo-overlay" />
          </div>
          <div className="col-lg-6 p-4 p-lg-5 hero-copy">
            <div className="eyebrow mb-3">{copy.landing.title}</div>
            <h1 className="display-5 fw-bold mb-3 hero-title">{copy.landing.heroTitle}</h1>
            <p className="hero-subtitle mb-3">{copy.landing.heroSubtitle}</p>
            <p className="hero-description mb-4">{copy.landing.heroDescription}</p>
            <div className="hero-feature-list mb-4">
              {copy.landing.features.map((feature) => (
                <div className="hero-feature-item" key={feature}>
                  ✔ {feature}
                </div>
              ))}
            </div>
            <div className="d-flex flex-wrap gap-3 hero-actions mb-4">
              <button className="btn btn-guest btn-lg" onClick={openGuestExperience}>
                {copy.landing.guestButton}
              </button>
              <button
                className="btn btn-sync btn-lg"
                onClick={() => signInCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                {copy.landing.syncButton}
              </button>
            </div>
            <div className="sign-in-card" ref={signInCardRef}>
              <div className="sign-in-label">{copy.landing.signInLabel}</div>
              <div className="input-group input-group-lg mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={copy.landing.studentPlaceholder}
                  value={signInName}
                  onChange={(event) => setSignInName(event.target.value)}
                />
                <button className="btn btn-light fw-semibold" onClick={openSignedInExperience}>
                  {copy.landing.signInButton}
                </button>
              </div>
              <div className="landing-footer">{copy.landing.footer}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
