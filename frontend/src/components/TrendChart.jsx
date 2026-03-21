import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function TrendChart({ subjectId }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [subjectId]);

  const fetchTrendData = async () => {
    try {
      const response = await api.get(`/performance/trends/${subjectId}`);
      const data = response.data;

      setChartData({
        labels: data.dates,
        datasets: [
          {
            label: "Score Percentage",
            data: data.percentages,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 3,
          },
          {
            label: "Target (70%)",
            data: Array(data.dates.length).fill(70),
            borderColor: "rgba(34, 197, 94, 0.5)",
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching trend data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        Loading chart...
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                font: { size: 12 },
                padding: 15,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              titleFont: { size: 14 },
              bodyFont: { size: 13 },
              callbacks: {
                afterLabel: (context) => {
                  if (context.datasetIndex === 0) {
                    return "(Your Score)";
                  } else if (context.datasetIndex === 1) {
                    return "(Target)";
                  }
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => value + "%",
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        }}
      />
    </div>
  );
}
