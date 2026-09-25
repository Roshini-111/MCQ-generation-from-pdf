import { useEffect, useState } from 'react'
import { Navigate, Routes, Route, Outlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingScreen } from './components/States'
import { Landing } from './pages/Landing'
import { About } from './pages/About'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Materials } from './pages/Materials'
import { QuestionBank } from './pages/QuestionBank'
import { AdaptiveQuiz } from './pages/AdaptiveQuiz'
import { TestSolver } from './pages/TestSolver'
import { Results } from './pages/Results'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

function ProtectedRoute() {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('learnflow_user') || 'null')
  } catch {
    localStorage.removeItem('learnflow_user')
  }

  return user?.email ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen message="Preparing your workspace..." />
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/generate" element={<Navigate to="/question-bank" replace />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/adaptive-quiz" element={<AdaptiveQuiz />} />
        <Route path="/test-solver" element={<TestSolver />} />
        <Route path="/results" element={<Results />} />
        <Route path="/analytics" element={<Navigate to="/results" replace />} />
        <Route path="/weak-topics" element={<Navigate to="/results" replace />} />
        <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
