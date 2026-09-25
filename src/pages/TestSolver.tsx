import { useState, useRef } from 'react'
import { FileQuestion, Upload, Type, BookOpen, Copy, CircleCheck as CheckCircle2, Lightbulb, FileText } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { AIProcessing, EmptyState } from '../components/States'
import { solveQuestions, type SolverParams } from '../services/api'
import type { AnswerStyle, SolverAnswer } from '../types'

const SUBJECTS = ['Computer Networks', 'DBMS', 'Operating Systems', 'Data Structures', 'Software Engineering']

const answerStyles: AnswerStyle[] = ['Short', 'Detailed', 'Exam', 'Point-wise']

const sampleQuestions = `1. What is the difference between TCP and UDP?
2. Explain the concept of normalization in DBMS.
3. What is a deadlock in operating systems and how can it be prevented?
4. Compare Merge Sort and Quick Sort.
5. What are the phases of the Software Development Life Cycle?`

export function TestSolver() {
  const [questions, setQuestions] = useState('')
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>('Detailed')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [solving, setSolving] = useState(false)
  const [answers, setAnswers] = useState<SolverAnswer[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSolve = async () => {
    if (!questions.trim()) return
    setSolving(true)
    setAnswers([])
    const params: SolverParams = { questions, answerStyle, subject }
    const result = await solveQuestions(params)
    setAnswers(result)
    setSolving(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setQuestions(`[Uploaded: ${file.name}]\n\n1. What is the difference between TCP and UDP?\n2. Explain normalization in DBMS.\n3. What is a deadlock and how to prevent it?\n4. Compare Merge Sort and Quick Sort.\n5. What are the phases of SDLC?`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="AI Test Solver"
        subtitle="Upload a question paper or paste questions to generate step-by-step verified solutions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2C8]">
            <div className="h-10 w-10 bg-[#606C38]/15 border border-[#606C38]/30 rounded-xl flex items-center justify-center">
              <FileQuestion className="h-5 w-5 text-[#606C38]" />
            </div>
            <div>
              <h3 className="font-bold text-[#283618] text-base">Input Questions</h3>
              <p className="text-xs text-[#606C38]">Upload document or paste questions</p>
            </div>
          </div>

          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="solver-upload"
          />
          <label
            htmlFor="solver-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#DDA15E]/60 bg-[#FEFAE0]/30 rounded-2xl py-6 cursor-pointer hover:border-[#606C38] hover:bg-[#FEFAE0] transition-colors"
          >
            <Upload className="h-7 w-7 text-[#BC6C25] mb-2" />
            <p className="text-sm text-[#283618] font-bold">Upload Question Paper</p>
            <p className="text-xs text-[#606C38] mt-0.5">PDF, PNG, or JPG files</p>
          </label>

          {/* Subject */}
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Answer style */}
          <div>
            <label className="label">Answer Format Style</label>
            <div className="grid grid-cols-2 gap-2">
              {answerStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setAnswerStyle(style)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    answerStyle === style
                      ? 'border-[#606C38] bg-[#606C38] text-[#FEFAE0] shadow-sm'
                      : 'border-[#E8E2C8] bg-white text-[#283618] hover:border-[#DDA15E]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-[#606C38]" /> Or Paste Questions
            </label>
            <textarea
              className="input min-h-[140px] font-mono text-xs"
              placeholder="Paste your questions here, one per line..."
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setQuestions(sampleQuestions)} className="btn-secondary text-xs">
              Load Sample
            </button>
            <button onClick={handleSolve} disabled={solving || !questions.trim()} className="btn-primary flex-1 shadow-md">
              <BookOpen className="h-4 w-4 text-[#DDA15E]" />
              {solving ? 'Solving Questions...' : 'Solve with AI'}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {solving ? (
            <div className="card">
              <AIProcessing message="Gemini LLM is synthesizing step-by-step verified explanations" />
            </div>
          ) : answers.length === 0 ? (
            <div className="card h-full flex items-center justify-center min-h-[380px]">
              <EmptyState
                icon={FileText}
                title="No answers generated yet"
                description="Upload a question paper or paste questions on the left, then click Solve to generate solutions."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#606C38] font-bold px-1">
                <CheckCircle2 className="h-5 w-5 text-[#606C38]" />
                {answers.length} verified solutions generated ({answerStyle} style)
              </div>
              {answers.map((ans, i) => (
                <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="h-7 w-7 bg-[#606C38]/15 text-[#606C38] rounded-lg flex items-center justify-center text-xs font-bold border border-[#606C38]/30 shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-bold text-[#283618] text-sm leading-snug">{ans.question}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(i, `${ans.question}\n\n${ans.answer}\n\n${ans.explanation}`)}
                      className="text-[#DDA15E] hover:text-[#606C38] transition p-1 shrink-0"
                      title="Copy solution"
                    >
                      {copied === i ? <CheckCircle2 className="h-4 w-4 text-[#606C38]" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="p-3.5 bg-[#FEFAE0]/50 border border-[#E8E2C8] rounded-xl mb-3">
                    <p className="text-xs text-[#283618] whitespace-pre-line leading-relaxed font-medium">{ans.answer}</p>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-[#FEFAE0] rounded-xl border border-[#DDA15E]/40">
                    <Lightbulb className="h-4 w-4 text-[#BC6C25] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#283618] leading-relaxed"><span className="font-bold text-[#BC6C25]">Key Insight: </span>{ans.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
