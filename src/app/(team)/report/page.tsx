"use client";

import { Card } from "@/shared/ui/components";

const KPI_ITEMS = [
  {
    icon: "✅",
    label: "Missions Completed",
    value: "18",
    hint: "+3 this week",
    hintClass: "text-emerald-300",
  },
  {
    icon: "🙋",
    label: "People Rescued",
    value: "126",
    hint: "+14 this week",
    hintClass: "text-cyan-300",
  },
  {
    icon: "📦",
    label: "Supplies Delivered",
    value: "2,340",
    hint: "units delivered",
    hintClass: "text-amber-300",
  },
  {
    icon: "⏱️",
    label: "Avg Response Time",
    value: "42m",
    hint: "target < 45m",
    hintClass: "text-violet-300",
  },
];

const TREND_ITEMS = [
  { day: "Mon", completed: 2, rescued: 11 },
  { day: "Tue", completed: 3, rescued: 18 },
  { day: "Wed", completed: 1, rescued: 6 },
  { day: "Thu", completed: 4, rescued: 29 },
  { day: "Fri", completed: 3, rescued: 21 },
  { day: "Sat", completed: 2, rescued: 13 },
  { day: "Sun", completed: 3, rescued: 28 },
];

const TOP_PERFORMERS = [
  { name: "Team Alpha", missions: 6, rescued: 41, rating: "A+" },
  { name: "Team Delta", missions: 5, rescued: 34, rating: "A" },
  { name: "Team Bravo", missions: 4, rescued: 27, rating: "A" },
  { name: "Team Echo", missions: 3, rescued: 19, rating: "B+" },
];

export default function TeamReportPage() {
  return (
    <div className="relative z-10 p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">📊 Team Report</h1>
          <p className="text-sm text-gray-300 mt-1">
            Snapshot hiệu suất cứu hộ và cứu trợ của đội trong 7 ngày gần nhất.
          </p>
        </div>
        <div className="text-xs text-gray-300 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
          Last updated: Today 08:30
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_ITEMS.map((item) => (
          <Card
            key={item.label}
            padding="none"
            className="bg-white/10 border border-white/20 rounded-2xl p-5"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-xs uppercase tracking-wide text-gray-300">{item.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{item.value}</p>
            <p className={`text-xs mt-2 ${item.hintClass}`}>{item.hint}</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          padding="none"
          className="xl:col-span-2 bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold text-white">📈 Weekly Trend</h2>
          <p className="text-xs text-gray-300 mb-4">
            Placeholder chart data để chuẩn bị cho dashboard analytics.
          </p>
          <div className="space-y-2">
            {TREND_ITEMS.map((item) => (
              <div
                key={item.day}
                className="grid grid-cols-[52px_1fr_1fr] items-center gap-2 text-xs"
              >
                <span className="text-gray-300">{item.day}</span>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md px-2 py-1 text-cyan-200">
                  Missions: {item.completed}
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md px-2 py-1 text-emerald-200">
                  Rescued: {item.rescued}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          padding="none"
          className="bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold text-white">🏅 Top Performers</h2>
          <p className="text-xs text-gray-300 mb-4">Mock ranking theo tuần</p>
          <div className="space-y-2">
            {TOP_PERFORMERS.map((team, index) => (
              <div
                key={team.name}
                className="rounded-lg border border-white/20 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-white font-semibold">
                    #{index + 1} {team.name}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/20">
                    {team.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  {team.missions} missions • {team.rescued} rescued
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
