// src/components/Topbar.jsx
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      {/* Logo + Title */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/logo.png"
          alt="logo"
          className="w-8 h-8 rounded-full border"
        />
        <span className="text-lg font-semibold text-purple-700">
          PRU Patrol
        </span>
      </div>

      {/* Buttons kanan */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/guard")}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          Guard
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          Admin
        </button>
      </div>
    </div>
  );
}
