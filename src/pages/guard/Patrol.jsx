import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HouseSnapUploader from "../../components/HouseSnapUploader";
import SelfieUploader from "../../components/SelfieUploader";
import EmergencyButton from "../../components/EmergencyButton";
import MapView from "../../components/MapView";
import { supabase } from "../../lib/supabaseClient";

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

  // skip rumah
  const skip = (id) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "skipped" } : x))
    );

  const doneCount = items.filter((x) => x.status === "done").length;

  const markDone = (id) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "done" } : x))
    );

  // ========================== SELFIE START ==========================
  const handleSelfieStart = async () => {
    try {
      setOpenStart(true);
      setTracking(false);

      let latitude = null;
      let longitude = null;

      // Ambil GPS dengan fallback
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            (err) => {
              console.warn("⚠️ GPS error (selfie-start):", err);
              // fallback HQ Kedah
              latitude = 6.3205;
              longitude = 100.2901;
              resolve();
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
      }

      // update guard jadi aktif + status rondaan
      const { error } = await supabase
        .from("guards")
        .update({
          is_active: true,
          status: "on_patrol",
          last_lat: latitude,
          last_lon: longitude,
          updated_at: new Date().toISOString(),
        })
        .eq("full_name", guardName);

      if (error) throw error;

      alert(
        `📸 Selfie-Start berjaya!\nGuard kini On Patrol.\nLat: ${latitude}\nLon: ${longitude}`
      );

      setTimeout(() => {
        setMapKey(Date.now());
        setTracking(true);
      }, 500);
    } catch (err) {
      console.error("❌ Gagal mula patrol:", err.message);
      alert("❌ Gagal mula rondaan (GPS / server error).");
    }
  };

  // ========================== STOP PATROL ==========================
  const handleStop = async (summary) => {
    try {
      // fallback kalau summary kosong
      const defaultSummary = {
        avg: 0,
        max: 0,
        distance: 0,
        duration: "00:00:00",
      };
      const { avg, max, distance, duration } = summary || defaultSummary;

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
              latitude = 6.3205;
              longitude = 100.2901;
              resolve();
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
      }

      // Simpan data rondaan ke Supabase
      const { error: insertErr } = await supabase.from("patrol_summary").insert([
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
      if (insertErr) throw insertErr;

      // Tamatkan duty guard
      const { error: updateErr } = await supabase
        .from("guards")
        .update({
          is_active: false,
          status: "off_duty",
          last_lat: latitude,
          last_lon: longitude,
          updated_at: new Date().toISOString(),
        })
        .eq("full_name", guardName);

      if (updateErr) throw updateErr;

      alert("✅ Rondaan disimpan & guard tamat duty!");
    } catch (err) {
      console.error("❌ Gagal simpan data rondaan:", err.message);
      alert("❌ Gagal simpan / hantar data rondaan.");
    }
  };

  // ========================== UI ==========================
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

      {/* Selfie Start */}
      <div className="mb-4">
        <button
          onClick={handleSelfieStart}
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

      {/* Senarai Rumah */}
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-xl border p-3 flex items-center justify-between bg-white shadow-sm"
          >
            <div>
              <div className="font-medium">{it.label}</div>
              <div className="text-xs text-gray-500 capitalize">
                {it.status}
              </div>
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

      {/* Selfie End */}
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

      {/* Stop Patrol */}
      <div className="mt-6">
        <button
          onClick={() => handleStop()}
          className="w-full py-3 rounded-xl bg-red-700 text-white font-semibold shadow hover:scale-105 active:scale-95 transition"
        >
          🛑 Stop Patrol & Hantar Ringkasan
        </button>
      </div>

      <div className="mt-6">
        <MapView key={mapKey} isActive={tracking} onStop={handleStop} />
      </div>

      <EmergencyButton guardName={guardName} plateNo={plateNo} />
    </div>
  );
}
