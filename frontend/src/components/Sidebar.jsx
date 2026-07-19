import React from 'react';

/**
 * Sidebar component rendering the brand title, feature navigation buttons,
 * and the return-to-landing button.
 *
 * @param {Object} props
 * @param {Array<string>} props.sidebarItems - The list of active feature keys
 * @param {string} props.activeFeature - The current active feature key
 * @param {Function} props.navigateToFeature - The navigation callback function
 * @param {Object} props.featureIcons - The map of icons for each feature
 * @param {Object} props.copy - The active language translations dictionary
 * @param {Function} props.setScreen - The screen switching callback function
 */
export default function Sidebar({
  sidebarItems = [],
  activeFeature,
  navigateToFeature,
  featureIcons = {},
  copy = { appName: 'EduReach AI', brandTagline: 'Learning Companion', dashboard: { sidebar: {} } },
  setScreen,
}) {
  // Ensure necessary items are present in the sidebar items
  const items = [...sidebarItems];
  if (!items.includes('adaptiveQuiz')) {
    items.push('adaptiveQuiz');
  }
  if (!items.includes('weakTopics')) {
    items.push('weakTopics');
  }
  if (!items.includes('offlineLearning')) {
    items.push('offlineLearning');
  }
  if (!items.includes('settings')) {
    items.push('settings');
  }

  // Define icons with defaults for the features
  const icons = {
    ...featureIcons,
    adaptiveQuiz: featureIcons.adaptiveQuiz || '📝',
    weakTopics: featureIcons.weakTopics || '📊',
    offlineLearning: featureIcons.offlineLearning || '📥',
    settings: featureIcons.settings || '⚙️',
  };

  // Define localized labels with fallback defaults
  const dashboardCopy = {
    ...copy,
    dashboard: {
      ...copy.dashboard,
      sidebar: {
        ...copy.dashboard?.sidebar,
        adaptiveQuiz: copy.dashboard?.sidebar?.adaptiveQuiz || 'Quiz Generator',
        weakTopics: copy.dashboard?.sidebar?.weakTopics || 'Weak Topics',
        offlineLearning: copy.dashboard?.sidebar?.offlineLearning || 'Offline Learning',
        settings: copy.dashboard?.sidebar?.settings || 'Settings',
      }
    }
  };

  return (
    <aside className="sidebar-panel">
      <div className="brand-stack">
        <div className="brand-mark">E</div>
        <div>
          <h2 className="brand-name mb-1">{dashboardCopy.appName}</h2>
          <p className="brand-subtitle mb-0">{dashboardCopy.brandTagline}</p>
        </div>
      </div>

      <nav className="sidebar-nav mt-4">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`sidebar-item ${activeFeature === item ? 'active' : ''}`}
            onClick={() => navigateToFeature && navigateToFeature(item)}
          >
            <span>{icons[item] || ''}</span>
            <span>{dashboardCopy.dashboard.sidebar[item] || item}</span>
          </button>
        ))}
      </nav>

      {setScreen && (
        <div className="sidebar-footer mt-auto">
          <button
            type="button"
            className="sidebar-item ghost"
            onClick={() => {
              setScreen('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>↩</span>
            <span>{dashboardCopy.dashboard.sidebar.backToLanding || 'Back to Landing'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
