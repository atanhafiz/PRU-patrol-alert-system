import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseAutoClient";
import { useToast } from "../../components/ToastProvider";

export default function GuardRegister() {
  const { showToast } = useToast();
  const [guards, setGuards] = useState([]);
  const [fullName, setFullName] = useState("");
  const [shift, setShift] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 Fetch guards
  const fetchGuards = async () => {
    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("Gagal ambil data guard", "error");
    } else setGuards(data || []);
  };

  useEffect(() => {
    fetchGuards();

    // 🛰️ Realtime listener
    const channel = supabase
      .channel("guards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guards" },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchGuards();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 🧩 Tambah guard
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!fullName || !shift || !company) {
      showToast("Sila isi semua maklumat", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("guards")
      .insert([{ full_name: fullName, shift, company, is_active: false }]);

    if (error) {
      showToast("Gagal daftar guard: " + error.message, "error");
    } else {
      showToast("Berjaya daftar guard baharu ✅", "success");
      setFullName("");
      setShift("");
      setCompany("");
      fetchGuards();
    }
    setLoading(false);
  };

  // 🗑 Delete guard
  const handleDelete = async (id) => {
    if (!window.confirm("Padam guard ini?")) return;
    const { error } = await supabase.from("guards").delete().eq("id", id);
    if (error) {
      showToast("Gagal padam guard", "error");
    } else {
      showToast("Guard dipadam ✅", "success");
      fetchGuards();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        Guard Register
      </h1>

      {/* Form daftar */}
      <form
        onSubmit={handleAdd}
        className="bg-white border rounded-xl shadow-sm p-4 mb-6"
      >
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Daftar Guard Baru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nama Guard"
            className="border rounded-lg p-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Shift"
            className="border rounded-lg p-2"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          />
          <input
            type="text"
            placeholder="Syarikat"
            className="border rounded-lg p-2"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
        >
          {loading ? "Menyimpan..." : "Daftar"}
        </button>
      </form>

      {/* Senarai guard */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Senarai Guard
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left p-2">Nama</th>
                <th className="text-left p-2">Shift</th>
                <th className="text-left p-2">Syarikat</th>
                <th className="text-left p-2">Status</th>
                <th className="text-center p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {guards.map((g) => (
                <tr
                  key={g.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-2">{g.full_name}</td>
                  <td className="p-2">{g.shift}</td>
                  <td className="p-2">{g.company}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        g.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {g.is_active ? "On Duty" : "Off Duty"}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {guards.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    Tiada guard berdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
