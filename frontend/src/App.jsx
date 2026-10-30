
import { useState } from 'react'
import {
  LayoutDashboard, MapPin, FileText, BarChart3,
  Users, Settings, Bell, Plus, Search,
  AlertTriangle, CheckCircle2, Clock, Menu, Eye,
  Check, CheckCheck, Trash2, X, LogOut, Mail, LockKeyhole, UserRound
} from 'lucide-react'

import ReportProblem from './ReportProblem'
import MapView from './MapView'
import Analytics from './Analytics'
import Community from './Community'
import SettingsPage from './Settings'

const problems = [
  { id: 1, title: 'Large pothole on main road', category: 'Road Damage', location: 'Sector 15, Chandigarh', severity: 'High', status: 'In Progress' },
  { id: 2, title: 'Garbage overflowing', category: 'Garbage', location: 'Sector 22, Chandigarh', severity: 'Medium', status: 'Under Review' },
  { id: 3, title: 'Streetlight not working', category: 'Streetlight', location: 'Sector 34, Chandigarh', severity: 'Low', status: 'Resolved' },
  { id: 4, title: 'Waterlogging near market', category: 'Waterlogging', location: 'Sector 17, Chandigarh', severity: 'High', status: 'Reported' },
  { id: 5, title: 'Damaged footpath', category: 'Footpath Damage', location: 'Sector 20, Chandigarh', severity: 'Medium', status: 'Reported' },
]

