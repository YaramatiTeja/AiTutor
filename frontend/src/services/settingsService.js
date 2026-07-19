const SESSION_KEY = 'edureach-session';
const THEME_KEY = 'edureach-theme';

const DEFAULT_SETTINGS = {
  profileName: 'Guest',
  isGuest: true,
  language: 'en',
  grade: 'class6',
  subject: 'science',
  theme: 'light'
};

/**
 * Retrieve current user settings (language, grade, subject, theme) from Local Storage.
 * 
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    let session = {};
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      session = JSON.parse(storedSession);
    }
    
    const theme = localStorage.getItem(THEME_KEY) || DEFAULT_SETTINGS.theme;
    
    return {
      profileName: session.profileName || DEFAULT_SETTINGS.profileName,
      isGuest: session.isGuest !== false,
      language: session.language || DEFAULT_SETTINGS.language,
      grade: session.grade || DEFAULT_SETTINGS.grade,
      subject: session.subject || DEFAULT_SETTINGS.subject,
      theme: theme
    };
  } catch (e) {
    console.error('Failed to get settings from Local Storage', e);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings to Local Storage.
 * Supports updating specific subset or full settings object.
 * 
 * @param {Object} settings - Settings fields to update
 * @param {string} [settings.language] - Preferred language
 * @param {string} [settings.grade] - Default school grade
 * @param {string} [settings.subject] - Default subject
 * @param {string} [settings.theme] - Theme (light/dark)
 */
export function saveSettings(settings) {
  if (!settings) return;
  try {
    const current = getSettings();
    
    // Update session data
    const updatedSession = {
      profileName: settings.profileName !== undefined ? settings.profileName : current.profileName,
      isGuest: settings.isGuest !== undefined ? settings.isGuest : current.isGuest,
      language: settings.language || current.language,
      grade: settings.grade || current.grade,
      subject: settings.subject || current.subject
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    
    // Update theme data
    if (settings.theme) {
      localStorage.setItem(THEME_KEY, settings.theme);
      // Dynamically apply/remove dark theme class to body in case this is called in context
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('dark-theme', settings.theme === 'dark');
      }
    }

    // Trigger storage event to alert listening windows/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Failed to save settings to Local Storage', e);
  }
}

/**
 * Reset all user settings back to their original defaults in Local Storage.
 */
export function resetSettings() {
  try {
    const defaultSession = {
      profileName: DEFAULT_SETTINGS.profileName,
      isGuest: DEFAULT_SETTINGS.isGuest,
      language: DEFAULT_SETTINGS.language,
      grade: DEFAULT_SETTINGS.grade,
      subject: DEFAULT_SETTINGS.subject
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(defaultSession));
    localStorage.setItem(THEME_KEY, DEFAULT_SETTINGS.theme);

    if (typeof document !== 'undefined') {
      document.body.classList.remove('dark-theme');
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Failed to reset settings in Local Storage', e);
  }
}
