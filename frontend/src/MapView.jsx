
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
    "All",
    "Road Damage",
    "Garbage",
    "Streetlight",
    "Waterlogging",
    "Drainage",
    "Footpath Damage",
    "Other",
];

const SEVERITY_COLORS = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#16a34a",
};

const createIcon = (severity) => {
    const color = SEVERITY_COLORS[severity] || "#64748b";

    return L.divIcon({
        className: "custom-map-marker",
        html: `
            <div style="
                width:32px;
                height:32px;
                background:${color};
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 3px 10px #0006;
                display:flex;
                align-items:center;
                justify-content:center;
                color:white;
                font-size:12px;
                font-weight:bold;
            ">
                ●
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

function getCoordinates(problem) {
    const coordinates = problem.coordinates;

    let latitude;
    let longitude;

    if (
        coordinates &&
        !Array.isArray(coordinates) &&
        typeof coordinates === "object"
    ) {
        latitude = coordinates.latitude ?? coordinates.lat;
        longitude =
            coordinates.longitude ?? coordinates.lng ?? coordinates.lon;
    }

    if (Array.isArray(coordinates) && coordinates.length >= 2) {
        longitude = coordinates[0];
        latitude = coordinates[1];
    }

    if (latitude == null) {
        latitude = problem.latitude ?? problem.lat;
    }

    if (longitude == null) {
        longitude = problem.longitude ?? problem.lng ?? problem.lon;
    }

    latitude = Number(latitude);
    longitude = Number(longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180 ||
        (latitude === 0 && longitude === 0)
    ) {
        return null;
    }

    return [latitude, longitude];
}

function MapView() {
    const [problems, setProblems] = useState([]);
    const [selectedSeverity, setSelectedSeverity] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProblems = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("civiclens_session");

            const response = await fetch(`${API_URL}/api/problems`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not load problems.");
            }

            setProblems(data.problems || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const locatedProblems = problems
        .map((problem) => ({
            ...problem,
            position: getCoordinates(problem),
        }))
        .filter((problem) => problem.position !== null);

    const filteredProblems = locatedProblems.filter((problem) => {
        const matchesSeverity =
            selectedSeverity === "All" ||
            problem.severity === selectedSeverity;

        const matchesCategory =
            selectedCategory === "All" ||
            problem.category === selectedCategory;

        return matchesSeverity && matchesCategory;
    });

    const countBySeverity = (severity) =>
        locatedProblems.filter(
            (problem) => problem.severity === severity
        ).length;

    const countByCategory = (category) =>
        locatedProblems.filter(
            (problem) => problem.category === category
        ).length;

    const mapCenter = filteredProblems[0]?.position || [30.9010, 75.8573];

    return (
        <div className="space-y-6">

            <section className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-7">
                <p className="text-cyan-300 text-sm font-semibold">
                    CIVICLENS LOCATION INTELLIGENCE
                </p>

                <h2 className="text-3xl font-bold mt-3">
                    Community Map View
                </h2>

                <p className="text-slate-300 mt-2">
                    Explore reported infrastructure problems across different categories.
                </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        name: "High Severity",
                        value: countBySeverity("High"),
                        color: "text-red-600",
                    },
                    {
                        name: "Medium Severity",
                        value: countBySeverity("Medium"),
                        color: "text-orange-600",
                    },
                    {
                        name: "Low Severity",
                        value: countBySeverity("Low"),
                        color: "text-green-600",
                    },
                ].map((item) => (
                    <div
                        key={item.name}
                        className="bg-white border border-slate-100 rounded-2xl p-5"
                    >
                        <p className="text-sm text-slate-500">
                            {item.name}
                        </p>

                        <h3 className={`text-3xl font-bold mt-2 ${item.color}`}>
                            {item.value}
                        </h3>
                    </div>
                ))}
            </section>

            <section className="bg-white rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-lg mb-4">
                    Reports by Category
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.filter(
                        (category) => category !== "All"
                    ).map((category) => (
                        <div
                            key={category}
                            className="bg-slate-50 rounded-xl p-3"
                        >
                            <p className="text-xs text-slate-500">
                                {category}
                            </p>

                            <p className="text-xl font-bold mt-1">
                                {countByCategory(category)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white rounded-2xl p-5 border border-slate-100">

                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                    <div>
                        <h3 className="font-bold text-lg">
                            Reported Problem Locations
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Zoom in and click overlapping clusters to spread reports into separate nodes.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-3 text-sm"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category === "All"
                                        ? "All Categories"
                                        : category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedSeverity}
                            onChange={(e) => setSelectedSeverity(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-3 text-sm"
                        >
                            <option value="All">All Severities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <button
                            onClick={fetchProblems}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {loading && (
                    <p className="text-slate-500 py-4">
                        Loading problem locations...
                    </p>
                )}

                {error && (
                    <p className="text-red-600 bg-red-50 p-3 rounded-xl mb-4">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <div className="flex flex-wrap gap-4 mb-4 text-xs font-medium">
                            <span className="text-red-600">● High</span>
                            <span className="text-orange-500">● Medium</span>
                            <span className="text-green-600">● Low</span>
                        </div>

                        <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200">

                            <MapContainer
                                key={`${mapCenter.join(",")}-${selectedCategory}-${selectedSeverity}`}
                                center={mapCenter}
                                zoom={12}
                                maxZoom={19}
                                scrollWheelZoom
                                zoomControl={false}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxZoom={19}
                                />

                                <ZoomControl position="bottomright" />

                                <MarkerClusterGroup
                                    chunkedLoading
                                    maxClusterRadius={35}
                                    spiderfyOnMaxZoom={true}
                                    spiderfyDistanceMultiplier={2}
                                    showCoverageOnHover={false}
                                    zoomToBoundsOnClick={true}
                                    animate={true}
                                    animateAddingMarkers={true}
                                    removeOutsideVisibleBounds={false}
                                >
                                    {filteredProblems.map((problem) => (
                                        <Marker
                                            key={problem._id}
                                            position={problem.position}
                                            icon={createIcon(problem.severity)}
                                        >
                                            <Popup>
                                                <div className="min-w-[180px]">
                                                    <h3 className="font-bold text-sm">
                                                        {problem.title}
                                                    </h3>

                                                    <p className="text-xs mt-2">
                                                        {problem.location}
                                                    </p>

                                                    <p className="text-xs mt-2">
                                                        Category: {problem.category}
                                                    </p>

                                                    <p className="text-xs mt-1">
                                                        Severity:{" "}
                                                        <strong
                                                            style={{
                                                                color:
                                                                    SEVERITY_COLORS[
                                                                        problem.severity
                                                                    ] || "#64748b",
                                                            }}
                                                        >
                                                            {problem.severity}
                                                        </strong>
                                                    </p>

                                                    <p className="text-xs mt-1">
                                                        Status: {problem.status}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MarkerClusterGroup>

                            </MapContainer>
                        </div>

                        <p className="text-sm text-slate-500 mt-4">
                            Showing {filteredProblems.length} of{" "}
                            {locatedProblems.length} located reports.
                            {" "}
                            {problems.length - locatedProblems.length} reports
                            do not have usable coordinates.
                        </p>

                        {problems.length - locatedProblems.length > 0 && (
                            <div className="bg-orange-50 text-orange-700 rounded-xl p-4 mt-3 text-sm">
                                <strong>
                                    Some reports are missing GPS coordinates.
                                </strong>
                                {" "}
                                Those reports cannot appear on the map until
                                valid latitude and longitude are saved.
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default MapView;
