
import { useState } from 'react'
import {
    MapPin,
    Upload,
    Send,
    ArrowLeft,
    LocateFixed,
    CheckCircle
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialForm = {
    title: '',
    category: '',
    description: '',
    severity: 'Medium',
    location: '',
}

function ReportProblem({ onBack }) {
    const [form, setForm] = useState(initialForm)
    const [coordinates, setCoordinates] = useState(null)
    const [image, setImage] = useState(null)

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const [loading, setLoading] = useState(false)
    const [gpsLoading, setGpsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    // Capture current GPS coordinates
    const getCurrentLocation = () => {
        setError('')
        setMessage('')

        if (!navigator.geolocation) {
            setError('Your browser does not support GPS location.')
            return
        }

        setGpsLoading(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude

                setCoordinates({
                    latitude,
                    longitude,
                })

                setGpsLoading(false)
                setMessage('Your GPS location has been captured successfully!')
            },
            (err) => {
                setGpsLoading(false)

                switch (err.code) {
                    case 1:
                        setError(
                            'Location permission denied. Please allow location access in your browser settings.'
                        )
                        break

                    case 2:
                        setError(
                            'Your current location could not be determined. Please try again.'
                        )
                        break

                    case 3:
                        setError(
                            'Location request timed out. Please try again.'
                        )
                        break

                    default:
                        setError('Unable to get your current location.')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            }
        )
    }

    // Submit report to backend
    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage('')
        setError('')

        const token = localStorage.getItem('civiclens_session')

        if (!token) {
            setError('Please log in before submitting a report.')
            return
        }

        if (!coordinates) {
            setError('Please capture your GPS location before submitting your report.')
            return
        }

        if (!form.location.trim()) {
            setError('Please enter the problem location or address.')
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
                body: JSON.stringify({
                    ...form,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    location: form.location.trim(),
                    coordinates: {
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                    },
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit report.')
            }

            setMessage('Report submitted successfully! Your GPS location has been saved.')

            setForm({ ...initialForm })
            setCoordinates(null)
            setImage(null)

            // Clear the selected file input after successful submission
            const fileInput = document.getElementById('problem-image')
            if (fileInput) fileInput.value = ''

        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">

            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-cyan-700 mb-6"
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-9 border border-slate-100 shadow-sm">

                <h1 className="text-2xl font-bold">
                    Report a Problem
                </h1>

                <p className="text-slate-500 mt-2">
                    Help improve your community by reporting an issue.
                </p>

                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mt-5 flex items-start gap-2">
                        <CheckCircle size={20} className="shrink-0 mt-0.5" />
                        <p>{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mt-5">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 mt-7"
                >

                    {/* Problem title */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Problem Title
                        </label>

                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            maxLength={120}
                            placeholder="Example: Large pothole near main road"
                            className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Category
                        </label>

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white"
                        >
                            <option value="">Select category</option>
                            <option value="Road Damage">Road Damage</option>
                            <option value="Garbage">Garbage</option>
                            <option value="Streetlight">Streetlight</option>
                            <option value="Waterlogging">Waterlogging</option>
                            <option value="Drainage">Drainage</option>
                            <option value="Footpath Damage">Footpath Damage</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            maxLength={2000}
                            rows="4"
                            placeholder="Describe the problem..."
                            className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Severity
                        </label>

                        <select
                            name="severity"
                            value={form.severity}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Problem Location / Address
                        </label>

                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-3 text-slate-400"
                                size={19}
                            />

                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                                placeholder="Enter area, sector or address"
                                className="w-full border border-slate-200 rounded-xl p-3 pl-10 outline-none focus:border-cyan-500"
                            />
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            Enter the address of the problem. GPS captures your device's current position separately.
                        </p>

                        {/* GPS button */}
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={gpsLoading || loading}
                            className="mt-4 flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 text-cyan-700 font-semibold px-5 py-3 rounded-xl text-sm transition"
                        >
                            <LocateFixed size={19} />

                            {gpsLoading
                                ? 'Getting your location...'
                                : 'Use My Current Location'}
                        </button>

                        {/* GPS coordinates */}
                        {coordinates && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">

                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <CheckCircle size={18} />
                                    GPS Location Captured
                                </div>

                                <p>
                                    Latitude: {coordinates.latitude.toFixed(6)}
                                </p>

                                <p>
                                    Longitude: {coordinates.longitude.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Upload Image
                        </label>

                        <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">

                            <Upload className="text-cyan-600 mb-2" size={28} />

                            <span className="text-sm text-slate-600">
                                {image ? image.name : 'Click to upload an image'}
                            </span>

                            <input
                                id="problem-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setImage(e.target.files?.[0] || null)}
                            />
                        </label>

                        <p className="text-xs text-slate-400 mt-2">
                            Image upload is not connected to the backend yet.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || gpsLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold rounded-xl p-4 flex justify-center items-center gap-2"
                    >
                        <Send size={18} />

                        {loading
                            ? 'Submitting...'
                            : 'Submit Report'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default ReportProblem
