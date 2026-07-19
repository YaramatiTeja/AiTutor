import { useState, useEffect } from 'react';
import { getQuizResults } from '../../services/progressService';
import './WeakTopics.css';

const uiTranslations = {
  en: {
    title: 'Weak Topic Detection',
    subtitle: 'Understand your progress and focus areas based on your quiz performance.',
    overallScore: 'Overall Score Percentage',
    weakTopics: 'Weak Topics',
    strongTopics: 'Strong Topics',
    weakDesc: 'Topics where you scored less than 60% on average. Focus on these!',
    strongDesc: 'Topics where you scored 60% or more on average. Great work!',
    noDataTitle: 'No quiz activity recorded yet',
    noDataDesc: 'Take practice quizzes in the Adaptive Quiz section, and your results will be analyzed here.',
    demoBtn: 'Load Sample Data to Preview',
    clearDemoBtn: 'Clear Quiz History',
    topicCol: 'Topic',
    scoreCol: 'Average Score',
    statusCol: 'Status',
    needPractice: 'Needs Practice',
    mastered: 'Mastered',
    quizzesTaken: 'Quizzes Taken',
    latestScoreLabel: 'Latest Score',
    recommendationText: 'Revise this topic using AI Tutor.',
    practiceBtn: 'Practice Again',
  },
  te: {
    title: 'బలహీన అంశాల గుర్తింపు',
    subtitle: 'మీ క్విజ్ ప్రదర్శన ఆధారంగా మీ ప్రగతిని మరియు శ్రద్ధ పెట్టాల్సిన అంశాలను అర్థం చేసుకోండి.',
    overallScore: 'మొత్తం స్కోరు శాతం',
    weakTopics: 'బలహీనమైన అంశాలు',
    strongTopics: 'బలమైన అంశాలు',
    weakDesc: 'సగటున 60% కంటే తక్కువ స్కోర్ చేసిన అంశాలు. వీటిపై శ్రద్ధ పెట్టండి!',
    strongDesc: 'సగటున 60% లేదా అంతకంటే ఎక్కువ స్కోర్ చేసిన అంశాలు. అద్భుతమైన పని!',
    noDataTitle: 'ఇంకా క్విజ్ సమాచారం నమోదు కాలేదు',
    noDataDesc: 'అడాప్టివ్ క్విజ్ విభాగంలో క్విజ్లు తీసుకోండి, మీ ఫలితాలు ఇక్కడ విశ్లేషించబడతాయి.',
    demoBtn: 'నమూనా సమాచారాన్ని చూపించు',
    clearDemoBtn: 'క్విజ్ చరిత్రను తుడిచేయి',
    topicCol: 'అంశం',
    scoreCol: 'సగటు స్కోరు',
    statusCol: 'స్థితి',
    needPractice: 'ప్రాక్టీస్ అవసరం',
    mastered: 'పట్టు సాధించారు',
    quizzesTaken: 'తీసుకున్న క్విజ్లు',
    latestScoreLabel: 'చివరి స్కోరు',
    recommendationText: 'AI ట్యూటర్ ఉపయోగించి ఈ అంశాన్ని పునర్విమర్శ చేయండి.',
    practiceBtn: 'మళ్లీ ప్రాక్టీస్ చేయండి',
  },
  hi: {
    title: 'कमज़ोर विषय पहचान',
    subtitle: 'अपने क्विज़ प्रदर्शन के आधार पर अपनी प्रगति और ध्यान केंद्रित करने वाले क्षेत्रों को समझें।',
    overallScore: 'कुल प्रतिशत स्कोर',
    weakTopics: 'कमज़ोर विषय',
    strongTopics: 'मजबूत विषय',
    weakDesc: 'वे विषय जिनमें आपने औसतन 60% से कम स्कोर किया। इन पर ध्यान दें!',
    strongDesc: 'वे विषय जिनमें आपने औसतन 60% या अधिक स्कोर किया। बहुत बढ़िया!',
    noDataTitle: 'अभी तक कोई क्विज़ गतिविधि दर्ज नहीं की गई है',
    noDataDesc: 'अनुकूली क्विज़ अनुभाग में अभ्यास क्विज़ लें, और आपके परिणामों का विश्लेषण यहाँ किया जाएगा।',
    demoBtn: 'पूर्वावलोकन के लिए नमूना डेटा लोड करें',
    clearDemoBtn: 'क्विज़ इतिहास साफ़ करें',
    topicCol: 'विषय',
    scoreCol: 'औसत स्कोर',
    statusCol: 'स्थिति',
    needPractice: 'अभ्यास की आवश्यकता',
    mastered: 'निपुण',
    quizzesTaken: 'दिए गए क्विज़',
    latestScoreLabel: 'नवीनतम स्कोर',
    recommendationText: 'AI ट्यूटर का उपयोग करके इस विषय को दोहराएं।',
    practiceBtn: 'फिर से अभ्यास करें',
  }
};

