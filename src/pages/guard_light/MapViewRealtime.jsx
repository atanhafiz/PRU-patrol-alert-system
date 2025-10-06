import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";

// 🔹 default icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🎨 speed→color
const getColorBySpeed = (speed) => {
  if (speed <= 10) return "green";
  if (speed <= 40) return "orange";
  return "red";
};

// 📍 component marker with smooth move
function MovingMarker({ position, icon, popupContent }) {
  const markerRef = useRef();

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setLatLng(position);
  }, [position]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      <Popup>{popupContent}</Popup>
    </Marker>
  );
}

export default function MapViewRealtime() {
  const [reports, setReports] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();
  const { showToast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("patrol_summary")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("❌ Error fetch map data:", err);
      showToast("Gagal ambil data peta: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 20000);
    return () => clearInterval(interval);
  }, []);

  // unique guard
  const guardNames = Array.from(new Set(reports.map((r) => r.guard_name)));
  const filtered =
    selectedGuard === "ALL"
      ? reports
      : reports.filter((r) => r.guard_name === selectedGuard);

  const guards = filtered.reduce((acc, r) => {
    if (!acc[r.guard_name]) acc[r.guard_name] = [];
    acc[r.guard_name].push(r);
    return acc;
  }, {});

  const latest = reports[reports.length - 1];
  const center = latest
    ? [latest.latitude, latest.longitude]
    : [3.139, 101.6869];

  if (loading)
    return <p className="p-4 text-gray-500 animate-pulse">Loading map data...</p>;

  return (
    <div className="animate-fadeIn relative h-[80vh] rounded-2xl overflow-hidden shadow">
      {/* filter dropdown */}
      <div className="absolute z-[1000] top-3 left-3 bg-white/90 rounded-xl p-2 shadow flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Guard:</label>
        <select
          value={selectedGuard}
          onChange={(e) => setSelectedGuard(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
        >
          <option value="ALL">All</option>
          {guardNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* guard loop */}
        {Object.entries(guards).map(([name, entries]) => {
          const sorted = [...entries].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          const path = sorted.map((r) => [r.latitude, r.longitude]);
          const last = sorted[sorted.length - 1];
          const color = getColorBySpeed(last.max_speed || 0);

          const popup = (
            <div className="text-sm">
              <p className="font-bold text-blue-700 mb-1">{name}</p>
              <p className="text-gray-700 mb-1">{last.plate_no}</p>
              <p className="text-xs text-gray-500">
                {new Date(last.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                🏎 Avg: {last.avg_speed} km/h | ⚡ Max: {last.max_speed} km/h
              </p>
              {last.distance_km > 0 && (
                <p className="text-xs text-gray-700">
                  📏 Distance: {last.distance_km.toFixed(2)} km
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Lat: {last.latitude?.toFixed(5)}, Lon: {last.longitude?.toFixed(5)}
              </p>
            </div>
          );

          return (
            <div key={name}>
              <Polyline positions={path} color={color} weight={5} opacity={0.7} />
              <MovingMarker position={[last.latitude, last.longitude]} icon={markerIcon} popupContent={popup} />
            </div>
          );
        })}
      </MapContainer>

      {/* legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-xl p-2 text-xs shadow">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> ≤10 km/h
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-orange-400 rounded-full" /> 20–40 km/h
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" /> ≥40 km/h
        </div>
      </div>
    </div>
  );
}
