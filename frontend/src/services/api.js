import axios from "axios";

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const login = (email, password) =>
  apiClient.post("/auth/login", { email, password });

export const register = (email, password) =>
  apiClient.post("/auth/register", { email, password });

export const getCurrentUser = () => apiClient.get("/auth/me");

// Subject endpoints
export const createSubject = (name, exam_target) =>
  apiClient.post("/notes/subjects", { name, exam_target });

export const getSubjects = () => apiClient.get("/notes/subjects");

// Notes endpoints
export const uploadNotes = (subjectId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(`/notes/upload?subject_id=${subjectId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getSubjectNotes = (subjectId) =>
  apiClient.get(`/notes/subject/${subjectId}`);

// Quiz endpoints (Kirtan's APIs)
export const generateQuiz = (subjectId) =>
  apiClient.post(`/quiz/generate?subject_id=${subjectId}`);

export const submitQuiz = (sessionId, answers) =>
  apiClient.post(`/quiz/submit`, { session_id: sessionId, answers });

// Doubt endpoints (Kirtan's APIs)
export const askDoubt = (subjectId, question) =>
  apiClient.post(`/doubt/ask`, { subject_id: subjectId, question });

// Explain endpoints (Kirtan's APIs)
export const explainTopic = (subjectId, topic) =>
  apiClient.post(`/explain/topic`, { subject_id: subjectId, topic });

// Study Plan endpoints (Prahlad's APIs)
export const generateStudyPlan = (examDate, dailyHours) =>
  apiClient.post("/studyplan/generate", {
    exam_date: examDate,
    daily_hours: dailyHours,
  });

export const getStudyPlan = (planId) => apiClient.get(`/studyplan/${planId}`);

export const listStudyPlans = () => apiClient.get("/studyplan/list/all");

// Performance endpoints (Prahlad's APIs)
export const getPerformanceSummary = (subjectId) =>
  apiClient.get(`/performance/summary/${subjectId}`);

export const getAllPerformance = () => apiClient.get("/performance/all");

export const getPerformanceTrends = (subjectId) =>
  apiClient.get(`/performance/trends/${subjectId}`);

export default apiClient;
