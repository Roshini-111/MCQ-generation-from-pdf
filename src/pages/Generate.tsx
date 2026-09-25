import { useEffect, useState } from 'react'
import { BookOpen, Settings2, CircleCheck as CheckCircle2, Lightbulb, Copy } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { DifficultyBadge, ValidationBadge } from '../components/Badge'
import { AIProcessing, EmptyState } from '../components/States'
import { generateQuestions, getMaterials, type GenerateParams } from '../services/api'
import type { Question, Difficulty, BloomLevel, Material } from '../types'
import { JellyRadio } from '../components/JellyRadio'

export function Generate() {
  const [topic, setTopic] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty>('Mixed')
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>('Mixed')
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    getMaterials().then((data) => {
      setMaterials(data)
      if (data.length > 0) setMaterialId(data[0].id)
    })
  }, [])

  const selectedMaterial = materials.find((material) => material.id === materialId)
  const subject = selectedMaterial?.subject || 'General'
  const availableTopics = selectedMaterial?.topics || []

  const handleGenerate = async () => {
    setGenerating(true)
    setQuestions([])
    const params: GenerateParams = {
      materialId: materialId || undefined,
      subject,
      topic: topic || undefined,
      numQuestions,
      difficulty,
      bloomLevel,
    }
    const result = await generateQuestions(params)
    setQuestions(result)
    setGenerating(false)
  }

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Mixed']
  const bloomLevels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Mixed']

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Generate Questions"
        subtitle="Create AI-powered MCQs from uploaded course material with cognitive alignment"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8E2C8]">
              <Settings2 className="h-5 w-5 text-[#606C38]" />
              <h3 className="font-bold text-[#283618] text-base">Configuration</h3>
            </div>

            <div>
              <label className="label">Source Material</label>
              <select className="input" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                {materials.length === 0 && <option value="">No materials uploaded</option>}
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.fileName} ({m.subject})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Topic (optional)</label>
              <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">All topics</option>
                {availableTopics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Number of Questions</label>
                <span className="text-xs font-bold text-[#606C38] bg-[#606C38]/10 px-2 py-0.5 rounded-md">{numQuestions}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full accent-[#606C38]"
              />
            </div>

            <div>
              <label className="label">Difficulty</label>
              <JellyRadio
                items={difficulties}
                value={difficulty}
                onChange={(v) => setDifficulty(v as Difficulty)}
                chipColor="#FEFAE0"
                activeColor="#606C38"
                textColor="#283618"
                activeTextColor="#FEFAE0"
                size="sm"
                gap={6}
                radius={14}
                ariaLabel="Difficulty"
              />
            </div>

            <div>
              <label className="label">Bloom's Level</label>
              <JellyRadio
                items={bloomLevels}
                value={bloomLevel}
                onChange={(v) => setBloomLevel(v as BloomLevel)}
                chipColor="#FEFAE0"
                activeColor="#BC6C25"
                textColor="#283618"
                activeTextColor="#FEFAE0"
                size="sm"
                gap={5}
                radius={14}
                stagger={18}
                ariaLabel="Bloom's Level"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || materials.length === 0}
              className="btn-primary w-full shadow-md mt-2"
            >
              <BookOpen className="h-4 w-4 text-[#DDA15E]" />
              {generating ? 'Generating MCQs...' : 'Generate MCQs'}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {generating ? (
            <div className="card">
              <AIProcessing message="Crafting verified questions with Gemini LLM + prompt engineering" />
            </div>
          ) : questions.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={BookOpen}
                title="No questions generated yet"
                description="Configure your preferences on the left and click Generate to create AI-powered MCQs."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#606C38] font-bold px-1">
                <CheckCircle2 className="h-5 w-5 text-[#606C38]" />
                {questions.length} questions generated successfully
              </div>
              {questions.map((q, i) => (
                <div key={q.id} className="card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 bg-[#606C38]/15 text-[#606C38] rounded-lg flex items-center justify-center text-xs font-bold border border-[#606C38]/20">
                        {i + 1}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="badge bg-[#DDA15E]/20 text-[#B07432] border border-[#DDA15E]/40">{q.bloomLevel}</span>
                        <ValidationBadge status={q.validationStatus} />
                      </div>
                    </div>
                    <button className="text-[#DDA15E] hover:text-[#606C38] transition p-1" title="Copy question">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-semibold text-[#283618] text-base mb-3 leading-snug">{q.question}</p>

                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                          idx === q.correctAnswer
                            ? 'bg-[#606C38]/15 text-[#283618] border border-[#606C38]/40 font-semibold'
                            : 'bg-[#FEFAE0]/40 text-[#283618] border border-[#E8E2C8]'
                        }`}
                      >
                        <span className="font-bold text-xs w-5 h-5 rounded-md flex items-center justify-center bg-white border border-[#E8E2C8]">{String.fromCharCode(65 + idx)}</span>
                        <span>{opt}</span>
                        {idx === q.correctAnswer && <CheckCircle2 className="h-4 w-4 ml-auto text-[#606C38]" />}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 bg-[#FEFAE0] rounded-xl border border-[#DDA15E]/40">
                    <Lightbulb className="h-4 w-4 text-[#BC6C25] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#283618] leading-relaxed"><span className="font-bold text-[#BC6C25]">Explanation: </span>{q.explanation}</p>
                  </div>

                  <p className="text-[11px] text-[#8C8F7A] mt-2.5 font-medium">Topic: <span className="text-[#606C38]">{q.topic}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
