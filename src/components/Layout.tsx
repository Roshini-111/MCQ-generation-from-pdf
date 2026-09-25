import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Sidebar } from './Sidebar'

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

export function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<StoredUser>(() => getStoredUser())

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-[#FEFAE0]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#FEFAE0]">
        <header className="sticky top-0 z-30 bg-[#283618]/95 backdrop-blur-md border-b border-[#606C38]/40 h-16 flex items-center justify-between px-4 lg:px-6 text-[#FEFAE0]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#DDA15E] hover:text-[#FEFAE0] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-[#DDA15E] hover:text-[#FEFAE0] hover:bg-white/5 transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <div>
              <h2 className="text-base font-semibold text-[#FEFAE0]">Welcome back, {user.name}</h2>
              <p className="text-xs text-[#DDA15E] hidden sm:block">Let's continue your learning journey</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-[#DDA15E] hover:text-[#FEFAE0] p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#BC6C25] rounded-full ring-2 ring-[#283618]" />
            </button>
            <div className="h-9 w-9 bg-gradient-to-br from-[#606C38] to-[#BC6C25] rounded-xl flex items-center justify-center text-[#FEFAE0] text-sm font-semibold shadow-sm">
              {user.initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-7 max-w-7xl w-full mx-auto bg-[#FEFAE0]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
