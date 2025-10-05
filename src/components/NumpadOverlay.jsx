// src/components/NumpadOverlay.jsx
import { useEffect, useRef, useState } from "react";

export default function NumpadOverlay({ roleTarget = "guard", onSuccess }) {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const btnOkRef = useRef(null);

  const GUARD_PIN = String(import.meta.env.VITE_GUARD_PIN || "1000");
  const ADMIN_PIN = String(import.meta.env.VITE_ADMIN_PIN || "2000");
  const MAX_LEN = 4;

  const push = (d) => setPin((p) => (p.length < MAX_LEN ? p + d : p));
  const del = () => setPin((p) => p.slice(0, -1));
  const clr = () => setPin("");

  const checkPin = () => {
    const ok =
      (roleTarget === "guard" && pin === GUARD_PIN) ||
      (roleTarget === "admin" && pin === ADMIN_PIN);

    if (ok) {
      try { onSuccess && onSuccess(); } catch {}
      clr();
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 250);
      clr();
    }
  };

  // cukup 4 angka → auto check
  useEffect(() => { if (pin.length === MAX_LEN) setTimeout(checkPin, 100); }, [pin]);
  // keyboard support
  useEffect(() => {
    const h = (e) => {
      if (/^\d$/.test(e.key)) push(e.key);
      if (e.key === "Backspace") del();
      if (e.key === "Escape") clr();
      if (e.key === "Enter") checkPin();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { btnOkRef.current?.focus(); }, []);

  const digits = ["1","2","3","4","5","6","7","8","9"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative w-[92%] max-w-sm rounded-2xl shadow-2xl p-5 bg-gradient-to-br from-white to-indigo-50 border ${isError?"ring-2 ring-red-500":"ring-1 ring-indigo-100"}`} style={{backdropFilter:"blur(4px)"}}>
        <div className="text-center mb-3">
          <div className="text-xs text-gray-500">Masukkan PIN</div>
          <div className="text-base font-semibold">{roleTarget==="guard"?"Guard":"Admin"}</div>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          {Array.from({length: MAX_LEN}).map((_,i)=>(
            <div key={i} className={`w-3.5 h-3.5 rounded-full border transition-all ${i < pin.length ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {digits.map((d)=>(
            <button key={d} onClick={()=>push(d)} className="py-4 rounded-xl bg-white hover:bg-gray-100 border text-lg font-semibold shadow-sm">
              {d}
            </button>
          ))}
          <button onClick={clr} className="py-3 rounded-xl bg-orange-50 hover:bg-orange-100 border text-sm font-medium">Clear</button>
          <button onClick={()=>push("0")} className="py-4 rounded-xl bg-white hover:bg-gray-100 border text-lg font-semibold shadow-sm">0</button>
          <button onClick={del} className="py-3 rounded-xl bg-white hover:bg-gray-100 border text-sm font-medium">Del</button>
        </div>

        <button ref={btnOkRef} onClick={checkPin} disabled={pin.length!==MAX_LEN}
          className={`w-full py-3 rounded-xl font-semibold shadow ${pin.length===MAX_LEN?"bg-indigo-600 text-white hover:opacity-95":"bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
          OK
        </button>
      </div>
    </div>
  );
}
