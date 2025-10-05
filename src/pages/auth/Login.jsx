import { useState } from "react";

export default function Login() {
  const [pin, setPin] = useState("");

  const handleKeyPress = (digit) => {
    if (pin.length < 6) setPin(pin + digit); // max 6 digit
  };

  const handleClear = () => setPin("");
  const handleBack = () => setPin(pin.slice(0, -1));

  const handleLogin = () => {
    if (pin === import.meta.env.VITE_GUARD_PIN) {
      localStorage.setItem("role", "guard");
      alert("Guard login berjaya ✅");
      window.location.href = "/guard/duty";
    } else if (pin === import.meta.env.VITE_ADMIN_PIN) {
      localStorage.setItem("role", "admin");
      alert("Admin login berjaya ✅");
      window.location.href = "/admin";
    } else {
      alert("PIN salah ❌");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {/* Display pin sebagai dot */}
      <div className="flex justify-center mb-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 mx-1 rounded-full border ${
              i < pin.length ? "bg-black" : "bg-white"
            }`}
          ></div>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleKeyPress(n.toString())}
            className="bg-gray-200 rounded-lg py-4 text-xl font-bold hover:bg-gray-300"
          >
            {n}
          </button>
        ))}
        <button onClick={handleClear} className="bg-red-200 rounded-lg py-4 text-lg hover:bg-red-300">
          C
        </button>
        <button onClick={() => handleKeyPress("0")} className="bg-gray-200 rounded-lg py-4 text-xl font-bold hover:bg-gray-300">
          0
        </button>
        <button onClick={handleBack} className="bg-yellow-200 rounded-lg py-4 text-lg hover:bg-yellow-300">
          ←
        </button>
      </div>

      {/* Login button */}
      <button
        onClick={handleLogin}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        Login
      </button>
    </div>
  );
}
