
import { useState } from 'react'
import {
  LayoutDashboard, MapPin, FileText, BarChart3, Users,
  Settings, Search, Bell, Plus, AlertTriangle,
  CheckCircle2, Clock, Menu, Filter, Eye, X
} from 'lucide-react'

import ReportProblem from './ReportProblem'

const initialProblems = [
  { id: 1, title: 'Large pothole on main road', category: 'Road Damage', location: 'Sector 15, Chandigarh', severity: 'High', status: 'In Progress', reports: 12, description: 'A large pothole is creating difficulties for vehicles and pedestrians.' },
  { id: 2, title: 'Garbage overflowing', category: 'Garbage', location: 'Sector 22, Chandigarh', severity: 'Medium', status: 'Under Review', reports: 8, description: 'Garbage bins are overflowing and need immediate cleaning.' },
  { id: 3, title: 'Streetlight not working', category: 'Streetlight', location: 'Sector 34, Chandigarh', severity: 'Low', status: 'Resolved', reports: 5, description: 'Streetlight near the residential area is not working.' },
  { id: 4, title: 'Waterlogging near market', category: 'Waterlogging', location: 'Sector 17, Chandigarh', severity: 'High', status: 'Reported', reports: 16, description: 'Water accumulation is affecting traffic and pedestrians.' },
  { id: 5, title: 'Damaged footpath', category: 'Footpath Damage', location: 'Sector 20, Chandigarh', severity: 'Medium', status: 'Reported', reports: 6, description: 'Broken footpath tiles are creating a safety hazard.' },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProblem, setSelectedProblem] = useState(null)

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Problems', icon: FileText },
    { name: 'Map View', icon: MapPin },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Community', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  const filteredProblems = initialProblems.filter(problem => {
    const matchesSearch =
      `${problem.title} ${problem.category} ${problem.location}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' || problem.category === categoryFilter

    const matchesSeverity =
      severityFilter === 'All' || problem.severity === severityFilter

    const matchesStatus =
      statusFilter === 'All' || problem.status === statusFilter

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus
  })

  const severityStyle = {
    High: 'bg-red-50 text-red-600',
    Medium: 'bg-orange-50 text-orange-600',
    Low: 'bg-green-50 text-green-600',
  }

  const statusStyle = {
    Reported: 'bg-blue-50 text-blue-600',
    'In Progress': 'bg-purple-50 text-purple-600',
    'Under Review': 'bg-orange-50 text-orange-600',
    Resolved: 'bg-green-50 text-green-600',
  }

  const handleNavigation = (name) => {
    setActive(name)
    setShowReport(false)
    setSelectedProblem(null)
    setMenuOpen(false)
    setSearch('')
    setCategoryFilter('All')
    setSeverityFilter('All')
    setStatusFilter('All')
  }

  const ProblemsTable = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="py-4">PROBLEM</th>
            <th className="py-4">LOCATION</th>
            <th className="py-4">SEVERITY</th>
            <th className="py-4">STATUS</th>
            <th className="py-4">SUPPORTS</th>
            <th className="py-4">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.map(problem => (
            <tr key={problem.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-4 pr-3">
                <p className="font-semibold text-sm">{problem.title}</p>
                <p className="text-xs text-slate-400 mt-1">{problem.category}</p>
              </td>
              <td className="py-4 text-sm text-slate-500">{problem.location}</td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityStyle[problem.severity]}`}>
                  {problem.severity}
                </span>
              </td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[problem.status]}`}>
                  {problem.status}
                </span>
              </td>
              <td className="py-4 text-sm">{problem.reports}</td>
              <td className="py-4">
                <button
                  onClick={() => setSelectedProblem(problem)}
                  className="flex items-center gap-1 text-cyan-700 text-sm font-semibold hover:text-cyan-900"
                >
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="6" className="py-12 text-center text-slate-400">
                No problems found. Try changing your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

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
                  onClick={() => handleNavigation(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${active === item.name
                      ? 'bg-cyan-500 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
              <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
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
              <button className="p-3 bg-white rounded-xl border border-slate-200">
                <Bell size={19} />
              </button>
              <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  K
                </div>
                <div>
                  <p className="text-sm font-semibold">Komal</p>
                  <p className="text-xs text-slate-500">Citizen</p>
                </div>
              </div>
            </div>
          </header>

          {showReport ? (
            <ReportProblem onBack={() => setShowReport(false)} />
          ) : active === 'Problems' ? (

            <div className="space-y-6">
              <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-medium">COMMUNITY ISSUES</p>
                <h2 className="text-3xl font-bold mt-3">Reported Problems</h2>
                <p className="text-slate-300 mt-2">
                  Explore and track infrastructure problems in your community.
                </p>
                <button
                  onClick={() => setShowReport(true)}
                  className="mt-5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-5 py-3 rounded-xl flex items-center gap-2"
                >
                  <Plus size={18} /> Report New Problem
                </button>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm text-slate-500">Total Problems</p>
                  <h3 className="text-3xl font-bold mt-2">{initialProblems.length}</h3>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm text-slate-500">High Severity</p>
                  <h3 className="text-3xl font-bold mt-2 text-red-600">
                    {initialProblems.filter(p => p.severity === 'High').length}
                  </h3>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm text-slate-500">Resolved</p>
                  <h3 className="text-3xl font-bold mt-2 text-green-600">
                    {initialProblems.filter(p => p.status === 'Resolved').length}
                  </h3>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Filter size={19} className="text-cyan-600" />
                  <h3 className="font-bold text-lg">Search and Filter Problems</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3">
                    <Search size={18} className="text-slate-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search problems..."
                      className="outline-none w-full text-sm"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Footpath Damage">Footpath Damage</option>
                  </select>

                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white"
                  >
                    <option value="All">All Severities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                  <p className="text-sm text-slate-500">
                    Showing <strong>{filteredProblems.length}</strong> of {initialProblems.length} problems
                  </p>
                  <button
                    onClick={() => {
                      setSearch('')
                      setCategoryFilter('All')
                      setSeverityFilter('All')
                      setStatusFilter('All')
                    }}
                    className="text-sm text-cyan-700 font-semibold hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-lg font-bold mb-4">All Community Problems</h3>
                <ProblemsTable data={filteredProblems} />
              </section>

              {selectedProblem && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold">Problem Details</h3>
                      <button onClick={() => setSelectedProblem(null)}>
                        <X />
                      </button>
                    </div>

                    <h4 className="text-lg font-semibold">{selectedProblem.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">{selectedProblem.description}</p>

                    <div className="space-y-3 mt-6 text-sm">
                      <p><strong>Category:</strong> {selectedProblem.category}</p>
                      <p><strong>Location:</strong> {selectedProblem.location}</p>
                      <p><strong>Severity:</strong> {selectedProblem.severity}</p>
                      <p><strong>Status:</strong> {selectedProblem.status}</p>
                      <p><strong>Community supports:</strong> {selectedProblem.reports}</p>
                    </div>

                    <button
                      onClick={() => setSelectedProblem(null)}
                      className="w-full mt-6 bg-cyan-600 text-white rounded-xl py-3 font-semibold hover:bg-cyan-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : active === 'Dashboard' ? (

            <>
              <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7 md:p-9 mb-8">
                <p className="text-cyan-300 text-sm font-medium">CIVICLENS COMMUNITY PORTAL</p>
                <h2 className="text-3xl font-bold mt-3">Your City, Your Voice.</h2>
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
                  { title: 'Total Reports', value: '156', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', change: 'Community submissions' },
                  { title: 'Active Problems', value: '42', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', change: 'Need attention' },
                  { title: 'Resolved Issues', value: '89', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', change: 'Successfully fixed' },
                  { title: 'Under Review', value: '25', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', change: 'Being reviewed' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">{stat.title}</p>
                        <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold mt-4">{stat.value}</h3>
                      <p className="text-xs text-slate-400 mt-2">{stat.change}</p>
                    </div>
                  )
                })}
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Recent Community Problems</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest reported infrastructure issues</p>
                  </div>
                  <div className="flex gap-2 items-center border border-slate-200 rounded-xl px-3 py-2">
                    <Search size={17} className="text-slate-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search problems..."
                      className="outline-none text-sm w-36"
                    />
                  </div>
                </div>
                <ProblemsTable data={filteredProblems} />
              </section>

              <footer className="text-center text-xs text-slate-400 mt-8">
                © 2026 CivicLens. Building better communities together.
              </footer>
            </>

          ) : (
            <section className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <div className="bg-cyan-50 text-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Settings size={30} />
              </div>
              <h3 className="text-xl font-bold mt-5">{active}</h3>
              <p className="text-slate-500 mt-2">
                This section is planned for the next development phase.
              </p>
              <button
                onClick={() => handleNavigation('Dashboard')}
                className="mt-5 bg-cyan-600 text-white px-5 py-3 rounded-xl"
              >
                Back to Dashboard
              </button>
            </section>
          )}

        </main>
      </div>
    </div>
  )
}

export default App
