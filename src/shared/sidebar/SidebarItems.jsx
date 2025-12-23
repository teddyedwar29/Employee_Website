import { NavLink } from "react-router-dom";

export default function SidebarItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition
        ${isActive ? "bg-[#800020] text-white" : "text-gray-600 hover:bg-gray-100"}`
      }
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}
