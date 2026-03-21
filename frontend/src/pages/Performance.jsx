import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import TrendChart from "../components/TrendChart";
import WeakTopicsBadge from "../components/WeakTopicsBadge";

export default function Performance() {
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subject_id");

  const [performanceData, setPerformanceData] = useState(null);
  const [allPerformance, setAllPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [subjectId]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      if (subjectId) {
        // Single subject performance
        const response = await api.get(`/performance/summary/${subjectId}`);
        setPerformanceData(response.data);
      } else {
        // All subjects performance
        const response = await api.get("/performance/all");
        setAllPerformance(response.data);
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load performance data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!examDate) {
      alert("Please select an exam date");
      return;
    }

    setGeneratingPlan(true);
    try {
      await api.post("/studyplan/generate", {
        exam_date: examDate,
        daily_hours: 6,
      });
      alert("Study plan generated! Navigate to Study Plan page to view it.");
      setShowPlanModal(false);
      setExamDate("");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate study plan");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg">
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  // Single subject view
  if (performanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📊 Performance Analytics
            </h1>
            <p className="text-gray-600">
              Subject:{" "}
              <span className="font-bold text-blue-600">
                {performanceData.subject_name}
              </span>
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">
                {performanceData.average_percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Score</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {performanceData.quiz_history.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Quizzes Taken</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">
                {performanceData.weak_topics.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Weak Topics</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-600">
                {performanceData.quiz_history.length > 0
                  ? performanceData.quiz_history[
                      performanceData.quiz_history.length - 1
                    ].percentage.toFixed(1)
                  : "N/A"}
                %
              </div>
              <div className="text-sm text-gray-600 mt-1">Latest Score</div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Score Trend Over Time
            </h2>
            <TrendChart subjectId={performanceData.subject_id} />
          </div>

          {/* Quiz History Table */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quiz History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.quiz_history.map((quiz, idx) => (
                    <tr
                      key={quiz.session_id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                      <td className="py-3 px-4">
                        {new Date(quiz.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        {quiz.score}/{quiz.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            quiz.percentage >= 70
                              ? "bg-green-100 text-green-700"
                              : quiz.percentage >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {quiz.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weak Topics */}
          {performanceData.weak_topics.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ⚠️ Weak Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceData.weak_topics.map((topic, idx) => (
                  <WeakTopicsBadge key={idx} topic={topic} />
                ))}
              </div>
              <button
                onClick={() => setShowPlanModal(true)}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                📋 Generate Study Plan (Focus on Weak Topics)
              </button>
            </div>
          )}
        </div>

        {/* Modal for Study Plan */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Generate Study Plan
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={generateStudyPlan}
                  disabled={generatingPlan}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {generatingPlan ? "Generating..." : "Generate 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // All subjects view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📊 Overall Performance
        </h1>
        <p className="text-gray-600 mb-8">
          View performance across all your subjects
        </p>

        {allPerformance.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No quiz data available yet. Take a quiz to see your performance!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allPerformance.map((subject, idx) => (
              <div
                key={subject.subject_id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {subject.subject_name}
                    </h2>
                    <p className="text-gray-600">
                      {subject.quiz_history.length} quizzes completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {subject.average_percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {subject.quiz_history.length}
                    </div>
                    <div className="text-xs text-gray-600">Quizzes</div>
                  </div>
                  <div className="bg-purple-50 rounded p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {subject.weak_topics.length}
                    </div>
                    <div className="text-xs text-gray-600">Weak Topics</div>
                  </div>
                  <div className="bg-green-50 rounded p-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {subject.quiz_history[
                        subject.quiz_history.length - 1
                      ]?.percentage.toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-gray-600">Latest</div>
                  </div>
                </div>

                <a
                  href={`/performance?subject_id=${subject.subject_id}`}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition"
                >
                  View Detailed Analytics →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
