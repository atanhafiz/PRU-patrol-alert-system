import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HouseSnapUploader from "../../components/HouseSnapUploader";
import SelfieUploader from "../../components/SelfieUploader";
import EmergencyButton from "../../components/EmergencyButton";
import MapView from "../../components/MapView";
import supabase from "../../services/supabaseClient";

const initialHouses = Array.from({ length: 7 }).map((_, i) => ({
  id: i + 1,
  label: `Rumah #${i + 1}`,
  status: "pending",
}));

export default function Patrol() {
  const [items, setItems] = useState(initialHouses);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());
  const navigate = useNavigate();
  const { state } = useLocation();
  const guardName = state?.guardName || "Unknown Guard";
  const plateNo = state?.plateNo || "-";

  const skip = (id) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "skipped" } : x))
    );

  const doneCount = items.filter((x) => x.status === "done").length;

  const markDone = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "done" } : x))
    );
  };

  // 🧩 Hantar Ringkasan ke Supabase + Telegram
  const handleStop = async (summary) => {
    if (!summary) {
      alert("⚠️ Tiada data ringkasan diterima daripada GPS.");
      return;
    }

    console.log("📊 Ringkasan Rondaan:", summary);

    try {
      const { avg, max, distance, duration } = summary;

      // 📍 Dapatkan lokasi semasa guard tekan Stop
      let latitude = null;
      let longitude = null;

      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            (err) => {
              console.warn("GPS error (stop patrol):", err);
              resolve();
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
      }

      // 🪣 Simpan ke Supabase
      const { error } = await supabase.from("patrol_summary").insert([
        {
          guard_name: guardName,
          plate_no: plateNo,
          avg_speed: avg,
          max_speed: max,
          distance_km: distance,
          duration,
          latitude,
          longitude,
          start_time: new Date(
            Date.now() - parseInt(duration.split(":")[0]) * 3600000
          ),
          end_time: new Date(),
        },
      ]);
      if (error) throw error;
      alert("📦 Data rondaan berjaya disimpan ke Supabase!");

      // 📢 Hantar ke Telegram
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

      const text = `🚨 *Ringkasan Rondaan PRU Patrol*\n\n👮 Guard: ${guardName}\n🛵 Plate: ${plateNo}\n🏎️ Purata: ${avg} km/h\n⚡ Max: ${max} km/h\n📏 Jarak: ${distance} km\n⏱️ Tempoh: ${duration}\n🌍 Koordinat: ${latitude?.toFixed(
        5
      )}, ${longitude?.toFixed(5)}\n🕒 ${new Date().toLocaleString("en-MY")}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      });

      alert("🚀 Ringkasan rondaan dihantar ke Telegram Control Room!");
    } catch (err) {
      console.error("❌ Gagal simpan atau hantar:", err);
      alert("❌ Gagal simpan / hantar data rondaan.");
    }
  };

  // 🛑 Stop patrol manual
  const stopPatrolManually = () => {
    if (!tracking) {
      alert("⚠️ Tiada sesi aktif untuk dihentikan.");
      return;
    }
    setTracking(false);
    alert("⏹️ Patrol dihentikan. Ringkasan sedang diproses...");
  };

  // ▶️ Mula patrol semula
  const startPatrol = () => {
    setOpenStart(true);
    setTracking(false);
    setTimeout(() => {
      setMapKey(Date.now());
      setTracking(true);
    }, 500);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      <div className="rounded-2xl bg-white p-4 shadow-sm border mb-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Sesi Patrol</div>
          <div className="text-sm text-gray-500">
            {doneCount}/{items.length} siap
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded mt-2">
          <div
            className="h-2 bg-indigo-500 rounded"
            style={{ width: `${(doneCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* === Selfie Start === */}
      <div className="mb-4">
        <button
          onClick={startPatrol}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:scale-105 active:scale-95 transition animate-pulse"
        >
          📸 Selfie-Start
        </button>
        {openStart && (
          <div className="mt-3 flex justify-center">
            <SelfieUploader
              label="Selfie-Start"
              guardName={guardName}
              plateNo={plateNo}
            />
            <button
              onClick={() => setOpenStart(false)}
              className="ml-2 px-3 py-2 rounded bg-gray-200 text-sm"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* === List Rumah === */}
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-xl border p-3 flex items-center justify-between bg-white shadow-sm"
          >
            <div>
              <div className="font-medium">{it.label}</div>
              <div className="text-xs text-gray-500 capitalize">{it.status}</div>
            </div>
            <div className="flex gap-2">
              <HouseSnapUploader
                houseLabel={it.label}
                guardName={guardName}
                plateNo={plateNo}
                onUploaded={() => markDone(it.id)}
              />
              <button
                onClick={() => skip(it.id)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* === Selfie End === */}
      <div className="mt-4">
        <button
          onClick={() => setOpenEnd(true)}
          className="w-full py-3 rounded-xl bg-pink-600 text-white font-semibold shadow hover:scale-105 active:scale-95 transition"
        >
          📸 Selfie-End
        </button>
        {openEnd && (
          <div className="mt-3 flex justify-center">
            <SelfieUploader
              label="Selfie-End"
              guardName={guardName}
              plateNo={plateNo}
            />
            <button
              onClick={() => setOpenEnd(false)}
              className="ml-2 px-3 py-2 rounded bg-gray-200 text-sm"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* === 🛑 STOP PATROL BUTTON === */}
      <div className="mt-6">
        <button
          onClick={stopPatrolManually}
          className="w-full py-3 rounded-xl bg-red-700 text-white font-semibold shadow hover:scale-105 active:scale-95 transition"
        >
          🛑 Stop Patrol & Hantar Ringkasan
        </button>
      </div>

      {/* === MapView (resettable) === */}
      <div className="mt-6">
        <MapView key={mapKey} isActive={tracking} onStop={handleStop} />
      </div>

      <EmergencyButton guardName={guardName} plateNo={plateNo} />
    </div>
  );
}
