import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FEFAE0] text-[#283618] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-[#E8E2C8] bg-white/95 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#606C38]/15 border border-[#606C38]/30 text-[#606C38]">
          <span className="text-2xl font-extrabold">404</span>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#283618]">Page not found</h1>
        <p className="mt-2 text-sm text-[#606C38]">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/dashboard" className="btn-primary">
            <Home className="h-4 w-4 text-[#DDA15E]" />
            Go to dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
