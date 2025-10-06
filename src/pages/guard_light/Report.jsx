import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ToastProvider";
import LoaderOverlay from "../../components/LoaderOverlay";

export default function Report() {
  const [text, setText] = useState("");
  const [plate, setPlate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔹 Submitting report...");
      // 1️⃣ Dapatkan user aktif dari Supabase Auth
      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr || !data.user) throw new Error("Sesi tamat, sila login semula.");
      const user = data.user;
      console.log("👤 Guard:", user.email);

      // 2️⃣ Dapatkan lokasi GPS guard
      const getLocation = () =>
        new Promise((resolve) => {
          if (!navigator.geolocation)
            return resolve({ lat: null, lon: null, error: "GPS not supported" });

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
              });
            },
            (err) => {
              console.warn("GPS error:", err);
              resolve({ lat: null, lon: null, error: err.message });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });

      const { lat, lon } = await getLocation();
      console.log("📍 Location:", lat, lon);

      // 3️⃣ Upload photo kalau ada
      let photoUrl = null;
      if (photo) {
        const fileName = `${user.id}_${Date.now()}.${photo.name.split(".").pop()}`;
        console.log("🖼️ Uploading:", fileName);
        const { error: uploadErr } = await supabase.storage
          .from("reports")
          .upload(fileName, photo);

        if (uploadErr) throw uploadErr;

        const { data: publicUrl } = supabase.storage
          .from("reports")
          .getPublicUrl(fileName);

        photoUrl = publicUrl.publicUrl;
      }

      // 4️⃣ Insert ke table patrol_summary
      const { data: insertData, error: insertErr } = await supabase
        .from("patrol_summary")
        .insert([
          {
            guard_name: user.email || "Unknown Guard",
            plate_no: plate || "-",
            text: text,
            photo_url: photoUrl,
            avg_speed: 0,
            max_speed: 0,
            distance_km: 0,
            duration: "00:00:00",
            created_at: new Date().toISOString(),
            latitude: lat,
            longitude: lon,
          },
        ])
        .select();

      if (insertErr) throw insertErr;
      console.log("✅ Insert success:", insertData);

      showToast("Laporan berjaya dihantar ✅", "success");
      setText("");
      setPlate("");
      setPhoto(null);
    } catch (err) {
      console.error("❌ Error submitting report:", err);
      showToast(`Gagal hantar laporan: ${err.message}`, "error");
    }

    setLoading(false);
  };

  return (
    <div className="animate-fadeIn">
      <LoaderOverlay show={loading} />
      <h2 className="text-lg font-bold mb-3 text-blue-700">Incident Report</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-sm"
      >
        <input
          type="text"
          placeholder="Vehicle Plate / ID"
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />

        <textarea
          rows="4"
          placeholder="Describe the issue or patrol notes..."
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
