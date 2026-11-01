import { useCallback, useEffect, useState } from 'react'

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    LineChart, Line, Legend
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SEVERITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#22c55e',
}

const STATUS_COLORS = {
    Resolved: 'bg-green-500',
    'Under Review': 'bg-orange-500',
    'In Progress': 'bg-cyan-500',
    Reported: 'bg-blue-500',
}

const STATUS_ORDER = [
    'Reported',
    'Under Review',
    'In Progress',
    'Resolved',
]

const SEVERITY_ORDER = ['High', 'Medium', 'Low']

function Analytics() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAnalytics = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('civiclens_session')

            if (!token) {
                throw new Error('Please log in to view analytics.')
            }

            const response = await fetch(
                `${API_URL}/api/analytics/dashboard`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'Failed to load analytics.'
                )
            }

            setAnalytics(data.analytics)
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const categoryData = (analytics?.categoryStats || []).map(item => ({
        name: item.category,
        reports: item.count,
    }))

    const severityData = SEVERITY_ORDER.map(severity => ({
        name: severity,
        value:
            analytics?.severityStats?.find(
                item => item.severity === severity
            )?.count || 0,
        color: SEVERITY_COLORS[severity],
    }))

    const monthlyData = (analytics?.monthlyStats || []).map(item => {
        const [year, month] = item.month.split('-')

        const monthName = new Date(
            Number(year),
            Number(month) - 1
        ).toLocaleString('en-US', { month: 'short' })

        return {
            month: `${monthName} ${year}`,
            reports: item.reports,
            resolved: item.resolved,
        }
    })

    const statusData = STATUS_ORDER.map(status => {
        const count =
            analytics?.statusStats?.find(
                item => item.status === status
            )?.count || 0

        const percentage = analytics?.totalReports
            ? Math.round((count / analytics.totalReports) * 100)
            : 0

        return {
            name: status,
            count,
            percentage,
            color: STATUS_COLORS[status],
        }
    })

    const summaryCards = [
        {
            title: 'Total Reports',
            value: analytics?.totalReports ?? 0,
            description: 'All submitted reports',
            color: 'text-blue-600',
        },
        {
            title: 'Resolved Issues',
            value: analytics?.resolvedReports ?? 0,
            description: `${analytics?.resolutionRate ?? 0}% resolution rate`,
            color: 'text-green-600',
        },
        {
            title: 'Pending Issues',
            value: analytics?.pendingReports ?? 0,
            description: 'Need attention',
            color: 'text-orange-600',
        },
        {
            title: 'High Priority',
            value: analytics?.highPriorityReports ?? 0,
            description: 'Unresolved high-severity issues',
            color: 'text-red-600',
        },
    ]

    if (loading && !analytics) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 mt-4">
                    Loading community analytics...
                </p>
            </div>
        )
    }

    if (error && !analytics) {
        return (
            <div className="bg-white rounded-2xl border p-8 text-center">
                <p className="text-red-600 font-semibold">
                    Unable to load analytics
                </p>
                <p className="text-slate-500 text-sm mt-2">
                    {error}
                </p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-5 px-5 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-cyan-300 text-sm font-semibold">
                            CIVICLENS DATA INTELLIGENCE
                        </p>

                        <h2 className="text-3xl font-bold mt-3">
                            Analytics Dashboard
                        </h2>

                        <p className="text-slate-300 mt-2">
                            Understand community problems through real-time data and insights.
                        </p>
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        disabled={loading}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Refreshing...' : '↻ Refresh Data'}
                    </button>
                </div>
            </section>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                    Refresh failed: {error}
                </div>
            )}

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {summaryCards.map(item => (
                    <div
                        key={item.title}
                        className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
                    >
                        <p className="text-sm text-slate-500">
                            {item.title}
                        </p>

                        <h3 className={`text-3xl font-bold mt-3 ${item.color}`}>
                            {item.value}
                        </h3>

                        <p className="text-xs text-slate-400 mt-2">
                            {item.description}
                        </p>
                    </div>
                ))}
            </section>

            {/* Category and Severity Charts */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl border p-5 shadow-sm">
                    <h3 className="font-bold text-lg">
                        Reports by Category
                    </h3>

                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        Distribution of reported civic issues
                    </p>

                    <div className="h-72">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="reports"
                                        name="Reports"
                                        fill="#06b6d4"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border p-5 shadow-sm">
                    <h3 className="font-bold text-lg">
                        Severity Distribution
                    </h3>

                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        Problems classified by severity
                    </p>

                    <div className="h-72">
                        {analytics?.totalReports > 0 ? (
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
                                            <Cell
                                                key={entry.name}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

            </section>

            {/* Monthly Reports */}
            <section className="bg-white rounded-2xl border p-5 shadow-sm">
                <h3 className="font-bold text-lg">
                    Monthly Reports Overview
                </h3>

                <p className="text-sm text-slate-400 mt-1 mb-5">
                    Reports received and issues resolved over the last six months
                </p>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="reports"
                                name="Reports"
                                stroke="#0891b2"
                                strokeWidth={3}
                            />

                            <Line
                                type="monotone"
                                dataKey="resolved"
                                name="Resolved"
                                stroke="#16a34a"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Community Performance */}
            <section className="bg-white rounded-2xl border p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-2">
                    Community Performance
                </h3>

                <p className="text-sm text-slate-400 mb-6">
                    Current distribution of reports by status
                </p>

                <div className="space-y-5">
                    {statusData.map(item => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">
                                    {item.name}
                                </span>

                                <span className="text-slate-500">
                                    {item.count} reports ({item.percentage}%)
                                </span>
                            </div>

                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                    style={{
                                        width: `${item.percentage}%`,
                                    }}
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

function EmptyChart() {
    return (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No report data available yet.
        </div>
    )
}

export default Analytics