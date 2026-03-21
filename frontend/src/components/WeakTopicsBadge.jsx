import React from "react";

export default function WeakTopicsBadge({ topic }) {
  const getColorClass = (failureRate) => {
    if (failureRate >= 75) {
      return "bg-red-100 border-red-300 text-red-900";
    } else if (failureRate >= 60) {
      return "bg-orange-100 border-orange-300 text-orange-900";
    } else {
      return "bg-yellow-100 border-yellow-300 text-yellow-900";
    }
  };

  const getSeverityEmoji = (failureRate) => {
    if (failureRate >= 75) return "🔴";
    if (failureRate >= 60) return "🟠";
    return "🟡";
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 ${getColorClass(topic.failure_rate)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">
              {getSeverityEmoji(topic.failure_rate)}
            </span>
            <h3 className="font-bold text-lg">{topic.topic}</h3>
          </div>
          <p className="text-sm opacity-75">
            Failed <span className="font-bold">{topic.total_attempts}</span>{" "}
            times
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {topic.failure_rate.toFixed(1)}%
          </div>
          <div className="text-xs opacity-75">Failure Rate</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
        <div
          className="h-full bg-current opacity-60 rounded-full transition-all"
          style={{ width: `${topic.failure_rate}%` }}
        ></div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 text-xs opacity-75 italic">
        💡 Focus extra time on this topic in your study plan
      </div>
    </div>
  );
}
