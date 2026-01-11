import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";

export default function SidebarItem({ icon: Icon, label, to, onClick }) {
    const handleClick = (e) => {
    // ⛔ intercept menu Profil
    if (label?.toLowerCase() === "profil") {
      e.preventDefault();

      Swal.fire({
        icon: "info",
        title: "Coming Soon 🚧",
        text: "Halaman profil sedang dalam tahap pengembangan",
        confirmButtonText: "OK",
      });

      return;
    }

    // menu lain tetap normal
    onClick?.();
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
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
