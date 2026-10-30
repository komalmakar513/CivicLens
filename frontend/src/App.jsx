
import { useState } from 'react'
import {
  LayoutDashboard, MapPin, FileText, BarChart3, Users,
  Settings, Search, Bell, Plus, AlertTriangle,
  CheckCircle2, Clock, Menu
} from 'lucide-react'

import ReportProblem from './ReportProblem'

const problems = [
  { id: 1, title: 'Large pothole on main road', category: 'Road Damage', location: 'Sector 15, Chandigarh', severity: 'High', status: 'In Progress', reports: 12 },
  { id: 2, title: 'Garbage overflowing', category: 'Garbage', location: 'Sector 22, Chandigarh', severity: 'Medium', status: 'Under Review', reports: 8 },
  { id: 3, title: 'Streetlight not working', category: 'Streetlight', location: 'Sector 34, Chandigarh', severity: 'Low', status: 'Resolved', reports: 5 },
  { id: 4, title: 'Waterlogging near market', category: 'Waterlogging', location: 'Sector 17, Chandigarh', severity: 'High', status: 'Reported', reports: 16 },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Problems', icon: FileText },
    { name: 'Map View', icon: MapPin },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Community', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  const filteredProblems = problems.filter(problem =>
    `${problem.title} ${problem.category} ${problem.location}`
      .toLowerCase().includes(search.toLowerCase())
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

          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Main Menu</p>

          <nav className="space-y-2">
            {navigation.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActive(item.name)
                    setShowReport(false)
                    setMenuOpen(false)
                  }}
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
                <p className="text-sm text-slate-500">Community / {showReport ? 'Report Problem' : active}</p>
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
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">K</div>
                <div>
                  <p className="text-sm font-semibold">Komal</p>
                  <p className="text-xs text-slate-500">Citizen</p>
                </div>
              </div>
            </div>
          </header>

          {showReport ? (
            <ReportProblem onBack={() => setShowReport(false)} />
          ) : (
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

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[650px]">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b border-slate-100">
                        <th className="py-3">PROBLEM</th>
                        <th className="py-3">LOCATION</th>
                        <th className="py-3">SEVERITY</th>
                        <th className="py-3">STATUS</th>
                        <th className="py-3">SUPPORTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProblems.map(problem => (
                        <tr key={problem.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-4">
                            <p className="font-semibold text-sm">{problem.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{problem.category}</p>
                          </td>
                          <td className="py-4 text-sm text-slate-500">{problem.location}</td>
                          <td className="py-4 text-xs font-semibold">{problem.severity}</td>
                          <td className="py-4 text-xs font-medium">{problem.status}</td>
                          <td className="py-4 text-sm">{problem.reports}</td>
                        </tr>
                      ))}
                      {filteredProblems.length === 0 && (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-400">No problems found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <footer className="text-center text-xs text-slate-400 mt-8">
                © 2026 CivicLens. Building better communities together.
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
