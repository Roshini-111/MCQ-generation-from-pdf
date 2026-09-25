import { useEffect, useState } from 'react'
import { TrendingUp, Target, BookOpen, AlertCircle } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { getResults, getWeakTopics } from '../services/api'
import type { QuizResult, WeakTopic } from '../types'

export function Analytics() {
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

  const averageScore = results.length
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0

  const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0)
  const strongestTopic = weakTopics.length ? weakTopics[0]?.topic ?? 'N/A' : 'N/A'

  return (
    <div className="animate-fade-in">
      <PageHeader title="Analytics" subtitle="Deep insights into your learning patterns and performance" />

      {loading ? (
        <div className="card">
          <div className="h-5 w-40 shimmer rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 shimmer rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-3 text-brand-600">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Average Score</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{averageScore}%</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3 text-brand-600">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Questions Attempted</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalQuestions}</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3 text-brand-600">
                <Target className="h-5 w-5" />
                <span className="font-medium">Focus Topic</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{strongestTopic}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-brand-600" />
              <h3 className="font-semibold text-slate-900">Weak Topics</h3>
            </div>

            {weakTopics.length === 0 ? (
              <p className="text-sm text-slate-500">No weak topic data yet. Complete a quiz to unlock learning insights.</p>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((topic) => (
                  <div key={topic.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{topic.topic}</span>
                      <span className="text-sm font-semibold text-red-600">{topic.averageScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${topic.averageScore}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{topic.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
