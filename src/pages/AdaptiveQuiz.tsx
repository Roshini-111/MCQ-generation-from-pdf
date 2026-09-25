import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Clock, ChevronLeft, ChevronRight, Flag, CircleCheck as CheckCircle2, Play, ArrowLeft } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, EmptyState, ErrorState } from '../components/States'
import { DifficultyBadge } from '../components/Badge'
import { getMaterials, getQuizQuestions, submitQuiz } from '../services/api'
import type { Material, Question, QuizResult } from '../types'

export function AdaptiveQuiz() {
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'submitting' | 'complete'>('setup')
  const [materialId, setMaterialId] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [count, setCount] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completedResult, setCompletedResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    getMaterials().then((data) => {
      setMaterials(data)
      if (data.length > 0) setMaterialId(data[0].id)
    })
  }, [])

  // Timer
  useEffect(() => {
    if (phase !== 'quiz') return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, timeLeft])

  const startQuiz = async () => {
    if (!materialId) {
      setSetupError('Select a material first before starting the adaptive quiz.')
      return
    }

    setLoading(true)
    setSetupError(null)
    setSubmitError(null)

    try {
      const qs = await getQuizQuestions(materialId, count)
      setQuestions(qs)
      setAnswers({})
      setSkipped(new Set())
      setCurrentIdx(0)
      setTimeLeft(count * 60)
      setPhase('quiz')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load quiz questions.'
      setSetupError(message)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }))
    setSkipped((prev) => {
      const next = new Set(prev)
      next.delete(questionId)
      return next
    })
  }

  const skipQuestion = () => {
    const q = questions[currentIdx]
    if (!q) return
    setSkipped((prev) => new Set(prev).add(q.id))
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting || phase === 'complete') return
    setSubmitting(true)
    setPhase('submitting')
    setSubmitError(null)

    try {
      const answerPayload = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] !== undefined ? answers[q.id] : null,
        skipped: skipped.has(q.id) || answers[q.id] === undefined,
      }))
      const result = await submitQuiz(answerPayload)
      setCompletedResult(result)
      setPhase('complete')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit the quiz.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (phase === 'complete' && completedResult) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
        <PageHeader title="Quiz Complete" subtitle="Your adaptive assessment result is calculated." />
        <div className="card text-center p-8">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-[#606C38]/15 border border-[#606C38]/30 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-[#606C38]" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#606C38]">Final Score</p>
          <p className="mt-1 text-5xl font-extrabold text-[#283618]">{completedResult.score}%</p>
          <p className="mt-3 text-sm text-[#606C38] font-medium">
            {completedResult.correct} correct, {completedResult.wrong} wrong, {completedResult.skipped} skipped
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/results" className="btn-primary shadow-sm">
              Analyze Results
            </Link>
            <button onClick={() => { setCompletedResult(null); setPhase('setup') }} className="btn-secondary shadow-sm">
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Setup Phase ----
  if (phase === 'setup') {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader title="Adaptive Quiz" subtitle="AI continuously adapts question difficulty based on your performance" />
        <div className="max-w-xl mx-auto">
          <div className="card space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E2C8]">
              <div className="h-12 w-12 bg-[#606C38]/15 border border-[#606C38]/30 rounded-2xl flex items-center justify-center shrink-0">
                <Brain className="h-6 w-6 text-[#606C38]" />
              </div>
              <div>
                <h3 className="font-bold text-[#283618] text-base">Start Adaptive Quiz</h3>
                <p className="text-xs text-[#606C38]">Difficulty dynamically adjusts in real time</p>
              </div>
            </div>

            {setupError && (
              <div className="rounded-xl border border-[#BC6C25]/40 bg-[#BC6C25]/10 px-4 py-3 text-xs font-semibold text-[#BC6C25]">
                {setupError}
              </div>
            )}

            <div>
              <label className="label">Select Course Material</label>
              <select
                className="input"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
              >
                {materials.length === 0 && <option value="">No materials available</option>}
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.fileName} ({m.subject})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Quiz Length</label>
                <span className="text-xs font-bold text-[#606C38] bg-[#606C38]/10 px-2 py-0.5 rounded-md">{count} Questions ({count} mins)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      count === n
                        ? 'border-[#606C38] bg-[#606C38] text-[#FEFAE0] shadow-sm'
                        : 'border-[#E8E2C8] bg-white text-[#283618] hover:border-[#DDA15E]'
                    }`}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#FEFAE0] rounded-2xl border border-[#DDA15E]/40 text-xs text-[#283618] space-y-1.5">
              <p className="font-bold text-[#606C38]">How the Adaptive Algorithm Works:</p>
              <p className="leading-relaxed">The quiz starts at Medium. Correct answers elevate question difficulty, while mistakes drop difficulty down with targeted remediation.</p>
            </div>

            <button
              onClick={startQuiz}
              disabled={loading || materials.length === 0}
              className="btn-primary w-full shadow-md py-3 font-bold"
            >
              <Play className="h-4 w-4 fill-current" />
              {loading ? 'Preparing Questions...' : 'Start Quiz Session'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Submitting Phase ----
  if (phase === 'submitting') {
    if (submitError) {
      return (
        <div className="card max-w-xl mx-auto mt-12">
          <ErrorState message={submitError} onRetry={handleSubmit} />
        </div>
      )
    }

    return (
      <div className="card max-w-xl mx-auto mt-12">
        <LoadingSpinner message="Calculating your adaptive performance results..." />
      </div>
    )
  }

  // ---- Quiz Active Phase ----
  if (questions.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Brain} title="No questions available" description="Generate and approve questions for this material before starting a quiz." />
      </div>
    )
  }

  const q = questions[currentIdx]
  const progress = ((currentIdx + 1) / questions.length) * 100
  const answered = Object.keys(answers).length + skipped.size

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => setPhase('setup')} className="text-[#606C38] hover:text-[#283618] flex items-center gap-1.5 text-xs font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Exit Quiz
        </button>
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs border ${
          timeLeft < 60
            ? 'bg-[#BC6C25]/15 text-[#BC6C25] border-[#BC6C25]/40 animate-pulse'
            : 'bg-white text-[#283618] border-[#E8E2C8] shadow-sm'
        }`}>
          <Clock className="h-3.5 w-3.5 text-[#BC6C25]" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-[#283618]">Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-[#606C38]">{answered}/{questions.length} completed</span>
        </div>
        <div className="h-2.5 bg-white border border-[#E8E2C8] rounded-full overflow-hidden p-0.5">
          <div className="h-full bg-gradient-to-r from-[#606C38] via-[#DDA15E] to-[#BC6C25] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          <DifficultyBadge difficulty={q.difficulty} />
          <span className="badge bg-[#DDA15E]/20 text-[#B07432] border border-[#DDA15E]/40">{q.bloomLevel}</span>
          <span className="badge bg-[#FEFAE0] text-[#283618] border border-[#E8E2C8]">{q.topic}</span>
        </div>
        <p className="text-lg font-bold text-[#283618] mb-5 leading-snug">{q.question}</p>

        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => selectAnswer(q.id, idx)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                answers[q.id] === idx
                  ? 'border-[#606C38] bg-[#606C38]/10 text-[#283618] font-bold shadow-sm'
                  : 'border-[#E8E2C8] bg-white text-[#283618] hover:border-[#DDA15E] hover:bg-[#FEFAE0]/30'
              }`}
            >
              <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                answers[q.id] === idx ? 'bg-[#606C38] text-[#FEFAE0]' : 'bg-[#FEFAE0] text-[#283618] border border-[#E8E2C8]'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <div className="flex gap-2">
          <button onClick={skipQuestion} className="btn-secondary">
            <Flag className="h-4 w-4 text-[#DDA15E]" /> Skip
          </button>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} className="btn-primary">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-accent font-bold">
              <CheckCircle2 className="h-4 w-4" /> Submit Quiz
            </button>
          )}
        </div>
      </div>

      {/* Question Number Pills */}
      <div className="pt-3 flex flex-wrap gap-2 justify-center">
        {questions.map((qq, idx) => (
          <button
            key={qq.id}
            onClick={() => setCurrentIdx(idx)}
            className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
              idx === currentIdx
                ? 'bg-[#283618] text-[#FEFAE0] ring-2 ring-[#606C38] shadow-sm'
                : skipped.has(qq.id)
                ? 'bg-[#DDA15E]/30 text-[#B07432] border border-[#DDA15E]/50'
                : answers[qq.id] !== undefined
                ? 'bg-[#606C38]/20 text-[#606C38] border border-[#606C38]/40'
                : 'bg-white text-[#8C8F7A] border border-[#E8E2C8] hover:border-[#DDA15E]'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
