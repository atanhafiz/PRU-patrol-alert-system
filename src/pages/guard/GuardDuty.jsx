// src/pages/guard/GuardDuty.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GuardDuty() {
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

      {/* Header: Guard Duty (biru, besar, bounce) */}
      <div className="flex justify-center mb-8">
        <button className="w-full max-w-xl py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl animate-bounce hover:scale-[1.02] transition">
          Guard Duty
        </button>
      </div>

      {/* 3 butang sebaris: Register • Patrol • Report */}
      <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Register (kuning) */}
        <button
          onClick={() => setShowRegisterPopup(true)}
          className="py-4 rounded-2xl bg-yellow-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
        >
          Register
        </button>

        {/* Patrol (hijau) */}
        <button
          onClick={() => navigate("/guard/patrol")}
          className="py-4 rounded-2xl bg-green-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition animate-pulse"
        >
          Patrol
        </button>

        {/* Report (purple) */}
        <button
          onClick={() => setShowReportPopup(true)}
          className="py-4 rounded-2xl bg-purple-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
        >
          Report
        </button>
      </div>

      {/* POPUP: Register Duty */}
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
                  alert(`Register Duty ✅\nNama: ${guardName}\nPlat: ${plateNo}`);
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

      {/* POPUP: Report */}
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
    </div>
  );
}
