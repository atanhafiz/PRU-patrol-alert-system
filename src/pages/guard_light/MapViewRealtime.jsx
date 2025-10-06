import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🧭 Default marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🎨 Kelajuan → warna
const getColorBySpeed = (speed) => {
  if (speed <= 10) return "green";
  if (speed <= 40) return "orange";
  return "red";
};

export default function MapViewRealtime() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuard, setSelectedGuard] = useState("ALL");
  const mapRef = useRef();
  const { showToast } = useToast();

  // Fetch dari Supabase
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
    const interval = setInterval(fetchReports, 20000); // auto refresh setiap 20s
    return () => clearInterval(interval);
  }, []);

  // Dapat semua nama guard
  const guardNames = Array.from(new Set(reports.map((r) => r.guard_name)));

  // Filter ikut guard
  const filteredReports =
    selectedGuard === "ALL"
      ? reports
      : reports.filter((r) => r.guard_name === selectedGuard);

  // Group ikut guard
  const guards = filteredReports.reduce((acc, r) => {
    if (!acc[r.guard_name]) acc[r.guard_name] = [];
    acc[r.guard_name].push(r);
    return acc;
  }, {});

  // Center peta
  const latest = reports[reports.length - 1];
  const center = latest
    ? [latest.latitude, latest.longitude]
    : [3.139, 101.6869];

  if (loading)
    return <p className="p-4 text-gray-500 animate-pulse">Loading map data...</p>;

  return (
    <div className="animate-fadeIn relative h-[80vh] rounded-2xl overflow-hidden shadow">
      {/* 🧭 Filter guard */}
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

        {/* Marker & line ikut guard */}
        {Object.entries(guards).map(([name, entries]) => {
          const sorted = [...entries].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );

          const path = sorted.map((r) => [r.latitude, r.longitude]);
          const latest = sorted[sorted.length - 1];
          const color = getColorBySpeed(latest.max_speed || 0);

          return (
            <div key={name}>
              <Polyline positions={path} color={color} weight={5} opacity={0.7} />
              <Marker
                position={[latest.latitude, latest.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-blue-700 mb-1">{name}</p>
                    <p className="text-gray-700 mb-1">{latest.plate_no}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(latest.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      🏎 Avg: {latest.avg_speed} km/h | ⚡ Max:{" "}
                      {latest.max_speed} km/h
                    </p>
                    {latest.distance_km > 0 && (
                      <p className="text-xs text-gray-700">
                        📏 Distance: {latest.distance_km.toFixed(2)} km
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {latest.latitude?.toFixed(5)}, Lon:{" "}
                      {latest.longitude?.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      {/* Legend */}
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
