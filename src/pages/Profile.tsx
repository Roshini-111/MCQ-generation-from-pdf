import { User, Mail, Calendar, Award, Brain, BookOpen, Target, CreditCard as Edit2, Save, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useEffect, useState } from 'react'

type ProfileData = {
  name: string
  email: string
  bio: string
  learningGoal: string
  memberSince: string
  interests: string[]
  profileComplete: boolean
}

const STORAGE_KEY = 'learnflow_profile'

const defaultProfile: ProfileData = {
  name: 'Alex Carter',
  email: 'your@email.com',
  bio: 'Computer Science student focusing on distributed systems, AI concepts, and network architectures.',
  learningGoal: 'Master CS Fundamentals and ace competitive tests',
  memberSince: new Date().toISOString(),
  interests: ['Computer Networks', 'DBMS', 'Operating Systems', 'Data Structures'],
  profileComplete: true,
}

export function Profile() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [setupForm, setSetupForm] = useState<ProfileData>(defaultProfile)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      const currentUser = localStorage.getItem('learnflow_user')
      const parsed = currentUser ? JSON.parse(currentUser) : null
      const nextProfile = parsed
        ? {
            ...defaultProfile,
            name: parsed.name || 'Alex Carter',
            email: parsed.email || 'your@email.com',
            memberSince: parsed.memberSince || new Date().toISOString(),
            profileComplete: true,
          }
        : defaultProfile

      setProfile(nextProfile)
      setSetupForm(nextProfile)
      return
    }

    const parsedProfile = JSON.parse(saved)
    setProfile(parsedProfile)
    setSetupForm(parsedProfile)
  }, [])

  const saveProfile = (nextProfile: ProfileData) => {
    const finalProfile = {
      ...nextProfile,
      profileComplete: true,
      memberSince: nextProfile.memberSince || new Date().toISOString(),
    }

    setProfile(finalProfile)
    setSetupForm(finalProfile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile))
  }

  const stats = [
    { label: 'Overall Score', value: '78%', icon: Award, color: 'bg-[#606C38]/15 text-[#606C38] border border-[#606C38]/30' },
    { label: 'Quizzes Taken', value: 12, icon: Brain, color: 'bg-[#DDA15E]/25 text-[#B07432] border border-[#DDA15E]/40' },
    { label: 'Questions Generated', value: 48, icon: BookOpen, color: 'bg-[#BC6C25]/20 text-[#BC6C25] border border-[#BC6C25]/40' },
    { label: 'Materials Uploaded', value: 4, icon: BookOpen, color: 'bg-[#283618]/15 text-[#283618] border border-[#283618]/30' },
  ]

  const handleSetupSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    saveProfile({
      ...setupForm,
      email: setupForm.email || profile.email,
      memberSince: setupForm.memberSince || new Date().toISOString(),
    })
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Profile & Preferences"
        subtitle="Manage your learner identity, subject interests, and study statistics"
      />

      {/* Header card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-20 w-20 bg-gradient-to-br from-[#606C38] to-[#BC6C25] rounded-2xl flex items-center justify-center text-[#FEFAE0] text-3xl font-extrabold shrink-0 shadow-md">
            {profile.name.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Full Name" />
                <input className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
                <textarea className="input min-h-[60px]" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#283618]">{profile.name || 'Alex Carter'}</h2>
                <p className="text-xs text-[#606C38] flex items-center gap-1.5 mt-1 font-semibold">
                  <Mail className="h-3.5 w-3.5 text-[#DDA15E]" /> {profile.email || 'your@email.com'}
                </p>
                <p className="text-xs text-[#283618] mt-2 leading-relaxed font-medium">{profile.bio || 'Computer Science student focusing on distributed systems, AI concepts, and network architectures.'}</p>
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (editing) {
                saveProfile(profile)
              }
              setEditing(!editing)
            }}
            className={editing ? 'btn-primary shadow-sm' : 'btn-secondary shadow-sm'}
          >
            {editing ? <><Save className="h-4 w-4 text-[#DDA15E]" /> Save</> : <><Edit2 className="h-4 w-4 text-[#606C38]" /> Edit Profile</>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-extrabold text-[#283618]">{stat.value}</p>
              <p className="text-xs font-semibold text-[#606C38] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="card space-y-4">
          <h3 className="font-bold text-[#283618] text-base pb-2 border-b border-[#E8E2C8]">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#E8E2C8]/60">
              <span className="text-xs font-medium text-[#606C38] flex items-center gap-2">
                <User className="h-4 w-4 text-[#DDA15E]" /> Full Name
              </span>
              <span className="text-xs font-bold text-[#283618]">{profile.name || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E8E2C8]/60">
              <span className="text-xs font-medium text-[#606C38] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#DDA15E]" /> Email Address
              </span>
              <span className="text-xs font-bold text-[#283618]">{profile.email || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E8E2C8]/60">
              <span className="text-xs font-medium text-[#606C38] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#DDA15E]" /> Member Since
              </span>
              <span className="text-xs font-bold text-[#283618]">
                {profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2026'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-[#606C38] flex items-center gap-2">
                <Target className="h-4 w-4 text-[#BC6C25]" /> Learning Goal
              </span>
              <span className="text-xs font-bold text-[#283618] text-right">{profile.learningGoal || 'Master CS Fundamentals'}</span>
            </div>
          </div>
        </div>

        {/* Interests and Badges */}
        <div className="card space-y-5">
          <div>
            <h3 className="font-bold text-[#283618] text-base pb-2 border-b border-[#E8E2C8] mb-3">Subject Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.length ? (
                profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-[#FEFAE0] text-[#283618] rounded-xl text-xs font-bold border border-[#E8E2C8]"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#606C38]">No interests added yet.</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#283618] text-base pb-2 border-b border-[#E8E2C8] mb-3">Milestone Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'First Adaptive Quiz', icon: Brain, color: 'bg-[#606C38]/15 text-[#606C38] border-[#606C38]/30' },
                { label: '10+ Questions', icon: BookOpen, color: 'bg-[#BC6C25]/15 text-[#BC6C25] border-[#BC6C25]/30' },
                { label: 'Consistent Learner', icon: Award, color: 'bg-[#DDA15E]/25 text-[#B07432] border-[#DDA15E]/40' },
              ].map((badge) => {
                const Icon = badge.icon
                return (
                  <div key={badge.label} className="flex flex-col items-center text-center p-3 border border-[#E8E2C8] rounded-2xl bg-[#FEFAE0]/30 shadow-sm">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 border ${badge.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#283618] leading-tight">{badge.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
