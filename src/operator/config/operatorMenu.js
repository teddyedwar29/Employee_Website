import { Clock, FileText, User, Settings } from "lucide-react";

export const operatorMenu = [
  { id: "absensi", label: "Absensi", icon: Clock, to: "/operator/absensi" },
  { id: "riwayat", label: "Riwayat", icon: FileText, to: "/operator/riwayat" },
  { id: "profil", label: "Profil", icon: User, to: "/operator/profil" },
];
