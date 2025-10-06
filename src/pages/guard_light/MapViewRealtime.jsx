import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";

// 🔹 Default icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🎨 Shift → warna marker
const getMarkerColor = (shift) => {
  if (!shift) return "gray";
  const lower = shift.toLowerCase();
  if (lower.includes("pagi")) return "orange";
  if (lower.includes("malam")) return "blue";
  return "green";
};

// 📍 Moving marker animation
function MovingMarker({ position, icon, popupContent }) {
  const markerRef = useRef();

  useEffect(() => {
    if (markerRef.current) markerRef.current.setLatLng(position);
  }, [position]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      <Popup>{popupContent}</Popup>
    </Marker>
  );
}

export default function MapViewRealtime() {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const mapRef = useRef();

  // 🛰️ Fetch guard aktif
  const fetchGuards = async () => {
    try {
      const { data, error } = await supabase
        .from("guards")
        .select("*")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (error) throw error;
      setGuards(data || []);
    } catch (err) {
      console.error("❌ Error fetch map data:", err);
      showToast("Gagal ambil data peta: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
    const interval = setInterval(fetchGuards, 20000); // refresh setiap 20s
    return () => clearInterval(interval);
  }, []);

  const center = guards.length
    ? [guards[0].last_lat || 3.139, guards[0].last_lon || 101.6869]
    : [3.139, 101.6869];

  if (loading)
    return <p className="p-4 text-gray-500 animate-pulse">Loading map data...</p>;

  return (
    <div className="animate-fadeIn relative h-[80vh] rounded-2xl overflow-hidden shadow">
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

        {guards.map((g) => {
          if (!g.last_lat || !g.last_lon) return null;
          const color = getMarkerColor(g.shift);
          const customIcon = new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          });

          const popup = (
            <div className="text-sm">
              <p className="font-bold text-blue-700 mb-1">{g.full_name}</p>
              <p className="text-gray-700 mb-1">{g.company || "-"}</p>
              <p className="text-xs text-gray-500 mb-1">
                Shift: {g.shift || "-"}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Lat: {g.last_lat?.toFixed(5)}, Lon: {g.last_lon?.toFixed(5)}
              </p>
              <p className="text-xs text-gray-400">
                ⏱️ {new Date(g.updated_at || g.created_at).toLocaleString()}
              </p>
            </div>
          );

          return (
            <MovingMarker
              key={g.id}
              position={[g.last_lat, g.last_lon]}
              icon={customIcon}
              popupContent={popup}
            />
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-xl p-2 text-xs shadow">
        <p className="font-semibold mb-1 text-gray-700">Guard On Duty</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-orange-500 rounded-full" /> Pagi
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-blue-500 rounded-full" /> Malam
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> Lain-lain
        </div>
      </div>
    </div>
  );
}
