import { useState } from "react";
import MapView from "../components/MapView";
import { useToastHelpers } from "../utils/toastHelpers";
import SelfieUploader from "../components/SelfieUploader";
import supabase from "../lib/supabaseAutoClient";

export default function PatrolSession({
  guardName = "Unknown Guard",
  plateNo = "-",
}) {
  const [tracking, setTracking] = useState(false);
  const { toastSuccess, toastError } = useToastHelpers();

  const selfieMula = async () => {
    setTracking(true);
    toastSuccess("Patrol bermula ✅");
  };

  const selfieTamat = async () => {
    setTracking(false);
    toastSuccess("Patrol tamat ⏹️");
  };

  // === AUTO SAVE SUMMARY + TELEGRAM ALERT ===
  const handleStop = async (summary) => {
    console.log("📊 Data Summary:", summary);
    try {
      const { avg, max, distance, duration, startTime, endTime } = summary;

      // 1️⃣ Simpan ke Supabase
      const { error } = await supabase.from("patrol_summary").insert([
        {
          guard_name: guardName,
          plate_no: plateNo,
          avg_speed: avg,
          max_speed: max,
          distance_km: distance,
          duration,
          start_time: startTime,
          end_time: endTime,
        },
      ]);
      if (error) throw error;
      toastSuccess("📦 Data rondaan berjaya disimpan ke Supabase!");

      // 2️⃣ Hantar ringkasan ke Telegram
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

      const text = `🚨 *Ringkasan Rondaan PRU Patrol*\n\n👮 Guard: ${guardName}\n🛵 Plate: ${plateNo}\n🏎️ Purata: ${avg} km/h\n⚡ Maksimum: ${max} km/h\n📏 Jarak: ${distance} km\n⏱️ Tempoh: ${duration}\n🕒 ${new Date().toLocaleString(
        "en-MY"
      )}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      });

      toastSuccess("🚀 Ringkasan dihantar ke Telegram Control Room!");
    } catch (err) {
      console.error("❌ Gagal simpan/hantar summary:", err);
      toastError("Gagal simpan atau hantar data rondaan.");
    }
  };

  return (
    <div className="wrap space-y-4">
      <h2 className="text-xl font-bold mb-2">Patrol Session</h2>

      {/* Butang Start / Stop */}
      <div className="flex gap-3">
        <button
          onClick={selfieMula}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          ▶️ Start Patrol
        </button>
        <button
          onClick={selfieTamat}
          className="px-4 py-2 bg-pink-600 text-white rounded"
        >
          ⏹️ Stop Patrol
        </button>
      </div>

      {/* Selfie Start / End */}
      <div className="flex gap-3">
        <SelfieUploader label="Selfie-Start" guardName={guardName} plateNo={plateNo} />
        <SelfieUploader label="Selfie-End" guardName={guardName} plateNo={plateNo} />
      </div>

      {/* Map tracking */}
      <MapView isActive={tracking} onStop={handleStop} />
    </div>
  );
}
