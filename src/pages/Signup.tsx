import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, GraduationCap, Lock, Mail, User } from 'lucide-react'

export function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const profile = {
      name,
      email,
      bio: '',
      learningGoal: '',
      memberSince: new Date().toISOString(),
      interests: [],
      profileComplete: false,
    }

    localStorage.setItem('learnflow_user', JSON.stringify({ name, email }))
    localStorage.setItem('learnflow_profile', JSON.stringify(profile))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FEFAE0] text-[#283618] flex items-center justify-center px-6 py-12 relative">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#606C38] hover:text-[#283618] bg-white/70 hover:bg-white px-3.5 py-2 rounded-xl border border-[#E8E2C8] transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#BC6C25]" /> Back to Home
          </Link>
        </div>

        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="h-11 w-11 bg-[#606C38] rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="h-6 w-6 text-[#FEFAE0]" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight text-[#283618]">LearnFlow</h1>
            <p className="text-xs text-[#606C38] font-medium">Adaptive Assessment Platform</p>
          </div>
        </Link>

        <div className="bg-white/95 rounded-3xl shadow-lg border border-[#E8E2C8] p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-[#283618] mb-1.5">Create your account</h2>
          <p className="text-sm text-[#606C38] mb-6">Start building a smarter learning routine today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8F7A]" />
                <input
                  className="input pl-10"
                  placeholder="Alex Carter"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8F7A]" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8F7A]" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#606C38] text-[#FEFAE0] rounded-xl font-semibold hover:bg-[#283618] transition-colors shadow-sm mt-2"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#606C38] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#BC6C25] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
