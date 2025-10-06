// src/pages/guard_light/LightLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function LightLayout() {
  const navigate = useNavigate();
  const tabClass = ({ isActive }) =>
    "px-3 py-2 rounded-lg text-sm transition font-medium " +
    (isActive ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-lg font-semibold text-blue-700">PRU Patrol Guard (Light)</h1>
        <button
          onClick={() => navigate("/light/login")}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <nav className="flex justify-around bg-white border-t p-2 shadow-inner">
        <NavLink to="/light/home" className={tabClass}>🏠 Home</NavLink>
        <NavLink to="/light/patrol" className={tabClass}>🪪 Patrol</NavLink>
        <NavLink to="/light/report" className={tabClass}>📋 Report</NavLink>
        <NavLink to="/light/history" className={tabClass}>🕘 History</NavLink>
        <NavLink to="/light/map" className={tabClass}>🗺️ Map</NavLink>
        <NavLink to="/light/map-realtime" className={tabClass}>🛰 Realtime</NavLink>
      </nav>
    </div>
  );
}
