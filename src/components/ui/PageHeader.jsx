import { Menu } from "lucide-react";

export default function PageHeader({
  title,
  description,
  onMenuClick,
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 relative">
      {/* Kiri */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* Hamburger - Mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden relative z-50 p-2 rounded-xl bg-white shadow
                   hover:bg-gray-100 active:scale-95 transition"
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>
    </div>
  );
}
