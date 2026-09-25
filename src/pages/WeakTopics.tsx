import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  TrendingDown,
  BookOpen,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, EmptyState } from '../components/States'
import { getWeakTopics } from '../services/api'
import type { WeakTopic } from '../types'

export function WeakTopics() {
  const [topics, setTopics] = useState<WeakTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeakTopics().then((data) => {
      setTopics(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner message="Analyzing your weak areas..." />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Weak Topics"
        subtitle="Topics that need your attention based on quiz performance"
      />

      {topics.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No weak topics detected"
            description="Take more quizzes to identify areas for improvement."
          />
        </div>
      ) : (
        <>
          {/* Summary banner */}
          <div className="card mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{topics.length} topics need improvement</p>
                <p className="text-sm text-slate-600">Focus on these areas to boost your overall score</p>
              </div>
            </div>
          </div>

          {/* Weak topic cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div key={topic.topic} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{topic.topic}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <BookOpen className="h-3 w-3" /> {topic.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      topic.averageScore < 40 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {topic.averageScore}%
                    </p>
                    <p className="text-[10px] text-slate-400">{topic.attempts} attempts</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.averageScore < 40 ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${topic.averageScore}%` }}
                  />
                </div>

                {/* Recommendation */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{topic.recommendedAction}</p>
                  </div>
                </div>

                {/* Action */}
                <Link
                  to="/adaptive-quiz"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-brand-200 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition"
                >
                  Practice Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
