import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutDashboard, MapPin, FileText, BarChart3,
  Users, Settings, Bell, Plus, Search,
  AlertTriangle, CheckCircle2, Clock, Menu, Eye,
  Check, CheckCheck, Trash2, X, LogOut, Mail,
  LockKeyhole, UserRound, KeyRound
} from 'lucide-react'

import ReportProblem from './ReportProblem'
import MapView from './MapView'
import Analytics from './Analytics'
import Community from './Community'
import SettingsPage from './Settings'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Red asterisk shown next to mandatory field labels
const Required = () => (
  <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
)

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [authUser, setAuthUser] = useState(() => {
    try {
      const token = localStorage.getItem('civiclens_session')
      const user = JSON.parse(localStorage.getItem('civiclens_user') || 'null')

      if (!token || token.split('.').length !== 3 || !user) {
        return null
      }

      return user
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
  const [authLoading, setAuthLoading] = useState(false)
  const [authCode, setAuthCode] = useState('')
  const [resendWait, setResendWait] = useState(0)

  // Countdown for the "Resend code" button
  useEffect(() => {
    if (resendWait <= 0) return

    const timer = setTimeout(() => setResendWait(prev => prev - 1), 1000)

    return () => clearTimeout(timer)
  }, [resendWait])

  // =========================
  // PROBLEMS STATE
  // =========================

  const [problems, setProblems] = useState([])
  const [problemsLoading, setProblemsLoading] = useState(false)
  const [problemsError, setProblemsError] = useState('')

  // =========================
  // ANALYTICS STATE
  // =========================

  const [dashboardAnalytics, setDashboardAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  // =========================
  // DASHBOARD UI STATE
  // =========================

  const [active, setActive] = useState('Dashboard')
  const [showReport, setShowReport] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // =========================
  // LIVE NOTIFICATIONS
  // Only new SSE events are stored here.
  // =========================

  const [liveNotifications, setLiveNotifications] = useState([])

  // =========================
  // NOTIFICATION PREFERENCES
  // =========================

  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('civiclens_read_notifications') || '[]'
      )
    } catch {
      return []
    }
  })

  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('civiclens_dismissed_notifications') || '[]'
      )
    } catch {
      return []
    }
  })

  // =========================
  // FETCH PROBLEMS
  // Called on initial login and manual refresh.
  // =========================

  const fetchProblems = useCallback(async () => {
    const token = localStorage.getItem('civiclens_session')

    if (!token) {
      setProblemsError('Please log in to view problems.')
      return
    }

    try {
      setProblemsLoading(true)
      setProblemsError('')

      const response = await fetch(`${API_URL}/api/problems`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not load problems.')
      }

      setProblems(Array.isArray(data.problems) ? data.problems : [])
    } catch (error) {
      console.error('Fetch problems error:', error)
      setProblemsError(error.message || 'Something went wrong.')
    } finally {
      setProblemsLoading(false)
    }
  }, [])

  // =========================
  // FETCH DASHBOARD ANALYTICS
  // =========================

  const fetchDashboardAnalytics = useCallback(async () => {
    const token = localStorage.getItem('civiclens_session')

    if (!token) {
      setAnalyticsError('Please log in to view dashboard analytics.')
      setDashboardAnalytics(null)
      return
    }

    try {
      setAnalyticsLoading(true)
      setAnalyticsError('')

      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not load dashboard analytics.')
      }

      setDashboardAnalytics(data.analytics)
    } catch (error) {
      console.error('Dashboard analytics error:', error)
      setAnalyticsError(error.message || 'Something went wrong.')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  // =========================
  // INITIAL DATA FETCH
  // =========================

  useEffect(() => {
    if (authUser) {
      fetchProblems()
      fetchDashboardAnalytics()
    }
  }, [authUser, fetchProblems, fetchDashboardAnalytics])

  // =========================
  // SERVER-SENT EVENTS
  // Listen for newly submitted reports.
  // No repeated GET requests.
  // =========================

  useEffect(() => {
    if (!authUser) return

    let stopped = false
    let currentController = null

    const connectToEvents = async () => {
      let retryDelay = 2000

      while (!stopped) {
        try {
          const token = localStorage.getItem('civiclens_session')

          if (!token) return

          currentController = new AbortController()

          const response = await fetch(`${API_URL}/api/problems/events`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'text/event-stream',
            },
            signal: currentController.signal,
          })

          if (!response.ok) {
            throw new Error(`Notification connection failed: ${response.status}`)
          }

          if (!response.body) {
            throw new Error('Streaming is not supported by this browser.')
          }

          retryDelay = 2000

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (!stopped) {
            const { value, done } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })
            buffer = buffer.replace(/\r\n/g, '\n')

            const events = buffer.split('\n\n')
            buffer = events.pop() || ''

            for (const eventBlock of events) {
              if (!eventBlock.trim()) continue

              const lines = eventBlock.split('\n')
              let eventName = ''
              let eventData = ''

              for (const line of lines) {
                if (line.startsWith('event:')) {
                  eventName = line.slice(6).trim()
                }

                if (line.startsWith('data:')) {
                  eventData += line.slice(5).trim()
                }
              }

              if (eventName === 'new-problem' && eventData) {
                try {
                  const newProblem = JSON.parse(eventData)

                  if (!newProblem._id) continue

                  // Update the problems list without another API request.
                  setProblems(prev => {
                    const alreadyExists = prev.some(
                      problem => String(problem._id) === String(newProblem._id)
                    )

                    if (alreadyExists) return prev

                    return [newProblem, ...prev]
                  })

                  // Create a notification only for this new report.
                  setLiveNotifications(prev => {
                    const alreadyExists = prev.some(
                      notification =>
                        notification.id === String(newProblem._id)
                    )

                    if (alreadyExists) return prev

                    const id = String(newProblem._id)

                    return [
                      {
                        id,
                        problemId: id,
                        title: 'New Problem Reported',
                        message: `${newProblem.title} has been reported at ${newProblem.location}.`,
                        time: newProblem.createdAt
                          ? new Date(newProblem.createdAt).toLocaleString()
                          : 'Just now',
                        type: 'problem',
                        createdAt: newProblem.createdAt
                          ? new Date(newProblem.createdAt).getTime()
                          : Date.now(),
                      },
                      ...prev,
                    ]
                  })
                } catch (error) {
                  console.error('Could not process new report event:', error)
                }
              }
            }
          }
        } catch (error) {
          if (error.name === 'AbortError' || stopped) {
            break
          }

          console.error('Live notification connection error:', error)
        }

        if (stopped) break

        // Reconnect with increasing delay if connection drops.
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, retryDelay)

          currentController = {
            abort: () => clearTimeout(timeout),
          }
        })

        retryDelay = Math.min(retryDelay * 2, 30000)
      }
    }

    connectToEvents()

    return () => {
      stopped = true
      currentController?.abort?.()
    }
  }, [authUser])

  // =========================
  // STATUS UPDATE (ADMIN)
  // =========================

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedProblem?._id || authUser?.role !== 'admin') {
      return
    }

    const token = localStorage.getItem('civiclens_session')

    try {
      setStatusUpdating(true)
      setStatusError('')
      setStatusSuccess('')

      const response = await fetch(
        `${API_URL}/api/problems/${selectedProblem._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not update problem status.')
      }

      setProblems(prev =>
        prev.map(problem =>
          problem._id === selectedProblem._id
            ? { ...problem, status: newStatus }
            : problem
        )
      )

      setSelectedProblem(prev => ({
        ...prev,
        status: newStatus,
      }))

      setStatusSuccess('Problem status updated successfully.')

      fetchDashboardAnalytics()
    } catch (error) {
      setStatusError(error.message || 'Status update failed.')
    } finally {
      setStatusUpdating(false)
    }
  }

  // =========================
  // INITIAL DATA FETCH
  // =========================

  // Notifications are based only on new SSE events.
  const notifications = useMemo(() => {
    return liveNotifications
      .filter(notification =>
        !dismissedNotifications.includes(notification.id)
      )
      .map(notification => ({
        ...notification,
        read: readNotifications.includes(notification.id),
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [liveNotifications, readNotifications, dismissedNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  // =========================
  // NOTIFICATION ACTIONS
  // =========================

  const markAsRead = (id) => {
    setReadNotifications(prev => {
      const updated = [...new Set([...prev, id])]

      localStorage.setItem(
        'civiclens_read_notifications',
        JSON.stringify(updated)
      )

      return updated
    })
  }

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id)

    setReadNotifications(prev => {
      const updated = [...new Set([...prev, ...allIds])]

      localStorage.setItem(
        'civiclens_read_notifications',
        JSON.stringify(updated)
      )

      return updated
    })
  }

  const clearAllNotifications = () => {
    setDismissedNotifications(prev => {
      const updated = [
        ...new Set([
          ...prev,
          ...notifications.map(n => n.id),
        ]),
      ]

      localStorage.setItem(
        'civiclens_dismissed_notifications',
        JSON.stringify(updated)
      )

      return updated
    })
  }

  const notificationIcon = {
    problem: AlertTriangle,
    update: Clock,
    resolved: CheckCircle2,
  }

  // =========================
  // AUTHENTICATION SUBMIT
  // =========================

  const startSession = (data, email) => {
    if (!data.token) {
      throw new Error('JWT token was not received from the server.')
    }

    const user = data.user || {
      id: data.id,
      name: data.name || authName || email.split('@')[0],
      email: data.email || email,
      role: data.role || 'citizen',
    }

    localStorage.setItem('civiclens_session', data.token)
    localStorage.setItem('civiclens_user', JSON.stringify(user))

    setAuthUser(user)
    setAuthPassword('')
    setAuthConfirmPassword('')
    setAuthCode('')
    setLiveNotifications([])
  }

  const goToVerify = (message) => {
    setAuthMode('verify')
    setAuthCode('')
    setAuthPassword('')
    setAuthConfirmPassword('')
    setAuthSuccess(message)
    setResendWait(60)
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    const email = authEmail.trim().toLowerCase()

    // Step 2 of signup: confirm the 6-digit code sent by email
    if (authMode === 'verify') {
      if (!/^\d{6}$/.test(authCode.trim())) {
        setAuthError('Please enter the 6-digit code sent to your email.')
        return
      }

      try {
        setAuthLoading(true)

        const response = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: authCode.trim() }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed.')
        }

        startSession(data, email)
      } catch (error) {
        setAuthError(error.message || 'Something went wrong. Please try again.')
      } finally {
        setAuthLoading(false)
      }

      return
    }

    if (!email || !authPassword) {
      setAuthError('Please enter your email and password.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setAuthError('Please enter a valid email address.')
      return
    }

    if (authMode === 'signup') {
      if (!authName.trim()) {
        setAuthError('Please enter your full name.')
        return
      }

      if (authPassword.length < 6) {
        setAuthError('Password must contain at least 6 characters.')
        return
      }

      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match.')
        return
      }
    }

    try {
      setAuthLoading(true)

      const endpoint = authMode === 'signup' ? 'register' : 'login'

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          authMode === 'signup'
            ? {
                name: authName.trim(),
                email,
                password: authPassword,
              }
            : {
                email,
                password: authPassword,
              }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsVerification) {
          // Account exists but the email was never verified: send a fresh code.
          try {
            await fetch(`${API_URL}/api/auth/resend-code`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            })
          } catch {
            // A recent code may still be valid, so continue to the code screen.
          }

          goToVerify('Your email is not verified yet. Enter the 6-digit code we sent to your email.')
          return
        }

        throw new Error(data.message || 'Authentication failed.')
      }

      if (authMode === 'signup') {
        goToVerify(`We sent a 6-digit code to ${email}. Enter it below to verify your email.`)
        return
      }

      startSession(data, email)
    } catch (error) {
      setAuthError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleResendCode = async () => {
    setAuthError('')
    setAuthSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: authEmail.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not resend the code.')
      }

      setAuthSuccess('A new code has been sent to your email.')
      setResendWait(60)
    } catch (error) {
      setAuthError(error.message || 'Could not resend the code.')
    }
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('civiclens_session')
    localStorage.removeItem('civiclens_user')

    setAuthUser(null)
    setProblems([])
    setProblemsError('')
    setDashboardAnalytics(null)
    setAnalyticsError('')
    setLiveNotifications([])
    setReadNotifications([])
    setDismissedNotifications([])
    setAuthMode('login')
    setAuthEmail('')
    setAuthPassword('')
    setAuthConfirmPassword('')
    setAuthCode('')
    setAuthError('')
    setAuthSuccess('')
    setShowNotifications(false)
  }

  // =========================
  // NAVIGATION
  // =========================

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Problems', icon: FileText },
    { name: 'Map View', icon: MapPin },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Community', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  const openPage = (name) => {
    setActive(name)
    setShowReport(false)
    setSelectedProblem(null)
    setSearch('')
    setMenuOpen(false)
    setShowNotifications(false)

    // No repeated problem fetch while navigating.
    if (name === 'Dashboard') {
      fetchDashboardAnalytics()
    }
  }

  // =========================
  // SEARCH AND COLORS
  // =========================

  const filteredProblems = problems.filter(p =>
    `${p.title || ''} ${p.category || ''} ${p.location || ''}`
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

  // =========================
  // PROBLEM TABLE
  // =========================

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
            <tr
              key={p._id || p.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="py-4 pr-3">
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
              </td>

              <td className="py-4 text-sm text-slate-500">
                {p.location}
              </td>

              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs ${severityColors[p.severity] || 'bg-slate-100 text-slate-600'}`}>
                  {p.severity}
                </span>
              </td>

              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>
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

  // =========================
  // LOGIN / SIGNUP SCREEN
  // =========================

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-28 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-5xl min-h-[620px] bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900 text-white p-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500 p-3 rounded-2xl">
                  <MapPin size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">CivicLens</h1>
                  <p className="text-sm text-slate-300">Community Intelligence</p>
                </div>
              </div>

              <div className="mt-24">
                <p className="text-cyan-300 text-sm font-semibold tracking-widest">
                  YOUR CITY, YOUR VOICE
                </p>
                <h2 className="text-4xl font-bold leading-tight mt-4">
                  Make your community a better place.
                </h2>
                <p className="text-slate-300 mt-5 leading-relaxed">
                  Report local problems, track progress and work together to improve public spaces.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              © 2026 CivicLens. Building better communities together.
            </p>
          </div>

          <div className="flex items-center justify-center p-7 sm:p-12">
            <div className="w-full max-w-md">
              <div className="md:hidden flex items-center gap-3 mb-10">
                <div className="bg-cyan-500 text-white p-3 rounded-xl">
                  <MapPin size={25} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">CivicLens</h1>
                  <p className="text-xs text-slate-500">Community Intelligence</p>
                </div>
              </div>

              <p className="text-sm font-semibold text-cyan-700">
                WELCOME TO CIVICLENS
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {authMode === 'login'
                  ? 'Welcome back'
                  : authMode === 'verify'
                    ? 'Verify your email'
                    : 'Create your account'}
              </h2>

              <p className="text-slate-500 mt-2">
                {authMode === 'login'
                  ? 'Log in to continue to your community dashboard.'
                  : authMode === 'verify'
                    ? 'Enter the 6-digit code we emailed you.'
                    : 'Join your community and help make a difference.'}
              </p>

              {authMode !== 'verify' && (
              <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mt-8 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                  className={`py-2.5 rounded-lg text-sm font-semibold ${
                    authMode === 'login'
                      ? 'bg-white text-cyan-700 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                  className={`py-2.5 rounded-lg text-sm font-semibold ${
                    authMode === 'signup'
                      ? 'bg-white text-cyan-700 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Sign up
                </button>
              </div>
              )}

              <form
                onSubmit={handleAuthSubmit}
                className={`space-y-4 ${authMode === 'verify' ? 'mt-8' : ''}`}
              >
                {authMode === 'signup' && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Full name<Required />
                    </span>

                    <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                      <UserRound size={18} className="text-slate-400" />
                      <input
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full outline-none text-sm"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>
                )}

                {authMode !== 'verify' && (
                  <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Email address<Required />
                  </span>

                  <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full outline-none text-sm"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Password<Required />
                  </span>

                  <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                    <LockKeyhole size={18} className="text-slate-400" />
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full outline-none text-sm"
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="text-xs font-semibold text-cyan-700"
                    >
                      {showAuthPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                  </>
                )}

                {authMode === 'signup' && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Confirm password<Required />
                    </span>

                    <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                      <LockKeyhole size={18} className="text-slate-400" />
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        value={authConfirmPassword}
                        onChange={e => setAuthConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full outline-none text-sm"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </label>
                )}

                {authMode === 'verify' && (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Verification code<Required />
                    </span>

                    <div className="mt-1.5 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                      <KeyRound size={18} className="text-slate-400" />
                      <input
                        value={authCode}
                        onChange={e => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        inputMode="numeric"
                        maxLength={6}
                        className="w-full outline-none text-sm tracking-widest"
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                  </label>
                )}

                {authError && (
                  <p role="alert\" className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                    {authError}
                  </p>
                )}

                {authSuccess && (
                  <p role="status" className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
                    {authSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-cyan-500/20"
                >
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'login'
                      ? 'Login to CivicLens'
                      : authMode === 'verify'
                        ? 'Verify Email'
                        : 'Create Account'}
                </button>

                {authMode === 'verify' && (
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendWait > 0}
                      className="font-semibold text-cyan-700 disabled:text-slate-400"
                    >
                      {resendWait > 0 ? `Resend code in ${resendWait}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login')
                        setAuthError('')
                        setAuthSuccess('')
                        setAuthCode('')
                      }}
                      className="text-slate-500"
                    >
                      Back to login
                    </button>
                  </div>
                )}
              </form>

              {authMode !== 'verify' && (
                <p className="text-xs text-slate-400 mt-4">
                  <span className="text-red-500">*</span> Required field
                </p>
              )}

              <p className="text-xs text-slate-400 text-center mt-6">
                By continuing, you agree to use CivicLens respectfully and responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className={`${
          menuOpen ? 'block' : 'hidden'
        } md:block w-64 shrink-0 bg-slate-950 text-white p-6`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    active === item.name
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

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 p-5 md:p-8">

          {/* HEADER */}
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

              {/* NOTIFICATIONS */}
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
                          const Icon = notificationIcon[n.type] || Bell

                          return (
                            <div
                              key={n.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 ${
                                !n.read ? 'bg-cyan-50/60' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                                  <Icon size={19} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold">{n.title}</p>

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
                        Live Community Reports
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* USER PROFILE */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    {(authUser.name || 'C').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{authUser.name}</p>
                    <p className="text-xs text-slate-500">
                      {authUser.role === 'admin' ? 'Admin' : 'Citizen'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="p-3 bg-white rounded-xl border text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* REPORT PROBLEM */}
          {showReport ? (
            <ReportProblem
              onBack={() => {
                setShowReport(false)
              }}
            />
          ) : active === 'Settings' ? (
            <SettingsPage />
          ) : active === 'Map View' ? (
            <MapView />
          ) : active === 'Analytics' ? (
            <Analytics />
          ) : active === 'Community' ? (
            <Community problems={problems} setProblems={setProblems} />
          ) : active === 'Problems' ? (

            /* PROBLEMS PAGE */
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

                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <p className="text-sm text-slate-500">
                    Showing {filteredProblems.length} of {problems.length} problems
                  </p>

                  <button
                    onClick={fetchProblems}
                    disabled={problemsLoading}
                    className="text-sm font-semibold text-cyan-700 disabled:opacity-50"
                  >
                    {problemsLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {problemsLoading ? (
                  <p className="text-center py-10 text-slate-500">
                    Loading problems...
                  </p>
                ) : problemsError ? (
                  <div className="text-center py-10">
                    <p className="text-red-600 text-sm mb-3">
                      {problemsError}
                    </p>

                    <button
                      onClick={fetchProblems}
                      className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <ProblemTable data={filteredProblems} />
                )}
              </section>
            </div>

          ) : active === 'Dashboard' ? (

            /* DASHBOARD */
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

              {/* LIVE ANALYTICS */}
              <section className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Community Overview</h3>
                    <p className="text-sm text-slate-500">
                      Live statistics from MongoDB
                    </p>
                  </div>

                  <button
                    onClick={fetchDashboardAnalytics}
                    disabled={analyticsLoading}
                    className="text-sm font-semibold text-cyan-700 disabled:opacity-50"
                  >
                    {analyticsLoading ? 'Refreshing...' : '↻ Refresh Statistics'}
                  </button>
                </div>

                {analyticsError && (
                  <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm mb-4">
                    {analyticsError}

                    <button
                      onClick={fetchDashboardAnalytics}
                      disabled={analyticsLoading}
                      className="font-bold ml-2 underline disabled:opacity-50"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {[
                    {
                      title: 'Total Reports',
                      value: dashboardAnalytics?.totalReports ?? 0,
                      icon: FileText,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      title: 'Active Problems',
                      value: dashboardAnalytics?.pendingReports ?? 0,
                      icon: AlertTriangle,
                      color: 'text-orange-600',
                      bg: 'bg-orange-50',
                    },
                    {
                      title: 'Resolved Issues',
                      value: dashboardAnalytics?.resolvedReports ?? 0,
                      icon: CheckCircle2,
                      color: 'text-green-600',
                      bg: 'bg-green-50',
                    },
                    {
                      title: 'Under Review',
                      value: dashboardAnalytics?.statusStats?.find(
                        item => item.status === 'Under Review'
                      )?.count ?? 0,
                      icon: Clock,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                    },
                  ].map(stat => {
                    const Icon = stat.icon

                    return (
                      <div
                        key={stat.title}
                        className="bg-white rounded-2xl p-5 border shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-slate-500">
                            {stat.title}
                          </p>

                          <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                            <Icon size={20} />
                          </div>
                        </div>

                        <h3 className="text-3xl font-bold mt-4">
                          {analyticsLoading && !dashboardAnalytics
                            ? '...'
                            : stat.value}
                        </h3>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* RECENT PROBLEMS */}
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

                {problemsLoading ? (
                  <p className="text-center py-8 text-slate-500">
                    Loading problems...
                  </p>
                ) : problemsError ? (
                  <p className="text-center py-8 text-red-600">
                    {problemsError}
                  </p>
                ) : (
                  <ProblemTable data={problems.slice(0, 3)} />
                )}
              </section>

              <footer className="text-center text-xs text-slate-400 mt-8">
                © 2026 CivicLens. Building better communities together.
              </footer>
            </>

          ) : (

            /* OTHER PAGES */
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

          {/* PROBLEM DETAILS MODAL */}
          {selectedProblem && (
            <div className="fixed inset-0 z-[1000] bg-slate-950/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold">Problem Details</h3>

                  <button onClick={() => setSelectedProblem(null)}>
                    <X size={20} />
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
                  Status: <span className="font-semibold">{selectedProblem.status}</span>
                </p>

                <p className="text-sm mt-2">
                  Description: {selectedProblem.description}
                </p>

                {/* UPLOADED EVIDENCE */}
                {selectedProblem.image && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">
                      Uploaded Evidence
                    </p>

                    <img
                      src={selectedProblem.image}
                      alt={`Evidence for ${selectedProblem.title}`}
                      className="w-full max-h-72 object-contain rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                )}

                {/* ADMIN STATUS MANAGEMENT */}
                {authUser?.role === 'admin' && (
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-bold text-base mb-3">
                      Admin: Update Problem Status
                    </h4>

                    <label className="block text-sm font-medium mb-2">
                      Select new status
                    </label>

                    <select
                      value={selectedProblem.status || 'Reported'}
                      onChange={e => handleStatusUpdate(e.target.value)}
                      disabled={statusUpdating}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-cyan-500 disabled:opacity-50"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    {statusUpdating && (
                      <p className="text-sm text-cyan-700 mt-2">
                        Updating status...
                      </p>
                    )}

                    {statusError && (
                      <p className="text-sm text-red-600 mt-2">
                        {statusError}
                      </p>
                    )}

                    {statusSuccess && (
                      <p className="text-sm text-green-600 mt-2">
                        {statusSuccess}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedProblem(null)
                    setStatusError('')
                    setStatusSuccess('')
                  }}
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