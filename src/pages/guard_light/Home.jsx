// src/pages/guard_light/Home.jsx
import { useState } from "react";
import { Power } from "lucide-react";

export default function Home() {
  const [onDuty, setOnDuty] = useState(false);

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Guard Home</h2>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <p className="text-gray-600 mb-3">
          Status semasa:{" "}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              onDuty ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {onDuty ? "On Duty" : "Off Duty"}
          </span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setOnDuty(true)}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium flex items-center justify-center gap-2 shadow active:scale-95 transition"
          >
            <Power className="w-4 h-4" /> Start Duty
          </button>
          <button
            onClick={() => setOnDuty(false)}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 font-medium active:scale-95 transition"
          >
            End Duty
          </button>
        </div>
      </div>
    </div>
  );
}
