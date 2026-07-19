import apiClient from './api';

/**
 * Generate exactly 5 multiple choice questions based on the topic, grade, and language.
 *
 * @param {string} topic - The topic of the quiz
 * @param {string} grade - The student's grade level
 * @param {string} language - The preferred language code (e.g., 'en', 'te', 'hi')
 * @returns {Promise<Object>} The generated quiz JSON response
 */
export async function generateQuiz(topic, grade, language) {
  const response = await apiClient.post('/quiz', {
    topic,
    grade,
    language,
  });
  return response.data;
}
