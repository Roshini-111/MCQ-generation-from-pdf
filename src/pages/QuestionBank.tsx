import { useEffect, useState, useMemo } from 'react'
import { Search, Library, CreditCard as Edit2, Trash2, Eye, X, Save, Lightbulb, CircleCheck as CheckCircle2, Download, BookOpen } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { DifficultyBadge, ValidationBadge } from '../components/Badge'
import { EmptyState, LoadingSpinner } from '../components/States'
import { getQuestions, deleteQuestion, updateQuestion } from '../services/api'
import type { Question } from '../types'
import { Generate } from './Generate'

export function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterBloom, setFilterBloom] = useState('')
  const [viewing, setViewing] = useState<Question | null>(null)
  const [editing, setEditing] = useState<Question | null>(null)
  const [activePanel, setActivePanel] = useState<'bank' | 'generate'>('bank')

  useEffect(() => {
    getQuestions().then((data) => {
      setQuestions(data)
      setLoading(false)
    })
  }, [])

  const allTopics = useMemo(() => [...new Set(questions.map((q) => q.topic))], [questions])

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
      if (filterTopic && q.topic !== filterTopic) return false
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false
      if (filterBloom && q.bloomLevel !== filterBloom) return false
      return true
    })
  }, [questions, search, filterTopic, filterDifficulty, filterBloom])

  const handleDelete = async (id: string) => {
    await deleteQuestion(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    const updated = await updateQuestion(editing.id, editing)
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setEditing(null)
  }

  const clearFilters = () => {
    setSearch('')
    setFilterTopic('')
    setFilterDifficulty('')
    setFilterBloom('')
  }

  const downloadQuestions = () => {
    const content = filtered.map((question, index) => {
      const options = question.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join('\n')
      return `${index + 1}. ${question.question}\n${options}\nAnswer: ${String.fromCharCode(65 + question.correctAnswer)}\nExplanation: ${question.explanation}`
    }).join('\n\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'learnflow-question-bank.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (activePanel === 'generate') {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Question Bank Generation"
          subtitle="Generate MCQs with options, answers, and explanations from your uploaded PDF"
          action={<button onClick={() => setActivePanel('bank')} className="btn-secondary">View Question Bank</button>}
        />
        <Generate />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Question Bank"
        subtitle={`${questions.length} questions curated with answers, bloom levels, and explanations`}
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActivePanel('generate')} className="btn-primary shadow-sm">
              <BookOpen className="h-4 w-4 text-[#DDA15E]" /> Generate Questions
            </button>
            <button onClick={downloadQuestions} disabled={filtered.length === 0} className="btn-secondary disabled:opacity-40 shadow-sm">
              <Download className="h-4 w-4 text-[#606C38]" /> Download TXT
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8F7A]" />
            <input
              className="input pl-10"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
            <option value="">All Topics</option>
            {allTopics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="">All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select className="input" value={filterBloom} onChange={(e) => setFilterBloom(e.target.value)}>
            <option value="">All Bloom Levels</option>
            <option>Remember</option>
            <option>Understand</option>
            <option>Apply</option>
            <option>Analyze</option>
            <option>Evaluate</option>
          </select>
        </div>
        {(search || filterTopic || filterDifficulty || filterBloom) && (
          <button onClick={clearFilters} className="text-xs font-semibold text-[#BC6C25] hover:underline mt-3 flex items-center gap-1">
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Questions list */}
      {loading ? (
        <LoadingSpinner message="Loading questions..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Library}
            title="No questions found"
            description="Try adjusting your filters or search query."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id} className="card hover:shadow-md transition group border-[#E8E2C8] hover:border-[#DDA15E]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#283618] text-base mb-2 line-clamp-2">{q.question}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-[#FEFAE0] text-[#283618] border border-[#E8E2C8]">{q.topic}</span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <span className="badge bg-[#DDA15E]/20 text-[#B07432] border border-[#DDA15E]/40">{q.bloomLevel}</span>
                    <ValidationBadge status={q.validationStatus} />
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewing(q)}
                    className="p-2 text-[#606C38] hover:text-[#283618] hover:bg-[#FEFAE0] rounded-xl transition-colors border border-transparent hover:border-[#E8E2C8]"
                    title="View question details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditing({ ...q })}
                    className="p-2 text-[#DDA15E] hover:text-[#B07432] hover:bg-[#FEFAE0] rounded-xl transition-colors border border-transparent hover:border-[#E8E2C8]"
                    title="Edit question"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-[#BC6C25] hover:text-[#864612] hover:bg-[#FEFAE0] rounded-xl transition-colors border border-transparent hover:border-[#E8E2C8]"
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {viewing && (
        <Modal onClose={() => setViewing(null)} title="Question Details">
          <p className="font-semibold text-[#283618] text-base mb-3.5 leading-snug">{viewing.question}</p>
          <div className="space-y-2 mb-4">
            {viewing.options.map((opt, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
                  idx === viewing.correctAnswer
                    ? 'bg-[#606C38]/15 text-[#283618] border border-[#606C38]/40 font-semibold'
                    : 'bg-[#FEFAE0]/40 text-[#283618] border border-[#E8E2C8]'
                }`}
              >
                <span className="font-bold text-xs w-5 h-5 rounded-md flex items-center justify-center bg-white border border-[#E8E2C8]">{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
                {idx === viewing.correctAnswer && <CheckCircle2 className="h-4 w-4 ml-auto text-[#606C38]" />}
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-[#FEFAE0] rounded-xl border border-[#DDA15E]/40 mb-4">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="h-4 w-4 text-[#BC6C25] shrink-0 mt-0.5" />
              <p className="text-xs text-[#283618] leading-relaxed"><span className="font-bold text-[#BC6C25]">Explanation: </span>{viewing.explanation}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E8E2C8]">
            <div><span className="text-[#606C38] font-medium">Topic:</span> <span className="font-bold text-[#283618]">{viewing.topic}</span></div>
            <div><span className="text-[#606C38] font-medium">Subject:</span> <span className="font-bold text-[#283618]">{viewing.subject}</span></div>
            <div><span className="text-[#606C38] font-medium">Difficulty:</span> <DifficultyBadge difficulty={viewing.difficulty} /></div>
            <div><span className="text-[#606C38] font-medium">Bloom:</span> <span className="badge bg-[#DDA15E]/20 text-[#B07432] border border-[#DDA15E]/40">{viewing.bloomLevel}</span></div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title="Edit Question">
          <div className="space-y-3">
            <div>
              <label className="label">Question</label>
              <textarea
                className="input min-h-[80px]"
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
              />
            </div>
            {editing.options.map((opt, idx) => (
              <div key={idx}>
                <label className="label">Option {String.fromCharCode(65 + idx)}</label>
                <input
                  className="input"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...editing.options]
                    newOptions[idx] = e.target.value
                    setEditing({ ...editing, options: newOptions })
                  }}
                />
              </div>
            ))}
            <div>
              <label className="label">Correct Answer</label>
              <select
                className="input"
                value={editing.correctAnswer}
                onChange={(e) => setEditing({ ...editing, correctAnswer: Number(e.target.value) })}
              >
                {editing.options.map((_, idx) => (
                  <option key={idx} value={idx}>Option {String.fromCharCode(65 + idx)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Explanation</label>
              <textarea
                className="input min-h-[60px]"
                value={editing.explanation}
                onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-[#E8E2C8]">
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary">
                <Save className="h-4 w-4 text-[#DDA15E]" /> Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8E2C8]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2C8] bg-[#FEFAE0]/40">
          <h3 className="font-bold text-[#283618] text-base">{title}</h3>
          <button onClick={onClose} className="text-[#8C8F7A] hover:text-[#283618] p-1 rounded-lg hover:bg-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
