export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed'

export type BloomLevel =
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Analyze'
  | 'Evaluate'
  | 'Mixed'

export type AnswerStyle = 'Short' | 'Detailed' | 'Exam' | 'Point-wise'

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index 0-3
  explanation: string
  topic: string
  subject: string
  difficulty: Difficulty
  bloomLevel: BloomLevel
  validationStatus: 'Validated' | 'Needs Review' | 'Rejected'
  createdAt: string
}

export interface Material {
  id: string
  fileName: string
  subject: string
  topics: string[]
  fileSize: string
  uploadedAt: string
  pages: number
}

export interface QuizQuestion {
  questionId: string
  question: string
  options: string[]
  selectedAnswer: number | null
  correctAnswer: number
  topic: string
  difficulty: Difficulty
  bloomLevel: BloomLevel
  explanation: string
  skipped: boolean
}

export interface QuizResult {
  id: string
  date: string
  totalQuestions: number
  correct: number
  wrong: number
  skipped: number
  score: number
  timeTaken: string
  topicPerformance: TopicPerformance[]
  difficultyPerformance: DifficultyPerformance[]
  bloomPerformance: BloomPerformance[]
  recommendations: string[]
  startedAt?: string
  completedAt?: string
}

export interface TopicPerformance {
  topic: string
  correct: number
  total: number
  percentage: number
}

export interface DifficultyPerformance {
  difficulty: string
  correct: number
  total: number
  percentage: number
}

export interface BloomPerformance {
  level: string
  correct: number
  total: number
  percentage: number
}

export interface WeakTopic {
  topic: string
  subject: string
  averageScore: number
  attempts: number
  recommendedAction: string
}

export interface SolverAnswer {
  question: string
  answer: string
  explanation: string
  style: AnswerStyle
}

export interface ActivityItem {
  id: string
  type: 'quiz' | 'generated' | 'material' | 'solver'
  title: string
  description: string
  timestamp: string
}
