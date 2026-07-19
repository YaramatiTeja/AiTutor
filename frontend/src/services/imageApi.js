import apiClient from './api';

export async function analyzeImage({ imageFile, grade, subject, language }) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('grade', grade);
  formData.append('subject', subject);
  formData.append('language', language);

  const response = await apiClient.post('/image/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
