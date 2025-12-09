import React, { useState } from 'react';
import { LayoutDashboard, Users, X, Settings, UserX } from 'lucide-react'; // 1. Import X
import { Link } from 'react-router-dom'; 

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'karyawan',  name: 'Data Karyawan', icon: Users, path: '/admin/karyawan' },
  { id: 'berhenti', label: 'Karyawan Berhenti', icon: UserX, path: '/admin/karyawan-berhenti' },


  { id: 'master-jabatan', name: 'Master Jabatan', icon: Settings, path: '/admin/master/jabatan' },
];

// 2. Terima 'isOpen' dan 'setIsOpen'
export default function EmployeeSidebar({ activeMenu, isOpen, setIsOpen }) {
  return (
    // 3. Ubah total class di sini
    <div 
      className={`
        fixed inset-y-0 left-0 z-50
        w-48 bg-white/70 backdrop-blur-xl p-6 shadow-2xl
        shrink-0 flex-col
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* 4. Tombol Close (HANYA muncul di HP) */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 md:hidden"
      >
        <X size={20} />
      </button>

      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-xl font-bold text-gray-800">EmployeePro</h1>
      </div>

      {/* Menu Items (Tidak diubah) */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              activeMenu === item.id
                ? 'bg-linear-to-r from-[#800020] to-[#a0002a] text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}