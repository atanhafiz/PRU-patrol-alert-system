import { useNavigate } from "react-router-dom";
import MapRouteCard from "../../components/MapRouteCard";

export default function GuardWorkspace() {
  const today = new Date().toLocaleDateString("ms-MY", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });
  const navigate = useNavigate();

  return (
    <div className="p-6 relative min-h-[70vh]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      <div className="flex justify-center mb-6">
        <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-xl animate-bounce hover:scale-105 transition">
          Guard Dashboard
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">Arahan hari ini • {today}</div>

      <div className="rounded-2xl bg-white shadow-sm border p-4 max-w-2xl mx-auto">
        <div className="font-medium mb-2">
          <span className="text-red-600 font-bold">WAJIB</span>
        </div>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li>• Ronda sesi (7 rumah/sesi)</li>
          <li>• Selfie-Start di Post Pengawal semasa Start Duty</li>
          <li>• Snap Gambar Setiap Rumah yang diberikan</li>
          <li>• Selfie-End di Post Pengawal Selepas siap snap 7 rumah</li>
        </ul>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/guard/duty")}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-xl hover:scale-105 transition animate-pulse"
          >
            Guard Workspace
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-2xl mx-auto">
        <MapRouteCard />
      </div>
    </div>
  );
}
