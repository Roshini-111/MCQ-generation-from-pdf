import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import { useEffect, useState } from 'react'
import { Layers, Brain, TrendingUp, BookOpen } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { getBloomPerformance } from '../services/api'

const bloomDescriptions = [
  {
    level: 'Remember',
    desc: 'Recall facts, terms, and basic concepts',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    level: 'Understand',
    desc: 'Explain ideas or concepts',
    icon: Brain,
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    level: 'Apply',
    desc: 'Use information in new situations',
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600',
  },
  {
    level: 'Analyze',
    desc: 'Draw connections among ideas',
    icon: Layers,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    level: 'Evaluate',
    desc: 'Justify a stand or decision',
    icon: TrendingUp,
    color: 'bg-red-50 text-red-600',
  },
]

export function BloomsTaxonomy() {
  const [bloomData, setBloomData] = useState<Array<{ level: string; score: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBloomPerformance().then((data) => {
      setBloomData(data)
      setLoading(false)
    })
  }, [])

  const avgScore = bloomData.length
    ? Math.round(bloomData.reduce((s, b) => s + b.score, 0) / bloomData.length)
    : 0

  const strongestLevel = bloomData.length
    ? bloomData.reduce((max, b) => (b.score > max.score ? b : max)).level
    : 'N/A'

  const weakestLevel = bloomData.length
    ? bloomData.reduce((min, b) => (b.score < min.score ? b : min)).level
    : 'N/A'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bloom's Taxonomy"
        subtitle="Performance across cognitive learning levels"
      />

      {loading ? (
        <div className="card">
          <div className="h-5 w-40 shimmer rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 shimmer rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-slate-500">Average Bloom Score</p>
              <p className="text-3xl font-bold text-brand-600 mt-1">{avgScore}%</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Strongest Level</p>
              <p className="text-xl font-bold text-green-600 mt-1">{strongestLevel}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Weakest Level</p>
              <p className="text-xl font-bold text-red-600 mt-1">{weakestLevel}</p>
            </div>
          </div>

          {bloomData.length === 0 ? (
            <div className="card">
              <p className="text-sm text-slate-500">No bloom performance data available yet. Complete a quiz to generate insights.</p>
            </div>
          ) : (
            <>
              <div className="card mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Bloom's Taxonomy Radar</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={bloomData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="level" tick={{ fontSize: 12, fontWeight: 500 }} stroke="#475569" />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="card mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Level-wise Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bloomData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {bloomData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.score >= 70 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {bloomDescriptions.map((item) => {
                  const data = bloomData.find((b) => b.level === item.level)
                  const Icon = item.icon
                  return (
                    <div key={item.level} className="card">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.level}</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">{item.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Score</span>
                        <span className={`text-sm font-bold ${
                          (data?.score || 0) >= 70 ? 'text-green-600' : (data?.score || 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {data?.score || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${
                            (data?.score || 0) >= 70 ? 'bg-green-400' : (data?.score || 0) >= 50 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${data?.score || 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
