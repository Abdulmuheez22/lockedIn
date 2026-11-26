import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
} from "lucide-react";
import { fetchDpfAnalytics } from "../../services/api.services.js";

const timeRanges = [
  //   { value: "7d", label: "7 days", days: 7 },
  //   { value: "30d", label: "30 days", days: 30 },
  //   { value: "all", label: "All time", days: null },
];

const dateKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const shiftDateKey = (key, days) => {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
};

const getTodayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const formatDuration = (minutes) => {
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainder = totalMinutes % 60;

  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${remainder}m`;
};

const formatDay = (key, options = { weekday: "short" }) =>
  new Intl.DateTimeFormat("en", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));

const getCurrentStreak = (entries) => {
  const dates = new Set(entries.map((entry) => entry.entryDate));
  let currentDate = getTodayKey();

  if (!dates.has(currentDate)) currentDate = shiftDateKey(currentDate, -1);

  let streak = 0;
  while (dates.has(currentDate)) {
    streak += 1;
    currentDate = shiftDateKey(currentDate, -1);
  }
  return streak;
};

const getValueCounts = (entries, field, isArray = false) => {
  const counts = new Map();

  entries.forEach((entry) => {
    const rawValues = entry[field];
    const values = isArray
      ? [...new Set(Array.isArray(rawValues) ? rawValues : [])]
      : [rawValues];

    values.filter(Boolean).forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
  });

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: total ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const getStudyChartData = (entries, range) => {
  if (range === "all") {
    const totalsByMonth = new Map();
    entries.forEach((entry) => {
      const month = entry.entryDate.slice(0, 7);
      totalsByMonth.set(
        month,
        (totalsByMonth.get(month) ?? 0) + entry.studyMinutes,
      );
    });

    return [...totalsByMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, minutes]) => ({
        key: month,
        label: formatDay(`${month}-01`, { month: "short" }),
        hours: minutes / 60,
      }));
  }

  const days = timeRanges.find((item) => item.value === range)?.days ?? 30;
  const today = getTodayKey();
  const minutesByDate = new Map(
    entries.map((entry) => [entry.entryDate, entry.studyMinutes]),
  );

  return Array.from({ length: days }, (_, index) => {
    const key = shiftDateKey(today, index - days + 1);
    return {
      key,
      label:
        days === 7
          ? formatDay(key)
          : new Date(`${key}T00:00:00Z`).getUTCDate().toString(),
      hours: (minutesByDate.get(key) ?? 0) / 60,
    };
  });
};

function MetricCard({ title, value, caption, icon }) {
  return (
    <div className="group rounded-3xl border border-[#eaeaea] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#737373]">{title}</p>
        <span className="rounded-xl bg-[#f5f5f5] p-2 text-[#0a0a0a] transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-[#0a0a0a]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#737373]">{caption}</p>
    </div>
  );
}

function DistributionPanel({ title, subtitle, items, emptyText }) {
  return (
    <section className="rounded-3xl border border-[#eaeaea] bg-white p-5 sm:p-7 shadow-xs">
      <div className="mb-5">
        <h3 className="text-base font-bold tracking-tight text-[#0a0a0a]">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-xs text-[#737373]">{subtitle}</p>}
      </div>
      {items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#0a0a0a]">
                  {item.label}
                </span>
                <span className="shrink-0 text-[#737373]">
                  {item.count} {item.count === 1 ? "entry" : "entries"} ·{" "}
                  {Math.round(item.percent)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-[#0a0a0a]"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#737373]">{emptyText}</p>
      )}
    </section>
  );
}

export default function MemberAnalyticsDashboard({ userData }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchDpfAnalytics();
        if (isMounted) {
          setEntries(Array.isArray(response?.entries) ? response.entries : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load your DPF analytics.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const range = timeRanges.find((item) => item.value === timeRange);
  const cutoffDate = range?.days
    ? shiftDateKey(getTodayKey(), -(range.days - 1))
    : null;
  const filteredEntries = entries.filter(
    (entry) => !cutoffDate || entry.entryDate >= cutoffDate,
  );
  const totalMinutes = filteredEntries.reduce(
    (total, entry) => total + entry.studyMinutes,
    0,
  );
  const averageMinutes = filteredEntries.length
    ? totalMinutes / filteredEntries.length
    : 0;
  const currentStreak = getCurrentStreak(entries);
  const studyChartData = getStudyChartData(filteredEntries, timeRange);
  const maxStudyHours = Math.max(
    1,
    ...studyChartData.map((item) => item.hours),
  );
  const courses = getValueCounts(filteredEntries, "coursesStudied", true).slice(
    0,
    6,
  );
  const challenges = getValueCounts(filteredEntries, "challengeFaced");
  const methods = getValueCounts(filteredEntries, "studyMethods", true);
  const techniques = getValueCounts(
    filteredEntries,
    "studyTechniques",
    true,
  ).slice(0, 6);
  const focusLevels = getValueCounts(filteredEntries, "focusLevel");
  const emotionalStates = getValueCounts(filteredEntries, "emotionalState");
  const understandingLevels = getValueCounts(filteredEntries, "understanding");
  const recentEntries = [...filteredEntries]
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-[#eaeaea] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          {/* <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#737373]">
            Member insights & analytics
          </p> */}
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0a0a0a]">
            {/* {userData?.fullname || "Member"}&apos; */}
            Member insights & analytics{" "}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            {[userData?.department, userData?.level]
              .filter(Boolean)
              .join(" · ") ||
              "Study and reflection metrics from your submitted DPFs"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
          {timeRanges.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeRange(item.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                timeRange === item.value
                  ? "bg-[#0a0a0a] text-white shadow-xs"
                  : "text-[#737373] hover:text-[#0a0a0a]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-2 font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="rounded-3xl border border-[#eaeaea] bg-white px-6 py-16 text-center text-sm text-[#737373]"
        >
          Loading your DPF analytics...
        </div>
      ) : error ? null : entries.length === 0 ? (
        <div className="rounded-3xl border border-[#eaeaea] bg-white px-6 py-16 text-center">
          <BarChart3 className="mx-auto h-9 w-9 text-[#a3a3a3]" />
          <h3 className="mt-4 text-base font-bold text-[#0a0a0a]">
            No DPF data yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#737373]">
            Submit a Daily Performance Form to start seeing your study-time
            averages, topic trends, study methods, and reflections here.
          </p>
        </div>
      ) : (
        <>
          {filteredEntries.length === 0 && (
            <p className="rounded-2xl border border-[#eaeaea] bg-white p-4 text-sm text-[#737373]">
              No DPF entries were submitted in this period. Choose another range
              to review your saved analytics.
            </p>
          )}

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              {
                title: "Average study time",
                value: formatDuration(averageMinutes),
                caption: "Per submitted DPF",
                icon: <Clock className="h-4 w-4" />,
              },
              {
                title: "Total study time",
                value: formatDuration(totalMinutes),
                caption: `Across ${filteredEntries.length} ${
                  filteredEntries.length === 1 ? "entry" : "entries"
                } in this period`,
                icon: <BookOpen className="h-4 w-4" />,
              },
              {
                title: "DPF entries",
                value: filteredEntries.length,
                caption: range?.label ?? "All time",
                icon: <CheckCircle2 className="h-4 w-4" />,
              },
              {
                title: "Current streak",
                value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`,
                caption: "Consecutive logged days",
                icon: <Flame className="h-4 w-4" />,
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, delay: index * 0.03 },
                  },
                }}
              >
                <MetricCard {...metric} />
              </motion.div>
            ))}
          </motion.div>

          <section className="rounded-3xl border border-[#eaeaea] bg-white p-5 shadow-xs sm:p-7">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#0a0a0a]">
                  Study time trend
                </h3>
                <p className="mt-1 text-xs text-[#737373]">
                  {timeRange === "all"
                    ? "Monthly hours recorded in your DPFs (latest 12 months)"
                    : `Daily hours recorded in your DPFs (${range?.label})`}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#737373]">
                Average per entry: {formatDuration(averageMinutes)}
              </span>
            </div>
            <div className="flex h-56 items-end gap-1 border-b border-[#f0f0f0] px-1 sm:gap-2">
              {studyChartData.map((item) => (
                <div
                  key={item.key}
                  title={`${item.key}: ${item.hours.toFixed(1)} hours`}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: item.hours
                        ? `${Math.max((item.hours / maxStudyHours) * 100, 3)}%`
                        : "0%",
                    }}
                    transition={{ duration: 0.45 }}
                    className={`w-full rounded-t-md ${
                      item.hours
                        ? "bg-[#0a0a0a] group-hover:bg-[#404040]"
                        : "bg-transparent"
                    }`}
                  />
                  <span className="mt-2 truncate text-[10px] font-medium text-[#737373]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-right text-[11px] text-[#737373]">
              {timeRange === "all" ? "Hours per month" : "Hours per day"}
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DistributionPanel
              title="Most studied courses and topics"
              subtitle="Counted by the number of DPFs that mention each topic."
              items={courses}
              emptyText="No course or topic tags in this period."
            />
            <DistributionPanel
              title="Challenges reported"
              subtitle="Challenges selected in submitted DPFs."
              items={challenges}
              emptyText="No challenges reported in this period."
            />
            <DistributionPanel
              title="Study methods"
              subtitle="Methods selected across your DPF entries."
              items={methods}
              emptyText="No study methods recorded in this period."
            />
            <DistributionPanel
              title="Study techniques"
              subtitle="Techniques selected across your DPF entries."
              items={techniques}
              emptyText="No study techniques recorded in this period."
            />
          </div>

          <section className="rounded-3xl border border-[#eaeaea] bg-white p-5 shadow-xs sm:p-7">
            <div className="mb-5">
              <h3 className="text-base font-bold tracking-tight text-[#0a0a0a]">
                Focus, mood, and understanding
              </h3>
              <p className="mt-1 text-xs text-[#737373]">
                Self-reported check-ins from your DPF entries.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DistributionPanel
                title="Focus level"
                subtitle=""
                items={focusLevels}
                emptyText="No focus check-ins."
              />
              <DistributionPanel
                title="Emotional state"
                subtitle=""
                items={emotionalStates}
                emptyText="No emotional check-ins."
              />
              <DistributionPanel
                title="Understanding"
                subtitle=""
                items={understandingLevels}
                emptyText="No understanding check-ins."
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
