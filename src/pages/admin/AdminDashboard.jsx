import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icon rumah custom (simple)
const houseIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
  iconSize: [25, 25],
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patrol");
  const [showSetting, setShowSetting] = useState(false);

  // Setting admin
  const [sessionsPerDay, setSessionsPerDay] = useState(6);
  const [housesPerSession, setHousesPerSession] = useState(7);
  const [note, setNote] = useState("");

  // Data sesi & rumah (multi-tab)
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

  // Drag & drop urutan rumah
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newSessions = [...sessions];
    const houses = Array.from(newSessions[activeSession].houses);
    const [moved] = houses.splice(result.source.index, 1);
    houses.splice(result.destination.index, 0, moved);
    newSessions[activeSession].houses = houses;
    setSessions(newSessions);
  };

  // Dummy statistik atas (nanti link Supabase)
  const totalHouses = sessionsPerDay * housesPerSession;
  const completedHouses = 12; // contoh
  const progress = Math.round((completedHouses / totalHouses) * 100);

  const dummyReports = [
    { id: 1, guard: "Ali", text: "Semua ok blok A", date: "2025-09-15" },
    { id: 2, guard: "Abu", text: "Lampu jalan rosak", date: "2025-09-16" },
  ];

  const dummyGuards = [
    { id: 1, name: "Ali", shift: "Malam", company: "SecurePro" },
    { id: 2, name: "Abu", shift: "Pagi", company: "PrimaGuard" },
  ];

  // 👉 Function Auto Generate (link Supabase Edge Function)
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
      {/* Header / Topbar */}
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

      {/* Menu Tab */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("patrol")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "patrol" ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Patrol Session
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "report" ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Report & Emergency
          </button>
          <button
            onClick={() => setActiveTab("guard")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "guard" ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Guard Register
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* PATROL SESSION */}
        {activeTab === "patrol" && (
          <div className="space-y-6">
            {/* Duty Summary */}
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-xl font-semibold mb-4">Duty Summary</h2>

              {/* Stat cards */}
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

              {/* Ringkasan sesi */}
              <h3 className="text-md font-semibold mb-3">
                Ringkasan {sessionsPerDay} Sesi ({totalHouses} rumah)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {sessions.map((s, i) => {
                  const done = i === 0 ? 4 : i === 1 ? housesPerSession : i === 2 ? 1 : 0;
                  const target = housesPerSession;
                  const percent = Math.round((done / target) * 100);
                  const bar =
                    done === target ? "bg-green-500" : done > 0 ? "bg-orange-500" : "bg-gray-300";

                  return (
                    <div key={s.id} className="p-3 border rounded-lg shadow-sm bg-white space-y-2">
                      <p className="text-sm font-medium">{s.name}</p>
                      <div className="w-full bg-gray-200 h-3 rounded">
                        <div className={`h-3 rounded ${bar}`} style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {done}/{target}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generate Session + Setting */}
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Generate Session</h2>
              <div className="flex gap-3">
                <button
                  onClick={autoGenerate}
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl px-4 py-2 hover:scale-105 transition-all duration-300"
                >
                  Auto Generate ({sessionsPerDay} sesi × {housesPerSession} rumah)
                </button>
                <button
                  onClick={() => setShowSetting(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-4 py-2 hover:scale-105 transition-all duration-300"
                >
                  ⚙️ Setting
                </button>
              </div>
              {note && <p className="text-sm text-gray-500 mt-2">Nota: {note}</p>}
            </div>

            {/* Review / Edit */}
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Review / Edit Rumah</h2>
              <div className="flex gap-2 mb-4">
                {sessions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSession(i)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      i === activeSession ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="houses">
                  {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {sessions[activeSession].houses.map((house, index) => (
                        <Draggable key={house.id} draggableId={house.id} index={index}>
                          {(provided) => (
                            <li
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 shadow-sm"
                            >
                              <input
                                type="text"
                                value={house.number}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[activeSession].houses[index].number = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full border-none bg-transparent focus:ring-0"
                              />
                              <span className="text-gray-400 cursor-move">⠿</span>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Map View */}
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Map View</h2>
              <div className="w-full h-96 rounded overflow-hidden">
                <MapContainer center={[3.139, 101.6869]} zoom={16} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {sessions[activeSession].houses.map((house, index) => {
                    const lat = 3.139 + index * 0.0002;
                    const lng = 101.6869 + index * 0.0002;
                    let status = "belum";
                    if (index < 3) status = "siap";
                    else if (index === 3) status = "jalan";
                    const color = status === "siap" ? "green" : status === "jalan" ? "orange" : "red";
                    return (
                      <Marker key={house.id} position={[lat, lng]} icon={houseIcon}>
                        <Popup>
                          {house.number}
                          <br />
                          Status:{" "}
                          <span className="font-semibold" style={{ color }}>
                            {status === "siap" ? "Siap" : status === "jalan" ? "Tengah Jalan" : "Belum Mula"}
                          </span>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {sessions[activeSession].houses.map((_, index, arr) => {
                    if (index === arr.length - 1) return null;
                    const latlng1 = [3.139 + index * 0.0002, 101.6869 + index * 0.0002];
                    const latlng2 = [3.139 + (index + 1) * 0.0002, 101.6869 + (index + 1) * 0.0002];
                    let color = "red";
                    if (index < 3) color = "green";
                    else if (index === 3) color = "orange";
                    return <Polyline key={index} positions={[latlng1, latlng2]} color={color} weight={5} />;
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* REPORT & EMERGENCY */}
        {activeTab === "report" && (
          <div className="space-y-6">
            <div className="shadow-lg rounded-xl bg-white p-4">
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
              <h2 className="text-lg font-semibold text-red-700 mb-3">Emergency Alert</h2>
              <p className="text-red-600">⚠️ Guard tekan butang kecemasan!</p>
            </div>
          </div>
        )}

        {/* GUARD REGISTER */}
        {activeTab === "guard" && (
          <div className="space-y-6">
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Daftar Guard Baru</h2>
              <form className="space-y-3">
                <input type="text" placeholder="Nama Guard" className="w-full border rounded px-3 py-2" />
                <input type="text" placeholder="Shift" className="w-full border rounded px-3 py-2" />
                <input type="text" placeholder="Syarikat" className="w-full border rounded px-3 py-2" />
                <button className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl px-4 py-2 hover:scale-105 transition-all duration-300">
                  Daftar
                </button>
              </form>
            </div>
            <div className="shadow-lg rounded-xl bg-white p-4">
              <h2 className="text-lg font-semibold mb-3">Senarai Guard Aktif</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Nama</th>
                    <th className="p-2 border">Shift</th>
                    <th className="p-2 border">Syarikat</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyGuards.map((g) => (
                    <tr key={g.id} className="text-center">
                      <td className="p-2 border">{g.name}</td>
                      <td className="p-2 border">{g.shift}</td>
                      <td className="p-2 border">{g.company}</td>
                      <td className="p-2 border">
                        <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Popup Setting */}
      {showSetting && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tetapan Jana Pelan</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Bilangan Sesi / Hari</label>
                <input
                  type="number"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Rumah per Sesi</label>
                <input
                  type="number"
                  value={housesPerSession}
                  onChange={(e) => setHousesPerSession(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nota</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: elak rumah yang ada anjing ganas"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowSetting(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                Batal
              </button>
              <button
                onClick={() => {
                  setSessions(buildSessions(sessionsPerDay, housesPerSession));
                  setActiveSession(0);
                  setShowSetting(false);
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl px-4 py-2 hover:scale-105 transition-all duration-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