function App() {
  // Demo authentication is stored in this browser. Connect a backend for production security.
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('civiclens_session') || 'null')
    } catch {
      return null
    }
  })
  const [authMode, setAuthMode] = useState('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [showAuthPassword, setShowAuthPassword] = useState(false)

  const handleAuthSubmit = (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthSuccess('')
    const email = authEmail.trim().toLowerCase()

    if (!email || !authPassword) {
      setAuthError('Please enter your email and password.')
      return
    }

    if (authMode === 'signup') {
      if (!authName.trim()) return setAuthError('Please enter your full name.')
      if (authPassword.length < 6) return setAuthError('Password must contain at least 6 characters.')
      if (authPassword !== authConfirmPassword) return setAuthError('Passwords do not match.')

      const newUser = { name: authName.trim(), email, password: authPassword }
      localStorage.setItem('civiclens_user', JSON.stringify(newUser))
      setAuthMode('login')
      setAuthPassword('')
      setAuthConfirmPassword('')
      setAuthSuccess('Account created successfully. Please log in.')
      return
    }

    let savedUser = null
    try {
      savedUser = JSON.parse(localStorage.getItem('civiclens_user') || 'null')
    } catch {
      savedUser = null
    }

    if (!savedUser || savedUser.email !== email || savedUser.password !== authPassword) {
      setAuthError('Invalid email or password. Please sign up first if you are a new user.')
      return
    }

    const session = { name: savedUser.name, email: savedUser.email }
    localStorage.setItem('civiclens_session', JSON.stringify(session))
    setAuthUser(session)
    setAuthPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('civiclens_session')
    setAuthUser(null)
    setAuthMode('login')
    setAuthEmail('')
    setAuthPassword('')
    setAuthError('')
    setAuthSuccess('')
  }

  const [active, setActive] = useState('Dashboard')
  const [showReport, setShowReport] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Problem Reported',
      message: 'A pothole has been reported in Sector 15, Chandigarh.',
      time: '5 minutes ago',
      type: 'problem',
      read: false,
    },
    {
      id: 2,
      title: 'Problem Status Updated',
      message: 'Garbage overflowing in Sector 22 is now under review.',
      time: '1 hour ago',
      type: 'update',
      read: false,
    },
    {
      id: 3,
      title: 'Issue Resolved',
      message: 'Streetlight problem in Sector 34 has been resolved.',
      time: '3 hours ago',
      type: 'resolved',
      read: false,
    },
    {
      id: 4,
      title: 'Community Update',
      message: 'Your community has received new support votes.',
      time: 'Yesterday',
      type: 'community',
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Problems', icon: FileText },
    { name: 'Map View', icon: MapPin },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Community', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  const filteredProblems = problems.filter(p =>
    `${p.title} ${p.category} ${p.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const severityColors = {
    High: 'bg-red-50 text-red-600',
    Medium: 'bg-orange-50 text-orange-600',
    Low: 'bg-green-50 text-green-600',
  }

  const statusColors = {
    Reported: 'bg-blue-50 text-blue-600',
    'In Progress': 'bg-purple-50 text-purple-600',
    'Under Review': 'bg-orange-50 text-orange-600',
    Resolved: 'bg-green-50 text-green-600',
  }

  const notificationIcon = {
    problem: AlertTriangle,
    update: Clock,
    resolved: CheckCircle2,
    community: Users,
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const openPage = (name) => {
    setActive(name)
    setShowReport(false)
    setSelectedProblem(null)
    setSearch('')
    setMenuOpen(false)
    setShowNotifications(false)
  }

  const ProblemTable = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[650px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b">
            <th className="py-4">PROBLEM</th>
            <th className="py-4">LOCATION</th>
            <th className="py-4">SEVERITY</th>
            <th className="py-4">STATUS</th>
            <th className="py-4">ACTION</th>
          </tr>
        </thead>

        <tbody>
          {data.map(p => (
            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 pr-3">
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
              </td>

              <td className="py-4 text-sm text-slate-500">{p.location}</td>

              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs ${severityColors[p.severity]}`}>
                  {p.severity}
                </span>
              </td>

              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs ${statusColors[p.status]}`}>
                  {p.status}
                </span>
              </td>

              <td className="py-4">
                <button
                  onClick={() => setSelectedProblem(p)}
                  className="text-cyan-700 flex items-center gap-1 text-sm font-semibold"
                >
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-10 text-slate-400">
                No problems found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-28 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="relative w-full max-w-5xl min-h-[620px] bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900 text-white p-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500 p-3 rounded-2xl"><MapPin size={28} /></div>
                <div><h1 className="text-3xl font-bold">CivicLens</h1><p className="text-sm text-slate-300">Community Intelligence</p></div>
              </div>
              <div className="mt-24">
                <p className="text-cyan-300 text-sm font-semibold tracking-widest">YOUR CITY, YOUR VOICE</p>
                <h2 className="text-4xl font-bold leading-tight mt-4">Make your community a better place.</h2>
                <p className="text-slate-300 mt-5 leading-relaxed">Report local problems, track progress and work together to improve public spaces.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">© 2026 CivicLens. Building better communities together.</p>
          </div>

          <div className="flex items-center justify-center p-7 sm:p-12">
            <div className="w-full max-w-md">
              <div className="md:hidden flex items-center gap-3 mb-10">
                <div className="bg-cyan-500 text-white p-3 rounded-xl"><MapPin size={25} /></div>
                <div><h1 className="text-2xl font-bold text-slate-900">CivicLens</h1><p className="text-xs text-slate-500">Community Intelligence</p></div>
              </div>
              <p className="text-sm font-semibold text-cyan-700">WELCOME TO CIVICLENS</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="text-slate-500 mt-2">{authMode === 'login' ? 'Log in to continue to your community dashboard.' : 'Join your community and help make a difference.'}</p>

              <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mt-8 mb-6">
                <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess('') }}
                  className={`py-2.5 rounded-lg text-sm font-semibold ${authMode === 'login' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>Login</button>
                <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess('') }}
                  className={`py-2.5 rounded-lg text-sm font-semibold ${authMode === 'signup' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>Sign up</button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Full name</span>
                    <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                      <UserRound size={18} className="text-slate-400" />
                      <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Enter your full name" className="w-full outline-none text-sm" autoComplete="name" />
                    </div>
                  </label>
                )}
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email address</span>
                  <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                    <Mail size={18} className="text-slate-400" />
                    <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" className="w-full outline-none text-sm" autoComplete="email" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                    <LockKeyhole size={18} className="text-slate-400" />
                    <input type={showAuthPassword ? 'text' : 'password'} value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Enter your password" className="w-full outline-none text-sm" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
                    <button type="button" onClick={() => setShowAuthPassword(!showAuthPassword)} className="text-xs font-semibold text-cyan-700">{showAuthPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                {authMode === 'signup' && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Confirm password</span>
                    <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                      <LockKeyhole size={18} className="text-slate-400" />
                      <input type={showAuthPassword ? 'text' : 'password'} value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full outline-none text-sm" autoComplete="new-password" />
                    </div>
                  </label>
                )}
                {authError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{authError}</p>}
                {authSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 rounded-lg p-3">{authSuccess}</p>}
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-cyan-500/20">
                  {authMode === 'login' ? 'Login to CivicLens' : 'Create Account'}
                </button>
              </form>
              <p className="text-xs text-slate-400 text-center mt-6">By continuing, you agree to use CivicLens respectfully and responsibly.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">

        <aside className={`${menuOpen ? 'block' : 'hidden'} md:block w-64 shrink-0 bg-slate-950 text-white p-6`}>
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-cyan-500 p-2 rounded-xl">
              <MapPin size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">CivicLens</h1>
              <p className="text-xs text-slate-400">Community Intelligence</p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map(item => {
              const Icon = item.icon

              return (
                <button
                  key={item.name}
                  onClick={() => openPage(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${active === item.name
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              )
            })}
          </nav>

          <div className="mt-16 rounded-2xl bg-slate-900 p-4">
            <p className="font-semibold text-sm">Make your city better!</p>
            <p className="text-xs text-slate-400 mt-2">
              Every report helps build a better community.
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-5 md:p-8">

          <header className="flex flex-wrap items-center justify-between gap-4 mb-9">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu />
              </button>

              <div>
                <p className="text-sm text-slate-500">
                  Community / {showReport ? 'Report Problem' : active}
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {showReport ? 'Report a Problem' : active}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-white rounded-xl border hover:bg-slate-50 transition"
                  aria-label="Notifications"
                >
                  <Bell size={19} />

                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-14 z-[100] w-[min(370px,calc(100vw-35px))] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {unreadCount} unread notifications
                        </p>
                      </div>

                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-3 flex justify-between gap-2 border-b">
                      <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-xs text-cyan-700 font-semibold flex items-center gap-1 disabled:opacity-40"
                      >
                        <CheckCheck size={15} />
                        Mark all as read
                      </button>

                      <button
                        onClick={clearAllNotifications}
                        disabled={notifications.length === 0}
                        className="text-xs text-red-500 font-semibold flex items-center gap-1 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                        Clear all
                      </button>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                      {notifications.length > 0 ? (

                        notifications.map(n => {
                          const Icon = notificationIcon[n.type]

                          return (
                            <div
                              key={n.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 ${!n.read ? 'bg-cyan-50/60' : ''
                                }`}
                            >
                              <div className="flex gap-3">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                                  <Icon size={19} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold">
                                      {n.title}
                                    </p>

                                    {!n.read && (
                                      <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1 shrink-0" />
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {n.message}
                                  </p>

                                  <div className="flex justify-between items-center mt-3">
                                    <span className="text-[11px] text-slate-400">
                                      {n.time}
                                    </span>

                                    {!n.read && (
                                      <button
                                        onClick={() => markAsRead(n.id)}
                                        className="text-xs text-cyan-700 font-semibold flex items-center gap-1"
                                      >
                                        <Check size={13} />
                                        Mark read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })

                      ) : (

                        <div className="py-12 text-center">
                          <Bell size={35} className="mx-auto text-slate-300" />
                          <p className="font-semibold text-slate-600 mt-3">
                            All caught up!
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            No notifications available.
                          </p>
                        </div>

                      )}
                    </div>

                    <div className="p-3 bg-slate-50 text-center">
                      <p className="text-xs text-slate-400">
                        CivicLens Community Notifications
                      </p>
                    </div>

                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    {(authUser.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{authUser.name}</p>
                    <p className="text-xs text-slate-500">Citizen</p>
                  </div>
                </div>
                <button onClick={handleLogout} title="Logout" aria-label="Logout" className="p-3 bg-white rounded-xl border text-slate-600 hover:text-red-600 hover:bg-red-50 transition">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {showReport ? (

            <ReportProblem onBack={() => setShowReport(false)} />

          ) : active === 'Settings' ? (

            <SettingsPage />

          ) : active === 'Map View' ? (

            <MapView />

          ) : active === 'Analytics' ? (

            <Analytics />

          ) : active === 'Community' ? (

            <Community />

          ) : active === 'Problems' ? (

            <div className="space-y-6">
              <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-semibold">
                  COMMUNITY ISSUES
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  Reported Problems
                </h2>

                <p className="text-slate-300 mt-2">
                  Explore and track infrastructure problems in your community.
                </p>

                <button
                  onClick={() => setShowReport(true)}
                  className="mt-5 bg-cyan-400 text-slate-950 font-semibold px-5 py-3 rounded-xl flex items-center gap-2"
                >
                  <Plus size={18} /> Report New Problem
                </button>
              </section>

              <section className="bg-white rounded-2xl p-5 border">
                <div className="flex items-center gap-2 border rounded-xl px-3 py-3 mb-5 max-w-md">
                  <Search size={18} className="text-slate-400" />

                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="outline-none w-full text-sm"
                  />
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Showing {filteredProblems.length} of {problems.length} problems
                </p>

                <ProblemTable data={filteredProblems} />
              </section>
            </div>

          ) : active === 'Dashboard' ? (

            <>
              <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7 md:p-9 mb-8">
                <p className="text-cyan-300 text-sm font-medium">
                  CIVICLENS COMMUNITY PORTAL
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  Your City, Your Voice.
                </h2>

                <p className="text-slate-300 mt-3 max-w-xl">
                  Report local problems, support your community and help make public spaces better for everyone.
                </p>

                <button
                  onClick={() => setShowReport(true)}
                  className="mt-6 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-5 py-3 rounded-xl flex items-center gap-2"
                >
                  <Plus size={19} /> Report a Problem
                </button>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {[
                  { title: 'Total Reports', value: '156', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Active Problems', value: '42', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { title: 'Resolved Issues', value: '89', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                  { title: 'Under Review', value: '25', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map(stat => {
                  const Icon = stat.icon

                  return (
                    <div key={stat.title} className="bg-white rounded-2xl p-5 border shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">{stat.title}</p>

                        <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                          <Icon size={20} />
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold mt-4">
                        {stat.value}
                      </h3>
                    </div>
                  )
                })}
              </section>

              <section className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      Recent Community Problems
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Latest reported infrastructure issues
                    </p>
                  </div>

                  <button
                    onClick={() => openPage('Problems')}
                    className="text-cyan-700 font-semibold text-sm"
                  >
                    View All
                  </button>
                </div>

                <ProblemTable data={problems.slice(0, 3)} />
              </section>

              <footer className="text-center text-xs text-slate-400 mt-8">
                © 2026 CivicLens. Building better communities together.
              </footer>
            </>

          ) : (

            <section className="bg-white rounded-2xl border p-10 text-center">
              <div className="bg-cyan-50 text-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Settings size={30} />
              </div>

              <h3 className="text-xl font-bold mt-5">{active}</h3>

              <p className="text-slate-500 mt-2">
                This section is planned for the next development phase.
              </p>

              <button
                onClick={() => openPage('Dashboard')}
                className="mt-5 bg-cyan-600 text-white px-5 py-3 rounded-xl"
              >
                Back to Dashboard
              </button>
            </section>
          )}

          {selectedProblem && (
            <div className="fixed inset-0 z-[1000] bg-slate-950/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold">Problem Details</h3>

                  <button onClick={() => setSelectedProblem(null)}>
                    ✕
                  </button>
                </div>

                <h4 className="font-semibold">
                  {selectedProblem.title}
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  {selectedProblem.location}
                </p>

                <p className="text-sm mt-3">
                  Category: {selectedProblem.category}
                </p>

                <p className="text-sm mt-2">
                  Severity: {selectedProblem.severity}
                </p>

                <p className="text-sm mt-2">
                  Status: {selectedProblem.status}
                </p>

                <button
                  onClick={() => setSelectedProblem(null)}
                  className="mt-6 w-full bg-cyan-600 text-white py-3 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default App
