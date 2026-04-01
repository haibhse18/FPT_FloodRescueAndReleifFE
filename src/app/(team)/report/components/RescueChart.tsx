"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";
import { RescueTrends } from "@/modules/teams/infrastructure/team.stats.api";

// Dynamic import Chart.js to avoid SSR issues
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
  ),
});

interface RescueChartProps {
  trends: RescueTrends | null;
  loading: boolean;
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
  currentPeriod: 'week' | 'month' | 'year';
}

const periodLabels = {
  week: 'Tuần',
  month: 'Tháng',
  year: 'Năm',
};

export function RescueChart({ trends, loading, onPeriodChange, currentPeriod }: RescueChartProps) {
  const chartHeight = 200;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} người được cứu`,
          title: (tooltipItems: any[]) => tooltipItems[0].label,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
          callback: (value: string | number) => String(value),
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const chartData = {
    labels: trends?.labels || [],
    datasets: [
      {
        label: 'Người được cứu',
        data: trends?.datasets[0]?.data || [],
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📊 Thống Kê Người Được Cứu
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {trends?.datasets[0]?.total || 0} người {periodLabels[currentPeriod].toLowerCase()}
          </p>
        </div>
        
        {/* Period Toggle */}
        <div className="flex bg-white/5 border border-white/20 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                currentPeriod === period
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : trends && trends.datasets[0]?.data?.some((value) => value > 0) ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-400 text-sm">Chưa có dữ liệu cứu hộ</p>
              <p className="text-gray-500 text-xs mt-1">
                Khoảng thời gian: {periodLabels[currentPeriod].toLowerCase()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {trends && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400">
              Trung bình:{" "}
              <span className="text-cyan-300 font-medium">
                {Math.round(
                  (trends.datasets[0]?.data?.reduce((sum, val) => sum + val, 0) || 0) /
                  (trends.labels?.length || 1)
                )} người
              </span>
            </div>
            <div className="text-gray-400">
              Cao nhất:{" "}
              <span className="text-cyan-300 font-medium">
                {Math.max(...(trends.datasets[0]?.data || [0]))} người
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
