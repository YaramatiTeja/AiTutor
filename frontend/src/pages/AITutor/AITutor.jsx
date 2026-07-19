import { useState, useEffect } from 'react';
import { askTutor } from '../../services/tutorApi';
import { saveLesson } from '../../services/offlineService';

export default function AITutor({
  grade,
  subject,
  language,
  copy,
  isOnline,
  onlineStateLabel,
  recordActivity,
  setSystemMessage,
}) {
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorAskedQuestion, setTutorAskedQuestion] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const [tutorResult, setTutorResult] = useState(null);
  const [tutorFollowUpLoading, setTutorFollowUpLoading] = useState(false);
  const [tutorFollowUpError, setTutorFollowUpError] = useState('');
  const [tutorFollowUpResult, setTutorFollowUpResult] = useState(null);

  const tutorLoadingText = copy.messages.tutorLoading;
 
  useEffect(() => {
    const practiceTopic = localStorage.getItem('edureach-practice-topic');
    if (practiceTopic) {
      setTutorQuestion(practiceTopic);
      localStorage.removeItem('edureach-practice-topic');
    }
  }, []);

  const handleSaveLesson = (resultToSave) => {
    if (!resultToSave) return;
    try {
      saveLesson({
        title: resultToSave.title || tutorAskedQuestion || 'AI Lesson',
        subject: subject,
        grade: grade,
        language: language,
        explanation: resultToSave.explanation,
        important_points: resultToSave.important_points,
        real_life_example: resultToSave.real_life_example,
        practice_question: resultToSave.practice_question,
      });
      alert('Lesson saved successfully for offline access!');
    } catch (e) {
      console.error('Failed to save lesson', e);
    }
  };

  const askCurrentTutor = async () => {
    const question = tutorQuestion.trim();

    if (!question) {
      setTutorError(copy.messages.tutorQuestionRequired);
      return;
    }

    setTutorLoading(true);
    setTutorError('');
    setTutorResult(null);
    setTutorFollowUpResult(null);
    setTutorFollowUpError('');
    setTutorAskedQuestion(question);

    try {
      const response = await askTutor({
        grade: grade,
        subject: subject,
        language: language,
        question,
      });

      setTutorResult(response);
      setSystemMessage({ type: 'success', key: 'messages.ready' });
      recordActivity('feature', { detailKey: 'aiTutor' });
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 503) {
        setTutorError(copy.messages.tutorServiceUnavailable);
      } else if (status === 502) {
        setTutorError(detail || copy.messages.tutorInvalidResponse);
      } else {
        setTutorError(copy.messages.tutorGenericError);
      }

      setSystemMessage({ type: 'error', key: 'messages.offlineSaved' });
    } finally {
      setTutorLoading(false);
    }
  };

  const requestExplainAgain = async (sourceResult) => {
    if (!tutorAskedQuestion || !sourceResult) {
      return;
    }

    setTutorFollowUpLoading(true);
    setTutorFollowUpError('');

    try {
      const response = await askTutor({
        grade: grade,
        subject: subject,
        language,
        question: tutorAskedQuestion,
        previousExplanation: sourceResult.explanation,
        followUp: true,
      });

      setTutorFollowUpResult(response);
      setSystemMessage({ type: 'success', key: 'messages.ready' });
      recordActivity('feature', { detailKey: 'aiTutor' });
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 503) {
        setTutorFollowUpError(copy.messages.tutorServiceUnavailable);
      } else if (status === 502) {
        setTutorFollowUpError(detail || copy.messages.tutorInvalidResponse);
      } else {
        setTutorFollowUpError(copy.messages.tutorGenericError);
      }
    } finally {
      setTutorFollowUpLoading(false);
    }
  };

  return (
    <div className="tutor-panel mt-4">
      <div className="tutor-hero-card card border-0 shadow-sm mb-3">
        <div className="card-body tutor-hero-body">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div className="section-heading mb-1">Ask the Tutor</div>
              <p className="tutor-hero-copy mb-0">Get step-by-step help in simple language for your class and subject.</p>
            </div>
            <span className={`badge rounded-pill ${isOnline ? 'text-bg-success' : 'text-bg-secondary'}`}>
              {onlineStateLabel}
            </span>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">{copy.dashboard.subjectLabel} Question</label>
            <textarea
              className="form-control tutor-textarea"
              rows="4"
              placeholder={language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి' : language === 'hi' ? 'अपना प्रश्न यहाँ लिखें' : 'Type your question here'}
              value={tutorQuestion}
              onChange={(event) => setTutorQuestion(event.target.value)}
            />
          </div>

          <div className="d-flex flex-wrap gap-3 mt-3">
            <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={askCurrentTutor} disabled={tutorLoading}>
              {tutorLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                  <span>{tutorLoadingText}</span>
                </>
              ) : (
                <span>{language === 'te' ? 'Ask AI' : language === 'hi' ? 'AI से पूछें' : 'Ask AI'}</span>
              )}
            </button>
            <button
              className="btn btn-guest"
              onClick={() => {
                setTutorQuestion('');
                setTutorResult(null);
                setTutorError('');
              }}
            >
              {language === 'te' ? 'తుడిచేయి' : language === 'hi' ? 'साफ़ करें' : 'Clear'}
            </button>
          </div>

          {tutorError ? <div className="alert alert-danger mt-3 mb-0 tutor-alert">{tutorError}</div> : null}
        </div>
      </div>

      {tutorResult ? (
        <div className="row g-3 mt-1 tutor-response-grid">
          <div className="col-12">
            <div className="card border-0 shadow-sm tutor-result-card">
              <div className="card-header tutor-result-header">Title</div>
              <div className="card-body">
                <h4 className="card-title mb-0 tutor-result-title">{tutorResult.title}</h4>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">Explanation</div>
              <div className="card-body">
                <p className="card-text mb-0 tutor-result-text" style={{ whiteSpace: 'pre-line' }}>{tutorResult.explanation}</p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-2"
                    onClick={() => requestExplainAgain(tutorResult)}
                    disabled={tutorFollowUpLoading || tutorLoading}
                  >
                    {tutorFollowUpLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        <span>{tutorLoadingText}</span>
                      </>
                    ) : (
                      <span>{copy.messages.tutorExplainAgain}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 px-3"
                    onClick={() => handleSaveLesson(tutorResult)}
                  >
                    💾 Save Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">Important Points</div>
              <div className="card-body">
                <ul className="list-group list-group-flush tutor-list-group">
                  {tutorResult.important_points.map((point) => (
                    <li className="list-group-item px-0 py-2" key={point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">Real Life Example</div>
              <div className="card-body">
                <p className="card-text mb-0 tutor-result-text">{tutorResult.real_life_example}</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">Practice Question</div>
              <div className="card-body">
                <p className="card-text mb-0 tutor-result-text">{tutorResult.practice_question}</p>
              </div>
            </div>
          </div>

          {tutorFollowUpResult ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm tutor-result-card tutor-follow-up-card">
                <div className="card-header tutor-result-header">{copy.messages.tutorExplainAgain}</div>
                <div className="card-body">
                  <h5 className="card-title mb-3 tutor-result-title">{tutorFollowUpResult.title}</h5>
                  <p className="card-text tutor-result-text">{tutorFollowUpResult.explanation}</p>

                  <div className="row g-3 mt-1">
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 tutor-mini-card h-100">
                        <div className="card-header tutor-result-header">Important Points</div>
                        <div className="card-body">
                          <ul className="list-group list-group-flush tutor-list-group">
                            {tutorFollowUpResult.important_points.map((point) => (
                              <li className="list-group-item px-0 py-2" key={point}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 tutor-mini-card h-100">
                        <div className="card-header tutor-result-header">Real Life Example</div>
                        <div className="card-body">
                          <p className="card-text mb-0 tutor-result-text">{tutorFollowUpResult.real_life_example}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card border-0 tutor-mini-card">
                        <div className="card-header tutor-result-header">Practice Question</div>
                        <div className="card-body">
                          <p className="card-text mb-0 tutor-result-text">{tutorFollowUpResult.practice_question}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button
                      className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-2"
                      onClick={() => requestExplainAgain(tutorFollowUpResult)}
                      disabled={tutorFollowUpLoading || tutorLoading}
                    >
                      {tutorFollowUpLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                          <span>{tutorLoadingText}</span>
                        </>
                      ) : (
                        <span>{copy.messages.tutorExplainAgain}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 px-3"
                      onClick={() => handleSaveLesson(tutorFollowUpResult)}
                    >
                      💾 Save Lesson
                    </button>
                  </div>

                  {tutorFollowUpError ? <div className="alert alert-danger mt-3 mb-0 tutor-alert">{tutorFollowUpError}</div> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
