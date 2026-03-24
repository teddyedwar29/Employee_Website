// src/admin/pages/KunjunganReportPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Search, MapPin, FileText } from "lucide-react";
import { BACKEND_BASE_URL, API_BASE_URL } from '@/utils/constants';
import PageHeader from '@/components/ui/PageHeader';
import { getKategoriKunjungan } from "@/services/ApiService";

// =============================================
// HELPER: Generate Excel Laporan Kunjungan
// =============================================
const generateExcelKunjungan = async (data, bulan, tahun, getNamaKategori) => {
  await new Promise((resolve, reject) => {
    if (window.ExcelJS) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  const ExcelJS = window.ExcelJS;

  const namaBulanStr = new Date(tahun, bulan - 1).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Kunjungan");

  // ── Lebar kolom
  ws.getColumn(1).width = 5;   // No
  ws.getColumn(2).width = 20;  // Tanggal
  ws.getColumn(3).width = 20;  // Nama
  ws.getColumn(4).width = 18;  // Departemen
  ws.getColumn(5).width = 12;  // ID Karyawan
  ws.getColumn(6).width = 10;  // Jam
  ws.getColumn(7).width = 25;  // Issue
  ws.getColumn(8).width = 22;  // Kategori Kunjungan

  // ── Helper style
  const styleHeader = (cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800020" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Arial" };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top:    { style: "thin", color: { argb: "FF999999" } },
      bottom: { style: "thin", color: { argb: "FF999999" } },
      left:   { style: "thin", color: { argb: "FF999999" } },
      right:  { style: "thin", color: { argb: "FF999999" } },
    };
  };

  const styleData = (cell, isEven, opts = {}) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? "FFFFFFFF" : "FFF5F5F5" } };
    cell.font = {
      bold: opts.bold || false,
      color: { argb: opts.fontColor || "FF000000" },
      size: 9,
      name: "Arial",
    };
    cell.alignment = { horizontal: opts.align || "center", vertical: "middle", wrapText: true };
    cell.border = {
      top:    { style: "thin", color: { argb: "FFD0D0D0" } },
      bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      left:   { style: "thin", color: { argb: "FFD0D0D0" } },
      right:  { style: "thin", color: { argb: "FFD0D0D0" } },
    };
  };

  // ── Baris 1: Judul
  ws.addRow([`LAPORAN KUNJUNGAN MARKETING - ${namaBulanStr.toUpperCase()}`]);
  ws.getRow(1).getCell(1).font = { bold: true, size: 13, name: "Arial" };
  ws.getRow(1).height = 22;
  ws.mergeCells(1, 1, 1, 8);

  // ── Baris 2: Tanggal cetak
  ws.addRow([`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`]);
  ws.getRow(2).getCell(1).font = { size: 9, name: "Arial", italic: true };
  ws.mergeCells(2, 1, 2, 8);

  // ── Baris 3: Kosong
  ws.addRow([]);

  // ── Baris 4: Header
  const headerRow = ws.addRow(["No", "Tanggal", "Nama", "Departemen", "ID Karyawan", "Jam", "Issue", "Kategori Kunjungan"]);
  ws.getRow(4).height = 20;
  headerRow.eachCell((cell) => styleHeader(cell));

  // ── Baris data
  data.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const row = ws.addRow([
      idx + 1,
      new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
      item.marketingName || "-",
      item.departemen || "-",
      item.id_karyawan || "-",
      item.jam || "-",
      item.issue || "-",
      item.nama_kategori_kunjungan || getNamaKategori(item.id_kategori_kunjungan) || "-",
    ]);
    row.height = 16;

    row.getCell(1).value && styleData(row.getCell(1), isEven); // No
    styleData(row.getCell(1), isEven);
    styleData(row.getCell(2), isEven, { align: "left" });  // Tanggal
    styleData(row.getCell(3), isEven, { bold: true, align: "left" }); // Nama
    styleData(row.getCell(4), isEven, { align: "left" });  // Departemen
    styleData(row.getCell(5), isEven);                     // ID
    styleData(row.getCell(6), isEven);                     // Jam
    styleData(row.getCell(7), isEven, { align: "left" });  // Issue
    styleData(row.getCell(8), isEven, { align: "left" });  // Kategori
  });

  // ── Baris keterangan
  ws.addRow([]);
  const ketRow = ws.addRow([`Total Kunjungan: ${data.length}`]);
  ketRow.getCell(1).font = { size: 9, bold: true, name: "Arial" };

  // ── Download
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Kunjungan_${namaBulanStr.replace(" ", "_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// =============================================
// MODAL PILIH BULAN & TAHUN
// =============================================
function ModalLaporanKunjungan({ onClose, onGenerate }) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const tahunOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <FileText size={18} className="text-[#800020]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Unduh Laporan Kunjungan</h3>
              <p className="text-xs text-gray-400">Pilih periode laporan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bulan</label>
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-sm"
          >
            {namaBulan.map((nama, i) => (
              <option key={i + 1} value={i + 1}>{nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-sm"
          >
            {tahunOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={() => onGenerate(bulan, tahun)}
            className="flex-1 px-4 py-2.5 bg-[#800020] text-white rounded-xl text-sm font-semibold hover:bg-[#6a001a] transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={15} />
            Unduh Excel
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN PAGE
// =============================================
export default function KunjunganReportPage({ onMenuClick }) {
  const [kunjunganList, setKunjunganList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state — hanya 1 tanggal
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [previewFoto, setPreviewFoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Modal laporan
  const [showModal, setShowModal] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const fetchKunjunganReport = async (tanggal = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Token tidak ditemukan. Silakan login kembali.", "error");
        return;
      }

      let url = `${API_BASE_URL}/kunjungan-report/AE`;
      const params = new URLSearchParams();

      // Filter 1 tanggal → kirim sebagai start_date & end_date yang sama
      if (tanggal) {
        params.append("start_date", tanggal);
        params.append("end_date", tanggal);
      }

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setKunjunganList([]);
          setFilteredList([]);
          return;
        }
        if (response.status === 401 || response.status === 403) {
          Swal.fire("Error", "Akses ditolak atau sesi berakhir", "error");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        let allKunjungan = [];
        if (Array.isArray(data.data)) {
          data.data.forEach((daily) => {
            if (daily.fotos && Array.isArray(daily.fotos)) {
              daily.fotos.forEach((fotoItem) => {
                allKunjungan.push({
                  ...fotoItem,
                  tanggal: daily.tanggal || new Date().toISOString().split("T")[0],
                  marketingName: daily.nama_karyawan || "Marketing",
                  departemen: daily.departemen || "-",
                  id_karyawan: daily.id_karyawan || "-",
                });
              });
            }
          });
        }
        allKunjungan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setKunjunganList(allKunjungan);
        setFilteredList(allKunjungan);
      } else {
        setKunjunganList([]);
        setFilteredList([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error", "Gagal memuat data kunjungan", "error");
      setKunjunganList([]);
      setFilteredList([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredList.length / limit);
  const paginatedData = filteredList.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [searchTerm, filterDate]);

  useEffect(() => {
    fetchKunjunganReport(filterDate);
  }, [filterDate]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(kunjunganList);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = kunjunganList.filter(
      (item) =>
        item.marketingName?.toLowerCase().includes(lowerSearch) ||
        item.tanggal?.includes(searchTerm)
    );
    setFilteredList(filtered);
  }, [searchTerm, kunjunganList]);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await getKategoriKunjungan();
        if (res.status === "success") setKategoriList(res.data);
      } catch (err) {
        console.error("Gagal fetch kategori kunjungan", err);
      }
    };
    fetchKategori();
  }, []);

  const getNamaKategori = (id) => {
    const kat = kategoriList.find((k) => k.id === id);
    return kat?.nama_kategori || "-";
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

  // Handler generate Excel
  const handleGenerateExcel = async (bulan, tahun) => {
    setShowModal(false);
    setLoadingExcel(true);
    try {
      const token = localStorage.getItem("access_token");
      const start = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
      const lastDay = new Date(tahun, bulan, 0).getDate();
      const end = `${tahun}-${String(bulan).padStart(2, "0")}-${lastDay}`;

      const res = await fetch(
        `${API_BASE_URL}/kunjungan-report/AE?start_date=${start}&end_date=${end}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (res.status === 404) {
        Swal.fire("Info", "Tidak ada data kunjungan pada periode ini.", "info");
        return;
      }
      if (!res.ok) throw new Error("Gagal mengambil data kunjungan");

      const json = await res.json();
      if (!json.success || !json.data?.length) {
        Swal.fire("Info", "Tidak ada data kunjungan pada periode ini.", "info");
        return;
      }

      // Flatten data sama seperti fetchKunjunganReport
      let allKunjungan = [];
      json.data.forEach((daily) => {
        if (daily.fotos && Array.isArray(daily.fotos)) {
          daily.fotos.forEach((fotoItem) => {
            allKunjungan.push({
              ...fotoItem,
              tanggal: daily.tanggal || new Date().toISOString().split("T")[0],
              marketingName: daily.nama_karyawan || "Marketing",
              departemen: daily.departemen || "-",
              id_karyawan: daily.id_karyawan || "-",
            });
          });
        }
      });
      allKunjungan.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

      await generateExcelKunjungan(allKunjungan, bulan, tahun, getNamaKategori);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal Membuat Laporan", text: err.message });
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Riwayat Kunjungan Marketing"
        description="Monitoring bukti kunjungan outlet seluruh marketing"
        onMenuClick={onMenuClick}
      />

      {/* FILTER SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama marketing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          {/* Filter 1 tanggal */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {(searchTerm || filterDate) && (
            <button
              onClick={() => { setSearchTerm(""); setFilterDate(""); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium text-sm"
            >
              Reset Filter
            </button>
          )}

          {/* Tombol Laporan */}
          <button
            onClick={() => setShowModal(true)}
            disabled={loadingExcel}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#6a001a] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed sm:ml-auto"
          >
            {loadingExcel ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Membuat Laporan...
              </>
            ) : (
              <>
                <FileText size={16} />
                Cetak Laporan
              </>
            )}
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#800020]"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat kunjungan...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Tidak ada data kunjungan pada filter ini</p>
        </div>
      )}

      {/* GRID CARD VIEW */}
      {!loading && filteredList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={item.foto ? `${BACKEND_BASE_URL}${item.foto}` : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNS4wMDAxIDM1LjAwMDFDMzUuMDAwMSAzMS42NjY4IDMyLjMzMzQgMjguOTk5OSAyOS4wMDAxIDI4Ljk5OTlIMjEuMDAwMUMxNy42NjY4IDI4Ljk5OTkgMTUuMDAwMSAzMS42NjY4IDE1LjAwMDEgMzUuMDAwMVYzOC4wMDAxQzE1LjAwMDEgNDAuMjA5MSAxNi43OTEgNDIuMDAwMSAxOS4wMDAxIDQyLjAwMDFIMzEuMDAwMUMzMy4yMDkxIDQyLjAwMDEgMzUuMDAwMSA0MC4yMDkxIDM1LjAwMDEgMzguMDAwMVYzNS4wMDAxWiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIxOCIgcj0iNyIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K"}
                  alt="Bukti kunjungan"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    if (!item.foto) return;
                    setPreviewFoto(`${BACKEND_BASE_URL}${item.foto}`);
                    setShowPreview(true);
                  }}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                  {formatDate(item.tanggal)}
                </div>
              </div>

              <div className="p-5">
                <p className="font-bold text-lg text-gray-900">{item.marketingName || "Marketing"}</p>

                {(item.nama_kategori_kunjungan || item.id_kategori_kunjungan) && (
                  <span className="inline-block mt-2 mb-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {item.nama_kategori_kunjungan || getNamaKategori(item.id_kategori_kunjungan)}
                  </span>
                )}

                {item.issue && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Issue:</span> {item.issue}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">Jam: {item.jam || "-:-:-"}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                  <MapPin size={16} />
                  {item.latitude && item.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {parseFloat(item.latitude).toFixed(6)}, {parseFloat(item.longitude).toFixed(6)}
                    </a>
                  ) : (
                    "Lokasi tidak tersedia"
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL LAPORAN */}
      {showModal && (
        <ModalLaporanKunjungan
          onClose={() => setShowModal(false)}
          onGenerate={handleGenerateExcel}
        />
      )}

      {/* PREVIEW FOTO */}
      {previewFoto && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-0"}`}
          onClick={() => { setShowPreview(false); setTimeout(() => setPreviewFoto(null), 300); }}
        >
          <div
            className={`bg-white rounded-xl max-w-4xl w-full p-4 relative transform transition-all duration-300 ${showPreview ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              onClick={() => { setShowPreview(false); setTimeout(() => setPreviewFoto(null), 300); }}
            >✕</button>
            <img src={previewFoto} alt="Preview Kunjungan" className="w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}