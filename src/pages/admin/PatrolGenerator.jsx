import { useState } from "react";
import { api } from "../../lib/api.js";

export default function PatrolGenerator(){
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const data = await api.generatePatrolSessions({ sessions:6, size:7 });
    setSessions(data);
    setLoading(false);
  };

  const approve = (id) => {
    setSessions(sessions.map(s => s.id===id ? { ...s, status:"approved" } : s));
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold">Generator Sesi (6 × 7 rumah)</h2>
      <div className="flex gap-2 mb-3 mt-2">
        <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading?"Menjana…":"Jana Sesi"}</button>
      </div>
      <ul className="list">
        {sessions.map(s => (
          <li key={s.id} className="list-item">
            <div>
              <div><strong>{s.id}</strong> <span className={`badge ${s.status==="approved"?"badge-green":"badge-orange"}`}>{s.status}</span></div>
              <small className="text-slate-600">{s.houses.length} rumah</small>
            </div>
            {s.status!=="approved" && (
              <button className="btn btn-blue" onClick={()=>approve(s.id)}>Approve & Hantar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
