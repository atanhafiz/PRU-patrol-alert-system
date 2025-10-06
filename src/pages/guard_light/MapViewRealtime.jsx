// src/pages/admin/MapViewRealtime.jsx
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { supabase } from "../../lib/supabaseAutoClient";
import { useToast } from "../../components/ToastProvider";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";

// marker asas
const baseIcon = (color = "green") =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const getColor = (shift) => {
  if (!shift) return "gray";
  const s = shift.toLowerCase();
  if (s.includes("pagi")) return "orange";
  if (s.includes("malam")) return "blue";
  return "green";
};

function RadarPulse({ color = "green" }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: [0, 2.5], opacity: [0.8, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
      style={{
        position: "absolute",
        backgroundColor:
          color === "blue"
            ? "rgba(59,130,246,0.25)"
            : color === "orange"
            ? "rgba(251,146,60,0.25)"
            : "rgba(34,197,94,0.25)",
        width: 100,
        height: 100,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    ></motion.div>
  );
}

function GuardMarker({ guard, popupContent, isNew, onFocus }) {
  const [blink, setBlink] = useState(isNew);
  const color = getColor(guard.shift);
  const icon = baseIcon(color);
  const lat = guard.last_lat;
  const lon = guard.last_lon;

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setBlink(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  if (!lat || !lon) return null;

  return (
    <>
      {blink ? (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Marker position={[lat, lon]} icon={icon} eventHandlers={{ click: () => onFocus([lat, lon], guard) }}>
            <Popup>{popupContent}</Popup>
          </Marker>
        </motion.div>
      ) : (
        <>
          <Marker position={[lat, lon]} icon={icon} eventHandlers={{ click: () => onFocus([lat, lon], guard) }}>
            <Popup>{popupContent}</Popup>
          </Marker>
          <RadarPulse color={color} />
        </>
      )}
    </>
  );
}

function useFlyTo(coord) {
  const map = useMap();
  useEffect(() => {
    if (coord && coord[0] && coord[1]) map.flyTo(coord, 17, { duration: 1.5 });
  }, [coord]);
  return null;
}

export default function MapViewRealtime() {
  const [guards, setGuards] = useState([]);
  const [paths, setPaths] = useState({});
  const [newGuardId, setNewGuardId] = useState(null);
  const [focusCoord, setFocusCoord] = useState(null);
  const [focusGuard, setFocusGuard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [routes, setRoutes] = useState([]); // 🆕 patrol_runs listener
  const { showToast } = useToast();
  const mapRef = useRef();

  // ambil guard aktif
  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .or("is_active.eq.true,status.eq.on_patrol")
      .not("last_lat", "is", null)
      .not("last_lon", "is", null)
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error);
      showToast("Gagal ambil data guard", "error");
    } else setGuards(data || []);
  };

  const fetchSummary = async (guardName) => {
    if (!guardName) return;
    const { data, error } = await supabase
      .from("patrol_summary")
      .select("*")
      .eq("guard_name", guardName)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error) setSummary(data[0] || null);
  };

  // 🆕 Fetch route
  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from("patrol_runs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setRoutes(data || []);
  };

  useEffect(() => {
    fetchGuards();
    fetchRoutes();

    // ====== Guards Realtime ======
    const guardChannel = supabase
      .channel("guards-command-hq")
      .on("postgres_changes", { event: "*", schema: "public", table: "guards" }, (payload) => {
        if (
          payload.eventType === "UPDATE" &&
          (payload.new.is_active === true || payload.new.status === "on_patrol")
        ) {
          setNewGuardId(payload.new.id);
          setFocusCoord([payload.new.last_lat, payload.new.last_lon]);
          setGuards((prev) => {
            const exist = prev.find((g) => g.id === payload.new.id);
            if (exist)
              return prev.map((g) => (g.id === payload.new.id ? payload.new : g));
            else return [...prev, payload.new];
          });
          showToast(`🚨 ${payload.new.full_name} mula rondaan!`, "success");
        }
        if (payload.eventType === "UPDATE" && payload.new.is_active === false) {
          setGuards((prev) => prev.filter((g) => g.id !== payload.new.id));
          showToast(`❎ ${payload.new.full_name} tamat duty.`, "info");
        }
        if (payload.eventType === "UPDATE" && payload.new.is_active === true) {
          setPaths((prev) => {
            const id = payload.new.id;
            const lat = payload.new.last_lat;
            const lon = payload.new.last_lon;
            if (!lat || !lon) return prev;
            const newPath = [...(prev[id] || []), [lat, lon]].slice(-10);
            return { ...prev, [id]: newPath };
          });
        }
      })
      .subscribe();

    // ====== PatrolRuns Realtime V2 ======
    const routeChannel = supabase
      .channel("realtime:public:patrol_runs")
      .on("postgres_changes", { event: "*", schema: "public", table: "patrol_runs" }, (payload) => {
        console.log("📡 patrol_runs change:", payload);
        fetchRoutes(); // refresh data
        showToast("📍 Update dari patrol_runs (Realtime)", "info");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(guardChannel);
      supabase.removeChannel(routeChannel);
    };
  }, []);

  const center = guards.length
    ? [guards[0].last_lat || 3.139, guards[0].last_lon || 101.6869]
    : [3.139, 101.6869];

  const handleFocus = (coord, guard) => {
    setFocusCoord(coord);
    setFocusGuard(guard);
    fetchSummary(guard.full_name);
  };

  if (!guards.length)
    return (
      <p className="p-4 text-gray-500 animate-pulse">
        Tiada guard aktif (belum selfie-start)...
      </p>
    );

  return (
    <div className="flex gap-4 h-[80vh]">
      {/* senarai guard */}
      <div className="w-1/4 bg-white rounded-2xl shadow overflow-y-auto p-4 border">
        <h2 className="text-lg font-bold text-indigo-600 mb-3">👮 Guard Aktif</h2>
        {guards.map((g) => (
          <div
            key={g.id}
            onClick={() => handleFocus([g.last_lat, g.last_lon], g)}
            className={`p-3 mb-2 rounded-lg cursor-pointer border ${
              g.id === newGuardId
                ? "bg-green-50 border-green-400"
                : "hover:bg-gray-100"
            }`}
          >
            <p className="font-semibold text-gray-800">{g.full_name}</p>
            <p className="text-xs text-gray-600">{g.company || "-"}</p>
            <p className="text-xs text-gray-500">
              Shift: {g.shift || "-"} |{" "}
              <span
                className={`font-semibold ${
                  g.is_active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {g.is_active ? "On Patrol" : g.status || "Off Duty"}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* peta utama */}
      <div className="flex-1 relative rounded-2xl overflow-hidden shadow border">
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
          <useFlyTo coord={focusCoord} />

          {/* 🧭 Marker guard */}
          {guards.map((g) => {
            if (!g.last_lat || !g.last_lon) return null;
            const color = getColor(g.shift);
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
              <div key={g.id}>
                <GuardMarker
                  guard={g}
                  popupContent={popup}
                  isNew={g.id === newGuardId}
                  onFocus={handleFocus}
                />
                {paths[g.id] && (
                  <Polyline
                    positions={paths[g.id]}
                    color={color}
                    weight={4}
                    opacity={0.6}
                  />
                )}
              </div>
            );
          })}

          {/* 🆕 Marker route dari patrol_runs */}
          {routes.map((r) => {
            if (!r.blok || !r.house_no) return null;
            const lat = 3.139 + (parseInt(r.house_no) || 0) * 0.00002;
            const lng = 101.6869 + (r.blok === "Merah" ? 0.0003 : 0);
            return (
              <Marker
                key={r.id}
                position={[lat, lng]}
                icon={baseIcon(r.status === "done" ? "green" : "red")}
              >
                <Popup>
                  <b>Rumah:</b> {r.house_no} <br />
                  <b>Blok:</b> {r.blok} <br />
                  <b>Status:</b>{" "}
                  <span className="capitalize">{r.status}</span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* panel kanan */}
      <div className="w-1/4 bg-white rounded-2xl shadow overflow-y-auto p-4 border">
        <h2 className="text-lg font-bold text-indigo-600 mb-3">🧭 Command Panel</h2>
        {focusGuard ? (
          <>
            <p className="font-semibold text-gray-800 text-lg mb-1">
              {focusGuard.full_name}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              {focusGuard.company} • {focusGuard.shift}
            </p>
            <p className="text-sm mb-1">
              <b>Status:</b>{" "}
              <span
                className={`font-semibold ${
                  focusGuard.is_active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {focusGuard.is_active ? "On Patrol" : focusGuard.status || "Off Duty"}
              </span>
            </p>
            <p className="text-sm mb-1">
              <b>Lat:</b> {focusGuard.last_lat?.toFixed(5)} <b>Lon:</b>{" "}
              {focusGuard.last_lon?.toFixed(5)}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Updated:{" "}
              {new Date(
                focusGuard.updated_at || focusGuard.created_at
              ).toLocaleString()}
            </p>

            <h3 className="text-sm font-semibold mt-4 mb-1 text-gray-600">
              🔹 Patrol Summary
            </h3>
            {summary ? (
              <div className="text-xs text-gray-700 border rounded p-2 mb-3">
                <p>Speed Avg: {summary.avg_speed} km/h</p>
                <p>Max Speed: {summary.max_speed} km/h</p>
                <p>Distance: {summary.distance_km} km</p>
                <p>Duration: {summary.duration}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">
                Tiada data laporan terkini.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setFocusCoord([focusGuard.last_lat, focusGuard.last_lon])}
                className="flex-1 bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-indigo-700"
              >
                🎯 Fokus Map
              </button>
              <button
                onClick={() => alert("Ping Telegram 🚀 (mock)")}
                className="flex-1 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700"
              >
                📢 Ping
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Klik guard untuk lihat detail.</p>
        )}
      </div>
    </div>
  );
}
