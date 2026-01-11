import React from 'react';
import { UserCircle, Calendar, Award, Users as UsersIcon, Menu, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';


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
  onMenuClick,
}) {
  // Hitung statistik jabatan dari data karyawan
  const jabatanStats = React.useMemo(() => {
    if (!employees || !jabatanOptions) return [];
    
    const stats = {};
    employees.forEach(emp => {
      const jabatanName = getJabatanName(emp.id_jabatan_karyawan, jabatanOptions);
      if (jabatanName && jabatanName !== 'N/A') {
        stats[jabatanName] = (stats[jabatanName] || 0) + 1;
      }
    });
    
    // Convert to array dan sort by count
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees, jabatanOptions]);

  return (
    <>
      {/* header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back, Admin"
        onMenuClick={onMenuClick}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Info Cards */}
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

          {/* GRAFIK BARU - Karyawan per Jabatan */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Karyawan per Jabatan</h3>
                <p className="text-xs text-gray-600 mt-1">Distribusi karyawan berdasarkan posisi</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {jabatanStats.map((item, index) => {
                const percentage = (item.count / totalEmployees) * 100;
                const colors = [
                  'from-orange-400 to-orange-600',
                  'from-pink-400 to-pink-600',
                  'from-purple-400 to-purple-600',
                  'from-blue-400 to-blue-600',
                  'from-teal-400 to-teal-600',
                  'from-indigo-400 to-indigo-600',
                  'from-cyan-400 to-cyan-600',
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
                        <span className="text-xs font-bold text-gray-800 min-w-[30px] text-right">{item.count}</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out group-hover:brightness-110 flex items-center justify-end pr-2`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 15 && (
                          <span className="text-[10px] font-bold text-white">{item.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {jabatanStats.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Tidak ada data jabatan
              </div>
            )}
          </div>

          {/* Employee Table */}
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
                            <div className="w-8 h-8 bg-gradient-to-br from-[#800020] to-[#a0002a] rounded-lg flex items-center justify-center text-white text-xs font-bold">
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

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Stats Card 1 */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-6 shadow-xl text-white">
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
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                <UsersIcon size={20} />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">TOTAL KARYAWAN</p>
            <p className="text-3xl font-bold">{totalEmployees}</p>
          </div>

          {/* Departments list */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Departemen
            </h3>
            <div className="space-y-3">
              {Object.entries(departments).map(([dept, info], index) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${
                        info.color || "from-gray-400 to-gray-600"
                      } rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">
                      {dept}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {info.count}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* Action Card */}
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
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