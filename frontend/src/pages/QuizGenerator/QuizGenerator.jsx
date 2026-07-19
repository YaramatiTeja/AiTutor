import { useState } from 'react';
import { generateQuiz } from '../../services/quizApi';
import { saveQuizResult } from '../../services/progressService';
import { saveQuizResult as saveQuizResultOffline } from '../../services/offlineService';
import './QuizGenerator.css';

const uiTranslations = {
  en: {
    title: 'Adaptive Quiz Generator',
    subtitle: 'Practice and test your knowledge with auto-generated questions.',
    topicLabel: 'Enter Quiz Topic',
    topicPlaceholder: 'e.g., Photosynthesis, Fractions, Solar System...',
    generateBtn: 'Generate Quiz',
    generating: 'Preparing your quiz...',
    clearBtn: 'Clear',
    questionHeader: 'Question {num} of {total}',
    submitBtn: 'Submit Quiz',
    scoreTitle: 'Quiz Results',
    scoreSub: 'You scored {score} out of {total}!',
    restartBtn: 'Try Another Topic',
    retakeBtn: 'Retake This Quiz',
    explanationHeader: 'Explanation:',
    pleaseSelect: 'Please select an option for each question before submitting.',
    serviceUnavailable: 'The quiz service is unavailable. Please try again in a moment.',
    invalidResponse: 'The quiz generator returned an unexpected response. Please try again.',
    genericError: 'We could not get a response just now. Please try again.',
    correctAnswersLabel: 'Correct Answers',
    wrongAnswersLabel: 'Wrong Answers',
    percentageScoreLabel: 'Percentage',
  },
  te: {
    title: 'అడాప్టివ్ క్విజ్ జనరేటర్',
    subtitle: 'ఆటో-జనరేటెడ్ ప్రశ్నలతో మీ జ్ఞానాన్ని పరీక్షించుకోండి.',
    topicLabel: 'క్విజ్ అంశాన్ని నమోదు చేయండి',
    topicPlaceholder: 'ఉదా: కిరణజన్య సంయోగ క్రియ, భిన్నాలు, సౌర కుటుంబం...',
    generateBtn: 'క్విజ్ సృష్టించు',
    generating: 'క్విజ్ సిద్ధం చేస్తున్నాము...',
    clearBtn: 'తుడిచేయి',
    questionHeader: 'ప్రశ్న {num} / {total}',
    submitBtn: 'సమర్పించండి',
    scoreTitle: 'క్విజ్ ఫలితం',
    scoreSub: 'మీరు {total} కి {score} మార్కులు సాధించారు!',
    restartBtn: 'మరో అంశం ప్రయత్నించండి',
    retakeBtn: 'మళ్లీ ప్రయత్నించండి',
    explanationHeader: 'వివరణ:',
    pleaseSelect: 'సమర్పించే ముందు దయచేసి అన్ని ప్రశ్నలకు సమాధానాన్ని ఎంచుకోండి.',
    serviceUnavailable: 'క్విజ్ సేవ ప్రస్తుతం అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
    invalidResponse: 'సరైన క్విజ్ సృష్టించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.',
    genericError: 'ఇప్పుడు సమాధానం తీసుకురాలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.',
    correctAnswersLabel: 'సరైన సమాధానాలు',
    wrongAnswersLabel: 'తప్పు సమాధానాలు',
    percentageScoreLabel: 'శాతం స్కోరు',
  },
  hi: {
    title: 'अनुकूली क्विज़ जनरेटर',
    subtitle: 'स्वतः उत्पन्न प्रश्नों के साथ अपने ज्ञान का परीक्षण करें।',
    topicLabel: 'क्विज़ का विषय दर्ज करें',
    topicPlaceholder: 'जैसे: प्रकाश संश्लेषण, भिन्न, सौर मंडल...',
    generateBtn: 'क्विज़ तैयार करें',
    generating: 'क्विज़ तैयार की जा रही है...',
    clearBtn: 'साफ़ करें',
    questionHeader: 'प्रश्न {num} / {total}',
    submitBtn: 'क्विज़ सबमिट करें',
    scoreTitle: 'आपका क्विज़ परिणाम',
    scoreSub: 'आपने {total} में से {score} अंक प्राप्त किए!',
    restartBtn: 'दूसरा विषय आज़माएं',
    retakeBtn: 'फिर से प्रयास करें',
    explanationHeader: 'व्याख्या:',
    pleaseSelect: 'कृपया सबमिट करने से पहले प्रत्येक प्रश्न के लिए एक विकल्प चुनें।',
    serviceUnavailable: 'क्विज़ सेवा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    invalidResponse: 'वैध क्विज़ तैयार करने में असमर्थ। कृपया पुनः प्रयास करें।',
    genericError: 'अभी उत्तर नहीं मिल सका। कृपया फिर से कोशिश करें।',
    correctAnswersLabel: 'सही उत्तर',
    wrongAnswersLabel: 'गलत उत्तर',
    percentageScoreLabel: 'प्रतिशत स्कोर',
  }
};

