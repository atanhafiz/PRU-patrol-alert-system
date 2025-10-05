import { useState, useRef, useEffect } from "react";

/**
 * Props:
 * - houseLabel: string (contoh "Rumah #1")
 * - guardName: string
 * - plateNo: string
 * - onUploaded?: () => void
 */
export default function HouseSnapUploader({
  houseLabel = "Rumah",
  guardName = "Unknown Guard",
  plateNo = "-",
  onUploaded,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;
    if (open) {
      (async () => {
        try {
          if (!navigator.mediaDevices?.getUserMedia)
            throw new Error("Browser tidak menyokong kamera.");
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
          console.error("❌ Kamera error:", e);
          setErrorMsg(e.message || "Gagal buka kamera.");
        }
      })();
    }
    return () => {
      stream?.getTracks()?.forEach((t) => t.stop());
    };
  }, [open]);

  const uploadPhoto = async (blob, lat, lng, acc, gpsUnavailable = false) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", blob, `${houseLabel}_${Date.now()}.jpg`);
      formData.append(
        "guard_name",
        `${houseLabel} • ${guardName} • Plate: ${plateNo}`
      );
      formData.append("plate_no", plateNo);

      if (!gpsUnavailable) {
        formData.append("lat", String(lat));
        formData.append("lng", String(lng));
        formData.append("accuracy", String(acc ?? ""));
      } else {
        formData.append("gps_unavailable", "1");
      }

      const res = await fetch(
        "https://blrhapbhoqemvhviyfig.functions.supabase.co/upload-selfie",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.success) {
        alert(`✅ ${houseLabel} dihantar!\n📍 Ketepatan GPS: ${gpsUnavailable ? "Tiada" : `±${Math.round(acc ?? 0)} m`}`);
        onUploaded?.();
      } else {
        alert("❌ Gagal upload gambar: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Ralat semasa upload gambar.");
    } finally {
      setLoading(false);
    }
  };

  const getBestPosition = () =>
    new Promise((resolve) => {
      let finished = false;

      const successLive = (pos) => {
        if (finished) return;
        finished = true;
        resolve({ pos, source: "live" });
      };
      const failLive = () => {
        if (finished) return;
        finished = true;
        resolve(null);
      };

      // try live first (short)
      navigator.geolocation.getCurrentPosition(successLive, failLive, {
        enableHighAccuracy: true,
        timeout: 3500,
        maximumAge: 0,
      });
    }).then(async (r) => {
      if (r && r.pos) return r;
      // try cached
      try {
        const cached = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ pos: p, source: "cached" }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 1200, maximumAge: 120000 }
          );
        });
        if (cached) return cached;
      } catch (_) {}

      if (window.lastKnownPosition) {
        return {
          pos: {
            coords: {
              latitude: window.lastKnownPosition.lat,
              longitude: window.lastKnownPosition.lng,
              accuracy: window.lastKnownPosition.accuracy ?? null,
            },
            timestamp: window.lastKnownPosition.ts,
          },
          source: "lastKnown",
        };
      }
      return { pos: null, source: "none" };
    });

  const capture = () => {
    const video = videoRef.current,
      canvas = canvasRef.current;
    if (!video || !canvas) {
      alert("❌ Kamera belum sedia!");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      setOpen(false);
      if (!navigator.geolocation) {
        await uploadPhoto(blob, 0, 0, 0, true);
        return;
      }

      const best = await getBestPosition();
      if (best && best.pos) {
        const { latitude, longitude, accuracy } = best.pos.coords;
        await uploadPhoto(blob, latitude, longitude, accuracy ?? null, false);
      } else {
        await uploadPhoto(blob, 0, 0, null, true);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold text-white shadow ${
          loading ? "bg-gray-400" : "bg-green-600 hover:scale-105 transition duration-200"
        }`}
      >
        {loading ? "⏳" : "SNAP"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 w-[360px] shadow-xl">
            <h3 className="text-base font-bold mb-2 text-center">{houseLabel}</h3>

            {errorMsg ? (
              <div className="text-red-600 text-sm mb-3">
                ❌ {errorMsg}<br/>Pastikan kamera dibenarkan & reload page.
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black/10" />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}

            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">Batal</button>
              {!errorMsg && <button onClick={capture} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">Snap</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
