import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import LoaderOverlay from "../../components/LoaderOverlay";

export default function GuardRegisterDuty() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [guards, setGuards] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeGuard, setActiveGuard] = useState(null);

  // 🛰️ Ambil senarai guard dari Supabase
  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("id, full_name, shift, company, is_active")
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error);
      showToast("Gagal ambil senarai guard", "error");
    } else {
      setGuards(data || []);
    }
  };

  // ✅ Realtime + auto fetch
  useEffect(() => {
    fetchGuards();

    const saved = localStorage.getItem("active_guard_id");
    if (saved) setActiveGuard(saved);

    const channel = supabase
      .channel("guards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guards" },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchGuards();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 🧭 Ambil lokasi GPS
  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation)
        return resolve({ lat: null, lon: null });

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        () => resolve({ lat: null, lon: null }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

  // 🟢 Start duty
  const handleStart = async () => {
    if (!selectedGuard) {
      showToast("Sila pilih nama guard", "error");
      return;
    }
    if (!plateNo) {
      showToast("Sila isi nombor plat motosikal", "error");
      return;
    }

    setLoading(true);
    try {
      const { lat, lon } = await getLocation();

      const { error } = await supabase
        .from("guards")
        .update({
          is_active: true,
          last_lat: lat,
          last_lon: lon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedGuard);

      if (error) throw error;

      setActiveGuard(selectedGuard);
      localStorage.setItem("active_guard_id", selectedGuard);

      showToast("✅ Duty dimulakan", "success");
      alert(`✅ Duty dimulakan!\nPlat: ${plateNo}\nLat: ${lat}\nLon: ${lon}`);
    } catch (err) {
      console.error(err);
      showToast("Gagal mula duty: " + err.message, "error");
    }
    setLoading(false);
  };

  // 🔴 Stop duty
  const handleStop = async () => {
    if (!activeGuard) {
      showToast("Tiada guard aktif", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("guards")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeGuard);

      if (error) throw error;

      showToast("🚨 Duty ditamatkan", "success");
      alert("🚨 Duty ditamatkan!");

      setActiveGuard(null);
      setSelectedGuard("");
      setPlateNo("");
      localStorage.removeItem("active_guard_id");
    } catch (err) {
      console.error(err);
      showToast("Gagal tamat duty: " + err.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <LoaderOverlay show={loading} />

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/guard/dashboard")}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow text-sm font-medium"
      >
        ← Kembali ke Dashboard
      </button>

      <h1 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
        Register Duty
      </h1>

      {/* Form Register Duty */}
      <div className="max-w-md mx-auto bg-white border rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium mb-1">Nama Guard</label>
        <select
          value={selectedGuard}
          onChange={(e) => setSelectedGuard(e.target.value)}
          className="border rounded-lg w-full p-2 mb-3"
        >
          <option value="">-- Pilih Nama --</option>
          {guards.map((g) => (
            <option key={g.id} value={g.id}>
              {g.full_name} ({g.shift}) – {g.company}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">
          No. Plat Motosikal
        </label>
        <input
          type="text"
          placeholder="Contoh: AMQ1143"
          value={plateNo}
          onChange={(e) => setPlateNo(e.target.value)}
          className="border rounded-lg w-full p-2 mb-4"
        />

        <div className="flex justify-center gap-3">
          {!activeGuard ? (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Start Duty
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🛑 Stop Duty
            </button>
          )}
        </div>
      </div>

      {/* Senarai guard aktif */}
      <div className="max-w-2xl mx-auto mt-8 bg-white border rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 text-center">
          Senarai Guard Aktif
        </h2>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Shift</th>
              <th className="p-2 border">Syarikat</th>
              <th className="p-2 border">Status</th>
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
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      g.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {g.is_active ? "On Duty" : "Off Duty"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
