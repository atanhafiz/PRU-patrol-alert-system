// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseAutoClient";
import { useToast } from "../../components/ToastProvider";
import MapViewRealtime from "../guard_light/MapViewRealtime";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("patrol");

  // ====== PATROL ASSIGN ======
  const [houseNo, setHouseNo] = useState("");
  const [blok, setBlok] = useState("");
  const [runs, setRuns] = useState([]);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const fetchRuns = async () => {
    const { data, error } = await supabase
      .from("patrol_runs")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error(error);
    else setRuns(data || []);
  };

  const addRun = async () => {
    if (!houseNo || !blok) return showToast("Sila pilih rumah & blok", "error");
    try {
      setLoadingAdd(true);
      const { error } = await supabase.from("patrol_runs").insert([
        {
          house_no: houseNo,
          blok,
          status: "pending",
        },
      ]);
      if (error) throw error;
      showToast("🏠 Rumah berjaya ditambah", "success");
      setHouseNo("");
      setBlok("");
      fetchRuns();
    } catch (err) {
      console.error(err);
      showToast("❌ Gagal tambah rumah", "error");
    } finally {
      setLoadingAdd(false);
    }
  };

  const deleteRun = async (id) => {
    if (!window.confirm("Padam rumah ni?")) return;
    const { error } = await supabase.from("patrol_runs").delete().eq("id", id);
    if (error) showToast("Gagal padam", "error");
    else {
      showToast("🗑️ Dipadam", "success");
      fetchRuns();
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // ====== REPORT & EMERGENCY ======
  const dummyReports = [
    { id: 1, guard: "Ali", text: "Semua ok blok A", date: "2025-09-15" },
    { id: 2, guard: "Abu", text: "Lampu jalan rosak", date: "2025-09-16" },
  ];

  // ====== GUARD REGISTER ======
  const [guards, setGuards] = useState([]);
  const [fullName, setFullName] = useState("");
  const [shift, setShift] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setGuards(data || []);
  };

  useEffect(() => {
    fetchGuards();
  }, []);

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
    if (error) showToast("Gagal daftar guard", "error");
    else {
      showToast("✅ Guard berjaya didaftarkan", "success");
      setFullName("");
      setShift("");
      setCompany("");
      fetchGuards();
    }
    setLoading(false);
  };

  const handleDeleteGuard = async (id) => {
    if (!window.confirm("Padam guard ni?")) return;
    const { error } = await supabase.from("guards").delete().eq("id", id);
    if (error) showToast("Gagal padam guard", "error");
    else {
      showToast("✅ Guard dipadam", "success");
      fetchGuards();
    }
  };

  // ====== ANALYTICS ======
  const [analytics, setAnalytics] = useState({
    total: 0,
    avgSpeed: 0,
    distance: 0,
    duration: 0,
  });
  const [summaryData, setSummaryData] = useState([]);

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from("patrol_summary")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return;
    if (data.length > 0) {
      const total = data.length;
      const avgSpeed =
        data.reduce((a, b) => a + (b.avg_speed || 0), 0) / total;
      const distance = data.reduce((a, b) => a + (b.distance_km || 0), 0);
      const duration =
        data.reduce((a, b) => a + (b.duration_minutes || 0), 0) / total;
      setAnalytics({
        total,
        avgSpeed: avgSpeed.toFixed(1),
        distance: distance.toFixed(2),
        duration: duration.toFixed(1),
      });
      const daily = {};
      data.forEach((r) => {
        const d = new Date(r.created_at).toLocaleDateString("en-MY");
        if (!daily[d])
          daily[d] = { date: d, distance: 0, avg_speed: 0, count: 0 };
        daily[d].distance += r.distance_km || 0;
        daily[d].avg_speed += r.avg_speed || 0;
        daily[d].count += 1;
      });
      setSummaryData(
        Object.values(daily).map((d) => ({
          date: d.date,
          distance: parseFloat(d.distance.toFixed(2)),
          avg_speed: parseFloat((d.avg_speed / d.count).toFixed(1)),
        }))
      );
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ====== RENDER ======
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-500 shadow">
        <div className="flex items-center gap-3 text-white">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-1" />
          <h1 className="text-lg font-semibold">PRU Patrol – Admin</h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {/* TABS */}
      <div className="flex justify-center mt-4">
        <div className="flex flex-wrap gap-3">
          {[
            { id: "patrol", label: "Patrol Session" },
            { id: "report", label: "Report & Emergency" },
            { id: "guard", label: "Guard Register" },
            { id: "livemap", label: "Live Map (Realtime)" },
            { id: "analytics", label: "Analytics 📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* PATROL SESSION */}
        {activeTab === "patrol" && (
          <div className="bg-white shadow rounded-xl p-4 space-y-4">
            <h2 className="text-lg font-semibold">🏠 Assign Rumah untuk Rondaan</h2>
            <div className="flex gap-3 flex-wrap">
              <select
                className="border rounded-lg p-2"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
              >
                <option value="">-- Pilih No Rumah --</option>
                {Array.from({ length: 1349 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Rumah {i + 1}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-lg p-2"
                value={blok}
                onChange={(e) => setBlok(e.target.value)}
              >
                <option value="">-- Pilih Warna Blok --</option>
                <option value="Merah">Merah</option>
                <option value="Kelabu">Kelabu</option>
              </select>
              <button
                onClick={addRun}
                disabled={loadingAdd}
                className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus /> {loadingAdd ? "Menambah..." : "Tambah"}
              </button>
            </div>

            <table className="w-full border text-sm mt-4">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 border">No Rumah</th>
                  <th className="p-2 border">Blok</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {runs.length > 0 ? (
                  runs.map((r) => (
                    <tr key={r.id} className="text-center border-b">
                      <td className="p-2">{r.house_no}</td>
                      <td className="p-2">{r.blok}</td>
                      <td className="p-2 capitalize">{r.status}</td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteRun(r.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500 italic">
                      Tiada rumah dalam senarai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT & EMERGENCY */}
        {activeTab === "report" && (
          <div className="bg-white p-4 rounded-xl shadow space-y-4">
            <h2 className="text-lg font-semibold">📋 Senarai Report Guard</h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
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

            <div className="bg-red-100 border border-red-400 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-red-700 mb-2">
                ⚠️ Emergency Alert
              </h2>
              <p className="text-red-600">Guard tekan butang kecemasan!</p>
            </div>
          </div>
        )}

        {/* GUARD REGISTER */}
        {activeTab === "guard" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddGuard}
              className="bg-white border rounded-xl shadow-sm p-4"
            >
              <h2 className="text-lg font-semibold mb-3">👮 Daftar Guard Baru</h2>
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {loading ? "Menyimpan..." : "Daftar"}
              </button>
            </form>

            <div className="bg-white rounded-xl p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Senarai Guard</h2>
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
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LIVE MAP */}
        {activeTab === "livemap" && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3">🗺️ Realtime Guard Map</h2>
            <MapViewRealtime />
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3">📊 Guard Analytics Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-indigo-50 rounded-lg text-center shadow">
                <p className="text-xs text-gray-500">Total Rondaan</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {analytics.total}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center shadow">
                <p className="text-xs text-gray-500">Purata Laju</p>
                <p className="text-2xl font-bold text-green-700">
                  {analytics.avgSpeed} km/h
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center shadow">
                <p className="text-xs text-gray-500">Jarak Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {analytics.distance} km
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg text-center shadow">
                <p className="text-xs text-gray-500">Tempoh Purata</p>
                <p className="text-2xl font-bold text-pink-700">
                  {analytics.duration} min
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={summaryData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="avg_speed"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
