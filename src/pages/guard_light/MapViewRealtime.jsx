import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🧭 Default marker
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🎨 Warna ikut kelajuan
const getColorBySpeed = (speed) => {
  if (speed <= 10) return "green";
  if (speed <= 40) return "orange";
  return "red";
};

export default function MapViewRealtime() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();
  const { showToast } = useToast();

  // 📡 Fetch data dari Supabase
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("patrol_summary")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

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

    // ♻️ Auto refresh setiap 30s
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="p-4 text-gray-500 animate-pulse">Loading map data...</p>;

  if (reports.length === 0)
    return <p className="p-4 text-gray-500">Tiada laporan dengan lokasi.</p>;

  // 🎯 Center map di lokasi terbaru
  const center = [
    reports[0].latitude || 3.139,
    reports[0].longitude || 101.6869,
  ];

  // 🔄 Group ikut guard_name
  const guards = reports.reduce((acc, r) => {
    if (!acc[r.guard_name]) acc[r.guard_name] = [];
    acc[r.guard_name].push(r);
    return acc;
  }, {});

  return (
    <div className="animate-fadeIn h-[80vh] rounded-2xl overflow-hidden shadow">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Marker & polyline untuk setiap guard */}
        {Object.entries(guards).map(([name, entries]) => {
          // Urut ikut masa
          const sorted = [...entries].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );

          // Ambil koordinat (garisan laluan)
          const path = sorted.map((r) => [r.latitude, r.longitude]);

          // Ambil warna ikut kelajuan terakhir
          const latest = sorted[sorted.length - 1];
          const color = getColorBySpeed(latest.max_speed || 0);

          return (
            <div key={name}>
              {/* Garisan laluan */}
              <Polyline positions={path} color={color} weight={5} opacity={0.7} />

              {/* Marker guard */}
              <Marker
                position={[latest.latitude, latest.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-blue-700 mb-1">
                      {latest.guard_name}
                    </p>
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
