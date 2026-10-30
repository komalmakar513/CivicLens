
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    LineChart, Line, Legend
} from 'recharts'

const categoryData = [
    { name: 'Road Damage', reports: 35 },
    { name: 'Garbage', reports: 25 },
    { name: 'Streetlight', reports: 18 },
    { name: 'Waterlogging', reports: 30 },
    { name: 'Footpath', reports: 15 },
]

const severityData = [
    { name: 'High', value: 32, color: '#ef4444' },
    { name: 'Medium', value: 48, color: '#f59e0b' },
    { name: 'Low', value: 20, color: '#22c55e' },
]

const monthlyData = [
    { month: 'Jan', reports: 18, resolved: 12 },
    { month: 'Feb', reports: 25, resolved: 18 },
    { month: 'Mar', reports: 30, resolved: 21 },
    { month: 'Apr', reports: 22, resolved: 17 },
    { month: 'May', reports: 38, resolved: 28 },
    { month: 'Jun', reports: 45, resolved: 35 },
]

function Analytics() {
    return (
        <div className="space-y-6">

            <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-semibold">
                    CIVICLENS DATA INTELLIGENCE
                </p>
                <h2 className="text-3xl font-bold mt-3">
                    Analytics Dashboard
                </h2>
                <p className="text-slate-300 mt-2">
                    Understand community problems through data and visual insights.
                </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                {[
                    { title: 'Total Reports', value: '156', change: '+12.5%', color: 'text-blue-600' },
                    { title: 'Resolved Issues', value: '89', change: '57% resolved', color: 'text-green-600' },
                    { title: 'Pending Issues', value: '42', change: 'Need attention', color: 'text-orange-600' },
                    { title: 'High Priority', value: '25', change: 'Urgent issues', color: 'text-red-600' },
                ].map(item => (
                    <div key={item.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{item.title}</p>
                        <h3 className={`text-3xl font-bold mt-3 ${item.color}`}>
                            {item.value}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2">{item.change}</p>
                    </div>
                ))}

            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl border p-5 shadow-sm">
                    <h3 className="font-bold text-lg">Reports by Category</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        Distribution of reported civic issues
                    </p>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="reports" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border p-5 shadow-sm">
                    <h3 className="font-bold text-lg">Severity Distribution</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        Problems classified by severity
                    </p>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={95}
                                    label
                                >
                                    {severityData.map(entry => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </section>

            <section className="bg-white rounded-2xl border p-5 shadow-sm">
                <h3 className="font-bold text-lg">Monthly Reports Overview</h3>
                <p className="text-sm text-slate-400 mt-1 mb-5">
                    Reports received and issues resolved each month
                </p>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="reports"
                                stroke="#0891b2"
                                strokeWidth={3}
                            />
                            <Line
                                type="monotone"
                                dataKey="resolved"
                                stroke="#16a34a"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="bg-white rounded-2xl border p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-5">Community Performance</h3>

                <div className="space-y-5">
                    {[
                        { name: 'Issues Resolved', value: 57, color: 'bg-green-500' },
                        { name: 'Issues Under Review', value: 27, color: 'bg-orange-500' },
                        { name: 'New Reports', value: 16, color: 'bg-blue-500' },
                    ].map(item => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-slate-500">{item.value}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full`}
                                    style={{ width: `${item.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <p className="text-center text-xs text-slate-400">
                © 2026 CivicLens | Community Analytics
            </p>

        </div>
    )
}

export default Analytics
