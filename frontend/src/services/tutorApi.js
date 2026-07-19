import apiClient from './api';

export async function askTutor({ grade, subject, language, question, previousExplanation = null, followUp = false }) {
  const response = await apiClient.post('/tutor', {
    grade,
    subject,
    language,
    question,
    previous_explanation: previousExplanation,
    follow_up: followUp,
  });

  return response.data;
}
