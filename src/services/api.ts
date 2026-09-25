import axios from 'axios'
import type {
  Question,
  Material,
  QuizResult,
  WeakTopic,
  SolverAnswer,
  AnswerStyle,
  Difficulty,
  BloomLevel,
} from '../types'

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${defaultHost}:8000`

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

const TEST_USER_ID = '23285917-fe1a-471d-9d6b-b1ec51abd271'

function toValidationStatus(value?: string): Question['validationStatus'] {
  if (value === 'Approved') return 'Validated'
  if (value === 'Rejected') return 'Rejected'
  return 'Needs Review'
}

function normalizeMaterial(raw: any): Material {
  return {
    id: raw?.id ?? raw?.textbook_id ?? String(Date.now()),
    fileName: raw?.title ?? raw?.fileName ?? 'Untitled material',
    subject: raw?.subject ?? 'General',
    topics: Array.isArray(raw?.topics) ? raw.topics : raw?.topic ? [raw.topic] : [],
    fileSize: raw?.file_size ?? raw?.fileSize ?? '0 KB',
    uploadedAt: raw?.created_at ?? raw?.uploadedAt ?? new Date().toISOString(),
    pages: Number(raw?.pages ?? 0),
  }
}

function normalizeQuestion(raw: any): Question {
  const options = Array.isArray(raw?.options)
    ? raw.options
    : [
        raw?.option_a ?? raw?.options?.A,
        raw?.option_b ?? raw?.options?.B,
        raw?.option_c ?? raw?.options?.C,
        raw?.option_d ?? raw?.options?.D,
      ]

  const correctAnswer =
    raw?.correctAnswer ??
    raw?.correct_answer ??
    (() => {
      const answer = String(raw?.correct_answer ?? raw?.correctAnswer ?? 'A').toUpperCase()
      const mapping: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      return mapping[answer] ?? 0
    })()

  return {
    id: raw?.id ?? raw?.question_id ?? String(Date.now()),
    question: raw?.question ?? 'Untitled question',
    options: options.map((opt: string | undefined) => String(opt ?? '')),
    correctAnswer: Number(correctAnswer),
    explanation: raw?.explanation ?? 'No explanation provided.',
    topic: raw?.topic ?? 'General',
    subject: raw?.subject ?? 'General',
    difficulty: (raw?.difficulty ?? 'Medium') as Difficulty,
    bloomLevel: (raw?.bloom_level ?? raw?.bloomLevel ?? 'Understand') as BloomLevel,
    validationStatus: toValidationStatus(raw?.validation ?? raw?.validationStatus),
    createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
  }
}

function normalizeWeakTopic(raw: any): WeakTopic {
  return {
    topic: raw?.topic ?? 'General',
    subject: raw?.subject ?? 'General',
    averageScore: Number(raw?.average_score ?? raw?.averageScore ?? 0),
    attempts: Number(raw?.attempts ?? raw?.total_attempts ?? 0),
    recommendedAction: raw?.recommended_action ?? raw?.recommendedAction ?? 'Review this topic again.',
  }
}

function normalizeQuizResult(raw: any): QuizResult {
  const totalQuestions = Number(raw?.total_questions ?? raw?.totalQuestions ?? 0)
  const correct = Number(raw?.correct ?? 0)
  const wrong = Number(raw?.wrong ?? 0)
  const skipped = Number(raw?.skipped ?? 0)
  const score = Number(raw?.score ?? raw?.accuracy ?? 0)
  const startedAt = raw?.started_at ?? raw?.startedAt
  const completedAt = raw?.completed_at ?? raw?.completedAt ?? raw?.date
  const durationSeconds = startedAt && completedAt
    ? Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000))
    : 0
  const durationMinutes = Math.floor(durationSeconds / 60)
  const durationRemainder = durationSeconds % 60

  return {
    id: raw?.attempt_id ?? raw?.id ?? String(Date.now()),
    date: completedAt ?? new Date().toISOString(),
    totalQuestions,
    correct,
    wrong,
    skipped,
    score,
    timeTaken: raw?.time_taken ?? raw?.timeTaken ?? `${durationMinutes}:${durationRemainder.toString().padStart(2, '0')}`,
    topicPerformance: Array.isArray(raw?.topic_performance) ? raw.topic_performance : [],
    difficultyPerformance: Array.isArray(raw?.difficulty_performance) ? raw.difficulty_performance : [],
    bloomPerformance: Array.isArray(raw?.bloom_performance) ? raw.bloom_performance : [],
    recommendations: Array.isArray(raw?.recommendations) ? raw.recommendations : [],
    startedAt,
    completedAt,
  }
}

export interface GenerateParams {
  materialId?: string
  subject: string
  topic?: string
  numQuestions: number
  difficulty: Difficulty
  bloomLevel: BloomLevel
}

export async function getMaterials(): Promise<Material[]> {
  try {
    const { data } = await apiClient.get('/textbooks')
    const items = data?.textbooks ?? data?.data ?? data ?? []
    return Array.isArray(items) ? items.map(normalizeMaterial) : []
  } catch (error) {
    console.error('getMaterials error:', error)
    return []
  }
}

export async function uploadMaterial(file: File, subject: string): Promise<Material> {
  const formData = new FormData()
  formData.append('title', file.name)
  formData.append('subject', subject)
  formData.append('file', file)

  try {
    const { data } = await apiClient.post('/textbooks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return normalizeMaterial(data?.textbook ?? data)
  } catch (error) {
    console.error('uploadMaterial error:', error)
    throw error
  }
}

export async function deleteMaterial(id: string): Promise<void> {
  try {
    await apiClient.delete(`/textbooks/${id}`)
  } catch (error) {
    console.error('deleteMaterial error:', error)
  }
}

export async function generateQuestions(params: GenerateParams): Promise<Question[]> {
  try {
    const textbookId = params.materialId || (await getMaterials())[0]?.id

    if (!textbookId) {
      throw new Error('No textbook available for question generation. Upload a PDF first.')
    }

    const { data } = await apiClient.post('/questions/generate', {
      textbook_id: textbookId,
      topic: params.topic || params.subject,
      num_questions: params.numQuestions,
      difficulty: params.difficulty,
      bloom_level: params.bloomLevel,
    })

    const questions = data?.questions ?? data?.data ?? []
    return Array.isArray(questions) ? questions.map(normalizeQuestion) : []
  } catch (error) {
    console.error('generateQuestions error:', error)
    throw error
  }
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const { data } = await apiClient.get(`/questions/bank/${TEST_USER_ID}`)
    const questions = data?.questions ?? data?.data ?? []
    return Array.isArray(questions) ? questions.map(normalizeQuestion) : []
  } catch (error) {
    console.error('getQuestions error:', error)
    return []
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  try {
    const payload = {
      ...updates,
      question: updates.question,
      options: updates.options,
      correct_answer: updates.correctAnswer,
      explanation: updates.explanation,
      difficulty: updates.difficulty,
      bloom_level: updates.bloomLevel,
      topic: updates.topic,
    }

    const { data } = await apiClient.post(`/questions/validate/${id}`, payload)

    const normalized = normalizeQuestion({
      ...updates,
      id,
      validation: data?.status ?? 'Approved',
    })

    return normalized
  } catch (error) {
    console.error('updateQuestion error:', error)
    throw error
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    await apiClient.delete(`/questions/${id}`)
  } catch (error) {
    console.error('deleteQuestion error:', error)
  }
}

export async function getQuizQuestions(textbookId: string, count: number = 10): Promise<Question[]> {
  try {
    const { data } = await apiClient.post('/quiz/start', {
      user_id: TEST_USER_ID,
      textbook_id: textbookId,
      num_questions: count,
      difficulty: 'Mixed',
    })

    if (data?.attempt_id) {
      localStorage.setItem('current_attempt_id', data.attempt_id)
    }

    const questions = data?.questions ?? []
    const mapped = Array.isArray(questions) ? questions.map(normalizeQuestion) : []

    return mapped
  } catch (error) {
    console.error('getQuizQuestions error:', error)
    throw error
  }
}

export async function submitQuiz(
  answers: { questionId: string; selectedAnswer: number | null; skipped: boolean }[]
): Promise<QuizResult> {
  const attemptId = localStorage.getItem('current_attempt_id') ?? ''

  try {
    if (!attemptId) {
      throw new Error('No active quiz attempt found.')
    }

    const payload = {
      user_id: TEST_USER_ID,
      attempt_id: attemptId,
      answers: answers.map((item) => ({
        question_id: item.questionId,
        answer: item.skipped || item.selectedAnswer == null ? '' : String.fromCharCode(65 + item.selectedAnswer),
      })),
    }

    const { data } = await apiClient.post('/quiz/submit', payload)
    const result = normalizeQuizResult({
      ...data,
      id: data?.attempt_id ?? attemptId,
      total_questions: data?.total_questions ?? answers.length,
      score: data?.score ?? 0,
      correct: data?.correct ?? 0,
      wrong: data?.wrong ?? 0,
      skipped: data?.skipped ?? answers.filter((a) => a.skipped).length,
    })

    localStorage.setItem('last_completed_attempt_id', attemptId)
    localStorage.removeItem('current_attempt_id')
    return result
  } catch (error) {
    console.error('submitQuiz error:', error)
    throw error
  }
}

export async function getResults(): Promise<QuizResult[]> {
  try {
    const { data } = await apiClient.get(`/quiz/results/user/${TEST_USER_ID}`)
    const history = data?.results ?? data?.data ?? []
    return Array.isArray(history) ? history.map(normalizeQuizResult) : []
  } catch (error) {
    console.error('getResults error:', error)
    return []
  }
}

export async function getWeakTopics(): Promise<WeakTopic[]> {
  try {
    const { data } = await apiClient.get(`/analytics/weak-topics/${TEST_USER_ID}`)
    const weakTopics = data?.data ?? data ?? []
    return Array.isArray(weakTopics) ? weakTopics.map(normalizeWeakTopic) : []
  } catch (error) {
    console.error('getWeakTopics error:', error)
    return []
  }
}

export async function getBloomPerformance(): Promise<Array<{ level: string; score: number }>> {
  try {
    const { data } = await apiClient.get(`/analytics/bloom/${TEST_USER_ID}`)
    const items = data?.data ?? data ?? []
    return Array.isArray(items)
      ? items.map((item: any) => ({
          level: item?.bloom_level ?? item?.level ?? 'Unknown',
          score: Number(item?.average_score ?? item?.score ?? item?.accuracy_pct ?? 0),
        }))
      : []
  } catch (error) {
    console.error('getBloomPerformance error:', error)
    return []
  }
}

export interface SolverParams {
  questions: string
  answerStyle: AnswerStyle
  subject?: string
}

export async function solveQuestions(params: SolverParams): Promise<SolverAnswer[]> {
  try {
    const { data } = await apiClient.post('/test-solver/solve', {
      user_id: TEST_USER_ID,
      input_text: params.questions,
      answer_style: params.answerStyle,
    })

    return [
      {
        question: params.questions,
        answer: data?.answer ?? 'No answer returned.',
        explanation: 'Generated by the AI test solver using the selected answer style.',
        style: params.answerStyle,
      },
    ]
  } catch (error) {
    console.error('solveQuestions error:', error)
    throw error
  }
}

export default apiClient
