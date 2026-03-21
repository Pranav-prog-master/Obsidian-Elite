import axios from "axios";

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "edu_token";

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
    const token = localStorage.getItem(TOKEN_KEY);
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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const login = (payloadOrEmail, password) => {
  if (typeof payloadOrEmail === "object") {
    return apiClient.post("/auth/login", payloadOrEmail);
  }
  return apiClient.post("/auth/login", { email: payloadOrEmail, password });
};

export const register = (payloadOrEmail, password) => {
  if (typeof payloadOrEmail === "object") {
    return apiClient.post("/auth/register", payloadOrEmail);
  }
  return apiClient.post("/auth/register", { email: payloadOrEmail, password });
};

export const getCurrentUser = () => apiClient.get("/auth/me");

// Subject endpoints
export const createSubject = (payloadOrName, examTarget) => {
  if (typeof payloadOrName === "object") {
    return apiClient.post("/notes/subjects", payloadOrName);
  }
  return apiClient.post("/notes/subjects", {
    name: payloadOrName,
    exam_target: examTarget,
  });
};

export const getSubjects = () => apiClient.get("/notes/subjects");

// Notes endpoints
export const uploadNotes = (subjectOrFormData, file) => {
  const formData =
    subjectOrFormData instanceof FormData ? subjectOrFormData : new FormData();

  if (!(subjectOrFormData instanceof FormData)) {
    formData.append("file", file);
  }

  const subjectId =
    subjectOrFormData instanceof FormData
      ? subjectOrFormData.get("subject_id")
      : subjectOrFormData;

  return apiClient
    .post(`/notes/upload?subject_id=${subjectId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => ({
      ...response,
      // Keep old UI contract alive.
      data: {
        ...response.data,
        chunk_count: response.data.chunk_count ?? response.data.chunks_created,
      },
    }));
};

export const getSubjectNotes = (subjectId) =>
  apiClient.get(`/notes/subject/${subjectId}`);

// Alias used by app router pages
export const getNotes = getSubjectNotes;

// Quiz endpoints (Kirtan's APIs)
export const generateQuiz = (subjectId) =>
  apiClient.post(`/quiz/generate?subject_id=${subjectId}`);

export const submitQuiz = (sessionOrPayload, answers) => {
  if (typeof sessionOrPayload === "object") {
    return apiClient.post(`/quiz/submit`, sessionOrPayload);
  }
  return apiClient.post(`/quiz/submit`, {
    session_id: sessionOrPayload,
    answers,
  });
};

// Doubt endpoints (Kirtan's APIs)
export const askDoubt = (subjectOrPayload, question) => {
  if (typeof subjectOrPayload === "object") {
    return apiClient.post(`/doubt/ask`, subjectOrPayload);
  }
  return apiClient.post(`/doubt/ask`, { subject_id: subjectOrPayload, question });
};

// Explain endpoints (Kirtan's APIs)
export const explainTopic = (subjectOrPayload, topic) => {
  if (typeof subjectOrPayload === "object") {
    return apiClient.post(`/explain/topic`, subjectOrPayload);
  }
  return apiClient.post(`/explain/topic`, {
    subject_id: subjectOrPayload,
    topic_name: topic,
  });
};

// Study Plan endpoints (Prahlad's APIs)
export const generateStudyPlan = (payloadOrDate, dailyHours) => {
  if (typeof payloadOrDate === "object") {
    return apiClient.post("/studyplan/generate", payloadOrDate);
  }
  return apiClient.post("/studyplan/generate", {
    exam_date: payloadOrDate,
    daily_hours: dailyHours,
  });
};

export const getStudyPlan = async (planId) => {
  if (planId) {
    return apiClient.get(`/studyplan/${planId}`);
  }
  const listResponse = await apiClient.get("/studyplan/list/all");
  const latest = listResponse.data?.[0];
  return {
    ...listResponse,
    data: {
      plan: latest?.plan_items || [],
      source: latest || null,
    },
  };
};

export const listStudyPlans = () => apiClient.get("/studyplan/list/all");

// Performance endpoints (Prahlad's APIs)
export const getPerformanceSummary = (subjectId) =>
  apiClient.get(`/performance/summary/${subjectId}`);

// Alias used by app router pages
export const getPerformance = async (subjectId) => {
  const response = await getPerformanceSummary(subjectId);
  return {
    ...response,
    data: {
      ...response.data,
      sessions: (response.data.quiz_history || []).map((q) => ({
        id: q.session_id,
        created_at: q.date,
        score: q.score,
        total: q.total,
        percentage: q.percentage,
      })),
      weak_topics: (response.data.weak_topics || []).map((t) => ({
        topic: t.topic,
        fail_rate: Math.round(t.failure_rate),
      })),
    },
  };
};

export const getAllPerformance = () => apiClient.get("/performance/all");

export const getPerformanceTrends = (subjectId) =>
  apiClient.get(`/performance/trends/${subjectId}`);

export default apiClient;
