import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edu_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('edu_token');
      document.cookie = 'edu_token=; path=/; max-age=0; samesite=lax';
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login        = (d) => api.post('/auth/login', d);
export const register     = (d) => api.post('/auth/register', d);
export const getSubjects  = () => api.get('/subjects');
export const createSubject= (d) => api.post('/subjects', d);
export const uploadNotes  = (fd) => api.post('/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getNotes     = (sid) => api.get(`/notes?subject_id=${sid}`);
export const generateQuiz = (sid) => api.post('/quiz/generate', { subject_id: sid });
export const submitQuiz   = (d) => api.post('/quiz/submit', d);
export const askDoubt     = (d) => api.post('/doubt/ask', d);
export const explainTopic = (d) => api.post('/explain/topic', d);
export const getStudyPlan = () => api.get('/studyplan');
export const generateStudyPlan = (d) => api.post('/studyplan/generate', d);
export const getPerformance = (sid) => api.get(`/performance/summary?subject_id=${sid}`);

export default api;
