export default function Status() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border max-w-2xl">
      <div className="text-lg font-semibold mb-1">Guard – Status</div>
      <div className="text-sm mb-4">
        Status semasa: <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600">Off Duty</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 rounded-full bg-indigo-600 text-white">Start Duty</button>
        <span className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm">📍 GPS: Ready</span>
      </div>
    </div>
  );
}
