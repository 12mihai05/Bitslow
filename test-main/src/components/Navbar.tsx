import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-wide">BitSlow</div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-32 text-base">
            <Link
              to="/dashboard"
              className="px-3 py-2 relative group transition text-gray-300 hover:text-white font-medium"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full"></span>
            </Link>

            <Link
              to="/profile"
              className="px-3 py-2 relative group transition text-gray-300 hover:text-white font-medium"
            >
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full"></span>
            </Link>

            <Link
              to="/market"
              className="px-3 py-2 relative group transition text-gray-300 hover:text-white font-medium"
            >
              Market
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:block">
            <button
              onClick={logout}
              className="bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-500 px-4 py-2 rounded-md text-sm transition-colors duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-6 h-6 flex flex-col items-center justify-center group cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`absolute w-5 h-[2px] bg-white rounded transition-transform duration-300 ${
                  menuOpen ? "rotate-45" : "-translate-y-[6px]"
                }`}
              />
              <span
                className={`absolute w-5 h-[2px] bg-white rounded transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute w-5 h-[2px] bg-white rounded transition-transform duration-300 ${
                  menuOpen ? "-rotate-45" : "translate-y-[6px]"
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-14 left-0 w-full bg-gray-800 text-white z-50 shadow-lg transition-all duration-300 ease-in-out transform ${
          menuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-5 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center text-lg py-6">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center px-6 py-3 relative group overflow-hidden text-gray-300 hover:text-white transition-colors"
          >
            <span className="absolute top-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            Dashboard
          </Link>

          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center px-6 py-3 relative group overflow-hidden text-gray-300 hover:text-white transition-colors"
          >
            <span className="absolute top-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            Profile
          </Link>

          <Link
            to="/market"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center px-6 py-3 relative group overflow-hidden text-gray-300 hover:text-white transition-colors"
          >
            <span className="absolute top-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"></span>
            Market
          </Link>

          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="w-full text-center px-6 py-3 relative group overflow-hidden text-red-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="absolute top-0 left-0 h-[1px] w-0 bg-red-400 transition-all duration-500 group-hover:w-full"></span>
            <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-red-400 transition-all duration-500 group-hover:w-full"></span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