const sampleQuizData = [
  { topic: 'Photosynthesis', score: 4, total: 5, percentage: 80 },
  { topic: 'Fractions', score: 2, total: 5, percentage: 40 },
  { topic: 'Solar System', score: 5, total: 5, percentage: 100 },
  { topic: 'Fractions', score: 3, total: 5, percentage: 60 },
  { topic: 'Gravitation', score: 3, total: 5, percentage: 60 },
  { topic: 'Algebra', score: 4, total: 5, percentage: 80 }
];

export default function WeakTopics({
  language = 'en',
  onNavigate,
  navigateToFeature,
  setActiveFeature,
  grade,
}) {
  const [history, setHistory] = useState([]);
  const [weakTopicsList, setWeakTopicsList] = useState([]);
  const [strongTopicsList, setStrongTopicsList] = useState([]);
  const [overallScore, setOverallScore] = useState(0);

  const lang = uiTranslations[language] ? language : 'en';
  const t = uiTranslations[lang];

  const loadQuizHistory = () => {
    const results = getQuizResults();
    setHistory(results);
  };

  const handlePracticeAgain = (topicName) => {
    // 1. Save topic to local storage for AI Tutor
    localStorage.setItem('edureach-practice-topic', topicName);

    // 2. Find and update grade
    const latestQuiz = history.find(q => q.topic === topicName);
    const targetGrade = latestQuiz ? latestQuiz.grade : grade;

    if (targetGrade) {
      // Trigger select option change for the grade selector in DOM
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        const options = Array.from(select.options).map(opt => opt.value);
        if (options.includes('class4') || options.includes('class5') || options.includes('class6')) {
          select.value = targetGrade;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    // 3. Navigation
    if (onNavigate) {
      onNavigate('aiTutor');
    } else if (navigateToFeature) {
      navigateToFeature('aiTutor');
    } else if (setActiveFeature) {
      setActiveFeature('aiTutor');
    } else {
      // Find the sidebar button and click it programmatically
      const sidebarButtons = document.querySelectorAll('.sidebar-panel button');
      let clicked = false;
      sidebarButtons.forEach(btn => {
        if (btn.textContent.includes('🎓') || btn.textContent.toLowerCase().includes('ai tutor') || btn.textContent.includes('ట్యూటర్') || btn.textContent.includes('ट्यूटर')) {
          btn.click();
          clicked = true;
        }
      });
      if (!clicked) {
        window.location.hash = '#aiTutor';
      }
    }
  };

  useEffect(() => {
    loadQuizHistory();
  }, []);

  useEffect(() => {
    if (history.length === 0) {
      setWeakTopicsList([]);
      setStrongTopicsList([]);
      setOverallScore(0);
      return;
    }

    // Group by topic
    const topicScores = {};
    history.forEach((q) => {
      const topicName = q.topic || 'General';
      if (!topicScores[topicName]) {
        topicScores[topicName] = { totalPercentage: 0, count: 0, latestPercentage: 0, latestTimestamp: '' };
      }
      topicScores[topicName].totalPercentage += q.percentage;
      topicScores[topicName].count += 1;

      // Keep track of the latest quiz by checking timestamps or order
      const hasNewerTimestamp = q.timestamp && topicScores[topicName].latestTimestamp && q.timestamp > topicScores[topicName].latestTimestamp;
      const noPreviousTimestamp = !topicScores[topicName].latestTimestamp;
      if (hasNewerTimestamp || noPreviousTimestamp || !q.timestamp) {
        topicScores[topicName].latestPercentage = q.percentage;
        if (q.timestamp) {
          topicScores[topicName].latestTimestamp = q.timestamp;
        }
      }
    });

    const analyzed = Object.keys(topicScores).map((topic) => {
      const avgScore = Math.round(topicScores[topic].totalPercentage / topicScores[topic].count);
      return {
        topic,
        averageScore: avgScore,
        latestScore: topicScores[topic].latestPercentage,
        count: topicScores[topic].count,
      };
    });

    // Partition weak vs strong (60% threshold)
    const weak = analyzed.filter(item => item.averageScore < 60);
    const strong = analyzed.filter(item => item.averageScore >= 60);

    // Sort weak topics by lowest score first
    weak.sort((a, b) => a.averageScore - b.averageScore);

    setWeakTopicsList(weak);
    setStrongTopicsList(strong);

    // Overall Average Score Percentage
    const sumPercent = history.reduce((sum, item) => sum + item.percentage, 0);
    setOverallScore(Math.round(sumPercent / history.length));

  }, [history]);

  const handleLoadDemo = () => {
    try {
      localStorage.setItem('edureach-quiz-history', JSON.stringify(sampleQuizData));
      setHistory(sampleQuizData);
    } catch (e) {
      console.error('Failed to load demo history', e);
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('edureach-quiz-history');
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <div className="weak-topics-panel mt-4">
      {/* Title Card */}
      <div className="card border-0 shadow-sm weak-topics-hero mb-3">
        <div className="card-body">
          <div className="section-heading mb-1">{t.title}</div>
          <p className="weak-topics-copy mb-0">{t.subtitle}</p>
        </div>
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="card border-0 shadow-sm empty-state-card text-center p-5">
          <div className="card-body">
            <span className="empty-state-icon">📊</span>
            <h4 className="mt-3 mb-2">{t.noDataTitle}</h4>
            <p className="text-muted mb-4">{t.noDataDesc}</p>
            <button
              className="btn btn-success px-4 py-2"
              onClick={handleLoadDemo}
            >
              {t.demoBtn}
            </button>
          </div>
        </div>
      ) : (
        /* Dashboard Content */
        <div className="weak-topics-content animate-fade-in">
          <div className="row g-3 mb-3">
            {/* Overall Score Card */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm score-card h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center p-4">
                  <span className="score-icon mb-2">🏆</span>
                  <div className="text-muted small fw-semibold uppercase">{t.overallScore}</div>
                  <div className="h1 fw-bold text-accent mt-2">{overallScore}%</div>
                  <div className="progress mt-3" style={{ height: '10px', borderRadius: '5px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${overallScore}%` }}
                      aria-valuenow={overallScore}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm stats-card h-100">
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-semibold">{t.quizzesTaken}:</span>
                    <span className="badge bg-secondary rounded-pill px-3 py-2 fs-6">{history.length}</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-semibold">{t.strongTopics}:</span>
                    <span className="badge bg-success rounded-pill px-3 py-2 fs-6">{strongTopicsList.length}</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{t.weakTopics}:</span>
                    <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">{weakTopicsList.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            {/* Weak Topics List */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm topic-section-card h-100 border-start border-4 border-danger">
                <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
                  <h5 className="card-title fw-bold text-danger d-flex align-items-center gap-2 mb-1">
                    <span>⚠️</span> {t.weakTopics}
                  </h5>
                  <span className="text-muted small">{t.weakDesc}</span>
                </div>
                <div className="card-body px-4 pb-4 pt-2">
                  {weakTopicsList.length === 0 ? (
                    <div className="text-muted py-3 italic">None</div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mt-2">
                      {weakTopicsList.map((item, idx) => (
                        <div key={idx} className="topic-item p-3 rounded bg-light border">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-dark">{item.topic}</span>
                            <span className="badge text-bg-danger">{t.needPractice}</span>
                          </div>
                          
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="progress flex-fill" style={{ height: '8px', borderRadius: '4px' }}>
                              <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{ width: `${item.averageScore}%` }}
                                aria-valuenow={item.averageScore}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <span className="small fw-bold text-muted">{item.averageScore}% ({t.scoreCol})</span>
                          </div>

                          <div className="small text-muted mb-2">
                            <strong>{t.latestScoreLabel}:</strong> {item.latestScore}%
                          </div>

                          <div className="recommendation-box p-2 bg-white rounded border-start border-3 border-danger small text-dark mt-2">
                            💡 {t.recommendationText}
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm mt-3 px-3 py-2 fw-semibold w-100"
                            onClick={() => handlePracticeAgain(item.topic)}
                          >
                            🔄 {t.practiceBtn}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Strong Topics List */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm topic-section-card h-100 border-start border-4 border-success">
                <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
                  <h5 className="card-title fw-bold text-success d-flex align-items-center gap-2 mb-1">
                    <span>✅</span> {t.strongTopics}
                  </h5>
                  <span className="text-muted small">{t.strongDesc}</span>
                </div>
                <div className="card-body px-4 pb-4 pt-2">
                  {strongTopicsList.length === 0 ? (
                    <div className="text-muted py-3 italic">None</div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mt-2">
                      {strongTopicsList.map((item, idx) => (
                        <div key={idx} className="topic-item p-3 rounded bg-light border">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-dark">{item.topic}</span>
                            <span className="badge text-bg-success">{t.mastered}</span>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="progress flex-fill" style={{ height: '8px', borderRadius: '4px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${item.averageScore}%` }}
                                aria-valuenow={item.averageScore}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <span className="small fw-bold text-muted">{item.averageScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Options */}
          <div className="mt-4 mb-5 text-center">
            <button
              className="btn btn-outline-danger px-4 py-2"
              onClick={handleClearHistory}
            >
              {t.clearDemoBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
