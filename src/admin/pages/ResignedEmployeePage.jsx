// File: src/admin/pages/ResignedEmployeePage.jsx
import React, { useMemo, useState } from 'react';
import {
  Search,
  Calendar,
  Users,
  UserCircle,
  TrendingUp,
  MapPin,
  Phone,
  FileText,
  UserX,
} from 'lucide-react';
import { Eye, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';


// Helper ambil nama jabatan / status kerja (optional, kalau mau dipakai)
const getJabatanName = (id, jabatanOptions) => {
  if (!jabatanOptions) return '...';
  const jabatan = jabatanOptions.find(j => j.id == id);
  return jabatan ? (jabatan.nama_jabatan || jabatan.nama) : 'N/A';
};

export default function ResignedEmployeePage({
  employeesBerhenti,   // array karyawan yang status_kerja = "berhenti"
  jabatanOptions = [],
  onMenuClick
}) {
  // --- STATE FILTER ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('Semua');
  const [filterExitType, setFilterExitType] = useState('Semua');

  // --- DEPARTEMEN UNTUK DROPDOWN ---
  const allDepartments = useMemo(
    () => ['Semua', ...Array.from(new Set(
      employeesBerhenti
        .map(e => e.jabatan?.nama_jabatan)
        .filter(Boolean)
    ))],
    [employeesBerhenti]
  );

  // NOTE:
  // Kalau nanti kamu punya kolom `tipe_keluar` (Resign / Habis Kontrak),
  // pakai itu. Untuk sekarang kita fallback ke 'Berhenti'.
  const filteredResignedEmployees = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return employeesBerhenti.filter(emp => {
      const nama = (emp.nama || '').toLowerCase();
      const id = (emp.id || '').toLowerCase();
      const alasan = (emp.alasan_keluar || '').toLowerCase();
      const jabatan = (emp.jabatan?.nama_jabatan || '').toLowerCase();

      const matchSearch =
        nama.includes(q) || id.includes(q) || alasan.includes(q) || jabatan.includes(q);

      const matchDept =
        filterDepartment === 'Semua' ||
        emp.jabatan?.nama_jabatan === filterDepartment;

      const exitType = emp.tipe_keluar || 'Berhenti';
      const matchExitType =
        filterExitType === 'Semua' || exitType === filterExitType;

      return matchSearch && matchDept && matchExitType;
    });
  }, [employeesBerhenti, searchTerm, filterDepartment, filterExitType]);

  const totalKeluar = employeesBerhenti.length;

  // Kalau nanti punya tipe_keluar, ini bakal kebaca otomatis
  const totalResign = employeesBerhenti.filter(e => (e.tipe_keluar || 'Berhenti') === 'Resign').length;
  const totalHabisKontrak = employeesBerhenti.filter(e => (e.tipe_keluar || 'Berhenti') === 'Habis Kontrak').length;

  return (
    <>
      <PageHeader
        title="Karyawan Berhenti"
        description="Daftar karyawan yang sudah mengundurkan diri / habis kontrak"
        onMenuClick={onMenuClick}
      />

      {/* FILTER SECTION */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Cari */}
          <div className="md:col-span-4">
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
                placeholder="Cari nama, ID, alasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
              />
            </div>
          </div>

          {/* Departemen */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Departemen
            </label>
            <div className="relative">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] appearance-none text-sm"
              >
                {allDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Tipe Keluar */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Tipe Keluar
            </label>
            <div className="relative">
              <select
                value={filterExitType}
                onChange={(e) => setFilterExitType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] appearance-none text-sm"
              >
                <option value="Semua">Semua</option>
                <option value="Resign">Resign</option>
                <option value="Habis Kontrak">Habis Kontrak</option>
                {/* fallback kalau datanya belum pakai dua tipe di atas */}
                <option value="Berhenti">Berhenti</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Kartu Total Keluar */}
          <div className="md:col-span-2">
            <div className="bg-red-50 px-4 py-3 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Total Keluar</p>
              <p className="text-2xl font-bold text-red-600">{totalKeluar}</p>
            </div>
          </div>
        </div>

        {/* Summary kecil */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Menampilkan</span>
            <span className="text-xs font-bold text-[#800020]">
              {filteredResignedEmployees.length}
            </span>
            <span className="text-xs text-gray-600">
              dari {totalKeluar} karyawan
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">
                Resign ({totalResign})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">
                Habis Kontrak ({totalHabisKontrak})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResignedEmployees.map((emp) => {
          const namaJabatan = getJabatanName(emp.id_jabatan_karyawan, jabatanOptions);
          const exitType = emp.tipe_keluar || 'Berhenti';

          return (
            <div
              key={emp.id}
              className={`bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all border-l-4 ${
                exitType === 'Resign' ? 'border-red-400' : 'border-orange-400'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg opacity-80">
                    {(emp.nama || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{emp.nama}</h3>
                    <p className="text-xs text-gray-500">{emp.id}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    exitType === 'Resign'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {exitType}
                </span>
              </div>

              {/* Info utama */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserCircle size={14} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700">{namaJabatan}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={14} className="text-purple-600" />
                  </div>
                  <span className="text-gray-700">{emp.jabatan?.nama_jabatan || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-gray-600">{emp.alamat || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone size={12} className="text-gray-400" />
                  <span className="text-gray-600">{emp.no_hp || '-'}</span>
                </div>
              </div>

              {/* Info keluar */}
              <div
                className={`rounded-xl p-3 mb-4 ${
                  exitType === 'Resign' ? 'bg-red-50' : 'bg-orange-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <FileText
                    size={14}
                    className={`mt-0.5 ${
                      exitType === 'Resign' ? 'text-red-600' : 'text-orange-600'
                    }`}
                  />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    {exitType === 'Resign' ? 'Alasan Resign:' : 'Keterangan:'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {emp.alasan_keluar || '-'}
                  </p>
                </div>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs text-gray-600 pt-2 border-t ${
                    exitType === 'Resign' ? 'border-red-100' : 'border-orange-100'
                  }`}
                >
                  <Calendar
                    size={12}
                    className={exitType === 'Resign' ? 'text-red-600' : 'text-orange-600'}
                  />
                  <span>
                    {exitType === 'Resign' ? 'Tanggal Resign:' : 'Berakhir:'}{' '}
                    {emp.tanggal_keluar || emp.akhir_kontrak || '-'}
                  </span>
                </div>
              </div>

              {/* Actions (nanti bisa dihubungkan ke detail / delete) */}
              <div className="flex gap-2 pt-4 border-top border-gray-200">
                <button className="flex-1 bg-gray-50/80 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1">
                  <Eye size={14} />
                  Detail
                </button>
                <button className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kalau tidak ada data */}
      {filteredResignedEmployees.length === 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-xl text-center mt-4">
          <UserX className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Tidak ada data karyawan berhenti
          </h3>
          <p className="text-sm text-gray-600">
            Coba ubah filter atau kata kunci pencarian.
          </p>
        </div>
      )}
    </>
  );
}
