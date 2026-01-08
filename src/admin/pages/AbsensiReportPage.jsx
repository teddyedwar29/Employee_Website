import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Search, Calendar, Building2 } from "lucide-react";
import PageHeader from '@/components/ui/PageHeader';
import Pagination from "@/components/ui/Pagination";
import { BACKEND_BASE_URL, API_BASE_URL } from '@/utils/constants';

export default function AbsensiReportPage({ onMenuClick }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [absensiList, setAbsensiList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const departemenOptions = ["Semua", "MARKETING", "OPERATOR", "HRD", "IT", "CS"];

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

      // ✅ FIX: Gunakan endpoint yang benar sesuai route blueprint
      let url = `${BACKEND_URL}/absensi/report`;
      const params = new URLSearchParams();

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (selectedDept && selectedDept !== "Semua") {
        params.append("departemen", selectedDept);
      }

      if (params.toString()) url += `?${params.toString()}`;

      console.log("Fetching from:", url); // Debug log

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ Handle error response lebih detail
      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text: "Sesi login Anda telah berakhir atau Anda tidak memiliki akses.",
          });
          // Optional: redirect ke login
          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          Swal.fire({
            icon: "warning",
            title: "Akses Ditolak",
            text: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          });
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
        if (data.message) {
          Swal.fire("Info", data.message, "info");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: err.message || "Terjadi kesalahan saat mengambil data absensi",
      });
      setAbsensiList([]);
      setFilteredList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensiReport();
    setCurrentPage(1);
  }, [searchTerm,startDate, endDate, selectedDept]);

  // Search filter
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => (time ? time.slice(0, 5) : "--:--");

  const hitungDurasi = (inTime, outTime) => {
    if (!inTime || !outTime) return "--";
    const [h1, m1] = inTime.split(":").map(Number);
    const [h2, m2] = outTime.split(":").map(Number);
    let hours = h2 - h1;
    let minutes = m2 - m1;
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) hours += 24;
    return `${hours}j ${minutes}m`;
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
                <option key={dept} value={dept === "Semua" ? "" : dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || startDate || endDate || selectedDept) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
                setSelectedDept("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
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
                      {/* tanggal */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatDate(item.tanggal)}
                      </td>
                      
                      {/* ID Karyawan */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.id_karyawan || "-"}
                      </td>

                      {/* Nama Karyawan */}
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.nama_karyawan || "-"}
                      </td>

                      {/* Departemen */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.nama_departemen || "-"}
                      </td>

                      {/* Jabatan */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.nama_jabatan || "-"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <img
                          src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                          alt="Masuk"
                          className="w-12 h-12 rounded-lg object-cover mx-auto border"
                          onError={(e) => (e.target.src = placeholderFoto)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(item.jam_in)}</td>
                      <td className="px-6 py-4 text-center">
                        <img
                          src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                          alt="Keluar"
                          className="w-12 h-12 rounded-lg object-cover mx-auto border"
                          onError={(e) => (e.target.src = placeholderFoto)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(item.jam_out)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {hitungDurasi(item.jam_in, item.jam_out)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Hadir
                        </span>
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
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">
                      {formatDate(item.tanggal)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {item.id_karyawan || "-"}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Hadir
                  </span>
                </div>

                {/* IDENTITAS */}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Nama:</span>{" "}
                    <span className="font-medium">{item.nama_karyawan || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Departemen:</span>{" "}
                    {item.nama_departemen || "-"}
                  </p>
                  <p>
                    <span className="text-gray-500">Jabatan:</span>{" "}
                    {item.nama_jabatan || "-"}
                  </p>
                </div>

                {/* ABSENSI MASUK */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Absen Masuk</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                      alt="Masuk"
                      className="w-20 h-20 rounded-lg object-cover border"
                      onError={(e) => (e.target.src = placeholderFoto)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Jam Masuk
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(item.jam_in)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ABSENSI KELUAR */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Absen Keluar</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                      alt="Keluar"
                      className="w-20 h-20 rounded-lg object-cover border"
                      onError={(e) => (e.target.src = placeholderFoto)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Jam Keluar
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(item.jam_out)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DURASI */}
                <div className="border-t pt-3 text-center">
                  <p className="text-xs text-gray-500">Durasi Kerja</p>
                  <p className="text-sm font-bold text-blue-900">
                    {hitungDurasi(item.jam_in, item.jam_out)}
                  </p>
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
    </div>
  );
}