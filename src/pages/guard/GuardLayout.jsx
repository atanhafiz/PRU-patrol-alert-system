// src/pages/guard/GuardLayout.jsx
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Status from "./Status.jsx";
import Patrol from "./Patrol.jsx";
import History from "./History.jsx";

export default function GuardLayout() {
  const role = localStorage.getItem("role");
  if (role !== "guard") return <Navigate to="/" replace />;

  const navigate = useNavigate();
  const tabClass = ({ isActive }) =>
    "px-4 py-2 rounded-full transition " +
    (isActive ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200");

  return (
    <div className="p-4 sm:p-6 relative">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      <div className="text-lg font-semibold mb-4">Guard Duty</div>

      {/* TAB (link RELATIVE) */}
      <div className="mb-4 flex gap-2">
        <NavLink to="status" className={tabClass}>🏠 Status</NavLink>
        <NavLink to="patrol" className={tabClass}>🪪 Patrol</NavLink>
        <NavLink to="history" className={tabClass}>🕘 History</NavLink>
      </div>

      <Routes>
        <Route index element={<Navigate to="status" replace />} />
        <Route path="status" element={<Status />} />
        <Route path="patrol" element={<Patrol />} />
        <Route path="history" element={<History />} />
        <Route path="*" element={<Navigate to="status" replace />} />
      </Routes>
    </div>
  );
}
