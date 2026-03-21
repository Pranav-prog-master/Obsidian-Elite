import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";
import "@/app/globals.css";

import LoginPage from "@/app/login/page.jsx";
import RegisterPage from "@/app/register/page.jsx";
import DashboardPage from "@/app/dashboard/page.jsx";
import UploadPage from "@/app/upload/page.jsx";
import DoubtPage from "@/app/doubt/page.jsx";
import ExplainPage from "@/app/explain/page.jsx";
import QuizPage from "@/app/quiz/page.jsx";
import PerformancePage from "@/app/performance/page.jsx";
import StudyPlanPage from "@/app/studyplan/page.jsx";

function RootRedirect() {
  return <Navigate to={isLoggedIn() ? "/dashboard" : "/login"} replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/doubt" element={<DoubtPage />} />
        <Route path="/explain" element={<ExplainPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/studyplan" element={<StudyPlanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
