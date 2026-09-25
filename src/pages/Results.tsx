import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Award, CircleCheck as CheckCircle2, Circle as XCircle, CircleMinus as MinusCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, EmptyState } from '../components/States'
import { getResults, getWeakTopics } from '../services/api'
import type { QuizResult, WeakTopic } from '../types'

export function Results() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])

  useEffect(() => {
    Promise.all([getResults(), getWeakTopics()]).then(([data, topicData]) => {
      setResults(data)
      setWeakTopics(topicData)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner message="Loading results..." />

  if (results.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Award} title="No quiz results yet" description="Take an adaptive quiz to see your results and analytical breakdown here." />
      </div>
    )
  }

  const result = results[selectedIdx]

  const summaryStats = [
    { label: 'Overall Score', value: `${result.score}%`, icon: Award, color: 'text-[#606C38] bg-[#606C38]/15 border border-[#606C38]/30' },
    { label: 'Correct Answers', value: result.correct, icon: CheckCircle2, color: 'text-[#606C38] bg-[#606C38]/15 border border-[#606C38]/30' },
    { label: 'Incorrect Answers', value: result.wrong, icon: XCircle, color: 'text-[#BC6C25] bg-[#BC6C25]/15 border border-[#BC6C25]/30' },
    { label: 'Skipped Items', value: result.skipped, icon: MinusCircle, color: 'text-[#DDA15E] bg-[#DDA15E]/20 border border-[#DDA15E]/40' },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Results & Analytics" subtitle="Score history, cognitive taxonomy breakdown, weak topics, and remedial advice" />

      {/* Current selected quiz summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3.5">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#606C38] uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-[#283618] mt-0.5">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completed quiz history */}
      <div className="card">
        <h3 className="font-bold text-[#283618] text-base mb-4 pb-2 border-b border-[#E8E2C8]">Completed Quiz History</h3>
        <div className="space-y-2.5">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedIdx(i)}
              className={`w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                i === selectedIdx
                  ? 'border-[#606C38] bg-[#606C38]/10 text-[#283618] font-bold shadow-sm'
                  : 'border-[#E8E2C8] bg-white text-[#283618] hover:border-[#DDA15E] hover:bg-[#FEFAE0]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-lg bg-[#283618] text-[#FEFAE0] flex items-center justify-center text-xs font-bold">
                  {results.length - i}
                </span>
                <span className="font-bold text-sm text-[#283618]">Quiz Session</span>
              </div>
              <span className="font-extrabold text-sm text-[#606C38] bg-[#606C38]/10 px-2.5 py-0.5 rounded-lg border border-[#606C38]/20">{r.score}% Score</span>
              <span className="text-xs text-[#8C8F7A] font-medium">{new Date(r.date).toLocaleDateString()}</span>
              <span className="text-xs text-[#BC6C25] font-semibold">{r.timeTaken}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weak Topics */}
      <div className="card">
        <h3 className="font-bold text-[#283618] text-base mb-4 pb-2 border-b border-[#E8E2C8]">Diagnosed Weak Topics</h3>
        {weakTopics.length === 0 ? (
          <p className="text-sm text-[#606C38]">Complete more quizzes to identify topics that need targeted practice.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {weakTopics.map((topic) => (
              <div key={`${topic.subject}-${topic.topic}`} className="p-3 bg-[#FEFAE0]/40 border border-[#E8E2C8] rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#283618] truncate">{topic.topic}</span>
                  <span className="text-xs font-extrabold text-[#BC6C25]">{topic.averageScore}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-[#E8E2C8]">
                  <div className="h-full bg-gradient-to-r from-[#DDA15E] to-[#BC6C25] rounded-full" style={{ width: `${topic.averageScore}%` }} />
                </div>
                <p className="text-[10px] text-[#606C38] mt-1.5 font-semibold">{topic.subject}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Topic performance */}
        <div className="card">
          <h3 className="font-bold text-[#283618] text-base mb-4 pb-2 border-b border-[#E8E2C8]">Topic Mastery Breakdown</h3>
          {result.topicPerformance.length === 0 ? (
            <p className="py-24 text-center text-xs text-[#606C38]">No topic data recorded for this session.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.topicPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2C8" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#606C38' }} stroke="#DDA15E" />
                  <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: '#283618' }} stroke="#DDA15E" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#283618', borderColor: '#606C38', borderRadius: '12px', color: '#FEFAE0', fontSize: '12px' }} />
                  <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                    {result.topicPerformance.map((entry, idx) => (
                      <Cell key={idx} fill={entry.percentage >= 70 ? '#606C38' : entry.percentage >= 50 ? '#DDA15E' : '#BC6C25'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Difficulty performance */}
        <div className="card">
          <h3 className="font-bold text-[#283618] text-base mb-4 pb-2 border-b border-[#E8E2C8]">Difficulty Performance</h3>
          {result.difficultyPerformance.length === 0 ? (
            <p className="py-24 text-center text-xs text-[#606C38]">No difficulty data recorded for this session.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.difficultyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2C8" />
                  <XAxis dataKey="difficulty" tick={{ fontSize: 11, fill: '#283618', fontWeight: 600 }} stroke="#DDA15E" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#606C38' }} stroke="#DDA15E" />
                  <Tooltip contentStyle={{ backgroundColor: '#283618', borderColor: '#606C38', borderRadius: '12px', color: '#FEFAE0', fontSize: '12px' }} />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="#606C38" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bloom performance */}
      <div className="card">
        <h3 className="font-bold text-[#283618] text-base mb-4 pb-2 border-b border-[#E8E2C8]">Bloom's Taxonomy Performance</h3>
        {result.bloomPerformance.length === 0 ? (
          <p className="py-20 text-center text-xs text-[#606C38]">No Bloom level data recorded for this session.</p>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.bloomPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2C8" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#283618', fontWeight: 600 }} stroke="#DDA15E" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#606C38' }} stroke="#DDA15E" />
                <Tooltip contentStyle={{ backgroundColor: '#283618', borderColor: '#606C38', borderRadius: '12px', color: '#FEFAE0', fontSize: '12px' }} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="#BC6C25" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#E8E2C8]">
          <TrendingUp className="h-5 w-5 text-[#BC6C25]" />
          <h3 className="font-bold text-[#283618] text-base">Recommended Practice &amp; Next Steps</h3>
        </div>
        <div className="space-y-2.5">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-[#FEFAE0] rounded-xl border border-[#DDA15E]/40">
              <Lightbulb className="h-4 w-4 text-[#BC6C25] shrink-0 mt-0.5" />
              <p className="text-xs text-[#283618] font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
