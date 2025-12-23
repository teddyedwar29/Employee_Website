import { marketingMenu } from "../config/marketingMenu";
import SidebarItem from "../../shared/sidebar/SidebarItems";

export default function MarketingSidebar() {
  return (
    <aside className="w-56 bg-white/70 backdrop-blur-xl p-6 shadow-xl">
      <h1 className="text-xl font-bold mb-8">Portal Marketing</h1>

      <nav className="space-y-1">
        {marketingMenu.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            to={item.to}
          />
        ))}
      </nav>
    </aside>
  );
}
