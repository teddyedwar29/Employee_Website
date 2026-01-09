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
      // walaupun error, tetap logout lokal
    }

    localStorage.removeItem("access_token");

    Swal.fire("Berhasil", "Logout berhasil", "success").then(() => {
      navigate("/login", { replace: true });
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ===== SIDEBAR (SAMA DENGAN MARKETING) ===== */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-56
          transform
          transition-transform duration-300
          ${isOpen ? "translate-x-0 fade-in-up" : "-translate-x-full"}
          md:static md:translate-x-0 md:fade-in-up
        `}
      >
        <OperatorSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onNavigate={() => setIsOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* ===== BACKDROP (MOBILE ONLY) ===== */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden modal-backdrop"
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 p-4 bg-white shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
          <h1 className="font-bold text-gray-800">
            Portal Karyawan
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
