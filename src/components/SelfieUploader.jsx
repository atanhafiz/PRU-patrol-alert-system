import { useState, useRef, useEffect } from "react";

/**
 * Props:
 * - label: string ("Selfie-Start" or "Selfie-End")
 * - guardName: string (real name of guard)
 * - plateNo: string
 */
export default function SelfieUploader({
  label = "Selfie-Start",
  guardName = "Unknown Guard",
  plateNo = "-",
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
            video: { facingMode: "user" },
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

  const uploadSelfie = async (blob, lat, lng, acc, gpsUnavailable = false) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", blob, `${label}_${Date.now()}.jpg`);
      formData.append("guard_name", label);
      formData.append("guard_real_name", guardName);
      formData.append("plate_no", plateNo);
      if (!gpsUnavailable) {
        formData.append("lat", String(lat));
        formData.append("lng", String(lng));
        formData.append("accuracy", String(acc ?? ""));
      } else {
        // mark as gps unavailable
        formData.append("gps_unavailable", "1");
      }

      const res = await fetch(
        "https://blrhapbhoqemvhviyfig.functions.supabase.co/upload-selfie",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) {
        alert(
          `✅ Selfie dihantar!\n${gpsUnavailable ? "📍 Lokasi: tidak tersedia (diproses tanpa GPS)" : `📍 Ketepatan GPS: ±${Math.round(acc ?? 0)} m`}`
        );
      } else {
        alert("❌ Gagal upload selfie: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error(e);
      alert("Ralat semasa upload selfie.");
    } finally {
      setLoading(false);
    }
  };

  // helper untuk fallback GPS
  const getBestPosition = () => {
    return new Promise((resolve) => {
      // 1) try getCurrentPosition (short timeout)
      let done = false;

      const success = (pos) => {
        if (done) return;
        done = true;
        resolve({ pos, source: "live" });
      };
      const fail = () => {
        if (done) return;
        done = true;
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(success, fail, {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 0,
      });
    }).then(async (res) => {
      if (res && res.pos) return { pos: res.pos, source: "live" };

      // 2) try cached position (maximumAge)
      try {
        const cached = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ pos: p, source: "cached" }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 1500, maximumAge: 120000 } // allow 2 min cached
          );
        });
        if (cached) return cached;
      } catch (_) {}

      // 3) try window.lastKnownPosition set by MapView
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

      // 4) no position
      return { pos: null, source: "none" };
    });
  };

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
        // no GPS API at all — upload but mark unavailable
        await uploadSelfie(blob, 0, 0, 0, true);
        return;
      }

      const best = await getBestPosition();

      if (best && best.pos) {
        const { latitude, longitude, accuracy } = best.pos.coords;
        await uploadSelfie(blob, latitude, longitude, accuracy ?? null, false);
      } else {
        // no position found — still upload but mark gps_unavailable
        await uploadSelfie(blob, 0, 0, null, true);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow hover:scale-105 transition disabled:opacity-50"
      >
        {loading ? "⏳ Menghantar..." : "📸 Ambil Selfie"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 w-[360px] shadow-xl">
            <h3 className="text-base font-bold mb-2 text-center">Ambil Selfie</h3>

            {errorMsg ? (
              <div className="text-red-600 text-sm mb-3">
                ❌ {errorMsg}
                <br />Pastikan kamera dibenarkan & reload page.
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black/10" />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}

            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg bg-gray-200 text-sm">
                Batal
              </button>
              {!errorMsg && (
                <button onClick={capture} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
                  Snap
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
