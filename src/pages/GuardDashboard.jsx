import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import EmergencyButton from "../components/EmergencyButton";

export default function GuardDashboard() {
  const navigate = useNavigate();
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);

  const [guardName, setGuardName] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [reportText, setReportText] = useState("");

  return (
    <div className="p-6 relative min-h-[80vh]">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex justify-center mb-8">
        <button className="w-full max-w-xl py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl animate-bounce hover:scale-[1.02] transition">
          Guard Dashboard
        </button>
      </div>

      {/* 3 button utama */}
      <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Register */}
        <button
          onClick={() => setShowRegisterPopup(true)}
          className="flex flex-col items-center justify-center py-6 rounded-2xl 
                     bg-gradient-to-br from-yellow-400 to-orange-500 
                     text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl
                     active:scale-95 transition-all duration-300"
        >
          <span className="text-3xl mb-2">📝</span>
          Register
        </button>

        {/* Patrol */}
        <button
          onClick={() =>
            navigate("/guard/patrol", { state: { guardName, plateNo } })
          }
          className="flex flex-col items-center justify-center py-6 rounded-2xl 
                     bg-gradient-to-br from-emerald-400 to-green-600 
                     text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl
                     active:scale-95 transition-all duration-300 animate-pulse"
        >
          <span className="text-3xl mb-2">🚨</span>
          Patrol
        </button>

        {/* Report */}
        <button
          onClick={() => setShowReportPopup(true)}
          className="flex flex-col items-center justify-center py-6 rounded-2xl 
                     bg-gradient-to-br from-purple-400 to-indigo-600 
                     text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl
                     active:scale-95 transition-all duration-300"
        >
          <span className="text-3xl mb-2">📋</span>
          Report
        </button>
      </div>

      {/* ===== POPUP REGISTER ===== */}
      {showRegisterPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Register Duty</h2>
            <input
              type="text"
              placeholder="Nama Guard"
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={guardName}
              onChange={(e) => setGuardName(e.target.value)}
            />
            <input
              type="text"
              placeholder="No. Plat Motosikal"
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={plateNo}
              onChange={(e) => setPlateNo(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert(
                    `Register Duty ✅\nNama: ${guardName}\nPlat: ${plateNo}`
                  );
                  setShowRegisterPopup(false);
                }}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP REPORT ===== */}
      {showReportPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Buat Report</h2>
            <textarea
              placeholder="Tulis laporan di sini..."
              className="border rounded-lg px-3 py-2 w-full mb-3 h-32"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => alert("Start rakam audio (mock) 🎙️")}
                className="px-4 py-2 rounded bg-purple-600 text-white"
              >
                🎙️ Voice
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportPopup(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    alert(`Report dihantar ✅\n${reportText}`);
                    setShowReportPopup(false);
                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Hantar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RINGKASAN TUGASAN ===== */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8 border-2 border-red-500">
        <h3 className="text-xl font-bold text-red-600 mb-4">WAJIB</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-gray-700">
          <li>Lakukan Rondaan sebanyak 6 sesi setiap hari (7 Rumah/Sesi).</li>
          <li><b>Selfie-Start</b> di Post Pengawal semasa Start Duty.</li>
          <li><b>Snap Gambar</b> setiap Rumah berdasarkan No rumah.</li>
          <li>Balik Semula ke Post Pengawal.</li>
          <li><b>Selfie-End</b> di Post Pengawal selepas siap 7 rumah.</li>
          <li><b>WAJIB</b> buat Laporan Suara/Text di ruangan Report.</li>
          <li>Selesai.</li>
        </ol>
      </div>

      {/* ===== PETA LALUAN ===== */}
      <div className="bg-white rounded-2xl shadow p-6 border-2 border-green-500 mb-20">
        <h3 className="text-xl font-bold text-green-700 mb-4">
          Peta Laluan Tugasan
        </h3>
        <div className="h-72 rounded-xl overflow-hidden border">
          <MapView isActive={false} />
        </div>
      </div>

      {/* ===== Emergency Button ===== */}
      <EmergencyButton guardName={guardName || "Unknown"} plateNo={plateNo || "-"} />
    </div>
  );
}
