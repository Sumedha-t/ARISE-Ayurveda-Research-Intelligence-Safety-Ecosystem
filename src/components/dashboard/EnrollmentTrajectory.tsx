"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export type EnrollmentPoint = {
  /** ISO date string, e.g. from trial_subjects.screening_date. */
  date: string;
  /** Cumulative enrolled count as of this date. */
  enrolled: number;
};

export type EnrollmentTrajectoryProps = {
  /** Cumulative enrollment series, one point per screening date. */
  data: EnrollmentPoint[];
  /** Portfolio-wide (or single-study) target enrolment. */
  target: number;
};

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function EnrollmentTrajectory({ data, target }: EnrollmentTrajectoryProps) {
  const current = data.length > 0 ? data[data.length - 1].enrolled : 0;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  // Flatten the target into the same series so a second flat Line can be
  // drawn against it, without reaching for ReferenceLine/Legend (kept to the
  // exact Recharts export list from the Milestone 4 brief).
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
    target,
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Enrollment Progress &amp; Trajectory
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {current} / {target} ({pct}%)
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Line
              type="monotone"
              dataKey="enrolled"
              name="Enrolled"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 3, fill: "#34d399" }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EnrollmentTrajectory;
