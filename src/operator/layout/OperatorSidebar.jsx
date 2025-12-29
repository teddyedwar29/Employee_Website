import { operatorMenu } from "../config/operatorMenu";
import SidebarItem from "../../shared/sidebar/SidebarItems";


export default function OperatorSidebar({ onNavigate, onLogout   }) {
  return (
    <aside className="h-full w-56 p-6">
      <h1 className="text-xl font-bold mb-8">Portal Karyawan</h1>

      <nav className="space-y-2">
        {operatorMenu.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            to={item.to}
            onClick={onNavigate}
          />
        ))}
        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          Logout
        </button>

      </nav>
    </aside>
  );
}
