import { useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Calendar,
  User,
  Eye,
  X,
} from "lucide-react";
import PageHeader from '@/components/ui/PageHeader';

export default function IzinPage({ onMenuClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedIzin, setSelectedIzin] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Dummy data — nanti diganti fetch real dari backend
  const dummyIzin = [
    {
      id: 1,
      nama: "Dahen",
      nik: "1371096805060002",
      jabatan: "MARKETING",
      tanggal_izin: "2025-12-30",
      keterangan: "Sakit demam tinggi, istirahat 1 hari",
      status_izin: "pending",
      diajukan_pada: "2025-12-29",
    },
    {
      id: 2,
      nama: "Fauzi",
      nik: "3213132313",
      jabatan: "OPERATOR",
      tanggal_izin: "2025-12-28",
      keterangan: "Keponakan meninggal, pulang kampung",
      status_izin: "approved",
      diajukan_pada: "2025-12-27",
    },
    {
      id: 3,
      nama: "Dwadaw",
      nik: "213123",
      jabatan: "MARKETING",
      tanggal_izin: "2025-12-25",
      keterangan: "Izin cuti tahunan",
      status_izin: "rejected",
      diajukan_pada: "2025-12-24",
    },
  ];

  const [izinList] = useState(dummyIzin);

  const filteredIzin = izinList.filter((izin) => {
    const matchesSearch =
      izin.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      izin.nik.includes(searchTerm) ||
      izin.keterangan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || izin.status_izin === statusFilter;

    const matchesDate = !dateFilter || izin.tanggal_izin === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: izinList.length,
    pending: izinList.filter((i) => i.status_izin === "pending").length,
    approved: izinList.filter((i) => i.status_izin === "approved").length,
    rejected: izinList.filter((i) => i.status_izin === "rejected").length,
  };

  const handleApprove = (id) => {
    alert(`Izin ID ${id} disetujui! (Nanti integrasi backend)`);
  };

  const handleReject = (id) => {
    alert(`Izin ID ${id} ditolak! (Nanti integrasi backend)`);
  };

  return (
    <div className="p-6 lg:p-8">
         {/* Header */}
        <PageHeader
            title="Manajemen Izin Karyawan"
            description="Kelola pengajuan izin karyawan, setujui atau tolak sesuai kebutuhan."
            onMenuClick={onMenuClick}
         />    


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pengajuan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <FileText size={40} className="text-[#800020] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <Clock size={40} className="text-yellow-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disetujui</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <CheckCircle size={40} className="text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
            </div>
            <XCircle size={40} className="text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Karyawan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal Izin</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Keterangan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Diajukan</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIzin.map((izin) => (
                <tr key={izin.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#800020] to-[#a0002a] rounded-xl flex items-center justify-center text-white font-bold">
                        {izin.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{izin.nama}</p>
                        <p className="text-xs text-gray-500">NIK: {izin.nik} • {izin.jabatan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(izin.tanggal_izin).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <p className="truncate" title={izin.keterangan}>
                      {izin.keterangan}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        izin.status_izin === "approved"
                          ? "bg-green-100 text-green-800"
                          : izin.status_izin === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {izin.status_izin === "approved" ? (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Disetujui
                        </>
                      ) : izin.status_izin === "rejected" ? (
                        <>
                          <XCircle size={16} className="mr-2" />
                          Ditolak
                        </>
                      ) : (
                        <>
                          <Clock size={16} className="mr-2" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(izin.diajukan_pada).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedIzin(izin);
                          setShowDetail(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Detail"
                      >
                        <Eye size={18} />
                      </button>

                      {izin.status_izin === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(izin.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Setujui"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(izin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Tolak"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedIzin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText size={28} className="text-[#800020]" />
              Detail Pengajuan Izin
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nama Karyawan</p>
                  <p className="font-semibold text-gray-900">{selectedIzin.nama}</p>
                  <p className="text-sm text-gray-500">NIK: {selectedIzin.nik} • {selectedIzin.jabatan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Izin</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedIzin.tanggal_izin).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Keterangan</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedIzin.keterangan}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status Saat Ini</p>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedIzin.status_izin === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedIzin.status_izin === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedIzin.status_izin === "approved" ? "Disetujui" : 
                     selectedIzin.status_izin === "rejected" ? "Ditolak" : "Menunggu Persetujuan"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Diajukan Pada</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedIzin.diajukan_pada).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}