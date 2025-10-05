import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NumpadOverlay from "../components/NumpadOverlay";

export default function Landing() {
  const [showGuardPad, setShowGuardPad] = useState(false);
  const [showAdminPad, setShowAdminPad] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowSlogan(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const afterGuard = () => {
    try { localStorage.setItem("role", "guard"); } catch {}
    setShowGuardPad(false);
    setTimeout(() => navigate("/guard/dashboard"), 0);
  };

  const afterAdmin = () => {
    try { localStorage.setItem("role", "admin"); } catch {}
    setShowAdminPad(false);
    setTimeout(() => navigate("/admin"), 0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-200 via-purple-50 to-white p-6">
      {/* Logo + Nama */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 text-center sm:text-left">
        <img
          src="/logo.png"
          alt="logo"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg ring-4 ring-purple-300"
          onError={({ currentTarget }) => { currentTarget.style.display = "none"; }}
        />
        <div>
          <div className="text-2xl sm:text-4xl font-extrabold text-purple-800 drop-shadow">
            Prima Residensi Utama – PATROL
          </div>
          <div className="text-sm sm:text-lg text-gray-700">
            Pilih workspace untuk mula
          </div>
          {/* Slogan dengan animasi fade-in */}
          <div
            className={`mt-2 text-base sm:text-xl text-purple-600 font-semibold italic transition-opacity duration-1000 ${
              showSlogan ? "opacity-100" : "opacity-0"
            }`}
          >
            Smart Patrol System – Safe & Secure Community
          </div>
        </div>
      </div>

      {/* 2 Button Bulat Responsive */}
      <div className="flex flex-col sm:flex-row gap-10 sm:gap-20 items-center">
        <button
          onClick={() => setShowGuardPad(true)}
          className="w-40 h-40 sm:w-96 sm:h-96 rounded-full shadow-2xl text-white text-xl sm:text-4xl font-bold bg-gradient-to-br from-green-500 to-green-700 hover:scale-105 active:scale-95 transition-transform animate-pulse"
        >
          Guard
        </button>

        <button
          onClick={() => setShowAdminPad(true)}
          className="w-40 h-40 sm:w-96 sm:h-96 rounded-full shadow-2xl text-white text-xl sm:text-4xl font-bold bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-105 active:scale-95 transition-transform animate-pulse"
        >
          Admin
        </button>
      </div>

      {showGuardPad && <NumpadOverlay roleTarget="guard" onSuccess={afterGuard} />}
      {showAdminPad && <NumpadOverlay roleTarget="admin" onSuccess={afterAdmin} />}

      {/* Footer credit */}
      <div className="mt-12 text-sm text-gray-500 italic">
        Developed by <span className="font-semibold text-purple-700">SharinaRoos</span>
      </div>
    </div>
  );
}
