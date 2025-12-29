// File: src/admin/components/layout/EmployeeSidebar.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  X,
  Settings,
  UserX,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Clock,
  Heart,
  Book,
  Building2,
  UserCircle,
  DollarSign,
  FileText,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'karyawan',  name: 'Data Karyawan', icon: Users, path: '/admin/karyawan' },
  { id: 'berhenti',  name: 'Karyawan Berhenti', icon: UserX, path: '/admin/karyawan-berhenti' },
  { id: 'laporan',  name: 'Laporan', icon: FileText, path: '/admin/laporan' },
  { id: 'izin',  name: 'Izin', icon: Clock, path: '/admin/izin' },
  { id: 'absensi-report', name: 'Riwayat Absensi', icon: Calendar, path: '/admin/absensi-report' },
];

const masterMenus = [
  {
    id: 'master-jabatan',
    name: 'Jabatan',
    icon: Briefcase,
    path: '/admin/master/jabatan',
  },
    {
    id: 'master-status-kerja',
    name: 'Status Kerja',
    icon: Clock,
    path: '/admin/master/status-kerja',
  },
  {
    id: 'master-status-pernikahan',
    name: 'Status Pernikahan',
    icon: Heart,                    // atau icon lain
    path: '/admin/master/status-pernikahan',
  },
  {
    id: 'master-agama',
    name: 'Agama',
    icon: Book,    
    path: '/admin/master/agama',             
  },
  {
    id: 'master-departemen',
    name: 'Departemen',
    icon: Building2,             // atau icon lain
    path: '/admin/master/departemen',
  },
  {
    id: 'master-kondisi-akun',
    name: 'Kondisi Akun',
    icon: UserCircle,
    path: '/admin/master/kondisi-akun',
  },
    {
    id: 'gaji-setting',
    name: 'Gaji Setting',
    icon: Settings,
    path: '/admin/master/gaji-setting',
  },

];

export default function EmployeeSidebar({ activeMenu, isOpen, setIsOpen }) {
  // buka/tutup dropdown Data Master
  const [isMasterOpen, setIsMasterOpen] = useState(
    window.location.pathname.startsWith('/admin/master')
  );

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50
        w-48 bg-white/70 backdrop-blur-xl shadow-2xl
        flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
    {/* Header Sidebar */}
    <div className="relative p-6 pb-4 shrink-0">
      {/* Tombol Close (mobile) */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 md:hidden"
      >
        <X size={20} />
      </button>

      <h1 className="text-xl font-bold text-gray-800">
        Alaska Employee
      </h1>
    </div>


      {/* Menu utama */}
      <nav className="
        flex-1 px-4 pb-6 space-y-1
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
      ">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              activeMenu === item.id
                ? 'bg-gradient-to-r from-[#800020] to-[#a0002a] text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}

        {/* ====== DATA MASTER + DROPDOWN ====== */}
        <div className="mt-4">
          {/* Tombol utama Data Master */}
          <button
            type="button"
            onClick={() => setIsMasterOpen((prev) => !prev)}
            className="
              w-full flex items-center justify-between
              px-3 py-2.5 rounded-lg
              border border-gray-300
              text-gray-700 text-sm font-medium
              hover:bg-white/60 transition-all
            "
          >
            <span className="flex items-center gap-2">
              <Settings size={18} />
              <span>Data Master</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isMasterOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {/* Dropdown submenu (dianimasikan) */}
          <div
            className={`
              mt-1 ml-2 space-y-1
              overflow-hidden
              transition-all duration-300
              ${isMasterOpen ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'}
            `}
          >
            {masterMenus.map((submenu) => (
              <Link
                key={submenu.id}
                to={submenu.path}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  activeMenu === submenu.id
                    ? 'bg-gradient-to-r from-[#800020] to-[#a0002a] text-white shadow-md'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <submenu.icon size={14} />
                <span className="font-medium">{submenu.name}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* ====== END DATA MASTER ====== */}
      </nav>
    </div>
  );
}

