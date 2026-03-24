import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Search, Calendar, Building2, FileText } from "lucide-react";
import PageHeader from '@/components/ui/PageHeader';
import Pagination from "@/components/ui/Pagination";
import { BACKEND_BASE_URL, API_BASE_URL } from '@/utils/constants';
import { getDepartemenOptions } from '@/services/ApiService';

// =============================================
// HELPER: Deteksi shift & cek keterlambatan OPERATOR
// Shift 1: 07:00 (toleransi s/d 07:10)
// Shift 2: 15:00 (toleransi s/d 15:10)
// Shift 3: 22:00 (toleransi s/d 22:10)
// =============================================
const getShiftInfo = (jamIn) => {
  if (!jamIn) return { label: "-", terlambat: false };
  const [h, m] = jamIn.split(":").map(Number);
  const totalMenit = h * 60 + m;

  // Shift 1: masuk antara 05:00–09:00
  if (totalMenit >= 300 && totalMenit < 540) {
    const terlambat = totalMenit > 7 * 60 + 20; // > 07:10
    return { label: jamIn.slice(0, 5), terlambat };
  }
  // Shift 2: masuk antara 13:00–17:00
  if (totalMenit >= 780 && totalMenit < 1020) {
    const terlambat = totalMenit > 15 * 60 + 20; // > 15:10
    return { label: jamIn.slice(0, 5), terlambat };
  }
  // Shift 3: masuk antara 20:00–24:00 atau 00:00–02:00
  if (totalMenit >= 1200 || totalMenit < 120) {
    const menit22 = 22 * 60 + 20;
    const terlambat = totalMenit >= 120
      ? totalMenit > menit22
      : false; // masuk tengah malam tidak dianggap terlambat
    return { label: jamIn.slice(0, 5), terlambat };
  }

  return { label: jamIn.slice(0, 5), terlambat: false };
};

