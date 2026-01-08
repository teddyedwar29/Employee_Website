import { Clock, FileText, User, MapPin,BarChart3 } from "lucide-react";

export const marketingMenu = [
  { id: "absensi", label: "Absensi", icon: Clock, path: "/marketing/absensi" },
  { id: "riwayat", label: "Riwayat Absensi", icon: FileText, path: "/marketing/riwayat" },
  { id: "kunjungan", label: "Kunjungan", icon: MapPin, path: "/marketing/kunjungan" },
  { id: "laporan", label: "Laporan Pencapaian Marketing", icon: BarChart3, path: "/marketing/laporan" },

 // { id: "profil", label: "Profil", icon: User },
];

