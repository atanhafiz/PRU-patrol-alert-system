// src/pages/guard_light/History.jsx
import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setHistory([
        { id: 1, date: "2025-10-05", report: "Gate A - All clear" },
        { id: 2, date: "2025-10-04", report: "Playground - Light malfunction" },
      ]);
    }, 800);
  }, []);

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Report History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500 animate-pulse">Loading history...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((h) => (
            <div key={h.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600">{h.date}</p>
              <p className="font-medium text-gray-800">{h.report}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
