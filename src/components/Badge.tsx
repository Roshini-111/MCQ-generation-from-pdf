import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'easy' | 'medium' | 'hard' | 'mixed' | 'validated' | 'review' | 'rejected'
}

const variantMap: Record<string, string> = {
  easy: 'badge-easy',
  medium: 'badge-medium',
  hard: 'badge-hard',
  mixed: 'badge-mixed',
  validated: 'badge-validated',
  review: 'badge-review',
  rejected: 'badge-rejected',
}

export function Badge({ children, variant = 'mixed' }: BadgeProps) {
  return <span className={`badge ${variantMap[variant]}`}>{children}</span>
}

interface DifficultyBadgeProps {
  difficulty: string
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variant = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard' | 'mixed'
  return <Badge variant={variant}>{difficulty}</Badge>
}

interface ValidationBadgeProps {
  status: string
}

export function ValidationBadge({ status }: ValidationBadgeProps) {
  if (status === 'Validated') return <Badge variant="validated">Validated</Badge>
  if (status === 'Needs Review') return <Badge variant="review">Needs Review</Badge>
  return <Badge variant="rejected">Rejected</Badge>
}
