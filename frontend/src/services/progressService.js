const STORAGE_KEY = 'edureach-quiz-history';

/**
 * Save a new quiz result to local storage history.
 *
 * @param {Object} result - The quiz result to save
 * @param {string} result.topic - The quiz topic
 * @param {number} result.score - The score achieved
 * @param {number} result.total - The total number of questions
 * @param {number} result.percentage - The percentage score
 * @param {string} [result.timestamp] - The timestamp of the result
 */
export function saveQuizResult(result) {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    history.push({
      topic: result.topic,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      timestamp: result.timestamp || new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save quiz result to Local Storage', e);
  }
}

/**
 * Get all quiz results from local storage history.
 *
 * @returns {Array<Object>} List of quiz results
 */
export function getQuizResults() {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (e) {
    console.error('Failed to get quiz results from Local Storage', e);
    return [];
  }
}
