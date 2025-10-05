export default function EmergencyPanel(){
  const items = [
    { id:1, guard:"Guard A", coords:"6.123, 100.456", time:"22:03", status:"resolved" },
    { id:2, guard:"Guard B", coords:"6.120, 100.450", time:"19:40", status:"open" },
  ];
  return (
    <div className="card">
      <h2 className="text-lg font-bold">Emergency Panel</h2>
      <ul className="list mt-2">
        {items.map(it => (
          <li key={it.id} className="list-item">
            <div>
              <strong>{it.guard}</strong> • <small className="text-slate-600">{it.coords}</small>
              <div><small className="text-slate-600">{it.time}</small></div>
            </div>
            <span className={`badge ${it.status==="open"?"badge-red":"badge-green"}`}>{it.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
