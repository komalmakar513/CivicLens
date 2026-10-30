
import { useState } from 'react'
import {
  LayoutDashboard, MapPin, FileText, BarChart3,
  Users, Settings, Bell, Plus, Search,
  AlertTriangle, CheckCircle2, Clock, Menu, Eye
} from 'lucide-react'

import ReportProblem from './ReportProblem'
import MapView from './MapView'

const problems = [
  { id: 1, title: 'Large pothole on main road', category: 'Road Damage', location: 'Sector 15, Chandigarh', severity: 'High', status: 'In Progress' },
  { id: 2, title: 'Garbage overflowing', category: 'Garbage', location: 'Sector 22, Chandigarh', severity: 'Medium', status: 'Under Review' },
  { id: 3, title: 'Streetlight not working', category: 'Streetlight', location: 'Sector 34, Chandigarh', severity: 'Low', status: 'Resolved' },
  { id: 4, title: 'Waterlogging near market', category: 'Waterlogging', location: 'Sector 17, Chandigarh', severity: 'High', status: 'Reported' },
  { id: 5, title: 'Damaged footpath', category: 'Footpath Damage', location: 'Sector 20, Chandigarh', severity: 'Medium', status: 'Reported' },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [showReport, setShowReport] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const openPage = (name) => {
    setActive(name)
    setShowReport(false)
    setSelectedProblem(null)
    setSearch('')
    setMenuOpen(false)
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
              <button className="p-3 bg-white rounded-xl border">
                <Bell size={19} />
              </button>
              <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border">
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
          ) : active === 'Map View' ? (

            <MapView />

          ) : active === 'Problems' ? (

            <div className="space-y-6">
              <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-semibold">COMMUNITY ISSUES</p>
                <h2 className="text-3xl font-bold mt-3">Reported Problems</h2>
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
                      <h3 className="text-3xl font-bold mt-4">{stat.value}</h3>
                    </div>
                  )
                })}
              </section>

              <section className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Recent Community Problems</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest reported infrastructure issues</p>
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
                  <button onClick={() => setSelectedProblem(null)}>✕</button>
                </div>
                <h4 className="font-semibold">{selectedProblem.title}</h4>
                <p className="text-sm text-slate-500 mt-2">{selectedProblem.location}</p>
                <p className="text-sm mt-3">Category: {selectedProblem.category}</p>
                <p className="text-sm mt-2">Severity: {selectedProblem.severity}</p>
                <p className="text-sm mt-2">Status: {selectedProblem.status}</p>
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
