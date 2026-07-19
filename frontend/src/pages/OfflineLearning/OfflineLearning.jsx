import React, { useState, useEffect } from 'react';
import { 
  getSavedLessons, 
  getSavedImageExplanations, 
  getSavedQuizResults, 
  clearOfflineData 
} from '../../services/offlineService';
import './OfflineLearning.css';

export default function OfflineLearning() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Storage states
  const [savedLessons, setSavedLessons] = useState([]);
  const [savedExplanations, setSavedExplanations] = useState([]);
  const [savedQuizResults, setSavedQuizResults] = useState([]);
  
  // Detail Modal view
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'lesson', 'explanation', 'quiz_result'

  // Monitor network status and load data
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadSavedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSavedData = () => {
    setSavedLessons(getSavedLessons());
    setSavedExplanations(getSavedImageExplanations());
    setSavedQuizResults(getSavedQuizResults());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all offline saved items?')) {
      clearOfflineData();
      loadSavedData();
    }
  };

  const handleDeleteItem = (id, type, e) => {
    e.stopPropagation(); // Prevent opening modal
    if (window.confirm('Delete this item from offline storage?')) {
      try {
        if (type === 'lesson') {
          const lessons = getSavedLessons();
          const updated = lessons.filter(item => item.id !== id);
          localStorage.setItem('edureach-saved-lessons', JSON.stringify(updated));
          setSavedLessons(updated);
        } else if (type === 'explanation') {
          const explanations = getSavedImageExplanations();
          const updated = explanations.filter(item => item.id !== id);
          localStorage.setItem('edureach-saved-image-explanations', JSON.stringify(updated));
          setSavedExplanations(updated);
        } else if (type === 'quiz_result') {
          const results = getSavedQuizResults();
          const updated = results.filter(item => item.id !== id);
          localStorage.setItem('edureach-saved-quiz-results', JSON.stringify(updated));
          setSavedQuizResults(updated);
        }
      } catch (err) {
        console.error('Failed to delete item', err);
      }
    }
  };

  const handleOpenItem = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const hasNoData = savedLessons.length === 0 && savedExplanations.length === 0 && savedQuizResults.length === 0;

  return (
    <div className="offline-learning-container">
      {/* Header Banner */}
      <div className="offline-hero">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="offline-title">Offline Library</h1>
            <p className="offline-subtitle">
              Access your manually saved AI lessons, workbook explanations, and quiz scores anytime offline.
            </p>
          </div>
          <div className={`status-bar ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span>{isOnline ? '🟢 Online Mode' : '🔴 Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      {!hasNoData && (
        <div className="control-row">
          <div className="text-muted small">
            Stored: {savedLessons.length} lessons, {savedExplanations.length} explanations, {savedQuizResults.length} quiz results
          </div>
          <button className="btn btn-sm btn-outline-danger px-3" onClick={handleClearAll}>
            🗑 Clear Library
          </button>
        </div>
      )}

      {hasNoData ? (
        <div className="empty-state">
          <span className="empty-icon">📥</span>
          <h4 className="empty-title">No offline content available.</h4>
          <p className="empty-desc">
            Save tutor lessons, image solver notes, or quiz results while online to view them here later.
          </p>
        </div>
      ) : (
        <div className="offline-sections-stack d-flex flex-column gap-5">
          {/* Saved AI Lessons Section */}
          {savedLessons.length > 0 && (
            <section className="offline-section">
              <h2 className="section-heading mb-4 d-flex align-items-center gap-2">
                <span>🎓</span> Saved AI Lessons ({savedLessons.length})
              </h2>
              <div className="cards-grid">
                {savedLessons.map(item => (
                  <div 
                    key={item.id} 
                    className="item-card" 
                    onClick={() => handleOpenItem(item, 'lesson')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="card-badge badge-lesson">🎓 Lesson</span>
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-meta">
                      <span className="meta-pill">{item.subject?.toUpperCase() || 'GENERAL'}</span>
                      <span className="meta-pill">{item.grade?.replace('class', 'Class ') || 'All Grades'}</span>
                    </div>
                    <div className="card-footer">
                      <button className="btn-view" onClick={() => handleOpenItem(item, 'lesson')}>
                        Read Lesson
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={(e) => handleDeleteItem(item.id, 'lesson', e)}
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Saved Image Explanations Section */}
          {savedExplanations.length > 0 && (
            <section className="offline-section">
              <h2 className="section-heading mb-4 d-flex align-items-center gap-2">
                <span>📷</span> Saved Image Explanations ({savedExplanations.length})
              </h2>
              <div className="cards-grid">
                {savedExplanations.map(item => (
                  <div 
                    key={item.id} 
                    className="item-card" 
                    onClick={() => handleOpenItem(item, 'explanation')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="card-badge badge-image">📷 Image Doubt</span>
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-meta">
                      <span className="meta-pill">{item.subject?.toUpperCase() || 'GENERAL'}</span>
                      <span className="meta-pill">{item.grade?.replace('class', 'Class ') || 'All Grades'}</span>
                    </div>
                    <div className="card-footer">
                      <button className="btn-view" onClick={() => handleOpenItem(item, 'explanation')}>
                        Read Explanation
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={(e) => handleDeleteItem(item.id, 'explanation', e)}
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Saved Quiz Results Section */}
          {savedQuizResults.length > 0 && (
            <section className="offline-section">
              <h2 className="section-heading mb-4 d-flex align-items-center gap-2">
                <span>📝</span> Saved Quiz Results ({savedQuizResults.length})
              </h2>
              <div className="cards-grid">
                {savedQuizResults.map(item => (
                  <div 
                    key={item.id} 
                    className="item-card" 
                    onClick={() => handleOpenItem(item, 'quiz_result')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="card-badge badge-quiz">📝 Quiz Result</span>
                    <h3 className="card-title">Score: {item.score}/{item.total}</h3>
                    <div className="card-meta">
                      <span className="meta-pill">TOPIC: {item.topic}</span>
                      <span className="meta-pill">{item.grade?.replace('class', 'Class ') || 'All Grades'}</span>
                    </div>
                    <div className="card-footer">
                      <button className="btn-view" onClick={() => handleOpenItem(item, 'quiz_result')}>
                        View Result
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={(e) => handleDeleteItem(item.id, 'quiz_result', e)}
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Details View Modal */}
      {selectedItem && (
        <div className="detail-modal-overlay" onClick={handleCloseModal}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                {modalType === 'lesson' && <span className="card-badge badge-lesson">🎓 Saved Lesson</span>}
                {modalType === 'explanation' && <span className="card-badge badge-image">📷 Saved Image Doubt</span>}
                {modalType === 'quiz_result' && <span className="card-badge badge-quiz">📝 Saved Quiz Score</span>}
                <h3 className="card-title mb-0">{selectedItem.title || selectedItem.topic}</h3>
                <div className="card-meta mb-0 mt-2">
                  <span className="meta-pill">{selectedItem.subject?.toUpperCase() || 'GENERAL'}</span>
                  <span className="meta-pill">{selectedItem.grade?.replace('class', 'Class ') || 'All Grades'}</span>
                  {selectedItem.timestamp && (
                    <span className="meta-pill">📅 {new Date(selectedItem.timestamp).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Image Preview if it has base64 data */}
              {selectedItem.previewUrl && (
                <img src={selectedItem.previewUrl} alt="Workbook upload query" className="modal-image-preview" />
              )}

              {/* Lesson / Image Explanation content */}
              {(modalType === 'lesson' || modalType === 'explanation') && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="card border-0 tutor-result-card">
                      <div className="card-header tutor-result-header">Explanation</div>
                      <div className="card-body">
                        <p className="card-text mb-0 tutor-result-text" style={{ whiteSpace: 'pre-line' }}>
                          {selectedItem.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.important_points && selectedItem.important_points.length > 0 && (
                    <div className="col-12 col-md-5">
                      <div className="card border-0 tutor-result-card h-100">
                        <div className="card-header tutor-result-header">Key Points</div>
                        <div className="card-body">
                          <ul className="list-group list-group-flush tutor-list-group">
                            {selectedItem.important_points.map((point, index) => (
                              <li className="list-group-item px-0 py-1.5" key={index}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={selectedItem.important_points && selectedItem.important_points.length > 0 ? "col-12 col-md-7" : "col-12"}>
                    <div className="card border-0 tutor-result-card h-100">
                      <div className="card-header tutor-result-header">Real Life Analogy</div>
                      <div className="card-body">
                        <p className="card-text mb-0 tutor-result-text">
                          {selectedItem.real_life_example}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.practice_question && (
                    <div className="col-12">
                      <div className="card border-0 tutor-result-card">
                        <div className="card-header tutor-result-header">Practice Question</div>
                        <div className="card-body">
                          <p className="card-text mb-0 tutor-result-text">
                            {selectedItem.practice_question}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Result View */}
              {modalType === 'quiz_result' && (
                <div className="quiz-retake-container text-center py-4">
                  <div className="quiz-score-banner mb-4">
                    <h3>Quiz Score Card</h3>
                    <div className="display-4 fw-bold text-success mt-2">{selectedItem.score} / {selectedItem.total}</div>
                    <div className="text-muted mt-2">Percentage: {selectedItem.percentage}%</div>
                  </div>
                  <div className="card border-0 bg-light p-3 rounded mx-auto" style={{ maxWidth: '400px' }}>
                    <div className="mb-2"><strong>Topic:</strong> {selectedItem.topic}</div>
                    <div className="mb-2"><strong>Grade Level:</strong> {selectedItem.grade?.replace('class', 'Class ')}</div>
                    <div><strong>Date Saved:</strong> {new Date(selectedItem.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-guest px-4 py-2" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
