// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Topbar from "./components/Topbar.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import GuardRouter from "./pages/guard/GuardRouter.jsx";

function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <>
      {isAdmin && <Topbar />}
      <div className={isAdmin ? "max-w-6xl mx-auto p-4" : ""}>{children}</div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* GUARD — sokong root & legacy prefix */}
          <Route path="/*" element={<GuardRouter />} />
          <Route path="/guard/*" element={<GuardRouter />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
