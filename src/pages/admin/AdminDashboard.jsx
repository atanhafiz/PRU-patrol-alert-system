import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";

// Icon rumah custom (simple)
const houseIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
  iconSize: [25, 25],
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("patrol");
  const [showSetting, setShowSetting] = useState(false);

  // ======== SETTING STATE ========
  const [sessionsPerDay, setSessionsPerDay] = useState(6);
  const [housesPerSession, setHousesPerSession] = useState(7);
  const [note, setNote] = useState("");

  // ======== PATROL SESSION ========
  const buildSessions = (sesi, rumah) =>
    Array.from({ length: sesi }, (_, i) => ({
      id: `session-${i + 1}`,
      name: `Sesi ${i + 1}`,
      houses: Array.from({ length: rumah }, (_, j) => ({
        id: `s${i + 1}-h${j + 1}`,
        number: `Rumah ${j + 1}`,
      })),
    }));

  const [sessions, setSessions] = useState(buildSessions(sessionsPerDay, housesPerSession));
  const [activeSession, setActiveSession] = useState(0);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newSessions = [...sessions];
    const houses = Array.from(newSessions[activeSession].houses);
    const [moved] = houses.splice(result.source.index, 1);
    houses.splice(result.destination.index, 0, moved);
    newSessions[activeSession].houses = houses;
    setSessions(newSessions);
  };

  const totalHouses = sessionsPerDay * housesPerSession;
  const completedHouses = 12;
  const progress = Math.round((completedHouses / totalHouses) * 100);

  const dummyReports = [
    { id: 1, guard: "Ali", text: "Semua ok blok A", date: "2025-09-15" },
    { id: 2, guard: "Abu", text: "Lampu jalan rosak", date: "2025-09-16" },
  ];

  // ======== GUARD REGISTER (Supabase) ========
  const [guards, setGuards] = useState([]);
  const [fullName, setFullName] = useState("");
  const [shift, setShift] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch guard data
  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("Gagal ambil data guard", "error");
    } else setGuards(data || []);
  };

  useEffect(() => {
    fetchGuards();

    // Realtime listener
    const channel = supabase
      .channel("guards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guards" },
        () => fetchGuards()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Add new guard
  const handleAddGuard = async (e) => {
    e.preventDefault();
    if (!fullName || !shift || !company) {
      showToast("Sila isi semua maklumat", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("guards")
      .insert([{ full_name: fullName, shift, company, is_active: false }]);

    if (error) {
      console.error(error);
      showToast("Gagal daftar guard: " + error.message, "error");
    } else {
      showToast("✅ Guard berjaya didaftarkan", "success");
      setFullName("");
      setShift("");
      setCompany("");
      fetchGuards();
    }
    setLoading(false);
  };

  // Delete guard
  const handleDeleteGuard = async (id) => {
    if (!window.confirm("Padam guard ini?")) return;
    const { error } = await supabase.from("guards").delete().eq("id", id);
    if (error) {
      console.error(error);
      showToast("Gagal padam guard", "error");
    } else {
      showToast("Guard dipadam ✅", "success");
      fetchGuards();
    }
  };

  // ======== AUTO GENERATE ========
  const autoGenerate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ sesi: sessionsPerDay, rumahPerSesi: housesPerSession }),
        }
      );
      const data = await res.json();
      console.log("Auto Generate result:", data);
      alert("✅ Auto Generate siap! Check Telegram group guard.");
    } catch (err) {
      console.error("Auto Generate error:", err);
      alert("❌ Auto Generate gagal. Check console log.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-500 shadow">
        <div className="flex items-center gap-3 text-white">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-1" />
          <h1 className="text-lg font-semibold">PRU Patrol – Admin</h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
        >
          Logout
        </button>
      </header>

      {/* ===== TABS ===== */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-4">
          {["patrol", "report", "guard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab === "patrol"
                ? "Patrol Session"
                : tab === "report"
                ? "Report & Emergency"
                : "Guard Register"}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="p-6">
        {/* PATROL TAB */}
        {activeTab === "patrol" && (
          <>
            <div className="shadow-lg rounded-xl bg-white p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Duty Summary</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg shadow text-center">
                  <p className="text-sm text-gray-500">Target / Hari</p>
                  <p className="text-2xl font-bold">{totalHouses}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow text-center">
                  <p className="text-sm text-gray-500">Siap Setakat Ini</p>
                  <p className="text-2xl font-bold">{completedHouses}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow text-center">
                  <p className="text-sm text-gray-500">Baki</p>
                  <p className="text-2xl font-bold">{totalHouses - completedHouses}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow text-center">
                  <p className="text-sm text-gray-500">Progress (%)</p>
                  <p className="text-2xl font-bold">{progress}%</p>
                </div>
              </div>
            </div>

            {/* MAP VIEW (Patrol) */}
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Map View</h2>
              <div className="w-full h-96 rounded overflow-hidden">
                <MapContainer
                  center={[3.139, 101.6869]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {sessions[activeSession].houses.map((house, index) => {
                    const lat = 3.139 + index * 0.0002;
                    const lng = 101.6869 + index * 0.0002;
                    let status = index < 3 ? "siap" : index === 3 ? "jalan" : "belum";
                    const color =
                      status === "siap" ? "green" : status === "jalan" ? "orange" : "red";
                    return (
                      <Marker key={house.id} position={[lat, lng]} icon={houseIcon}>
                        <Popup>
                          {house.number}
                          <br />
                          Status:{" "}
                          <span className="font-semibold" style={{ color }}>
                            {status === "siap"
                              ? "Siap"
                              : status === "jalan"
                              ? "Tengah Jalan"
                              : "Belum Mula"}
                          </span>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </>
        )}

        {/* REPORT TAB */}
        {activeTab === "report" && (
          <>
            <div className="shadow-lg rounded-xl bg-white p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3">Senarai Report Guard</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Nama</th>
                    <th className="p-2 border">Text</th>
                    <th className="p-2 border">Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyReports.map((r) => (
                    <tr key={r.id} className="text-center">
                      <td className="p-2 border">{r.guard}</td>
                      <td className="p-2 border">{r.text}</td>
                      <td className="p-2 border">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="shadow-lg rounded-xl bg-white p-4 bg-red-100 border border-red-400">
              <h2 className="text-lg font-semibold text-red-700 mb-3">
                Emergency Alert
              </h2>
              <p className="text-red-600">⚠️ Guard tekan butang kecemasan!</p>
            </div>
          </>
        )}

        {/* GUARD REGISTER TAB (LIVE SUPABASE) */}
        {activeTab === "guard" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddGuard}
              className="bg-white border rounded-xl shadow-sm p-4 mb-6"
            >
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Daftar Guard Baru
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Nama Guard"
                  className="border rounded-lg p-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Shift"
                  className="border rounded-lg p-2"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Syarikat"
                  className="border rounded-lg p-2"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
              >
                {loading ? "Menyimpan..." : "Daftar"}
              </button>
            </form>

            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Senarai Guard
              </h2>
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 border">Nama</th>
                    <th className="p-2 border">Shift</th>
                    <th className="p-2 border">Syarikat</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.map((g) => (
                    <tr key={g.id} className="text-center border-b">
                      <td className="p-2">{g.full_name}</td>
                      <td className="p-2">{g.shift}</td>
                      <td className="p-2">{g.company}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            g.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {g.is_active ? "On Duty" : "Off Duty"}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteGuard(g.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {guards.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        Tiada guard berdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
