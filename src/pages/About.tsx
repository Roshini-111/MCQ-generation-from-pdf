import { Brain, ChartBar as BarChart3, BookOpen, Target, GraduationCap, ArrowLeft, ArrowRight, ShieldCheck, Zap, Layers, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const capabilities = [
  {
    icon: BookOpen,
    title: 'Automated Cognitive MCQ Generation',
    desc: 'Synthesizes high-fidelity multiple choice questions directly from uploaded academic materials, ensuring every item features verified options, plausible distractors, and pedagogical rationales.',
  },
  {
    icon: Layers,
    title: "Bloom's Revised Taxonomy Alignment",
    desc: 'Every question is systematically classified across cognitive domains—from foundational recall (Remember, Understand) to higher-order critical thinking (Apply, Analyze, Evaluate).',
  },
  {
    icon: Brain,
    title: 'Real-Time Adaptive Testing Algorithm',
    desc: 'Dynamically modulates test difficulty based on continuous probability models. Correct answers elevate question difficulty while errors prompt targeted diagnostic calibration.',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Diagnostic Analytics',
    desc: 'Granular telemetry delivers deep visibility into topic mastery, cognitive depth distribution, response duration, and historical score progression.',
  },
  {
    icon: Target,
    title: 'Precision Knowledge Deficit Tracking',
    desc: 'Automatically pinpoints specific conceptual gaps across subjects and generates targeted remedial pathways to accelerate mastery.',
  },
  {
    icon: Zap,
    title: 'Verified AI Test Solver',
    desc: 'Accepts raw question papers and text to formulate verified, structured solutions with multi-format styling (Short, Detailed, Exam, and Point-wise).',
  },
]

export function About() {
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
            <Link to="/login" className="text-[#606C38] hover:text-[#283618] transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-[#606C38] px-4 py-2 text-[#FEFAE0] hover:bg-[#283618] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#606C38] hover:text-[#283618] mb-8 bg-white/70 px-3.5 py-1.5 rounded-xl border border-[#E8E2C8] transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#BC6C25]" /> Back to Home
          </Link>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#BC6C25] bg-[#BC6C25]/10 px-3.5 py-1 rounded-full border border-[#BC6C25]/20">
              Platform Architecture &amp; Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[#283618] mt-4 mb-6">
              Empowering Learners with Diagnostic Precision.
            </h2>
            <p className="text-[#606C38] text-base sm:text-lg leading-relaxed mb-12 font-medium">
              LearnFlow bridges the gap between passive reading and active comprehension. By pairing automated question generation with time-tested psychometric and cognitive frameworks, our system transforms raw study materials into personalized assessment systems.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/95 rounded-2xl border border-[#E8E2C8] p-6 hover:border-[#DDA15E] transition-all shadow-sm hover:shadow-md"
              >
                <div className="h-11 w-11 bg-[#606C38]/10 text-[#606C38] border border-[#606C38]/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#283618] text-base mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-[#606C38] leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>

          {/* Educational Philosophy Section */}
          <div className="mt-14 card p-8 border-[#E8E2C8] bg-white/90">
            <h3 className="text-xl font-bold text-[#283618] mb-3">Our Pedagogical Foundation</h3>
            <div className="space-y-3 text-xs sm:text-sm text-[#606C38] leading-relaxed">
              <p>
                Traditional testing approaches treat evaluation as a static post-study ritual. LearnFlow reconceptualizes testing as an active, continuous learning loop.
              </p>
              <p>
                By classifying questions across Bloom’s cognitive taxonomy (Remembering, Understanding, Applying, Analyzing, and Evaluating), students avoid the illusion of competence and gain clarity on their actual cognitive grasp.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8E2C8]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#283618]">
                <CheckCircle2 className="h-4 w-4 text-[#606C38]" /> Objective Difficulty Scaling
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#283618]">
                <CheckCircle2 className="h-4 w-4 text-[#606C38]" /> Continuous Feedback Loops
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#283618]">
                <CheckCircle2 className="h-4 w-4 text-[#606C38]" /> Verified Explanations
              </div>
            </div>
          </div>

          {/* Call to Action Card */}
          <div className="mt-12 bg-[#283618] text-[#FEFAE0] rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#606C38]/40">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#FEFAE0] mb-2">Elevate Your Assessment Routine</h3>
              <p className="text-xs sm:text-sm text-[#DDA15E]">
                Upload your course materials and launch your first adaptive session today.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#BC6C25] text-[#FEFAE0] rounded-xl text-sm font-bold hover:bg-[#A1581B] transition-colors shrink-0 shadow-md"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
