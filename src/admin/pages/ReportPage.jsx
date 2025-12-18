    // src/admin/pages/ReportPage.jsx
import React, { useMemo, useState } from 'react';
import { Download, Menu } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

/**
 * props:
 * - employees: array semua karyawan (opsional)
 * - employeesBerhenti: array karyawan berhenti (opsional)
 */
export default function ReportPage({ employees = [], employeesBerhenti = [], onMenuClick, }) {
  const thisYear = new Date().getFullYear();
  const [month, setMonth] = useState(''); // 1..12 as string
  const [year, setYear] = useState(String(thisYear));

  const months = [
    { value: '', label: '-- Pilih Bulan --' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  // contoh: filter employeesBerhenti by month/year on field endDate or tanggal_resign
  const filtered = useMemo(() => {
    if (!month || !year) return [];
    // asumsikan `endDate`, `tanggal_resign` atau `akhir_kontrak` tersedia di data
    const list = employeesBerhenti.filter((e) => {
      const dateStr = e.endDate || e.tanggal_resign || e.akhir_kontrak || e.tanggal_keluar || '';
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d)) return false;
      return (d.getMonth() + 1) === Number(month) && d.getFullYear() === Number(year);
    });
    return list;
  }, [month, year, employeesBerhenti]);

  const total = filtered.length;

  function exportCsv() {
    // buat CSV dari filtered. kalau kosong, export kosong.
    const rows = filtered.length ? filtered : [];
    // columns: id, name, department, position, endDate, reason
    const headers = ['ID', 'Nama', 'Departemen', 'Posisi', 'Tanggal Keluar', 'Alasan'];
    const csv = [
      headers.join(','),
      ...rows.map(r => {
        const id = (r.id || r.nik || '').toString().replace(/,/g, ' ');
        const nama = (r.nama || r.name || r.nama_karyawan || '').toString().replace(/,/g, ' ');
        const dept = (r.department || r.departemen || r.jabatan?.nama_jabatan || '').toString().replace(/,/g,' ');
        const pos = (r.position || r.posisi || r.jabatan?.nama || '').toString().replace(/,/g, ' ');
        const date = (r.endDate || r.tanggal_resign || r.akhir_kontrak || '').toString();
        const reason = (r.reason || r.alasan || r.keterangan || '').toString().replace(/,/g, ' ');
        return [id, nama, dept, pos, date, reason].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_keluar_${year}_${month || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>

      <PageHeader
        title="Laporan"
        description="Export data karyawan yang keluar per bulan"
        onMenuClick={onMenuClick}
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Export data karyawan yang keluar per bulan</h2>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Pilih Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Pilih Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="col-span-2">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
              <p className="text-xs text-gray-600">Total Data</p>
              <p className="text-3xl font-bold text-gray-800">{total}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={exportCsv}
              disabled={!month || !year}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                (!month || !year) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#800020] to-[#a0002a] text-white hover:shadow-lg'
              }`}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Empty/preview card (kanan bawah pada contoh) */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl text-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-4 text-3xl">📄</div>
          <h3 className="text-xl font-semibold mb-2">Pilih Periode Laporan</h3>
          <p className="text-sm text-gray-600">Silakan pilih bulan dan tahun untuk menampilkan dan mengexport data karyawan yang keluar pada periode tersebut.</p>
        </div>
      </div>
    </div>
  );
}
