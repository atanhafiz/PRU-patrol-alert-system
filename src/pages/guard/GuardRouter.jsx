// src/pages/guard/GuardRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// dalam /pages/guard
import GuardLayout from "./GuardLayout.jsx";
import GuardWorkspace from "./GuardWorkspace.jsx";
import GuardDuty from "./GuardDuty.jsx";
import Patrol from "./Patrol.jsx";
import History from "./History.jsx";
import Report from "./Report.jsx";
import Status from "./Status.jsx";

// duduk direct bawah /pages
import Landing from "../Landing.jsx";
import GuardDashboard from "../GuardDashboard.jsx";
import PatrolSession from "../PatrolSession.jsx";

export default function GuardRouter() {
  return (
    <Routes>
      {/* "/" → Landing (2 butang + PIN) */}
      <Route index element={<Landing />} />

      {/* Dashboard (lepas PIN guard) */}
      <Route path="dashboard" element={<GuardDashboard />} />

      {/* Session dari dashboard */}
      <Route path="session/:id" element={<PatrolSession />} />

      {/* Page Guard lain */}
      <Route path="workspace" element={<GuardWorkspace />} />
      <Route path="duty" element={<GuardDuty />} />
      <Route path="patrol" element={<Patrol />} />
      <Route path="history" element={<History />} />
      <Route path="report" element={<Report />} />
      <Route path="status" element={<Status />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
