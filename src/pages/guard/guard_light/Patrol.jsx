// src/pages/guard_light/Patrol.jsx
import { useState } from "react";

export default function Patrol() {
  const [checkpoints] = useState([
    { id: 1, name: "Gate A", status: "Done" },
    { id: 2, name: "Playground", status: "Pending" },
    { id: 3, name: "Block C", status: "Pending" },
  ]);

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Patrol Task</h2>
      <div className="flex flex-col gap-3">
        {checkpoints.map((cp) => (
          <div
            key={cp.id}
            className={`p-4 rounded-xl shadow-sm border ${
              cp.status === "Done" ? "border-green-200 bg-green-50" : "border-blue-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{cp.name}</span>
              <span
                className={`text-xs font-semibold ${
                  cp.status === "Done" ? "text-green-600" : "text-blue-600"
                }`}
              >
                {cp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
