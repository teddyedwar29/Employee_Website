// src/admin/pages/KunjunganReportPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Search, MapPin, Calendar } from "lucide-react";
import { BACKEND_BASE_URL, API_BASE_URL } from '@/utils/constants';
import PageHeader from '@/components/ui/PageHeader';

export default function KunjunganReportPage({ onMenuClick }) {
  const [kunjunganList, setKunjunganList] = useState([]); // Array flat fotos/kunjungan
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const fetchKunjunganReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Token tidak ditemukan. Silakan login kembali.", "error");
        return;
      }

      let url = `${API_BASE_URL}/kunjungan-report/AE`;
      const params = new URLSearchParams();

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      // Kalau ada filter per tanggal tunggal, bisa tambah params.append("tanggal", someDate)

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          Swal.fire("Error", "Akses ditolak atau sesi berakhir", "error");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        let allKunjungan = [];

        // Backend kirim array kunjungan harian, tiap item punya .fotos array
        if (Array.isArray(data.data)) {
          data.data.forEach((daily) => {
            if (daily.fotos && Array.isArray(daily.fotos)) {
              daily.fotos.forEach((fotoItem) => {
                allKunjungan.push({
                  ...fotoItem,
                  tanggal: daily.tanggal || new Date().toISOString().split("T")[0], // Ambil tanggal dari parent
                  marketingName: daily.karyawan?.nama || "Marketing", // Asumsi ada info karyawan
                });
              });
            }
          });
        }

        // Sort descending by tanggal
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

  useEffect(() => {
    fetchKunjunganReport();
  }, [startDate, endDate]); // Auto refetch saat filter date berubah

  // Client-side search (nama marketing atau tanggal)
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER MIRIP ABSENSI REPORT */}
      <PageHeader
        title="Riwayat Kunjungan Marketing"
        description="Monitoring bukti kunjungan outlet seluruh marketing"
        onMenuClick={onMenuClick}
      />

      {/* FILTER SECTION - MIRIP ABSENSI REPORT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama marketing atau tanggal..."
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
        </div>

        {(searchTerm || startDate || endDate) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* LOADING & EMPTY STATE */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#800020]"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat kunjungan...</p>
        </div>
      )}

      {!loading && filteredList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Tidak ada data kunjungan pada filter ini</p>
        </div>
      )}

      {/* GRID CARD VIEW - MIRIP KUNJUNGANPAGE MARKETING */}
      {!loading && filteredList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredList.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative aspect-video bg-gray-100">
                <img
                src={item.foto ? `${BACKEND_BASE_URL}${item.foto}` : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNS4wMDAxIDM1LjAwMDFDMzUuMDAwMSAzMS42NjY4IDMyLjMzMzQgMjguOTk5OSAyOS4wMDAxIDI4Ljk5OTlIMjEuMDAwMUMxNy42NjY4IDI4Ljk5OTkgMTUuMDAwMSAzMS42NjY4IDE1LjAwMDEgMzUuMDAwMVYzOC4wMDAxQzE1LjAwMDEgNDAuMjA5MSAxNi43OTEgNDIuMDAwMSAxOS4wMDAxIDQyLjAwMDFIMzEuMDAwMUMzMy4yMDkxIDQyLjAwMDEgMzUuMDAwMSA0MC4yMDkxIDM1LjAwMDEgMzguMDAwMVYzNS4wMDAxWiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIxOCIgcj0iNyIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K"}
                  alt="Bukti kunjungan"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/placeholder.jpg")} // Placeholder kalau error
                />      
                <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                  {formatDate(item.tanggal)}
                </div>
              </div>

              <div className="p-5">
                <p className="font-bold text-lg text-gray-900">{item.marketingName || "Marketing"}</p>
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
    </div>
  );
}