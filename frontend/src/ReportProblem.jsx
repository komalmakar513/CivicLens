
import { useState } from 'react'
import { MapPin, Upload, Send, ArrowLeft } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function ReportProblem({ onBack }) {
    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        severity: 'Medium',
        location: '',
    })

    const [image, setImage] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')

        const token = localStorage.getItem('civiclens_session')

        if (!token) {
            setError('Please log in before submitting a report.')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/problems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit report.')
            }

            setMessage('Report submitted successfully!')
            setForm({
                title: '',
                category: '',
                description: '',
                severity: 'Medium',
                location: '',
            })
            setImage(null)
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-cyan-700 mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-9 border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold">Report a Problem</h1>
                <p className="text-slate-500 mt-2">
                    Help improve your community by reporting an issue.
                </p>

                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mt-5">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mt-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 mt-7">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Problem Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            placeholder="Example: Large pothole near main road"
                            className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white"
                        >
                            <option value="">Select category</option>
                            <option>Road Damage</option>
                            <option>Garbage</option>
                            <option>Streetlight</option>
                            <option>Waterlogging</option>
                            <option>Drainage</option>
                            <option>Footpath Damage</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Describe the problem..."
                            className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Severity</label>
                        <select
                            name="severity"
                            value={form.severity}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white"
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400" size={19} />
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                                placeholder="Enter area, sector or address"
                                className="w-full border border-slate-200 rounded-xl p-3 pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Upload Image</label>
                        <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">
                            <Upload className="text-cyan-600 mb-2" size={28} />
                            <span className="text-sm text-slate-600">
                                {image ? image.name : 'Click to upload an image'}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setImage(e.target.files[0] || null)}
                            />
                        </label>
                        <p className="text-xs text-slate-400 mt-2">
                            Image upload will be enabled separately.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold rounded-xl p-4 flex justify-center items-center gap-2"
                    >
                        <Send size={18} />
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ReportProblem
