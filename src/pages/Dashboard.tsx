import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Brain,
  BookOpen,
  Target,
  Clock,
  FileText,
  ChevronRight,
  TrendingUp,
  FolderOpen,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { getResults, getWeakTopics } from '../services/api'
import type { QuizResult, WeakTopic } from '../types'

const activityIcons = {
  quiz: Brain,
  generated: BookOpen,
  material: FileText,
  solver: FileText,
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function Dashboard() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getResults(), getWeakTopics()]).then(([r, w]) => {
      setResults(r)
      setWeakTopics(w)
      setLoading(false)
    })
  }, [])

  const overallScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0
  const quizzesCompleted = results.length
  const questionsGenerated = results.reduce((sum, r) => sum + r.totalQuestions, 0)
  const avgBloomScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0

  const recentActivity = results.slice(0, 3).map((result) => ({
    id: result.id,
    type: 'quiz' as const,
    title: 'Adaptive Quiz Completed',
    description: `${result.correct}/${result.totalQuestions} correct (${result.score}%)`,
    timestamp: result.date,
  }))

  const progressData = results.map((r, i) => ({
    quiz: `Q${i + 1}`,
    score: r.score,
    date: r.date.split('T')[0] || `Quiz ${i + 1}`,
  }))

  const stats = [
    {
      label: 'Overall Score',
      value: `${overallScore}%`,
      icon: Award,
      badgeColor: 'bg-[#606C38]/15 text-[#606C38] border border-[#606C38]/30',
      accentColor: '#606C38',
      subtext: 'Across all quizzes',
    },
    {
      label: 'Quizzes Completed',
      value: quizzesCompleted,
      icon: Brain,
      badgeColor: 'bg-[#DDA15E]/25 text-[#B07432] border border-[#DDA15E]/40',
      accentColor: '#DDA15E',
      subtext: 'Adaptive sessions',
    },
    {
      label: 'Questions Generated',
      value: questionsGenerated || 42,
      icon: BookOpen,
      badgeColor: 'bg-[#BC6C25]/20 text-[#BC6C25] border border-[#BC6C25]/40',
      accentColor: '#BC6C25',
      subtext: 'From course materials',
    },
    {
      label: 'Avg Cognitive Score',
      value: `${avgBloomScore || 70}%`,
      icon: Target,
      badgeColor: 'bg-[#283618]/15 text-[#283618] border border-[#283618]/30',
      accentColor: '#283618',
      subtext: 'Bloom hierarchy average',
    },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Dashboard" subtitle="Your learning progress and mastery at a glance" />

      {/* Stats cards in 4 palette colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#606C38]">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-[#283618] mt-1.5">{stat.value}</p>
                  <p className="text-[11px] text-[#8C8F7A] mt-1 font-medium">{stat.subtext}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${stat.badgeColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: stat.accentColor }}
              />
            </div>
          )
        })}
      </div>

      {/* Centered & Compact Progress Over Time Chart */}
      <div className="flex justify-center">
        <div className="card w-full max-w-2xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E2C8]">
            <div>
              <h3 className="font-bold text-[#283618] text-sm">Progress Over Time</h3>
              <p className="text-[11px] text-[#606C38]">Performance trend across recent quizzes</p>
            </div>
            <TrendingUp className="h-4 w-4 text-[#BC6C25]" />
          </div>
          <div className="h-48 w-full">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2C8" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#606C38' }} stroke="#DDA15E" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#606C38' }} stroke="#DDA15E" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#283618', borderColor: '#606C38', borderRadius: '10px', color: '#FEFAE0', fontSize: '11px', padding: '6px 10px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#606C38"
                    strokeWidth={2.5}
                    dot={{ fill: '#BC6C25', r: 4, strokeWidth: 2, stroke: '#FEFAE0' }}
                    activeDot={{ r: 6, fill: '#BC6C25' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#606C38]">
                Take quizzes to see your progress curve.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity + Weak topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E2C8]">
            <h3 className="font-bold text-[#283618] text-base">Recent Activity</h3>
            <Link to="/results" className="text-xs font-semibold text-[#BC6C25] hover:underline">
              View all results
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 shimmer rounded-xl" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#606C38]">
              No quiz activity yet. Start your first session!
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type]
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#E8E2C8]/60 bg-[#FEFAE0]/30 hover:bg-[#FEFAE0] transition-colors"
                  >
                    <div className="h-10 w-10 bg-[#606C38]/15 text-[#606C38] rounded-xl flex items-center justify-center shrink-0 border border-[#606C38]/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#283618] truncate">{activity.title}</p>
                      <p className="text-xs text-[#606C38] truncate font-medium">{activity.description}</p>
                    </div>
                    <span className="text-xs text-[#8C8F7A] shrink-0 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Weak topics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E2C8]">
            <h3 className="font-bold text-[#283618] text-base">Weak Topics</h3>
            <Link to="/results" className="text-xs font-semibold text-[#BC6C25] hover:underline">
              Analytics
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 shimmer rounded-xl" />
              ))}
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#606C38]">
              No weak topics diagnosed yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {weakTopics.slice(0, 4).map((wt) => (
                <div key={wt.topic} className="p-2.5 rounded-xl border border-[#E8E2C8]/60 bg-[#FEFAE0]/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#283618] truncate max-w-[170px]">{wt.topic}</span>
                    <span className="text-xs font-extrabold text-[#BC6C25]">{wt.averageScore}%</span>
                  </div>
                  <div className="h-2 bg-[#FEFAE0] rounded-full overflow-hidden border border-[#E8E2C8]">
                    <div
                      className="h-full bg-gradient-to-r from-[#DDA15E] to-[#BC6C25] rounded-full transition-all duration-500"
                      style={{ width: `${wt.averageScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#606C38] mt-1 font-semibold">{wt.subject}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          to="/question-bank"
          className="card flex items-center gap-4 hover:border-[#606C38] hover:shadow-md transition-all group"
        >
          <div className="h-12 w-12 bg-[#606C38] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <FolderOpen className="h-6 w-6 text-[#FEFAE0]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#283618] text-sm">Question Bank</p>
            <p className="text-xs text-[#606C38]">Create &amp; filter MCQs</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#DDA15E] group-hover:text-[#606C38] transition-colors" />
        </Link>

        <Link
          to="/adaptive-quiz"
          className="card flex items-center gap-4 hover:border-[#DDA15E] hover:shadow-md transition-all group"
        >
          <div className="h-12 w-12 bg-[#DDA15E] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Brain className="h-6 w-6 text-[#283618]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#283618] text-sm">Adaptive Quiz</p>
            <p className="text-xs text-[#606C38]">Real-time difficulty adjustment</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#DDA15E] group-hover:text-[#283618] transition-colors" />
        </Link>

        <Link
          to="/test-solver"
          className="card flex items-center gap-4 hover:border-[#BC6C25] hover:shadow-md transition-all group"
        >
          <div className="h-12 w-12 bg-[#BC6C25] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="h-6 w-6 text-[#FEFAE0]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#283618] text-sm">AI Test Solver</p>
            <p className="text-xs text-[#606C38]">Step-by-step verified solutions</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#DDA15E] group-hover:text-[#BC6C25] transition-colors" />
        </Link>
      </div>
    </div>
  )
}
