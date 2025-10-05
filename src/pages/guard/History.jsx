// src/pages/guard/History.jsx
export default function History() {
  const rows = [
    { id: 1, date: "2025-09-15", sesi: "Sesi 3", progress: "7/7", notes: "OK" },
    { id: 2, date: "2025-09-14", sesi: "Sesi 2", progress: "6/7", notes: "1 skip (tiada penghuni)" },
  ];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Sejarah Rondaan</div>
        <input className="border rounded-lg px-3 py-1 text-sm" placeholder="Cari tarikh / sesi" />
      </div>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm">{r.date} • {r.sesi}</div>
              <div className="text-xs text-gray-500">{r.notes}</div>
            </div>
            <div className="text-sm font-medium">{r.progress}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">*UI mock – data contoh.</div>
    </div>
  );
}
