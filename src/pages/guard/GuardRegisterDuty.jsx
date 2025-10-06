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

  // 🚀 Fetch senarai guard
  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("id, full_name, shift, company, is_active, status")
      .order("full_name", { ascending: true });
    if (error) {
      console.error(error);
      showToast("Gagal ambil senarai guard", "error");
    } else setGuards(data || []);
  };

  useEffect(() => {
    fetchGuards();
    const saved = localStorage.getItem("active_guard_id");
    if (saved) setActiveGuard(saved);

    const channel = supabase
      .channel("guards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guards" },
        fetchGuards
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // 🟢 Start Duty (masuk shift sahaja)
  const handleStart = async () => {
    if (!selectedGuard || !plateNo) {
      showToast("Sila lengkapkan semua maklumat", "error");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("guards")
        .update({
          status: "on_duty",
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedGuard);

      if (error) throw error;

      setActiveGuard(selectedGuard);
      localStorage.setItem("active_guard_id", selectedGuard);

      showToast("✅ Duty bermula (On Duty – belum ronda)", "success");
      alert("✅ Anda kini On Duty.\nSila tekan Selfie-Start bila rondaan bermula.");
    } catch (err) {
      console.error(err);
      showToast("Gagal mula duty: " + err.message, "error");
    }
    setLoading(false);
  };

  // 🔴 Stop Duty (tamat shift)
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
          status: "off_duty",
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeGuard);

      if (error) throw error;

      showToast("🚨 Duty ditamatkan", "success");
      alert("🚨 Duty tamat. Terima kasih!");
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

      {/* 🔙 Butang balik */}
      <button
        onClick={() => navigate("/guard/dashboard")}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow text-sm font-medium"
      >
        ← Kembali ke Dashboard
      </button>

      <h1 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
        Register Duty
      </h1>

      {/* 🧾 Form daftar */}
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

      {/* 📋 Senarai Guard */}
      <div className="max-w-2xl mx-auto mt-8 bg-white border rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 text-center">
          Senarai Guard
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
                      g.status === "on_patrol"
                        ? "bg-green-100 text-green-700"
                        : g.status === "on_duty"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {g.status === "on_patrol"
                      ? "On Patrol"
                      : g.status === "on_duty"
                      ? "On Duty"
                      : "Off Duty"}
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
