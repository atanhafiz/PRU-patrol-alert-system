import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../../lib/supabaseAutoClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
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
        showToast("Gagal ambil data peta: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <p className="p-4 text-gray-500 animate-pulse">Loading map...</p>;
  if (reports.length === 0)
    return <p className="p-4 text-gray-500">Tiada laporan dengan lokasi.</p>;

  // Center map di lokasi pertama (atau default Malaysia)
  const center = reports.length
    ? [reports[0].latitude, reports[0].longitude]
    : [3.139, 101.6869];

  return (
    <div className="animate-fadeIn h-[80vh] rounded-2xl overflow-hidden shadow">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-blue-700 mb-1">{r.guard_name}</p>
                <p className="text-gray-700 mb-1">{r.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                {r.photo_url && (
                  <img
                    src={r.photo_url}
                    alt="report"
                    className="mt-2 rounded-lg border"
                    style={{ maxWidth: "180px" }}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
