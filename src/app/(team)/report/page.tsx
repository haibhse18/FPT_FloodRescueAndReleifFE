"use client";

import { Card } from "@/shared/ui/components";
import { 
  PiCheckCircleBold,
  PiSpinnerGapBold, 
  PiXCircleBold,
  PiUsersBold,
  PiUsersThreeBold,
  PiArrowClockwiseBold
} from "react-icons/pi";
import { RescueChart } from "./components/RescueChart";
import { useTeamReport } from "./hooks/useTeamReport";

export default function TeamReportPage() {
  const {
    stats,
    trends,
    loading,
    error,
    period,
    setPeriod,
    refetch,
  } = useTeamReport();

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="relative z-10 p-4 lg:p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="relative z-10 p-4 lg:p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-white/10 rounded-lg w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            📊 Báo Cáo Thành Tích Đội
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Tổng quan hoạt động cứu hộ và cứu trợ của đội
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-300 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
            Cập nhật lần cuối: {stats?.lastUpdated ? 
              new Date(stats.lastUpdated).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Đang tải...'
            }
          </div>
          <button
            onClick={handleRefresh}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-2 text-white transition-colors"
            disabled={loading}
          >
            <PiArrowClockwiseBold className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Missions Completed */}
        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <div className="text-2xl mb-2 text-emerald-400">
            <PiCheckCircleBold />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Hoàn thành</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.missionsCompleted || 0}</p>
          <p className="text-xs mt-2 text-emerald-300">
            +{Math.min(3, stats?.missionsCompleted || 0)} tuần này
          </p>
        </Card>

        {/* Missions In Progress */}
        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <div className="text-2xl mb-2 text-cyan-400">
            <PiSpinnerGapBold />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Đang thực hiện</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.missionsInProgress || 0}</p>
          <p className="text-xs mt-2 text-cyan-300">nhiệm vụ đang chạy</p>
        </Card>

        {/* Missions Failed */}
        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <div className="text-2xl mb-2 text-red-400">
            <PiXCircleBold />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Thất bại</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.missionsFailed || 0}</p>
          <p className="text-xs mt-2 text-red-300">cần cải thiện</p>
        </Card>

        {/* Team Members */}
        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <div className="text-2xl mb-2 text-violet-400">
            <PiUsersThreeBold />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Thành viên</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.memberCount || 0}</p>
          <p className="text-xs mt-2 text-violet-300">
            {stats?.activeMemberCount || 0} đang hoạt động
          </p>
        </Card>
      </section>

      {/* Chart and People Rescued Section */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Rescue Chart - takes 3 columns on xl */}
        <div className="xl:col-span-3">
          <RescueChart
            trends={trends}
            loading={loading}
            onPeriodChange={setPeriod}
            currentPeriod={period}
          />
        </div>

        {/* People Rescued KPI - takes 1 column on xl */}
        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <div className="text-2xl mb-2 text-amber-400">
            <PiUsersBold />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Người được cứu</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.peopleRescued || 0}</p>
          <p className="text-xs mt-2 text-amber-300">
            +{Math.min(14, stats?.peopleRescued || 0)} tuần này
          </p>
        </Card>
      </section>

      {/* Team Info Section */}
      {stats && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            padding="none"
            className="bg-white/10 border border-white/20 rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📋 Thông tin đội
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Tên đội:</span>
                <span className="text-white font-medium">{stats.teamName}</span>
              </div>
              {stats.teamLeader && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Đội trưởng:</span>
                  <span className="text-white font-medium">{stats.teamLeader.displayName}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Thành viên:</span>
                <span className="text-white font-medium">
                  {stats.memberCount} người ({stats.activeMemberCount} đang hoạt động)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Tổng nhiệm vụ:</span>
                <span className="text-white font-medium">{stats.totalMissions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Tỷ lệ thành công:</span>
                <span className="text-emerald-400 font-medium">{stats.successRate}%</span>
              </div>
            </div>
          </Card>

          {/* Performance Summary */}
          <Card
            padding="none"
            className="bg-white/10 border border-white/20 rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📈 Tóm tắt hiệu suất
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Nhiệm vụ hoàn thành:</span>
                <span className="text-emerald-400 font-medium">{stats.missionsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Người được cứu:</span>
                <span className="text-amber-400 font-medium">{stats.peopleRescued}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Đánh giá:</span>
                <span className={`font-medium ${
                  stats.successRate >= 80 ? 'text-emerald-400' :
                  stats.successRate >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {stats.successRate >= 80 ? 'Xuất sắc' :
                   stats.successRate >= 60 ? 'Tốt' : 'Cần cải thiện'}
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
