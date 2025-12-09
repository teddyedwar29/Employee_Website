import React from 'react';
import {
  Search,
  Plus,
  Users,
  UserCircle,
  TrendingUp,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  MapPin, 
  FileText,
  Menu,
  ChevronDown
} from 'lucide-react';

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

// Hitung status kontrak
const getContractStatusInfo = (awalStr, akhirStr, namaStatus) => {
  // Kalau status kerja sudah berhenti
  if (namaStatus && namaStatus.toLowerCase() === 'berhenti') {
    return {
      label: 'Karyawan sudah berhenti',
      badgeClass: 'bg-red-100 text-red-700',
    };
  }

  if (!akhirStr) {
    return {
      label: 'Tidak ada tanggal akhir kontrak',
      badgeClass: 'bg-gray-100 text-gray-600',
    };
  }

  const end = new Date(akhirStr);
  if (isNaN(end.getTime())) {
    return {
      label: 'Tanggal kontrak tidak valid',
      badgeClass: 'bg-gray-100 text-gray-600',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.round((end - today) / (1000 * 60 * 60 * 24));

  // Kontrak sudah lewat
  if (diffDays < 0) {
    return {
      label: `Kontrak berakhir ${Math.abs(diffDays)} hari lalu`,
      badgeClass: 'bg-red-100 text-red-700',
    };
  }

  // ≤ 30 hari lagi -> merah (critical)
  if (diffDays <= 30) {
    return {
      label: `Sisa kontrak ${diffDays} hari`,
      badgeClass: 'bg-red-100 text-red-700',
    };
  }

  // 31–90 hari -> kuning (warning)
  if (diffDays <= 90) {
    return {
      label: `Sisa kontrak ${diffDays} hari`,
      badgeClass: 'bg-amber-100 text-amber-700',
    };
  }

  // > 90 hari -> hijau (aman)
  return {
    label: `Sisa kontrak ${diffDays} hari`,
    badgeClass: 'bg-emerald-100 text-emerald-700',
  };
};


export default function DataEmployee({
  // ... (semua props lama)
  searchTerm,
  onChangeSearch,
  filterDepartment, 
  onChangeDepartment,
  filterStatus, 
  onChangeStatus,
  totalEmployees,
  filteredEmployees,
  allDepartments, 
  allStatusOptions, 
  jabatanOptions,
  statusKerjaOptions,
  onAddClick,
  onDeleteEmployee, 
  onEditClick,
  onDetailClick,
  isLoading, 
  
  // 2. Terima prop BARU
  onMenuClick,
}) {
  return (
    <>
      {/* 3. Header di-MODIFIKASI: tambah tombol menu */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Data Karyawan</h2>
          <p className="text-sm text-gray-600">Kelola semua data karyawan perusahaan</p>
        </div>
        {/* Tombol Hamburger (HANYA muncul di HP) */}
        <button 
          onClick={onMenuClick}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 md:hidden"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      {/* 4. Filter Section di-MODIFIKASI: Ganti grid-cols-12 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        {/* 'grid-cols-1' untuk HP, 'md:grid-cols-12' untuk desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* 'md:col-span-5' -> artinya di desktop ambil 5 kolom */}
          <div className="md:col-span-5">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Cari Karyawan
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama, NIK, jabatan..."
                value={searchTerm}
                onChange={(e) => onChangeSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Jabatan
            </label>

            <div className="relative">
              <select
                value={filterDepartment} 
                onChange={(e) => onChangeDepartment(e.target.value)}
                className="w-full pl-4 cursor-pointer pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-[#800020] appearance-none text-sm"
              >
                {(allDepartments || []).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* icon panah */}
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>


          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Status Kerja
            </label>

            <div className="relative">
              <select
                value={filterStatus} 
                onChange={(e) => onChangeStatus(e.target.value)}
                className="w-full pl-4 pr-10 cursor-pointer  py-3 bg-gray-50/80 border border-gray-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-[#800020] appearance-none text-sm"
              >
                {(allStatusOptions || []).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>


          <div className="md:col-span-2">
            <button 
              onClick={onAddClick}
              className="w-full bg-linear-to-r from-[#800020] cursor-pointer to-[#a0002a] text-white px-4 py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Tambah
            </button>
          </div>
        </div>

        {/* ... (Info count tidak diubah) ... */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-600">Menampilkan</span>
          <span className="text-xs font-bold text-[#800020]">
            {filteredEmployees.length}
          </span>
          <span className="text-xs text-gray-600">
            dari {totalEmployees} karyawan
          </span>
        </div>  
      </div>

      {/* 5. Employee Cards di-MODIFIKASI: Ganti grid-cols-3 */}
      {/* 'grid-cols-1' (HP), 'lg:grid-cols-2' (Tablet), 'xl:grid-cols-3' (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const namaJabatan = getJabatanName(emp.id_jabatan_karyawan, jabatanOptions);
          const namaStatus = getStatusName(emp.id_status_kerja_karyawan, statusKerjaOptions);
          const contractInfo = getContractStatusInfo(
            emp.awal_kontrak,
            emp.akhir_kontrak,
            namaStatus
          );
          
          return (
            <div
              key={emp.id}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all"
            >
              {/* ... (Card Header tidak diubah) ... */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-[#800020] to-[#a0002a] rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {(emp.nama || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{emp.nama || 'Nama Kosong'}</h3>
                    <p className="text-xs text-gray-500">{emp.nik || 'NIK tidak ada'}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    namaStatus.toLowerCase() === 'tetap' || namaStatus.toLowerCase() === 'kontrak'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {namaStatus}
                </span>
              </div>

              {/* ... (Card Info tidak diubah) ... */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserCircle size={14} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700">{namaJabatan}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone size={14} className="text-purple-600" />
                  </div>
                  <span className="text-gray-700">{emp.no_hp || 'No. HP tidak ada'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-gray-600">{emp.alamat || 'Alamat tidak ada'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileText size={12} className="text-gray-400" />
                  <span className="text-gray-600">
                    Kontrak: {emp.awal_kontrak || 'N/A'} s/d {emp.akhir_kontrak || 'N/A'}
                  </span>
                </div>

                {/* sisa kontrak */}

                <div className="flex items-center gap-2 text-xs">
                  <FileText size={12} className="text-gray-400" />
                  <span
                    className={`px-2 py-1 rounded-full font-semibold ${contractInfo.badgeClass}`}
                  >
                    {contractInfo.label}
                  </span>
                </div>
              </div>

              {/* ... (Card Actions tidak diubah) ... */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => onDetailClick(emp)}
                  className="flex-1 bg-gray-50/80 hover:bg-gray-300 cursor-pointer text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  Detail
                </button>
                <button 
                  onClick={() => onEditClick(emp)} 
                  className="flex-1 bg-blue-50 hover:bg-blue-100 cursor-pointer text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteEmployee(emp.id)}
                  className="bg-red-50 hover:bg-red-2 00 text-red-700 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ... (Tampilan "Tidak ada karyawan" tidak diubah) ... */}
      {filteredEmployees.length === 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-xl text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {isLoading ? 'Mengambil data...' : 'Tidak ada karyawan ditemukan'}
          </h3>
          <p className="text-sm text-gray-600">
            {isLoading ? 'Mohon tunggu sebentar...' : 'Coba ubah filter atau tambahkan data karyawan baru.'}
          </p>
        </div>
      )}
    </>
  );
}