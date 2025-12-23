import { Clock, FileText, User, Settings } from "lucide-react";

export const operatorMenu = [
  { id: "absensi", label: "Absensi", icon: Clock, path: "/operator/absensi" },
  { id: "riwayat", label: "Riwayat", icon: FileText, path: "/operator/riwayat" },
  { id: "profil", label: "Profil", icon: User, path: "/operator/profil" },
];
