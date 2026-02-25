import { Clock, FileText, User, BarChart3, TrendingUp } from "lucide-react";

export const operatorMenu = [
  { id: "absensi", label: "Absensi", icon: Clock, path: "/operator/absensi" },
  { id: "riwayat", label: "Riwayat", icon: FileText, path: "/operator/riwayat" },
  { id: "profil", label: "Profil", icon: User, path: "/operator/profil" },

  {
    id: "analytic",
    label: "Analytic",
    icon: BarChart3,
    children: [
      {
        id: "omzet-level",
        label: "Omzet Level",
        icon: BarChart3,
        path: "/operator/analytic/omzet-level",
      },
            {
        id: "top-produk-level",
        label: "Top Produk",
        icon: TrendingUp,
        path: "/operator/analytic/top-produk-level",
      },
    ],
  },
];
