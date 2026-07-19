import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AITutor from '../AITutor/AITutor';
import ImageDoubtSolver from '../ImageDoubtSolver/ImageDoubtSolver';
import QuizGenerator from '../QuizGenerator/QuizGenerator';
import WeakTopics from '../WeakTopics/WeakTopics';
import OfflineLearning from '../OfflineLearning/OfflineLearning';
import Settings from '../Settings/Settings';

import {
  translations,
  languageOptions,
  normalizeLanguage,
  normalizeGrade,
  normalizeSubject
} from '../../services/translationService';

const featureKeys = ['home', 'aiTutor', 'imageDoubt', 'adaptiveQuiz', 'weakTopics', 'offlineLearning', 'settings'];

const sidebarItems = featureKeys;

const initialCache = () => {
  try {
    const stored = localStorage.getItem('edureach-cache');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeFeature, setActiveFeature] = useState('home');
  const [cache, setCache] = useState(initialCache);
  const [systemMessage, setSystemMessage] = useState({ type: 'info', key: 'messages.ready' });

  const syncTimeoutRef = useRef(null);
  const workspaceRef = useRef(null);

  const language = normalizeLanguage(session.language);
  const copy = useMemo(() => translations[language] ?? translations.en, [language]);
  const activeContent = useMemo(() => copy.dashboard.features[activeFeature] ?? copy.dashboard.features.home, [copy, activeFeature]);
  const onlineStateLabel = isOnline ? copy.status.online : copy.status.offline;
  const onlineStateClass = isOnline ? 'status-online' : 'status-offline';
  const welcomeLabel = session.isGuest
    ? copy.dashboard.welcomeGuest
    : copy.dashboard.welcomeUser.replace('{name}', session.profileName || 'Student');

  // Monitor storage changes to sync options live
  useEffect(() => {
    const handleStorageChange = () => {
      setSession(initialSession());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  // Sync session changes to localStorage
  useEffect(() => {
    localStorage.setItem('edureach-session', JSON.stringify(session));
  }, [session]);

  // Sync cache changes to localStorage
  useEffect(() => {
    localStorage.setItem('edureach-cache', JSON.stringify(cache));
  }, [cache]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Update document title
  useEffect(() => {
    document.title = `${copy.appTitle} | ${copy.dashboard.sectionTitle}`;
  }, [copy]);

  const recordActivity = (kind, details = {}) => {
    setCache((current) => [
      {
        id: `${kind}-${Date.now()}`,
        kind,
        detailKey: details.detailKey,
        detailText: details.detailText,
        timestamp: new Date().toLocaleString(),
        syncState: isOnline ? 'synced' : 'local',
      },
      ...current,
    ]);
  };

  const navigateToFeature = (featureKey) => {
    setActiveFeature(featureKey);
    setSystemMessage({ type: 'info', key: 'messages.ready' });
    recordActivity('feature', { detailKey: featureKey });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    workspaceRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const updateSessionField = (field, value) => {
    setSession((current) => ({ ...current, [field]: value }));
    setSystemMessage(
      field === 'language' 
        ? { type: 'info', key: 'messages.languageChanged' } 
        : { type: 'info', key: 'messages.ready' }
    );
    recordActivity('setting', { detailKey: `${field}.${value}` });
  };

  const syncProgress = () => {
    if (!isOnline) {
      setSystemMessage({ type: 'error', key: 'messages.offlineSaved' });
      recordActivity('sync', { detailText: String(cache.length) });
      return;
    }

    setSystemMessage({ type: 'loading', key: 'messages.syncing' });
    recordActivity('sync', { detailText: String(cache.length) });
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      setSystemMessage({ type: 'success', key: 'messages.synced' });
    }, 900);
  };

  const resolveActivityValue = (item) => {
    if (!item) return '';
    if (item.detailText) return item.detailText;

    if (item.detailKey) {
      if (item.kind === 'feature') {
        return copy.dashboard.features[item.detailKey]?.title ?? item.detailKey;
      }

      if (item.kind === 'setting') {
        const [group, code] = item.detailKey.split('.');
        if (group === 'grade') {
          return copy.gradeOptions.find((option) => option.value === code)?.label ?? item.detailKey;
        }
        if (group === 'subject') {
          return copy.subjectOptions.find((option) => option.value === code)?.label ?? item.detailKey;
        }
        if (group === 'language') {
          return languageOptions.find((option) => option.value === code)?.label ?? item.detailKey;
        }
      }

      if (item.kind === 'login' && item.detailKey === 'guest') {
        return copy.landing.guestButton;
      }
    }

    return '';
  };

  const featureIcons = {
    home: '🏠',
    aiTutor: '🎓',
    imageDoubt: '📷',
    adaptiveQuiz: '📝',
    weakTopics: '📊',
    offlineLearning: '📥',
    settings: '⚙️',
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

  const messageText = copy.messages[systemMessage.key] ?? '';
  const isHomeFeature = activeFeature === 'home';
  const contentGridClassName = isHomeFeature ? 'content-grid' : 'content-grid content-grid-single';
  const shouldShowTutorDetails = activeFeature === 'aiTutor' || activeFeature === 'imageDoubt' || activeFeature === 'adaptiveQuiz' || activeFeature === 'weakTopics';

  const setScreen = (scr) => {
    if (scr === 'landing') {
      navigate('/');
    }
  };

  return (
    <div className="app-shell home-shell">
      <div className="layout-shell">
        <Sidebar
          sidebarItems={sidebarItems}
          activeFeature={activeFeature}
          navigateToFeature={navigateToFeature}
          featureIcons={featureIcons}
          copy={copy}
          setScreen={setScreen}
        />

        <section className="workspace-panel" ref={workspaceRef}>
          <header className="workspace-topbar">
            <div>
              <div className="welcome-text">{welcomeLabel}</div>
              <div className="muted-copy">
                {session.isGuest
                  ? copy.dashboard.guestMode
                  : copy.dashboard.signedInMode}
              </div>
            </div>
            <div className="topbar-actions">
              {renderLanguageSelector()}
              <span className={`status-chip ${onlineStateClass}`}>{onlineStateLabel}</span>
            </div>
          </header>

          <div className={`message-banner message-${systemMessage.type}`}>{messageText}</div>

          <div className="workspace-controls">
            <label className="toolbar-field">
              <span>{copy.dashboard.gradeLabel}</span>
              <select
                className="form-select form-select-sm"
                value={session.grade}
                onChange={(event) => updateSessionField('grade', event.target.value)}
              >
                {copy.gradeOptions.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="toolbar-field">
              <span>{copy.dashboard.subjectLabel}</span>
              <select
                className="form-select form-select-sm"
                value={session.subject}
                onChange={(event) => updateSessionField('subject', event.target.value)}
              >
                {copy.subjectOptions.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-sync btn-sm ms-lg-auto" onClick={syncProgress}>
              {copy.dashboard.syncProgress}
            </button>
          </div>

          {isHomeFeature ? (
            <div className="dashboard-cards">
              {copy.dashboard.dashboardCards.map((card) => (
                <article key={card.key} className="dashboard-card">
                  <div className="dashboard-card-title">{card.title}</div>
                  <div className="dashboard-card-copy">{card.description}</div>
                </article>
              ))}
            </div>
          ) : null}

          <div className={contentGridClassName}>
            <article className="content-card feature-card">
              {shouldShowTutorDetails ? null : (
                <>
                  <div className="feature-badge">{activeFeature}</div>
                  <h3 className="feature-title mt-3">{activeContent.title}</h3>
                  <p className="feature-description">{activeContent.description}</p>
                  <div className="feature-list">
                    {activeContent.points.map((point) => (
                      <div key={point} className="feature-list-item">
                        <span className="feature-dot" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeFeature === 'aiTutor' ? (
                <AITutor
                  grade={session.grade}
                  subject={session.subject}
                  language={language}
                  copy={copy}
                  isOnline={isOnline}
                  onlineStateLabel={onlineStateLabel}
                  recordActivity={recordActivity}
                  setSystemMessage={setSystemMessage}
                />
              ) : null}

              {activeFeature === 'adaptiveQuiz' ? (
                <QuizGenerator
                  grade={session.grade}
                  language={language}
                  isOnline={isOnline}
                  onlineStateLabel={onlineStateLabel}
                  recordActivity={recordActivity}
                  setSystemMessage={setSystemMessage}
                />
              ) : null}

              {activeFeature === 'weakTopics' ? (
                <WeakTopics
                  language={language}
                  onNavigate={navigateToFeature}
                  grade={session.grade}
                />
              ) : null}

              {activeFeature === 'imageDoubt' ? (
                <ImageDoubtSolver
                  grade={session.grade}
                  subject={session.subject}
                  language={language}
                />
              ) : null}

              {activeFeature === 'offlineLearning' ? (
                <OfflineLearning />
              ) : null}

              {activeFeature === 'settings' ? (
                <Settings />
              ) : null}
            </article>

            {isHomeFeature ? (
              <article className="content-card activity-card">
                <div className="section-heading">{copy.dashboard.activity.title}</div>
                <div className="activity-list">
                  {cache.slice(0, 5).map((item) => (
                    <div className="activity-entry" key={item.id}>
                      <div className="fw-semibold">{copy.dashboard.activityLabels[item.kind] ?? item.kind}</div>
                      <div className="small text-muted">{resolveActivityValue(item)}</div>
                      <div className="tiny-copy">
                        {item.timestamp} · {copy.dashboard.activityStates[item.syncState] ?? item.syncState}
                      </div>
                    </div>
                  ))}
                  {cache.length === 0 ? <div className="empty-state">{copy.dashboard.activity.empty}</div> : null}
                </div>
              </article>
            ) : null}
          </div>

          <footer className="app-footer">{copy.dashboard.footer}</footer>
        </section>
      </div>
    </div>
  );
}