// =============================================
// HELPER: Generate PDF Laporan Absensi Bulanan
// Format pivot: per karyawan 1 baris, kolom = tiap hari (M/K)
// install: npm install jspdf jspdf-autotable
// =============================================
const generateExcel = async (absensiData, izinData, bulan, tahun, dept) => {
  // Load ExcelJS via CDN — support full styling (border, fill, font color)
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
  const jumlahHari = new Date(tahun, bulan, 0).getDate();
  const totalCols = 4 + jumlahHari * 2 + 3;
  const hColIdx = 4 + jumlahHari * 2; // 1-indexed nanti di ExcelJS +1

  // Mapping izin
  const izinSet = new Set();
  (izinData || []).forEach((iz) => {
    izinSet.add(`${iz.id_karyawan.toLowerCase()}|${iz.tanggal}`);
  });

  // Group absensi per karyawan
  const karyawanMap = {};
  absensiData.forEach((item) => {
    const key = (item.id_karyawan || "").toLowerCase();
    if (!karyawanMap[key]) {
      karyawanMap[key] = {
        id: item.id_karyawan,
        nama: item.nama_karyawan || "-",
        dept: item.nama_departemen || "-",
        hariMap: {},
      };
    }
    karyawanMap[key].hariMap[item.tanggal] = {
      jam_in: item.jam_in,
      jam_out: item.jam_out,
    };
  });
  const karyawanList = Object.values(karyawanMap);

  // ── Workbook & Sheet
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Absensi", { views: [{ state: "frozen", xSplit: 4, ySplit: 5 }] });

  // ── Lebar kolom
  ws.getColumn(1).width = 5;  // No
  ws.getColumn(2).width = 12; // ID
  ws.getColumn(3).width = 22; // Nama
  ws.getColumn(4).width = 14; // Dept
  for (let d = 0; d < jumlahHari; d++) {
    ws.getColumn(5 + d * 2).width = 7;     // M
    ws.getColumn(5 + d * 2 + 1).width = 7; // K
  }
  ws.getColumn(hColIdx + 1).width = 6; // H
  ws.getColumn(hColIdx + 2).width = 6; // T
  ws.getColumn(hColIdx + 3).width = 6; // I
  ws.getColumn(hColIdx + 4).width = 8; // Total

  // ── Helper style
  const styleHeader = (cell, extraFont = {}) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800020" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9, name: "Arial", ...extraFont };
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
      size: 8,
      name: "Arial",
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top:    { style: "thin", color: { argb: "FFD0D0D0" } },
      bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      left:   { style: "thin", color: { argb: "FFD0D0D0" } },
      right:  { style: "thin", color: { argb: "FFD0D0D0" } },
    };
  };

  // ── Baris 1: Judul
  ws.addRow([`LAPORAN ABSENSI KARYAWAN - ${namaBulanStr.toUpperCase()}${dept ? " - " + dept : ""}`]);
  ws.getRow(1).getCell(1).font = { bold: true, size: 13, name: "Arial" };
  ws.getRow(1).height = 20;

  // ── Baris 2: Tanggal cetak
  ws.addRow([`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`]);
  ws.getRow(2).getCell(1).font = { size: 9, name: "Arial", italic: true };

  // ── Baris 3: Kosong
  ws.addRow([]);

  // ── Baris 4: Header hari
  const headerRow1 = ws.addRow([]); // row 4
  ws.getRow(4).height = 18;
  // Kolom tetap
  ["No", "ID Karyawan", "Nama Karyawan", "Departemen"].forEach((v, i) => {
    const cell = headerRow1.getCell(i + 1);
    cell.value = v;
    styleHeader(cell);
  });
  // Angka hari
  for (let d = 1; d <= jumlahHari; d++) {
    const c = 4 + (d - 1) * 2 + 1; // 1-indexed
    const cell = headerRow1.getCell(c);
    cell.value = d;
    styleHeader(cell);
    // merge horizontal hari ke M & K
    ws.mergeCells(4, c, 4, c + 1);
  }
  // H T I
  ["H", "T", "I", "Total"].forEach((v, i) => {
    const cell = headerRow1.getCell(hColIdx + 1 + i);
    cell.value = v;
    styleHeader(cell, { size: 10 });
  });

  // ── Baris 5: Sub-header M / K
  const headerRow2 = ws.addRow([]); // row 5
  ws.getRow(5).height = 16;
  // Kolom tetap — merge vertikal baris 4 & 5
  for (let c = 1; c <= 4; c++) {
    styleHeader(headerRow2.getCell(c));
    ws.mergeCells(4, c, 5, c);
  }
  // M & K per hari
  for (let d = 0; d < jumlahHari; d++) {
    const cM = 5 + d * 2;
    const cK = 6 + d * 2;
    const cellM = headerRow2.getCell(cM);
    const cellK = headerRow2.getCell(cK);
    cellM.value = "M";
    cellK.value = "K";
    styleHeader(cellM);
    styleHeader(cellK);
  }
  // H T I — merge vertikal baris 4 & 5
  for (let i = 0; i < 4; i++) {
    const c = hColIdx + 1 + i;
    styleHeader(headerRow2.getCell(c));
    ws.mergeCells(4, c, 5, c);
  }

  // ── Baris data karyawan
  karyawanList.forEach((kar, rowIdx) => {
    const isOperator = kar.dept.toUpperCase() === "OPERATOR";
    const isEven = rowIdx % 2 === 0;
    const excelRow = ws.addRow([]); // row 6+
    excelRow.height = 15;

    let totalHadir = 0, totalTerlambat = 0, totalIzin = 0;

    // Kolom tetap
    const dataFixed = [rowIdx + 1, kar.id, kar.nama, kar.dept];
    dataFixed.forEach((v, i) => {
      const cell = excelRow.getCell(i + 1);
      cell.value = v;
      styleData(cell, isEven, { bold: i === 2 }); // Nama bold
      if (i <= 1) cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Kolom hari
    for (let d = 1; d <= jumlahHari; d++) {
      const tglStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rekap = kar.hariMap[tglStr];
      const adaIzin = izinSet.has(`${kar.id.toLowerCase()}|${tglStr}`);
      const cM = 4 + (d - 1) * 2 + 1; // 1-indexed
      const cK = cM + 1;

      const cellM = excelRow.getCell(cM);
      const cellK = excelRow.getCell(cK);

      if (rekap) {
        totalHadir++;
        let jamMasuk = rekap.jam_in ? rekap.jam_in.slice(0, 5) : "-";
        let terlambat = false;
        if (isOperator) {
          const info = getShiftInfo(rekap.jam_in);
          jamMasuk = info.label;
          terlambat = info.terlambat;
        }
        if (terlambat) totalTerlambat++;

        cellM.value = jamMasuk;
        cellK.value = rekap.jam_out ? rekap.jam_out.slice(0, 5) : "-";
        styleData(cellM, isEven, { bold: terlambat, fontColor: terlambat ? "FFCC0000" : "FF000000" });
        styleData(cellK, isEven);
      } else if (adaIzin) {
        totalIzin++;
        cellM.value = "I";
        cellK.value = "-";
        styleData(cellM, isEven, { bold: true, fontColor: "FF0070C0" });
        styleData(cellK, isEven);
      } else {
        cellM.value = "-";
        cellK.value = "-";
        styleData(cellM, isEven, { fontColor: "FFAAAAAA" });
        styleData(cellK, isEven, { fontColor: "FFAAAAAA" });
      }
    }

    // Kolom summary H T I
    const cellH = excelRow.getCell(hColIdx + 1);
    const cellT = excelRow.getCell(hColIdx + 2);
    const cellI = excelRow.getCell(hColIdx + 3);
    cellH.value = totalHadir;
    cellT.value = totalTerlambat;
    cellI.value = totalIzin;
    styleData(cellH, isEven, { bold: true, fontColor: "FF0064B4" });
    styleData(cellT, isEven, { bold: true, fontColor: totalTerlambat > 0 ? "FFCC0000" : "FF000000" });
    styleData(cellI, isEven, { bold: true });

    const cellTotal = excelRow.getCell(hColIdx + 4);
    cellTotal.value = totalHadir + totalIzin + totalTerlambat;
    styleData(cellTotal, isEven, { bold: true, fontColor: "FF006400" });
  });

  // ── Baris keterangan
  ws.addRow([]);
  const ketRow = ws.addRow(["Keterangan: M = Jam Masuk | K = Jam Keluar | H = Hadir | T = Terlambat | I = Izin | Merah = Terlambat"]);
  ketRow.getCell(1).font = { size: 8, italic: true, name: "Arial" };

  // ── Download
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Absensi_${namaBulanStr.replace(" ", "_")}${dept ? "_" + dept : ""}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// =============================================
// MODAL PILIH BULAN & TAHUN
// =============================================
function ModalLaporan({ onClose, onGenerate, deptOptions = [] }) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [selectedDeptModal, setSelectedDeptModal] = useState("");

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
        {/* Header modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <FileText size={18} className="text-[#800020]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Unduh Laporan Absensi</h3>
              <p className="text-xs text-gray-400">Pilih periode laporan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Pilih Bulan */}
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

        {/* Pilih Tahun */}
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

        {/* filter by departemen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Departemen</label>
          <select
            value={selectedDeptModal}
            onChange={(e) => setSelectedDeptModal(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020] focus:outline-none text-sm"
          >
            <option value="">Semua Departemen</option>
            {deptOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Tombol */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={() => onGenerate(bulan, tahun, selectedDeptModal)}
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
export default function AbsensiReportPage({ onMenuClick }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [absensiList, setAbsensiList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // ← TAMBAHAN: state modal laporan
  const [showModalLaporan, setShowModalLaporan] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Departemen options
  const [departemenOptions, setDepartemenOptions] = useState(["Semua"]);

  const BACKEND_URL = API_BASE_URL;
  const placeholderFoto = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNS4wMDAxIDM1LjAwMDFDMzUuMDAwMSAzMS42NjY4IDMyLjMzMzQgMjguOTk5OSAyOS4wMDAxIDI4Ljk5OTlIMjEuMDAwMUMxNy42NjY4IDI4Ljk5OTkgMTUuMDAwMSAzMS42NjY4IDE1LjAwMDEgMzUuMDAwMVYzOC4wMDAxQzE1LjAwMDEgNDAuMjA5MSAxNi43OTEgNDIuMDAwMSAxOS4wMDAxIDQyLjAwMDFIMzEuMDAwMUMzMy4yMDkxIDQyLjAwMDEgMzUuMDAwMSA0MC4yMDkxIDM1LjAwMDEgMzguMDAwMVYzNS4wMDAxWiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIxOCIgcj0iNyIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K";

  const fetchAbsensiReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Token tidak ditemukan. Silakan login kembali.", "error");
        return;
      }

      let url = `${BACKEND_URL}/absensi/report`;
      const params = new URLSearchParams();

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (selectedDept && selectedDept !== "Semua") {
        params.append("departemen", selectedDept);
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
        if (response.status === 401) {
          Swal.fire({ icon: "error", title: "Unauthorized", text: "Sesi login Anda telah berakhir atau Anda tidak memiliki akses." });
          window.location.href = "/login";
          return;
        }
        if (response.status === 403) {
          Swal.fire({ icon: "warning", title: "Akses Ditolak", text: "Anda tidak memiliki izin untuk mengakses halaman ini." });
          return;
        }
        if (response.status === 404) {
          setAbsensiList([]);
          setFilteredList([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const sorted = data.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setAbsensiList(sorted);
        setFilteredList(sorted);
      } else {
        setAbsensiList([]);
        setFilteredList([]);
        if (data.message) Swal.fire("Info", data.message, "info");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal Memuat Data", text: err.message || "Terjadi kesalahan saat mengambil data absensi" });
      setAbsensiList([]);
      setFilteredList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDept = async () => {
      try {
        const json = await getDepartemenOptions();
        if (json.success && json.data) {
          const names = json.data.map((d) => d.nama_departemen);
          setDepartemenOptions(["Semua", ...names]);
        }
      } catch (err) {
        console.error("Gagal fetch departemen", err);
      }
    };
    fetchDept();
  }, []);

  useEffect(() => {
    fetchAbsensiReport();
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, selectedDept]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(absensiList);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = absensiList.filter(
      (item) =>
        item.karyawan?.nama?.toLowerCase().includes(lowerSearch) ||
        item.karyawan?.nik?.includes(searchTerm) ||
        item.karyawan?.jabatan?.nama_jabatan?.toLowerCase().includes(lowerSearch)
    );
    setFilteredList(filtered);
  }, [searchTerm, absensiList]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const formatTime = (time) => (time ? time.slice(0, 5) : "--:--");

  const hitungDurasi = (inTime, outTime) => {
    if (!inTime || !outTime) return "--";
    const [h1, m1] = inTime.split(":").map(Number);
    const [h2, m2] = outTime.split(":").map(Number);
    let hours = h2 - h1, minutes = m2 - m1;
    if (minutes < 0) { minutes += 60; hours -= 1; }
    if (hours < 0) hours += 24;
    return `${hours}j ${minutes}m`;
  };

  // handler generate PDF (pivot per karyawan)
  const handleGeneratePDF = async (bulan, tahun, dept) => {
    setShowModalLaporan(false);
    setLoadingPDF(true);

    try {
      const token = localStorage.getItem("access_token");
      const start = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
      const lastDay = new Date(tahun, bulan, 0).getDate();
      const end = `${tahun}-${String(bulan).padStart(2, "0")}-${lastDay}`;

      // Fetch absensi & izin secara paralel
      const [resAbsensi, resIzin] = await Promise.all([
        fetch(
          `${BACKEND_URL}/absensi/report?start_date=${start}&end_date=${end}${dept ? `&departemen=${dept}` : ""}`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        ),
        fetch(
          `${BACKEND_URL}/izin/my-history?from=${start}&to=${end}`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        ),
      ]);

      if (!resAbsensi.ok) throw new Error("Gagal mengambil data absensi");

      const jsonAbsensi = await resAbsensi.json();
      const jsonIzin = resIzin.ok ? await resIzin.json() : { data: [] };

      if (!jsonAbsensi.success || !jsonAbsensi.data?.length) {
        Swal.fire("Info", "Tidak ada data absensi pada periode ini.", "info");
        return;
      }

      const absensiData = jsonAbsensi.data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      const izinData = jsonIzin.success ? (jsonIzin.data || []) : [];

      await generateExcel(absensiData, izinData, bulan, tahun, dept);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal Membuat Laporan", text: err.message });
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER */}
      <PageHeader
        title="Riwayat Absensi Karyawan"
        description="Monitoring absensi seluruh karyawan perusahaan"
        onMenuClick={onMenuClick}
      />

      {/* FILTER SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020]"
          />

          <div className="relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#800020] appearance-none"
            >
              {departemenOptions.map((dept) => (
                <option key={dept} value={dept === "Semua" ? "" : dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ← BARIS BAWAH FILTER: Reset + Tombol Laporan */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {(searchTerm || startDate || endDate || selectedDept) && (
            <button
              onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); setSelectedDept(""); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium text-sm"
            >
              Reset Filter
            </button>
          )}

          {/* TOMBOL LAPORAN PDF ← TAMBAHAN */}
          <button
            onClick={() => setShowModalLaporan(true)}
            disabled={loadingPDF}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#6a001a] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed sm:ml-auto"
          >
            {loadingPDF ? (
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
          <p className="mt-4 text-gray-600">Memuat riwayat absensi...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Tidak ada data absensi pada filter ini</p>
        </div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && filteredList.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">No</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID Karyawan</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nama Karyawan</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Departemen</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jabatan</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Foto Masuk</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jam Masuk</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Foto Keluar</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jam Keluar</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Durasi</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{startIndex + idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatDate(item.tanggal)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.id_karyawan || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nama_karyawan || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.nama_departemen || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.nama_jabatan || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <img
                          src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                          alt="Masuk"
                          className="w-12 h-12 rounded-lg object-cover mx-auto border"
                          onClick={() => { if (!item.foto_in) return; setPreviewFoto(`${BACKEND_BASE_URL}/${item.foto_in}`); setShowPreview(true); }}
                          onError={(e) => (e.target.src = placeholderFoto)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(item.jam_in)}</td>
                      <td className="px-6 py-4 text-center">
                        <img
                          src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                          alt="Keluar"
                          className="w-12 h-12 rounded-lg object-cover mx-auto border"
                          onClick={() => { if (!item.foto_out) return; setPreviewFoto(`${BACKEND_BASE_URL}/${item.foto_out}`); setShowPreview(true); }}
                          onError={(e) => (e.target.src = placeholderFoto)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(item.jam_out)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hitungDurasi(item.jam_in, item.jam_out)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Hadir</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="lg:hidden space-y-4">
            {paginatedList.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">#{startIndex + idx + 1} • {formatDate(item.tanggal)}</p>
                    <p className="text-xs text-gray-500">ID: {item.id_karyawan || "-"}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Hadir</span>
                </div>
                <div className="border-t pt-3 space-y-1 text-sm">
                  <p><span className="text-gray-500">Nama:</span> <span className="font-medium">{item.nama_karyawan || "-"}</span></p>
                  <p><span className="text-gray-500">Departemen:</span> {item.nama_departemen || "-"}</p>
                  <p><span className="text-gray-500">Jabatan:</span> {item.nama_jabatan || "-"}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Absen Masuk</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                      alt="Masuk" className="w-20 h-20 rounded-lg object-cover border"
                      onClick={() => { if (!item.foto_in) return; setPreviewFoto(`${BACKEND_BASE_URL}/${item.foto_in}`); setShowPreview(true); }}
                      onError={(e) => (e.target.src = placeholderFoto)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Jam Masuk</p>
                      <p className="text-sm text-gray-600">{formatTime(item.jam_in)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Absen Keluar</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                      alt="Keluar" className="w-20 h-20 rounded-lg object-cover border"
                      onClick={() => { if (!item.foto_out) return; setPreviewFoto(`${BACKEND_BASE_URL}/${item.foto_out}`); setShowPreview(true); }}
                      onError={(e) => (e.target.src = placeholderFoto)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Jam Keluar</p>
                      <p className="text-sm text-gray-600">{formatTime(item.jam_out)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3 text-center">
                  <p className="text-xs text-gray-500">Durasi Kerja</p>
                  <p className="text-sm font-bold text-blue-900">{hitungDurasi(item.jam_in, item.jam_out)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* MODAL LAPORAN ← TAMBAHAN */}
      {showModalLaporan && (
        <ModalLaporan
          onClose={() => setShowModalLaporan(false)}
          onGenerate={handleGeneratePDF}
          deptOptions={departemenOptions.filter((d) => d !== "Semua")}
        />
      )}

      {previewFoto && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-0"}`}
          onClick={() => { setShowPreview(false); setTimeout(() => setPreviewFoto(null), 300); }}
        >
          <div
            className={`bg-white rounded-xl max-w-3xl w-full p-4 relative transform transition-all duration-300 ${showPreview ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              onClick={() => { setShowPreview(false); setTimeout(() => setPreviewFoto(null), 300); }}
            >✕</button>
            <img src={previewFoto} alt="Preview Absensi" className="w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}