import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import OperatorSidebar from "./OperatorSidebar";
import { logout } from "@/services/authServices";
import Swal from "sweetalert2";

export default function OperatorLayout() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "Kamu akan keluar dari sistem",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await logout();
    } catch (e) {
      // walaupun error, kita tetap logout local
    }

    localStorage.removeItem("access_token");

    Swal.fire("Berhasil", "Logout berhasil", "success").then(() => {
      navigate("/login", { replace: true });
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0
          z-50 w-56
          bg-white/70 backdrop-blur-xl shadow-xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        <OperatorSidebar onNavigate={() => setIsOpen(false)} onLogout={handleLogout} />
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-30">
          <h1 className="text-lg font-bold text-gray-800">Portal Karyawan</h1>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 p-6 fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}