// src/router/index.jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// ==== Pages ====
import Home from "../pages/Home.jsx";                            
import GuardWorkspace from "../pages/guard/GuardWorkspace.jsx"; 
import AdminDashboard from "../pages/admin/AdminDashboard.jsx"; 

// Definisi routes
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/guard", element: <GuardWorkspace /> },   // UI Guard KEKAL
  { path: "/admin", element: <AdminDashboard /> },   // UI Admin baru
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    />
  );
}
