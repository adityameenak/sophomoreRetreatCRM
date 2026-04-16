import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials, classNames } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/companies', label: 'Companies', icon: Building2 },
]

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const role = profile?.role === 'admin'
    ? 'Admin'
    : profile?.role === 'co_admin'
    ? 'Co-Admin'
    : 'Member'

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-slate-900">
      {/* Logo / App name */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-xs font-bold text-white">SR</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Sponsor CRM</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sophomore Retreat</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Quick actions */}
        <div className="mt-6">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Quick Add
          </p>
          <NavLink
            to="/companies/new"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-600 text-xs font-bold text-slate-400">+</span>
            New Company
          </NavLink>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{displayName}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
