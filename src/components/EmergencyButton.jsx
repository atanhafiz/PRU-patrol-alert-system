import { useState } from "react";
import { Siren } from "lucide-react";
import supabase from "../services/supabaseClient";

/**
 * Props:
 * - guardName: string
 * - plateNo: string
 */
export default function EmergencyButton({
  guardName = "Unknown Guard",
  plateNo = "-",
}) {
  const [sending, setSending] = useState(false);

  const sendEmergencyAlert = async (lat, lng) => {
    const body = {
      guard_name: `${guardName} • Plate: ${plateNo}`,
      lat,
      lng,
      notes: "Emergency button triggered 🚨",
    };

    const { data, error } = await supabase.functions.invoke("notify-telegram", { body });
    if (error) {
      console.error("❌ Error:", error);
      alert("Gagal hantar alert ke Control Room!");
    } else {
      console.log("✅ Alert sent:", data);
      alert("🚨 Alert berjaya dihantar ke Telegram Control Room!");
    }
  };

  const handleEmergency = async () => {
    if (sending) return;
    setSending(true);

    try {
      if (!navigator.geolocation) {
        alert("⚠️ GPS tidak disokong peranti ini.");
        await sendEmergencyAlert(0, 0);
        setSending(false);
        return;
      }

      // ✅ GPS retry 3x + guna lokasi terakhir + upload sekali saja
      const tryGetLocation = (attempt = 1, lastKnown = null, uploaded = false, watcherId = null) => {
        if (uploaded) return;
        let localUploaded = uploaded;

        const stopWatch = () => {
          if (watcherId !== null) navigator.geolocation.clearWatch(watcherId);
        };

        const handleSuccess = (pos) => {
          if (localUploaded) return;
          localUploaded = true;
          stopWatch();
          sendEmergencyAlert(pos.coords.latitude, pos.coords.longitude);
          setSending(false);
        };

        const handleError = (err) => {
          console.warn(`GPS attempt ${attempt} gagal:`, err.message);

          // Simpan lokasi terakhir kalau ada
          if (navigator.geolocation.watchPosition) {
            navigator.geolocation.watchPosition(
              (p) => {
                lastKnown = p.coords;
              },
              () => {},
              { enableHighAccuracy: true, maximumAge: 10000 }
            );
          }

          if (attempt < 3 && !localUploaded) {
            setTimeout(() => tryGetLocation(attempt + 1, lastKnown, localUploaded, watcherId), 1500);
          } else if (!localUploaded) {
            stopWatch();
            if (lastKnown) {
              alert("⚠️ Guna lokasi terakhir yang dikesan untuk alert ini.");
              sendEmergencyAlert(lastKnown.latitude, lastKnown.longitude);
            } else {
              alert("⚠️ Tiada lokasi sah, alert dihantar tanpa koordinat tepat.");
              sendEmergencyAlert(0, 0);
            }
            setSending(false);
          }
        };

        watcherId = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
        );
      };

      tryGetLocation();
    } catch (err) {
      console.error("❌ Emergency error:", err);
      alert("Gagal hantar Emergency alert!");
      setSending(false);
    }
  };

  return (
    <button
      className={`fixed right-4 bottom-20 px-6 py-4 rounded-full text-white font-bold shadow-2xl transition-all duration-200 ${
        sending ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:scale-105"
      }`}
      onClick={handleEmergency}
      disabled={sending}
      title="Emergency"
    >
      <div className="flex items-center gap-2">
        <Siren className="w-5 h-5" />
        {sending ? "SENDING..." : "EMERGENCY"}
      </div>
    </button>
  );
}
