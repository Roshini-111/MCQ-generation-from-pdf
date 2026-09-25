import { Loader as Loader2, BookOpen, AlertCircle } from 'lucide-react'

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0] px-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#DDA15E]/40 bg-white shadow-md">
          <div className="absolute inset-2 rounded-xl border-2 border-[#DDA15E]/20 border-t-[#606C38] animate-spin" />
          <Loader2 className="h-8 w-8 text-[#606C38] animate-spin" />
        </div>
        <p className="mt-6 text-xl font-bold text-[#283618]">{message}</p>
        <p className="mt-2 text-sm text-[#606C38] font-medium">Preparing your learning workspace</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 text-[#606C38] animate-spin" />
      {message && <p className="mt-3 text-[#606C38] text-sm font-medium">{message}</p>}
    </div>
  )
}

export function AIProcessing({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="absolute inset-0 bg-[#DDA15E]/30 rounded-full blur-xl animate-pulse-soft" />
        <BookOpen className="h-10 w-10 text-[#BC6C25] animate-pulse-soft relative" />
      </div>
      <p className="mt-4 text-[#283618] font-semibold">AI is working...</p>
      <p className="mt-1 text-[#606C38] text-sm">{message || 'Generating with Gemini LLM'}</p>
      <div className="mt-4 flex gap-1.5">
        <span className="h-2 w-2 bg-[#606C38] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 bg-[#DDA15E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 bg-[#BC6C25] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-12 w-12 bg-[#BC6C25]/20 text-[#BC6C25] rounded-xl flex items-center justify-center">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="mt-3 text-[#283618] font-semibold">Something went wrong</p>
      <p className="mt-1 text-[#606C38] text-sm">{message || 'Please try again'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4">
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 bg-[#FEFAE0] border border-[#E8E2C8] rounded-2xl flex items-center justify-center shadow-sm">
        <Icon className="h-8 w-8 text-[#606C38]" />
      </div>
      <p className="mt-4 text-[#283618] font-semibold">{title}</p>
      {description && <p className="mt-1 text-[#606C38] text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="h-4 w-3/4 shimmer rounded mb-3" />
      <div className="h-3 w-full shimmer rounded mb-2" />
      <div className="h-3 w-5/6 shimmer rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-5 w-16 shimmer rounded-full" />
        <div className="h-5 w-20 shimmer rounded-full" />
      </div>
    </div>
  )
}
