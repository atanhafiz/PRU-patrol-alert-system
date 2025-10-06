// src/pages/guard_light/LightRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LightLayout from "./LightLayout.jsx";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import Patrol from "./Patrol.jsx";
import Report from "./Report.jsx";
import History from "./History.jsx";
import MapView from "./MapView.jsx";

export default function LightRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />
      <Route path="login" element={<Login />} />
      <Route element={<LightLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="patrol" element={<Patrol />} />
        <Route path="report" element={<Report />} />
        <Route path="history" element={<History />} />
        <Route path="map" element={<MapView />} />
      </Route>
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
}
