import { GraduationCap, ArrowRight, BookOpen, Brain, ChartBar as BarChart3, Target, CheckCircle2, ShieldCheck, Zap, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

const keyCapabilities = [
  {
    icon: BookOpen,
    title: 'Cognitive MCQ Synthesis',
    desc: 'Extract and formulate verified, multiple-choice questions directly from textbooks with granular Bloom-level cognitive tagging.',
    color: 'text-[#606C38] bg-[#606C38]/10 border-[#606C38]/20',
  },
  {
    icon: Brain,
    title: 'Real-Time Adaptive Assessment',
    desc: 'Dynamic difficulty modulation continuously calibrates question complexity to match learner mastery in real time.',
    color: 'text-[#BC6C25] bg-[#BC6C25]/10 border-[#BC6C25]/20',
  },
  {
    icon: BarChart3,
    title: 'Diagnostic Analytics & Insights',
    desc: 'Comprehensive performance telemetry detailing subject accuracy, time efficiency, and cognitive skill depth.',
    color: 'text-[#DDA15E] bg-[#DDA15E]/15 border-[#DDA15E]/30',
  },
  {
    icon: Target,
    title: 'Targeted Remediation Engine',
    desc: 'Identify specific knowledge deficits with automated diagnostic detection and targeted practice recommendations.',
    color: 'text-[#283618] bg-[#283618]/10 border-[#283618]/20',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FEFAE0] text-[#283618] selection:bg-[#606C38] selection:text-[#FEFAE0]">
      <div className="max-w-6xl mx-auto px-6 py-6 lg:px-10">
        {/* Navigation Header */}
        <header className="flex items-center justify-between border-b border-[#E8E2C8] pb-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-[#606C38] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#283618] transition-colors">
              <GraduationCap className="h-5 w-5 text-[#FEFAE0]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-[#283618]">LearnFlow</h1>
              <p className="text-xs text-[#606C38] font-semibold">Adaptive Assessment Engine</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
            <Link to="/about" className="text-[#606C38] hover:text-[#283618] transition-colors">
              About
            </Link>
            <Link to="/login" className="text-[#606C38] hover:text-[#283618] transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-[#606C38] px-4 py-2 text-[#FEFAE0] hover:bg-[#283618] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="max-w-5xl mx-auto py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#606C38]/10 text-[#606C38] border border-[#606C38]/20 rounded-full text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 text-[#BC6C25]" /> Intelligent Educational Assessment
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-[#283618] mb-6 tracking-tight">
              Transform Complex Learning Material into Adaptive Mastery
            </h2>
            <p className="text-[#606C38] text-base sm:text-lg max-w-2xl mx-auto mb-9 leading-relaxed font-medium">
              Accelerate comprehension with automated MCQ generation, Bloom-calibrated cognitive taxonomies, and real-time adaptive quizzes engineered to diagnose and resolve conceptual gaps.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#606C38] text-[#FEFAE0] rounded-xl font-bold hover:bg-[#283618] transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Start Assessment Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#283618] border border-[#DDA15E] rounded-xl font-bold hover:bg-[#FEFAE0] transition-colors shadow-sm text-sm sm:text-base"
              >
                Platform Overview
              </Link>
            </div>
          </div>

          {/* Featured Hero Image Showcase */}
          <div className="mt-14 sm:mt-18 relative">
            <div className="rounded-3xl border-2 border-[#E8E2C8] bg-white p-2.5 sm:p-4 shadow-2xl overflow-hidden transition-all hover:border-[#DDA15E]/80">
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E2C8]/70 bg-[#FEFAE0]/40">
                <img
                  src="/landing image.png"
                  alt="LearnFlow Platform Showcase"
                  className="w-full h-auto object-cover max-h-[520px] rounded-2xl transition-transform duration-500 hover:scale-[1.01]"
                  loading="eager"
                />
              </div>
            </div>

            {/* Floating Highlight Badges */}
            <div className="hidden md:flex absolute -bottom-5 left-8 bg-white/95 backdrop-blur-md border border-[#E8E2C8] px-4 py-2.5 rounded-2xl shadow-lg items-center gap-2.5 text-xs font-bold text-[#283618]">
              <div className="h-7 w-7 rounded-lg bg-[#606C38]/15 flex items-center justify-center text-[#606C38]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Bloom's Taxonomy Calibrated</span>
            </div>

            <div className="hidden md:flex absolute -top-5 right-8 bg-white/95 backdrop-blur-md border border-[#E8E2C8] px-4 py-2.5 rounded-2xl shadow-lg items-center gap-2.5 text-xs font-bold text-[#283618]">
              <div className="h-7 w-7 rounded-lg bg-[#BC6C25]/15 flex items-center justify-center text-[#BC6C25]">
                <Zap className="h-4 w-4" />
              </div>
              <span>Real-Time Adaptive Scaling</span>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#283618]">Engineered for Academic Rigor</h3>
              <p className="text-xs sm:text-sm text-[#606C38] mt-2 font-medium">
                Combining generative machine learning with pedagogical frameworks to ensure objective evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {keyCapabilities.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8E2C8] p-6 hover:border-[#DDA15E] transition-all shadow-sm hover:shadow-md"
                  >
                    <div className={`h-11 w-11 ${item.color} rounded-xl border flex items-center justify-center mb-4`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-[#283618] text-base mb-2">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-[#606C38] leading-relaxed font-normal">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Structured 4-Step Process Section */}
          <div className="mt-16 bg-[#283618] text-[#FEFAE0] rounded-3xl p-8 sm:p-12 shadow-xl border border-[#606C38]/40">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DDA15E]">System Architecture</span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-2 mb-3 text-[#FEFAE0]">How LearnFlow Powers Learning</h3>
              <p className="text-[#DDA15E] text-xs sm:text-sm mb-8 leading-relaxed font-medium">
                An end-to-end cognitive loop designed to convert raw text documents into measurable student mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Document Ingestion', desc: 'Secure PDF/image parsing and automated subject-topic mapping.' },
                { step: '02', title: 'Taxonomy Synthesis', desc: 'LLM question generation with verified options and rationale.' },
                { step: '03', title: 'Adaptive Testing', desc: 'Real-time difficulty shifts adjusting to student answer accuracy.' },
                { step: '04', title: 'Mastery Diagnostics', desc: 'Precise identification of weak conceptual points and remedial plans.' },
              ].map((s) => (
                <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <span className="text-xs font-extrabold text-[#DDA15E]">{s.step}</span>
                  <h4 className="font-bold text-sm text-[#FEFAE0] mt-1.5 mb-1.5">{s.title}</h4>
                  <p className="text-xs text-[#FEFAE0]/80 leading-relaxed font-normal">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-semibold text-[#DDA15E]">Ready to begin your adaptive learning journey?</span>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#BC6C25] text-[#FEFAE0] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#A1581B] transition-colors shadow-sm"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
