
import { useState } from 'react'
import {
    Heart, ThumbsUp, Users, TrendingUp,
    MapPin, Search, MessageCircle
} from 'lucide-react'

const initialIssues = [
    {
        id: 1,
        title: 'Repair damaged roads in Sector 15',
        category: 'Road Damage',
        location: 'Sector 15, Chandigarh',
        description: 'Large potholes are causing difficulties for daily commuters.',
        votes: 42,
        priority: 'High'
    },
    {
        id: 2,
        title: 'Improve garbage collection',
        category: 'Garbage',
        location: 'Sector 22, Chandigarh',
        description: 'Garbage bins are overflowing and need regular collection.',
        votes: 35,
        priority: 'Medium'
    },
    {
        id: 3,
        title: 'Install streetlights near park',
        category: 'Streetlight',
        location: 'Sector 34, Chandigarh',
        description: 'The park area becomes very dark during evening hours.',
        votes: 28,
        priority: 'Medium'
    },
    {
        id: 4,
        title: 'Fix waterlogging problem',
        category: 'Waterlogging',
        location: 'Sector 17, Chandigarh',
        description: 'Water accumulates near the market after rainfall.',
        votes: 51,
        priority: 'High'
    },
    {
        id: 5,
        title: 'Repair broken footpaths',
        category: 'Footpath',
        location: 'Sector 20, Chandigarh',
        description: 'Damaged footpaths create difficulties for pedestrians.',
        votes: 19,
        priority: 'Low'
    }
]

function Community() {
    const [issues, setIssues] = useState(initialIssues)
    const [supported, setSupported] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')

    const categories = [
        'All',
        'Road Damage',
        'Garbage',
        'Streetlight',
        'Waterlogging',
        'Footpath'
    ]

    const handleSupport = (id) => {
        const alreadySupported = supported.includes(id)

        setSupported(prev =>
            alreadySupported
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )

        setIssues(prev =>
            prev.map(issue =>
                issue.id === id
                    ? {
                        ...issue,
                        votes: issue.votes + (alreadySupported ? -1 : 1)
                    }
                    : issue
            )
        )
    }

    const filteredIssues = issues.filter(issue => {
        const matchesSearch =
            `${issue.title} ${issue.location} ${issue.category}`
                .toLowerCase()
                .includes(search.toLowerCase())

        const matchesCategory =
            category === 'All' || issue.category === category

        return matchesSearch && matchesCategory
    })

    const sortedIssues = [...filteredIssues].sort(
        (a, b) => b.votes - a.votes
    )

    const totalSupport = issues.reduce(
        (sum, issue) => sum + issue.votes, 0
    )

    return (
        <div className="space-y-6">

            <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7 md:p-9">
                <p className="text-cyan-300 text-sm font-semibold">
                    CIVICLENS COMMUNITY NETWORK
                </p>

                <h2 className="text-3xl font-bold mt-3">
                    Together, We Make a Difference.
                </h2>

                <p className="text-slate-300 mt-3 max-w-2xl">
                    Support local civic issues, raise awareness and help your
                    community decide which problems need attention first.
                </p>

                <div className="flex flex-wrap gap-6 mt-7">
                    <div>
                        <p className="text-2xl font-bold">{issues.length}</p>
                        <p className="text-xs text-slate-300">Community Issues</p>
                    </div>

                    <div>
                        <p className="text-2xl font-bold">{totalSupport}</p>
                        <p className="text-xs text-slate-300">Total Support Votes</p>
                    </div>

                    <div>
                        <p className="text-2xl font-bold">{supported.length}</p>
                        <p className="text-xs text-slate-300">Your Supports</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white border rounded-2xl p-5">
                    <Users className="text-cyan-600 mb-3" size={25} />
                    <h3 className="text-2xl font-bold">{issues.length}</h3>
                    <p className="text-sm text-slate-500">Active Discussions</p>
                </div>

                <div className="bg-white border rounded-2xl p-5">
                    <Heart className="text-pink-500 mb-3" size={25} />
                    <h3 className="text-2xl font-bold">{totalSupport}</h3>
                    <p className="text-sm text-slate-500">Community Votes</p>
                </div>

                <div className="bg-white border rounded-2xl p-5">
                    <TrendingUp className="text-green-600 mb-3" size={25} />
                    <h3 className="text-2xl font-bold">
                        {issues.filter(i => i.priority === 'High').length}
                    </h3>
                    <p className="text-sm text-slate-500">High Priority Issues</p>
                </div>

            </section>

            <section className="bg-white border rounded-2xl p-5">

                <h3 className="text-lg font-bold mb-4">
                    Explore Community Issues
                </h3>

                <div className="flex items-center gap-3 border rounded-xl px-4 py-3 mb-5">
                    <Search size={19} className="text-slate-400" />

                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search community problems..."
                        className="outline-none w-full text-sm"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {categories.map(item => (
                        <button
                            key={item}
                            onClick={() => setCategory(item)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold ${category === item
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

            </section>

            <section className="space-y-4">

                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                        Trending Community Problems
                    </h3>

                    <span className="text-xs text-slate-500">
                        {sortedIssues.length} results
                    </span>
                </div>

                {sortedIssues.map((issue, index) => (

                    <div
                        key={issue.id}
                        className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                    >

                        <div className="flex justify-between gap-3">

                            <div className="min-w-0">

                                {index === 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-3">
                                        <TrendingUp size={13} />
                                        Most Supported
                                    </span>
                                )}

                                <h4 className="font-bold text-base">
                                    {issue.title}
                                </h4>

                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">

                                    <span className="flex items-center gap-1">
                                        <MapPin size={13} />
                                        {issue.location}
                                    </span>

                                    <span>{issue.category}</span>

                                </div>

                            </div>

                            <span className={`text-xs px-3 py-1 rounded-full h-fit ${issue.priority === 'High'
                                    ? 'bg-red-50 text-red-600'
                                    : issue.priority === 'Medium'
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-green-50 text-green-600'
                                }`}>
                                {issue.priority}
                            </span>

                        </div>

                        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                            {issue.description}
                        </p>

                        <div className="flex justify-between items-center mt-5 pt-4 border-t">

                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <MessageCircle size={17} />
                                Community Discussion
                            </div>

                            <button
                                onClick={() => handleSupport(issue.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${supported.includes(issue.id)
                                        ? 'bg-pink-100 text-pink-600'
                                        : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                                    }`}
                            >
                                <ThumbsUp size={16} />

                                {supported.includes(issue.id) ? 'Supported' : 'Support'}

                                <span>{issue.votes}</span>
                            </button>

                        </div>

                    </div>

                ))}

                {sortedIssues.length === 0 && (
                    <div className="bg-white border rounded-2xl p-10 text-center">
                        <Search className="mx-auto text-slate-300" size={35} />
                        <p className="font-semibold mt-3">No issues found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Try another search or category.
                        </p>
                    </div>
                )}

            </section>

            <footer className="text-center text-xs text-slate-400 py-4">
                CivicLens | Stronger Communities, Better Cities.
            </footer>

        </div>
    )
}

export default Community