export default function QuizGenerator({
  grade,
  language = 'en',
  isOnline = true,
  onlineStateLabel = 'Online',
  recordActivity,
  setSystemMessage,
}) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const lang = uiTranslations[language] ? language : 'en';
  const t = uiTranslations[lang];

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;

    setLoading(true);
    setError('');
    setQuiz(null);
    setSelectedOptions({});
    setSubmitted(false);
    setScore(0);
    setWrongCount(0);
    setPercentage(0);

    try {
      const response = await generateQuiz(cleanTopic, grade, lang);
      setQuiz(response);
      
      if (setSystemMessage) {
        setSystemMessage({ type: 'success', key: 'messages.ready' });
      }
      if (recordActivity) {
        recordActivity('feature', { detailText: `Quiz: ${cleanTopic}` });
      }
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 503) {
        setError(t.serviceUnavailable);
      } else if (status === 502) {
        setError(detail || t.invalidResponse);
      } else {
        setError(t.genericError);
      }

      if (setSystemMessage) {
        setSystemMessage({ type: 'error', key: 'messages.offlineSaved' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIdx, option) => {
    if (submitted) return;
    setSelectedOptions(prev => ({
      ...prev,
      [questionIdx]: option
    }));
  };

  const handleSaveQuizResult = () => {
    if (!quiz) return;
    try {
      saveQuizResultOffline({
        topic: topic.trim(),
        grade: grade,
        score: score,
        total: quiz.questions.length,
        percentage: percentage,
        timestamp: new Date().toISOString()
      });
      alert('Quiz result saved successfully for offline access!');
    } catch (e) {
      console.error('Failed to save quiz result', e);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    if (Object.keys(selectedOptions).length < quiz.questions.length) {
      setError(t.pleaseSelect);
      return;
    }

    setError('');
    let calculatedScore = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correct_answer) {
        calculatedScore += 1;
      }
    });

    const wrong = quiz.questions.length - calculatedScore;
    const percent = Math.round((calculatedScore / quiz.questions.length) * 100);

    setScore(calculatedScore);
    setWrongCount(wrong);
    setPercentage(percent);
    setSubmitted(true);

    try {
      saveQuizResult({
        topic: topic.trim(),
        grade: grade,
        score: calculatedScore,
        total: quiz.questions.length,
        percentage: percent,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      });
    } catch (e) {
      console.error("Failed to save quiz result", e);
    }
  };

  const handleClear = () => {
    setTopic('');
    setQuiz(null);
    setSelectedOptions({});
    setSubmitted(false);
    setScore(0);
    setWrongCount(0);
    setPercentage(0);
    setError('');
  };

  return (
    <div className="quiz-panel mt-4">
      {/* Configuration Card */}
      <div className="card border-0 shadow-sm quiz-hero-card mb-3">
        <div className="card-body quiz-hero-body">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div className="section-heading mb-1">{t.title}</div>
              <p className="quiz-hero-copy mb-0">{t.subtitle}</p>
            </div>
            <span className={`badge rounded-pill ${isOnline ? 'text-bg-success' : 'text-bg-secondary'}`}>
              {onlineStateLabel}
            </span>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">{t.topicLabel}</label>
            <input
              type="text"
              className="form-control quiz-input"
              placeholder={t.topicPlaceholder}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="d-flex flex-wrap gap-3 mt-3">
            <button
              className="btn btn-success d-inline-flex align-items-center gap-2"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <span>{t.generateBtn}</span>
              )}
            </button>
            <button
              className="btn btn-guest"
              onClick={handleClear}
              disabled={loading}
            >
              {t.clearBtn}
            </button>
          </div>

          {error && !quiz && <div className="alert alert-danger mt-3 mb-0 quiz-alert">{error}</div>}
        </div>
      </div>

      {/* Quiz Title & Score */}
      {quiz && (
        <div className="quiz-content animate-fade-in">
          <div className="card border-0 shadow-sm quiz-title-card mb-3">
            <div className="card-body text-center">
              <h4 className="card-title quiz-title mb-3">{quiz.title}</h4>
              {submitted && (
                <div className="quiz-score-display mt-3 p-3 animate-pulse">
                  <h5 className="fw-bold mb-3">{t.scoreTitle}</h5>
                  <div className="row g-2">
                    <div className="col-4 border-end">
                      <div className="text-muted small fw-semibold">{t.correctAnswersLabel}</div>
                      <div className="h3 fw-bold text-success mt-1">{score}</div>
                    </div>
                    <div className="col-4 border-end">
                      <div className="text-muted small fw-semibold">{t.wrongAnswersLabel}</div>
                      <div className="h3 fw-bold text-danger mt-1">{wrongCount}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-muted small fw-semibold">{t.percentageScoreLabel}</div>
                      <div className="h3 fw-bold text-primary mt-1">{percentage}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error inside quiz */}
          {error && submitted && <div className="alert alert-danger mb-3 quiz-alert">{error}</div>}

          {/* Question List */}
          <div className="questions-container d-flex flex-column gap-3 mb-4">
            {quiz.questions.map((q, qIdx) => {
              const selected = selectedOptions[qIdx];
              const isCorrect = selected === q.correct_answer;
              return (
                <div key={qIdx} className={`card border-0 shadow-sm quiz-question-card ${submitted ? (isCorrect ? 'quiz-card-correct' : 'quiz-card-incorrect') : ''}`}>
                  <div className="card-header quiz-question-header fw-bold">
                    {t.questionHeader.replace('{num}', qIdx + 1).replace('{total}', quiz.questions.length)}
                  </div>
                  <div className="card-body">
                    <p className="card-text quiz-question-text fw-semibold mb-3">{q.question}</p>
                    
                    <div className="options-list d-flex flex-column gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelectedOpt = selected === opt;
                        const isCorrectOpt = q.correct_answer === opt;
                        
                        let optClass = 'btn-outline-secondary';
                        if (submitted) {
                          if (isCorrectOpt) {
                            optClass = 'btn-success text-white disabled-opt';
                          } else if (isSelectedOpt) {
                            optClass = 'btn-danger text-white disabled-opt';
                          } else {
                            optClass = 'btn-outline-secondary disabled-opt';
                          }
                        } else if (isSelectedOpt) {
                          optClass = 'btn-success text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={`btn text-start option-btn px-3 py-2.5 ${optClass}`}
                            onClick={() => handleSelectOption(qIdx, opt)}
                            disabled={submitted}
                          >
                            <span className="option-letter me-2">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                            <span className="option-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {submitted && (
                      <div className="explanation-section mt-3 p-3 bg-light rounded animate-fade-in border-start border-4 border-success">
                        <span className="fw-bold text-success d-block mb-1">{t.explanationHeader}</span>
                        <p className="explanation-text mb-0 text-muted">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="quiz-actions d-flex gap-3 mb-5">
            {!submitted ? (
              <button
                className="btn btn-success px-4 py-2.5 fw-bold w-100"
                onClick={handleSubmit}
                disabled={Object.keys(selectedOptions).length < quiz.questions.length}
              >
                {t.submitBtn}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success px-4 py-2.5 fw-bold flex-fill"
                  onClick={handleGenerate}
                >
                  {t.retakeBtn}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success px-4 py-2.5 fw-bold flex-fill"
                  onClick={handleSaveQuizResult}
                >
                  💾 Save Quiz Result
                </button>
                <button
                  className="btn btn-guest px-4 py-2.5 fw-bold flex-fill"
                  onClick={handleClear}
                >
                  {t.restartBtn}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
