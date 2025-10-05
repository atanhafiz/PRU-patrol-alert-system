import { X, BellRing } from "lucide-react";

export default function EmergencyOverlay({ open, onClose, onConfirm, details }) {
  if(!open) return null;
  return (
    <div className="overlay" role="dialog" aria-modal>
      <div className="overlay-card space-y-3">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BellRing className="w-5 h-5 text-red-400" /> Emergency Dikesan
        </h3>
        <p>Lokasi guard: <strong>{details?.coords || "-"}</strong></p>
        <p>Nota: <em>{details?.note || "Tiada"}</em></p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button className="btn btn-ghost" onClick={onClose}><X className="w-4 h-4 mr-1" />Tutup</button>
          <button className="btn btn-red" onClick={onConfirm}>Alert AJK</button>
        </div>
      </div>
    </div>
  );
}
