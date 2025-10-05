import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem("role");
  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
