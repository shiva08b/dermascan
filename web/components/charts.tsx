'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScanRecord } from '@/lib/types'
import { formatShortDate, scoreToSeverity, severityToScore } from '@/lib/app-data'

interface ProgressChartProps {
  scans: ScanRecord[]
}

export function ProgressChart({ scans }: ProgressChartProps) {
  const data = [...scans]
    .reverse()
    .map((scan) => ({
      date: formatShortDate(scan.created_at),
      severity: severityToScore(scan.severity),
      confidence: Number((scan.confidence * 100).toFixed(1)),
    }))

  if (!data.length) {
    return <div className="empty-state">No scans yet. Your trend line appears after the first analysis.</div>
  }

  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d47d57" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#d47d57" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#90857f', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 0.75, 1.5, 2.25, 3]}
            tick={{ fill: '#90857f', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(212,125,87,0.5)', strokeDasharray: '4 4' }}
            contentStyle={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 0,
            }}
            formatter={(value, name) => {
              if (name === 'severity') {
                return [scoreToSeverity(Number(value)), 'Severity']
              }
              return [value, name]
            }}
          />
          <Area
            type="monotone"
            dataKey="severity"
            stroke="#d47d57"
            strokeWidth={2}
            fill="url(#severityGradient)"
            dot={{ fill: '#d47d57', strokeWidth: 0, r: 3 }}
            activeDot={{ fill: '#f2eee8', stroke: '#d47d57', strokeWidth: 2, r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
