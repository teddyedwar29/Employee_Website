import { X, LogOut } from "lucide-react";
import { marketingMenu } from "../config/marketingMenu";
import SidebarItem from "../../shared/sidebar/SidebarItems";

export default function MarketingSidebar({
  isOpen,
  setIsOpen,
  onNavigate,
  onLogout,
}) {
  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50
        w-48 bg-white/70 backdrop-blur-xl shadow-2xl
        flex flex-col h-full
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* ===== HEADER ===== */}
      <div className="relative p-6 pb-4 shrink-0">
        {/* Close (mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 md:hidden"
        >
          <X size={20} />
        </button>

        <h1 className="text-xl font-bold text-gray-800">
          Portal Marketing
        </h1>
      </div>

      {/* ===== MENU ===== */}
      <nav
        className="
          flex-1 px-4 pb-6 space-y-1
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
        "
      >
        {marketingMenu.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            to={item.path}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* ===== LOGOUT ===== */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="
            w-full flex items-center gap-3
            px-3 py-2.5 rounded-lg
            text-red-600 font-medium text-sm
            hover:bg-red-50 transition-all
          "
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
