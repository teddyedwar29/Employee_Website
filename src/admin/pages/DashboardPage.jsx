import React from 'react';
import { UserCircle, Calendar, Award, Users as UsersIcon, Menu } from 'lucide-react'; // 1. Import Menu

// ... (Helper 'getJabatanName' dan 'getStatusName' tetap sama) ...
const getJabatanName = (id, jabatanOptions) => {
  if (!jabatanOptions) return '...';
  const jabatan = jabatanOptions.find(j => j.id == id);
  return jabatan ? (jabatan.nama_jabatan || jabatan.nama) : 'N/A';
};
const getStatusName = (id, statusKerjaOptions) => {
  if (!statusKerjaOptions) return '...';
  const status = statusKerjaOptions.find(s => s.id == id);
  return status ? (status.nama_status || status.nama) : 'N/A';
};


export default function DashboardPage({
  employees,
  totalEmployees,
  activeEmployees,
  departments,
  onSeeAllEmployees,
  jabatanOptions,
  statusKerjaOptions,
  
  // 2. Terima prop BARU
  onMenuClick,
}) {
  return (
    <>
      {/* 3. Header di-MODIFIKASI: tambah tombol menu */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Welcome back, Admin 👋</p>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        </div>
        {/* Tombol Hamburger (HANYA muncul di HP) */}
        <button 
          onClick={onMenuClick}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 md:hidden"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Info Cards (Sudah benar) */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Total Karyawan</h3>
              <button 
                onClick={onSeeAllEmployees} 
                className="text-xs text-[#800020] font-medium hover:underline"
              >
                Lihat detail
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl px-4 py-2">
                <UserCircle className="text-[#800020]" size={20} />
                <span className="text-sm text-gray-600">Total: {totalEmployees}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl px-4 py-2">
                <Calendar className="text-[#800020]" size={20} />
                <span className="text-sm text-gray-600">Minggu, 16 November 2025</span>
              </div>
            </div>
          </div>

          {/* Employee Table (Sudah benar) */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Daftar Karyawan</h3>
              <button
                onClick={onSeeAllEmployees}
                className="text-xs text-[#800020] font-medium hover:underline"
              >
                Lihat semua
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Jabatan</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">No. HP</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 6).map((emp, index) => {
                    const namaJabatan = getJabatanName(emp.id_jabatan_karyawan, jabatanOptions);
                    const namaStatus = getStatusName(emp.id_status_kerja_karyawan, statusKerjaOptions);
                    
                    return (
                      <tr
                        key={emp.id}
                        className="border-b border-gray-100 hover:bg-white/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <span className="text-sm font-bold text-gray-800">{index + 1}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-linear-to-br from-[#800020] to-[#a0002a] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {(emp.nama || '?').charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{emp.nama || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-600">{namaJabatan}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-600">{emp.no_hp || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-500">{emp.alamat || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              ['aktif', 'kontrak'].includes(namaStatus.toLowerCase())
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {namaStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Right Column di-MODIFIKASI: Ganti col-span */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Stats Card 1 */}
          <div className="bg-linear-to-br from-purple-400 to-purple-600 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                <Award size={20} />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">KARYAWAN AKTIF</p>
            <p className="text-3xl font-bold">
              {activeEmployees}
            </p>
          </div>

          {/* Stats Card 2 */}
          <div className="bg-linear-to-br from-pink-400 to-pink-600 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                <UsersIcon size={20} />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">TOTAL KARYAWAN</p>
            <p className="text-3xl font-bold">{totalEmployees}</p>
          </div>

          {/* Departments list (Data dari 'departments' prop) */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Jabatan</h3>
            <div className="space-y-3">
              {Object.entries(departments).map(([dept, info], index) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 bg-linear-to-br ${info.color || 'from-gray-400 to-gray-600'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{dept}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{info.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Card (Tidak diubah) */}
          <div className="bg-linear-to-br from-teal-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-semibold mb-2 opacity-90">FITUR BARU</p>
              <h4 className="text-lg font-bold mb-3">Kelola data karyawan</h4>
              <button 
                onClick={onSeeAllEmployees}
                className="bg-white/30 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/40 transition-all"
              >
                Lihat data
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
}