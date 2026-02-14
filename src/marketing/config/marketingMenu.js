import {
  Clock,
  FileText,
  MapPin,
  BarChart3,
  Activity,
  TrendingUp,
} from "lucide-react";

export const marketingMenu = [
  {
    id: "absensi",
    label: "Absensi",
    icon: Clock,
    path: "/marketing/absensi",
  },
  {
    id: "riwayat",
    label: "Riwayat Absensi",
    icon: FileText,
    path: "/marketing/riwayat",
  },
  {
    id: "kunjungan",
    label: "Kunjungan",
    icon: MapPin,
    path: "/marketing/kunjungan",
  },

  // 🔽 DROPDOWN LAPORAN
  {
    id: "laporan",
    label: "Laporan",
    icon: BarChart3,
    children: [
      {
        id: "laporan-masa-aktif",
        label: "Laporan Masa Aktif Reseller",
        icon: Activity,
        path: "/marketing/laporan/masa-aktif",
      },
      {
        id: "laporan-pencapaian",
        label: "Laporan Pencapaian Marketing",
        icon: TrendingUp,
        path: "/marketing/laporan/pencapaian",
      },
    ],
  },
];
