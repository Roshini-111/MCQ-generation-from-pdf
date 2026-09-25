import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  X,
  LogOut,
  LayoutDashboard,
  BookText,
  FolderOpen,
  BrainCircuit,
  FileText,
  BarChart3,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { LineSidebar } from './LineSidebar'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/materials', label: 'My Materials', icon: BookText },
  { to: '/question-bank', label: 'Question Bank', icon: FolderOpen },
  { to: '/adaptive-quiz', label: 'Adaptive Quiz', icon: BrainCircuit },
  { to: '/test-solver', label: 'Test Solver', icon: FileText },
  { to: '/results', label: 'Results & Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

type StoredUser = {
  name: string
  email: string
  initials: string
}

const getStoredUser = (): StoredUser => {
  try {
    const profileJson = localStorage.getItem('learnflow_profile')
    if (profileJson) {
      const profile = JSON.parse(profileJson)
      if (profile?.name) {
        return {
          name: profile.name,
          email: profile.email || 'your@email.com',
          initials: profile.name.trim().charAt(0).toUpperCase() || 'U',
        }
      }
    }

    const userJson = localStorage.getItem('learnflow_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      if (user?.name) {
        return {
          name: user.name,
          email: user.email || 'your@email.com',
          initials: user.name.trim().charAt(0).toUpperCase() || 'U',
        }
      }
    }
  } catch (error) {
    console.warn('Unable to load saved user profile', error)
  }

  return {
    name: 'Alex Carter',
    email: 'your@email.com',
    initials: 'A',
  }
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<StoredUser>(() => getStoredUser())

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  const activeIndex = Math.max(0, navItems.findIndex((item) => item.to === location.pathname))

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#283618] flex flex-col transition-all duration-300 ease-out border-r border-[#606C38]/30 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#606C38]/30 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="h-9 w-9 bg-[#606C38] rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5 text-[#FEFAE0]" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-[#FEFAE0] text-base leading-tight">LearnFlow</h1>
                <p className="text-[10px] text-[#DDA15E] font-medium leading-tight">Adaptive Assessment</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-[#DDA15E] hover:text-[#FEFAE0] hover:bg-white/5 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <button onClick={onClose} className="lg:hidden text-[#DDA15E] hover:text-[#FEFAE0]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {collapsed ? (
            <nav className="flex flex-col items-center gap-2.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to

                return (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to)
                      onClose()
                    }}
                    className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-[#606C38] text-[#FEFAE0] shadow-md border border-[#DDA15E]/30'
                        : 'text-[#DDA15E] hover:bg-white/10 hover:text-[#FEFAE0]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                )
              })}
            </nav>
          ) : (
            <LineSidebar
              key={location.pathname}
              items={navItems.map((item) => item.label)}
              accentColor="#FEFAE0"
              textColor="#DDA15E"
              markerColor="#BC6C25"
              showIndex={false}
              showMarker
              proximityRadius={110}
              maxShift={14}
              falloff="smooth"
              markerLength={28}
              markerGap={12}
              itemGap={24}
              fontSize={0.9}
              smoothing={100}
              defaultActive={activeIndex}
              onItemClick={(index) => {
                navigate(navItems[index].to)
                onClose()
              }}
            />
          )}
        </div>

        {/* Footer profile */}
        <div className={`px-4 py-3.5 border-t border-[#606C38]/30 shrink-0 bg-[#283618]/60 ${collapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}>
          <div className="h-9 w-9 bg-gradient-to-br from-[#606C38] to-[#BC6C25] rounded-xl flex items-center justify-center text-[#FEFAE0] text-sm font-semibold shrink-0 shadow-sm">
            {user.initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#FEFAE0] truncate">{user.name}</p>
                <p className="text-[10px] text-[#DDA15E] truncate">{user.email}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-[#DDA15E] hover:text-[#BC6C25] hover:bg-white/5 p-1.5 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
