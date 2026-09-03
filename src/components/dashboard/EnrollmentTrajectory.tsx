"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export interface EnrollmentPoint {
  date: string
  enrolled: number
  target: number
}

interface EnrollmentTrajectoryProps {
  data: EnrollmentPoint[]
  target: number
}

export function EnrollmentTrajectory({ data, target }: EnrollmentTrajectoryProps) {
  const currentTotal = data.length > 0 ? data[data.length - 1].enrolled : 0
  const progressPercent = target > 0 ? Math.round((currentTotal / target) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#25231F]">Enrollment Progress & Trajectory</h2>
          <p className="text-[11px] text-[#6B6355]">Cumulative subject accrual against planned targets</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#25231F]">{currentTotal}</span>
          <span className="text-xs text-[#6B6355]"> / {target} ({progressPercent}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFD3] h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-[#2D5A27] h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>

      {/* Recharts Curve */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6B6355"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5DFD3' }}
            />
            <YAxis
              stroke="#6B6355"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5DFD3' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FCFAF7',
                border: '1px solid #E5DFD3',
                borderRadius: '0.5rem',
                fontSize: '11px',
                color: '#25231F',
              }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#C87D0E"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Target"
            />
            <Line
              type="monotone"
              dataKey="enrolled"
              stroke="#2D5A27"
              strokeWidth={2.5}
              dot={{ fill: '#2D5A27', r: 4 }}
              activeDot={{ r: 6 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EnrollmentTrajectory