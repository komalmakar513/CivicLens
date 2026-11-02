
import { useState } from 'react'
import {
  MapPin,
  Upload,
  Send,
  ArrowLeft,
  LocateFixed,
  CheckCircle,
  X
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const initialForm = {
  title: '',
  category: '',
  description: '',
  severity: 'Medium',
  location: '',
}

// Compress the selected PC image before sending it to the backend.
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        const maxDimension = 1400
        const scale = Math.min(
          1,
          maxDimension / Math.max(img.width, img.height)
        )

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('Could not process the selected image.'))
          return
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed.'))
              return
            }

            const compressedReader = new FileReader()

            compressedReader.onload = () => resolve(compressedReader.result)
            compressedReader.onerror = () =>
              reject(new Error('Could not read the compressed image.'))

            compressedReader.readAsDataURL(blob)
          },
          'image/jpeg',
          0.75
        )
      }

      img.onerror = () => reject(new Error('Invalid image file.'))
      img.src = reader.result
    }

    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function ReportProblem({ onBack }) {
  const [form, setForm] = useState(initialForm)
  const [coordinates, setCoordinates] = useState(null)
  const [image, setImage] = useState('')
  const [imageName, setImageName] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]

    setError('')
    setMessage('')

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 10 MB.')
      e.target.value = ''
      return
    }

    try {
      setImageLoading(true)

      const compressedImage = await compressImage(file)

      setImage(compressedImage)
      setImageName(file.name)
    } catch (err) {
      setError(err.message || 'Could not process the image.')
      setImage('')
      setImageName('')
      e.target.value = ''
    } finally {
      setImageLoading(false)
    }
  }

  const removeImage = () => {
    setImage('')
    setImageName('')

    const fileInput = document.getElementById('problem-image')
    if (fileInput) fileInput.value = ''
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
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })

        setGpsLoading(false)
        setMessage('Your GPS location has been captured successfully!')
      },
      (err) => {
        setGpsLoading(false)

        switch (err.code) {
          case 1:
            setError('Location permission denied. Please allow location access in your browser settings.')
            break
          case 2:
            setError('Your current location could not be determined. Please try again.')
            break
          case 3:
            setError('Location request timed out. Please try again.')
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

  // Submit report, including the compressed image data.
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
          image,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit report.')
      }

      setMessage('Report submitted successfully! Your image and GPS location have been saved.')

      setForm({ ...initialForm })
      setCoordinates(null)
      setImage('')
      setImageName('')

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
        <h1 className="text-2xl font-bold">Report a Problem</h1>

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

        <form onSubmit={handleSubmit} className="space-y-5 mt-7">
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

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gpsLoading || loading}
              className="mt-4 flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 text-cyan-700 font-semibold px-5 py-3 rounded-xl text-sm transition"
            >
              <LocateFixed size={19} />
              {gpsLoading ? 'Getting your location...' : 'Use My Current Location'}
            </button>

            {coordinates && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <CheckCircle size={18} />
                  GPS Location Captured
                </div>
                <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
                <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload Image
            </label>

            <label
              htmlFor="problem-image"
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50"
            >
              <Upload className="text-cyan-600 mb-2" size={28} />

              <span className="text-sm text-slate-600 text-center">
                {imageLoading
                  ? 'Processing image...'
                  : imageName || 'Click to upload an image from your PC'}
              </span>

              <span className="text-xs text-slate-400 mt-1">
                Maximum original file size: 10 MB
              </span>

              <input
                id="problem-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading || imageLoading}
              />
            </label>

            {image && (
              <div className="mt-4 relative max-w-sm">
                <img
                  src={image}
                  alt="Selected problem"
                  className="w-full max-h-64 object-cover rounded-xl border"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-white text-red-600 p-2 rounded-full shadow"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-2">
              Your image will be compressed and saved with this report.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || gpsLoading || imageLoading}
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
