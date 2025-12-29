import { NavLink } from "react-router-dom";

export default function SidebarItem({ icon: Icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-4 py-3 rounded-xl transition
        ${
          isActive
            ? "bg-[#800020] text-white"
            : "text-gray-700 hover:bg-gray-100"
        }
        `
      }
    >
      <Icon size={18} />
      <span className="text-sm font-semibold">{label}</span>
    </NavLink>
  );
}
