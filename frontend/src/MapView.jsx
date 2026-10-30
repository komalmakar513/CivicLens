
import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const problems = [
    {
        id: 1,
        title: 'Large pothole on main road',
        category: 'Road Damage',
        location: 'Sector 15, Chandigarh',
        severity: 'High',
        status: 'In Progress',
        position: [30.7415, 76.7680],
    },
    {
        id: 2,
        title: 'Garbage overflowing',
        category: 'Garbage',
        location: 'Sector 22, Chandigarh',
        severity: 'Medium',
        status: 'Under Review',
        position: [30.7333, 76.7720],
    },
    {
        id: 3,
        title: 'Streetlight not working',
        category: 'Streetlight',
        location: 'Sector 34, Chandigarh',
        severity: 'Low',
        status: 'Resolved',
        position: [30.7190, 76.7590],
    },
    {
        id: 4,
        title: 'Waterlogging near market',
        category: 'Waterlogging',
        location: 'Sector 17, Chandigarh',
        severity: 'High',
        status: 'Reported',
        position: [30.7410, 76.7820],
    },
    {
        id: 5,
        title: 'Damaged footpath',
        category: 'Footpath Damage',
        location: 'Sector 20, Chandigarh',
        severity: 'Medium',
        status: 'Reported',
        position: [30.7270, 76.7740],
    },
]

const createIcon = (severity) => {
    const colors = {
        High: '#ef4444',
        Medium: '#f59e0b',
        Low: '#16a34a',
    }

    return L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
      width:30px;
      height:30px;
      background:${colors[severity]};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px #0005;
    "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    })
}

function MapView() {
    const [selectedSeverity, setSelectedSeverity] = useState('All')

    const filteredProblems = problems.filter(problem =>
        selectedSeverity === 'All' || problem.severity === selectedSeverity
    )

    return (
        <div className="space-y-6">

            <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-semibold">
                    CIVICLENS LOCATION INTELLIGENCE
                </p>
                <h2 className="text-3xl font-bold mt-3">Community Map View</h2>
                <p className="text-slate-300 mt-2">
                    Explore reported infrastructure problems across Chandigarh.
                </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { name: 'High Severity', value: problems.filter(p => p.severity === 'High').length, color: 'text-red-600' },
                    { name: 'Medium Severity', value: problems.filter(p => p.severity === 'Medium').length, color: 'text-orange-600' },
                    { name: 'Low Severity', value: problems.filter(p => p.severity === 'Low').length, color: 'text-green-600' },
                ].map(item => (
                    <div key={item.name} className="bg-white border border-slate-100 rounded-2xl p-5">
                        <p className="text-sm text-slate-500">{item.name}</p>
                        <h3 className={`text-3xl font-bold mt-2 ${item.color}`}>{item.value}</h3>
                    </div>
                ))}
            </section>

            <section className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                    <div>
                        <h3 className="font-bold text-lg">Reported Problem Locations</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Click a marker to view problem details.
                        </p>
                    </div>

                    <select
                        value={selectedSeverity}
                        onChange={e => setSelectedSeverity(e.target.value)}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    >
                        <option value="All">All Severities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-xs font-medium">
                    <span className="text-red-600">● High</span>
                    <span className="text-orange-500">● Medium</span>
                    <span className="text-green-600">● Low</span>
                </div>

                <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200">
                    <MapContainer
                        center={[30.7333, 76.7794]}
                        zoom={13}
                        scrollWheelZoom={true}
                        zoomControl={false}
                        className="h-full w-full"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <ZoomControl position="bottomright" />

                        {filteredProblems.map(problem => (
                            <Marker
                                key={problem.id}
                                position={problem.position}
                                icon={createIcon(problem.severity)}
                            >
                                <Popup>
                                    <div className="min-w-[180px]">
                                        <h3 className="font-bold text-sm">{problem.title}</h3>
                                        <p className="text-xs mt-2">{problem.location}</p>
                                        <p className="text-xs mt-2">
                                            Category: {problem.category}
                                        </p>
                                        <p className="text-xs mt-1">
                                            Severity: <strong>{problem.severity}</strong>
                                        </p>
                                        <p className="text-xs mt-1">
                                            Status: {problem.status}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <p className="text-sm text-slate-500 mt-4">
                    Displaying {filteredProblems.length} of {problems.length} sample problem locations.
                </p>
            </section>
        </div>
    )
}

export default MapView
