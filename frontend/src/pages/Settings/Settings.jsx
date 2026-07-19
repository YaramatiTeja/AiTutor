import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../services/settingsService';
import { clearOfflineData } from '../../services/offlineService';
import './Settings.css';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
];

const gradeOptions = [
  { value: 'class4', label: 'Class 4' },
  { value: 'class5', label: 'Class 5' },
  { value: 'class6', label: 'Class 6' },
  { value: 'class7', label: 'Class 7' },
  { value: 'class8', label: 'Class 8' },
  { value: 'class9', label: 'Class 9' },
  { value: 'class10', label: 'Class 10' },
];

const subjectOptions = [
  { value: 'science', label: 'Science' },
  { value: 'maths', label: 'Maths' },
  { value: 'english', label: 'English' },
  { value: 'socialScience', label: 'Social Science' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
];

export default function Settings() {
  // Session states (loaded from localStorage)
  const [session, setSession] = useState({
    profileName: 'Guest',
    isGuest: true,
    language: 'en',
    grade: 'class6',
    subject: 'science',
  });

  // Theme state
  const [theme, setTheme] = useState('light');
  
  // Alert banner state
  const [alertMsg, setAlertMsg] = useState('');

  // Initial load
  useEffect(() => {
    const activeSettings = getSettings();
    setSession({
      profileName: activeSettings.profileName,
      isGuest: activeSettings.isGuest,
      language: activeSettings.language,
      grade: activeSettings.grade,
      subject: activeSettings.subject
    });
    setTheme(activeSettings.theme);
    document.body.classList.toggle('dark-theme', activeSettings.theme === 'dark');
  }, []);

  // Update session field helper
  const updateSessionField = (field, value) => {
    const updatedSession = { ...session, [field]: value };
    setSession(updatedSession);
    
    try {
      saveSettings({
        ...updatedSession,
        theme: theme
      });
      triggerAlert(`Settings saved successfully! ${field.charAt(0).toUpperCase() + field.slice(1)} updated.`);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  // Update theme helper
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    try {
      saveSettings({
        ...session,
        theme: newTheme
      });
      triggerAlert(`Settings saved successfully! Theme changed to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode.`);
    } catch (e) {
      console.error('Failed to save theme settings', e);
    }
  };

  // Clear offline data helper
  const handleClearOfflineData = () => {
    const confirmed = window.confirm('Are you sure you want to delete all offline data?');
    if (confirmed) {
      clearOfflineData();
      triggerAlert('Offline data cleared successfully!');
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => {
      setAlertMsg('');
    }, 3000);
  };

  return (
    <div className="settings-container">
      {/* Success Alert Banner */}
      {alertMsg && (
        <div className="save-alert">
          ✨ {alertMsg}
        </div>
      )}

      {/* Header */}
      <div className="settings-hero">
        <h1 className="settings-title">Learning Settings</h1>
        <p className="settings-subtitle">
          Personalize your learning environment, set language preferences, and manage offline data.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="settings-card">
        {/* Preferred Language */}
        <div className="setting-row">
          <div className="setting-label-block">
            <h3 className="setting-name">Preferred Language</h3>
            <p className="setting-desc">
              Change the primary translation language for all lessons, explanations, and quiz interfaces.
            </p>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={session.language}
              onChange={(e) => updateSessionField('language', e.target.value)}
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Grade */}
        <div className="setting-row">
          <div className="setting-label-block">
            <h3 className="setting-name">Default Grade</h3>
            <p className="setting-desc">
              Set your primary school class/grade. AI tutor prompts will adapt automatically to this level.
            </p>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={session.grade}
              onChange={(e) => updateSessionField('grade', e.target.value)}
            >
              {gradeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Subject */}
        <div className="setting-row">
          <div className="setting-label-block">
            <h3 className="setting-name">Default Subject</h3>
            <p className="setting-desc">
              Choose your default starting subject for the dashboard cards and tutor screens.
            </p>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={session.subject}
              onChange={(e) => updateSessionField('subject', e.target.value)}
            >
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="setting-row">
          <div className="setting-label-block">
            <h3 className="setting-name">App Theme</h3>
            <p className="setting-desc">
              Choose between Light Mode (great for outdoor study) and Dark Mode (easy on the eyes at night).
            </p>
          </div>
          <div className="setting-control">
            <div className="theme-toggle-group">
              <button
                type="button"
                className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Settings Card */}
      <div className="settings-card danger-zone">
        <div className="setting-row">
          <div className="setting-label-block">
            <h3 className="setting-name danger-title">Clear Saved Storage</h3>
            <p className="setting-desc">
              Remove all saved offline lessons and quiz definitions from this device. This action is permanent.
            </p>
          </div>
          <div className="setting-control text-end">
            <button
              type="button"
              className="btn-danger-action"
              onClick={handleClearOfflineData}
            >
              Clear Offline Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
