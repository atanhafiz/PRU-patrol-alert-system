import { Navigate, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  if (role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <div className="text-lg font-semibold mb-2">Admin Workspace</div>
        <p className="text-sm text-gray-600">
          UI Admin kekal (guna layout lama). Modul arahan harian boleh tambah lepas ni.
        </p>
      </div>
    </div>
  );
}
