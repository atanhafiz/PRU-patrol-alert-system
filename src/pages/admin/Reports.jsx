export default function Reports(){
  const rows = Array.from({length:7}, (_,i)=> ({ sesi:i+1, selesai: 5+i%2, tinggal: 2-(i%2), guard: i%2?"B":"A" }));
  return (
    <div className="card">
      <h2 className="text-lg font-bold">Laporan Harian</h2>
      <div className="card overflow-x-auto mt-2">
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-50">
              <th className="text-left p-2">Sesi</th>
              <th className="text-left p-2">Selesai</th>
              <th className="text-left p-2">Tertinggal</th>
              <th className="text-left p-2">Guard</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.sesi} className="odd:bg-white even:bg-slate-50">
                <td className="p-2">#{r.sesi}</td>
                <td className="p-2">{r.selesai}</td>
                <td className="p-2">{r.tinggal}</td>
                <td className="p-2">{r.guard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={()=>alert("Export PDF (mock)")}>Export PDF</button>
        <button className="btn btn-ghost" onClick={()=>alert("Export Excel (mock)")}>Export Excel</button>
      </div>
    </div>
  );
}
