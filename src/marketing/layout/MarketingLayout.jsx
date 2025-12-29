import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import MarketingSidebar from "./MarketingSidebar";


export default function MarketingLayout() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-56
          transform bg-white/70 backdrop-blur-xl shadow-xl
          transition-transform duration-300
          ${isOpen ? "translate-x-0 fade-in-up" : "-translate-x-full"}
          md:static md:translate-x-0 md:fade-in-up
        `}
      >
        <MarketingSidebar />
      </div>

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden modal-backdrop"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 p-4 bg-white shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
          <h1 className="font-bold text-gray-800">Portal Karyawan</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
