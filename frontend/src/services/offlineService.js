const LESSONS_KEY = 'edureach-saved-lessons';
const EXPLANATIONS_KEY = 'edureach-saved-image-explanations';
const QUIZ_RESULTS_KEY = 'edureach-saved-quiz-results';

/**
 * Get all saved AI tutor lessons from Local Storage.
 * @returns {Array} List of saved lessons
 */
export function getSavedLessons() {
  try {
    const stored = localStorage.getItem(LESSONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load saved lessons', e);
    return [];
  }
}

/**
 * Get all saved image doubt solver explanations from Local Storage.
 * @returns {Array} List of saved image explanations
 */
export function getSavedImageExplanations() {
  try {
    const stored = localStorage.getItem(EXPLANATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load saved image explanations', e);
    return [];
  }
}

/**
 * Get all saved quiz results from Local Storage.
 * @returns {Array} List of saved quiz results
 */
export function getSavedQuizResults() {
  try {
    const stored = localStorage.getItem(QUIZ_RESULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load saved quiz results', e);
    return [];
  }
}

/**
 * Save an AI tutor lesson to Local Storage.
 * @param {Object} lesson - Lesson object containing details
 */
export function saveLesson(lesson) {
  if (!lesson || !lesson.title) return;
  try {
    const lessons = getSavedLessons();
    const exists = lessons.some(
      item => item.title === lesson.title && item.explanation === lesson.explanation
    );
    if (exists) {
      return;
    }

    lessons.push({
      id: lesson.id || `lesson-${Date.now()}`,
      title: lesson.title,
      subject: lesson.subject || '',
      grade: lesson.grade || '',
      language: lesson.language || 'en',
      explanation: lesson.explanation,
      important_points: lesson.important_points || [],
      real_life_example: lesson.real_life_example || '',
      practice_question: lesson.practice_question || '',
      timestamp: lesson.timestamp || new Date().toISOString()
    });

    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (e) {
    console.error('Failed to save lesson', e);
  }
}

/**
 * Save an image doubt explanation to Local Storage.
 * @param {Object} exp - Explanation object containing details
 */
export function saveImageExplanation(exp) {
  if (!exp || !exp.title) return;
  try {
    const explanations = getSavedImageExplanations();
    const exists = explanations.some(
      item => item.title === exp.title && item.explanation === exp.explanation
    );
    if (exists) {
      return;
    }

    explanations.push({
      id: exp.id || `image-exp-${Date.now()}`,
      title: exp.title,
      subject: exp.subject || '',
      grade: exp.grade || '',
      language: exp.language || 'en',
      explanation: exp.explanation,
      important_points: exp.important_points || [],
      real_life_example: exp.real_life_example || '',
      practice_question: exp.practice_question || '',
      previewUrl: exp.previewUrl || '',
      timestamp: exp.timestamp || new Date().toISOString()
    });

    localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(explanations));
  } catch (e) {
    console.error('Failed to save image explanation', e);
  }
}

/**
 * Save a quiz result to Local Storage.
 * @param {Object} result - Quiz result containing topic and score
 */
export function saveQuizResult(result) {
  if (!result || !result.topic) return;
  try {
    const results = getSavedQuizResults();
    const exists = results.some(
      item => item.topic === result.topic && item.timestamp === result.timestamp
    );
    if (exists) {
      return;
    }

    results.push({
      id: result.id || `quiz-res-${Date.now()}`,
      topic: result.topic,
      grade: result.grade || '',
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      timestamp: result.timestamp || new Date().toISOString()
    });

    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save quiz result', e);
  }
}

/**
 * Clear all offline stored data (lessons, explanations, quiz results).
 */
export function clearOfflineData() {
  try {
    localStorage.removeItem(LESSONS_KEY);
    localStorage.removeItem(EXPLANATIONS_KEY);
    localStorage.removeItem(QUIZ_RESULTS_KEY);
  } catch (e) {
    console.error('Failed to clear offline data', e);
  }
}
