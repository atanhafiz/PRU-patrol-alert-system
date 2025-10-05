import { useState, useRef, useEffect } from "react";

export default function SelfieButton({ onCaptured }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;
    if (open) {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { /* UI only */ }
      })();
    }
    return () => { stream?.getTracks()?.forEach(t => t.stop()); };
  }, [open]);

  const capture = () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { onCaptured?.(blob); setOpen(false); }, "image/jpeg", 0.9);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow">
        📸 Selfie
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 w-[360px] shadow-xl">
            <div className="text-sm font-medium mb-2">Ambil Selfie</div>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black/10" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg bg-gray-100">Batal</button>
              <button onClick={capture} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Snap</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
