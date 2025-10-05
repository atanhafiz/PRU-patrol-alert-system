import { useNavigate } from "react-router-dom";

export default function Report() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      >
        ← Back
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm border max-w-2xl">
        <div className="text-lg font-semibold mb-2">Report</div>
        <p className="text-sm text-gray-600">Placeholder report. (Akan isi ikut arahan bos seterusnya)</p>
      </div>
    </div>
  );
}
