import { marketingMenu } from "../config/marketingMenu";
import SidebarItem from "../../shared/sidebar/SidebarItems";
import { X } from "lucide-react";

export default function MarketingSidebar({onClose, onNavigate}) {
  return (
    <aside className="w-56 bg-white/70 backdrop-blur-xl p-6 shadow-xl">
      {/* CLOSE BUTTON (MOBILE ONLY) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <X size={20} />
      </button>

      <h1 className="text-xl font-bold mb-8">Portal Marketing</h1>

      <nav className="space-y-2">
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
    </aside>
  );
}
