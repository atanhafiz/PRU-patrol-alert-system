// src/pages/guard_light/Report.jsx
import { useState } from "react";

export default function Report() {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1500);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-bold mb-3 text-blue-700">Incident Report</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-sm">
        <textarea
          rows="4"
          placeholder="Describe the issue..."
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="text-sm"
        />
        <button
          type="submit"
          disabled={submitted}
          className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition"
        >
          {submitted ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
