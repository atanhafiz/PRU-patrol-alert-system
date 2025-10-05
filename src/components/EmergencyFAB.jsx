export default function EmergencyFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 px-5 py-3 rounded-full bg-red-600 text-white shadow-2xl z-40"
      title="Emergency"
    >
      🚨 Emergency
    </button>
  );
}
