import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StudyPlan() {
  const navigate = useNavigate();
  const [studyPlanData, setStudyPlanData] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planGenerated, setPlanGenerated] = useState(false);

  // Load previously generated plan on mount
  useEffect(() => {
    fetchPreviousPlan();
  }, []);

  const fetchPreviousPlan = async () => {
    try {
      const response = await api.get("/studyplan/list/all");
      if (response.data && response.data.length > 0) {
        // Load the most recent plan
        setStudyPlanData(response.data[0]);
        setPlanGenerated(true);
      }
    } catch (err) {
      console.error("Failed to fetch previous plan:", err);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();

    if (!examDate) {
      setError("Please select an exam date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/studyplan/generate", {
        exam_date: examDate,
        daily_hours: parseInt(dailyHours),
      });

      setStudyPlanData(response.data);
      setPlanGenerated(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate study plan");
      console.error("Error generating plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getTaskTypeColor = (taskType) => {
    switch (taskType) {
      case "read":
        return "bg-blue-100 text-blue-800";
      case "practice":
        return "bg-green-100 text-green-800";
      case "revise":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskTypeEmoji = (taskType) => {
    switch (taskType) {
      case "read":
        return "📖";
      case "practice":
        return "✏️";
      case "revise":
        return "🔄";
      default:
        return "📝";
    }
  };

  if (!planGenerated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Study Plan Generator
            </h1>
            <p className="text-gray-600 mb-8">
              Create a personalized day-by-day study schedule based on your exam
              date and available study hours
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  📅 Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  ⏰ Daily Study Hours
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-16">
                    {dailyHours} hrs
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? "Generating Plan..." : "Generate My Study Plan 🚀"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Display generated plan
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setPlanGenerated(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            ← Back to Generate New Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Personalized Study Plan
          </h1>
          <p className="text-gray-600 mb-6">
            📌 Exam Date:{" "}
            <span className="font-semibold">
              {formatDate(studyPlanData.exam_date)}
            </span>{" "}
            | Created:{" "}
            <span className="text-sm text-gray-500">
              {new Date(studyPlanData.created_at).toLocaleString()}
            </span>
          </p>

          {/* Plan Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
              <div className="text-2xl font-bold text-blue-600">
                {studyPlanData.plan_items.length}
              </div>
              <div className="text-sm text-gray-600">Days of Study</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
              <div className="text-2xl font-bold text-green-600">
                {studyPlanData.plan_items.reduce(
                  (sum, item) => sum + item.duration_minutes,
                  0,
                )}{" "}
                min
              </div>
              <div className="text-sm text-gray-600">Total Study Time</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
              <div className="text-2xl font-bold text-purple-600">
                {
                  new Set(studyPlanData.plan_items.map((item) => item.subject))
                    .size
                }
              </div>
              <div className="text-sm text-gray-600">Subjects</div>
            </div>
          </div>

          {/* Study Plan Items */}
          <div className="space-y-4">
            {studyPlanData.plan_items.map((item, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-400 min-w-10">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {item.subject}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-2">
                      <p className="font-semibold text-gray-700">
                        📚 Topic: {item.topic}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getTaskTypeColor(item.task_type)}`}
                        >
                          {getTaskTypeEmoji(item.task_type)}{" "}
                          {item.task_type.charAt(0).toUpperCase() +
                            item.task_type.slice(1)}
                        </span>
                        <span className="text-gray-600 font-semibold">
                          ⏱️ {item.duration_minutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition duration-200"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setPlanGenerated(false)}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-200"
          >
            Create New Plan 🔄
          </button>
        </div>
      </div>
    </div>
  );
}
