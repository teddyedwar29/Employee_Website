import { operatorMenu } from "../config/operatorMenu";
import SidebarItem from "../../shared/sidebar/SidebarItems";


export default function OperatorSidebar({ employee }) {
  return (
    <aside className="w-56 bg-white/70 backdrop-blur-xl p-6 shadow-xl">
      <h1 className="text-xl font-bold mb-8">Portal Karyawan</h1>

      <nav className="space-y-1">
        {operatorMenu.map(item => (
          <SidebarItem key={item.id} {...item} />
        ))}
      </nav>
    </aside>
  );
}

