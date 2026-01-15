import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMyAbsensi } from "@/services/absensiReportService";
import { BACKEND_BASE_URL } from "@/utils/constants";
import { Calendar, Clock, Timer, FileText } from "lucide-react";
import { getMyIzinHistory } from "@/services/ApiService";

export default function RiwayatAbsensi() {
  const [riwayat, setRiwayat] = useState([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("absensi"); // absensi | izin
  const [izinHistory, setIzinHistory] = useState([]);

  // State filter tanggal
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  useEffect(() => {
    fetchRiwayatAbsensi();
  }, []);

  useEffect(() => {
    if (activeTab === "izin") {
      fetchRiwayatIzin();
    }
  }, [activeTab]);


  const fetchRiwayatIzin = async () => {
    try {
      const res = await getMyIzinHistory();
      if (res.success && Array.isArray(res.data)) {
        setIzinHistory(res.data);
      } else {
        setIzinHistory([]);
      }
    } catch (err) {
      console.error("Gagal fetch riwayat izin:", err);
      setIzinHistory([]);
    }
  };


  const fetchRiwayatAbsensi = async () => {
    setLoading(true);
    try {
      const res = await getMyAbsensi();

      if (res.success && res.data) {
        const sorted = res.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setRiwayat(sorted);
        setFilteredRiwayat(sorted);
      } else {
        setRiwayat([]);
        setFilteredRiwayat([]);
      }
    } catch (err) {
      console.error("Error fetch riwayat:", err);
      setRiwayat([]);
      setFilteredRiwayat([]);
      Swal.fire("Error", "Gagal memuat riwayat absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter real-time
  useEffect(() => {
    let filtered = riwayat;

    if (tanggalMulai) {
      filtered = filtered.filter(item => new Date(item.tanggal) >= new Date(tanggalMulai));
    }
    if (tanggalAkhir) {
      filtered = filtered.filter(item => new Date(item.tanggal) <= new Date(tanggalAkhir));
    }

    setFilteredRiwayat(filtered);
  }, [tanggalMulai, tanggalAkhir, riwayat]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString.slice(0, 5);
  };

  const hitungDurasi = (jamIn, jamOut) => {
    if (!jamIn || !jamOut) return "--";
    const [h1, m1] = jamIn.split(":").map(Number);
    const [h2, m2] = jamOut.split(":").map(Number);
    let hours = h2 - h1;
    let minutes = m2 - m1;
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) hours += 24;
    return `${hours}j ${minutes}m`;
  };

  const getStatusBadge = (status) => {
    const color = status === "Hadir" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{status || "Hadir"}</span>;
  };

  const placeholderFoto = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNS4wMDAxIDM1LjAwMDFDMzUuMDAwMSAzMS42NjY4IDMyLjMzMzQgMjguOTk5OSAyOS4wMDAxIDI4Ljk5OTlIMjEuMDAwMUMxNy42NjY4IDI4Ljk5OTkgMTUuMDAwMSAzMS42NjY4IDE1LjAwMDEgMzUuMDAwMVYzOC4wMDAxQzE1LjAwMDEgNDAuMjA5MSAxNi43OTEgNDIuMDAwMSAxOS4wMDAxIDQyLjAwMDFIMzEuMDAwMUMzMy4yMDkxIDQyLjAwMDEgMzUuMDAwMSA0MC4yMDkxIDM1LjAwMDEgMzguMDAwMVYzNS4wMDAxWiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIxOCIgcj0iNyIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K";

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold mb-2">Riwayat Absensi</h1>
      <p className="text-gray-600 mb-6">Riwayat kehadiran Anda</p>




      {/* FILTER TANGGAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Tanggal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setTanggalMulai("");
                setTanggalAkhir("");
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2 px-6 py-4 font-medium ${
              activeTab === "absensi"
                ? "text-[#800020] border-b-2 border-[#800020]"
                : "text-gray-600"
            }`}
          >
            <Calendar size={18} />
            Riwayat Absensi
          </button>

          <button
            onClick={() => setActiveTab("izin")}
            className={`flex items-center gap-2 px-6 py-4 font-medium ${
              activeTab === "izin"
                ? "text-[#800020] border-b-2 border-[#800020]"
                : "text-gray-600"
            }`}
          >
            <FileText size={18} />
            Riwayat Izin
          </button>
        </div>
      </div>

      {/* LOADING / EMPTY STATE */}
      {activeTab === "absensi" && (
        <>
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat...</p>
          </div>
        ) : filteredRiwayat.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Tidak ada riwayat absensi pada rentang tanggal ini</p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW - TABEL (Hidden di mobile) */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 w-12">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Foto Absen Masuk</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jam Masuk</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Foto Absen Keluar</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jam Keluar</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Durasi Kerja</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRiwayat.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <img
                            src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                            alt="Absen Masuk"
                            className="w-12 h-12 rounded-lg object-cover mx-auto border border-gray-200"
                            onError={(e) => (e.target.src = placeholderFoto)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(item.jam_in) || "--:--"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <img
                            src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                            alt="Absen Keluar"
                            className="w-12 h-12 rounded-lg object-cover mx-auto border border-gray-200"
                            onError={(e) => (e.target.src = placeholderFoto)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(item.jam_out) || "--:--"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {hitungDurasi(item.jam_in, item.jam_out)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE VIEW - CARDS (Hidden di desktop) */}
            <div className="lg:hidden space-y-4">
              {filteredRiwayat.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {/* Header Card */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Calendar size={18} className="text-[#800020]" />
                      {formatDate(item.tanggal)}
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Foto Absensi */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Foto Masuk</p>
                      <img
                        src={item.foto_in ? `${BACKEND_BASE_URL}/${item.foto_in}` : placeholderFoto}
                        alt="Absen Masuk"
                        className="w-full h-24 rounded-lg object-cover border border-gray-200"
                        onError={(e) => (e.target.src = placeholderFoto)}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Foto Keluar</p>
                      <img
                        src={item.foto_out ? `${BACKEND_BASE_URL}/${item.foto_out}` : placeholderFoto}
                        alt="Absen Keluar"
                        className="w-full h-24 rounded-lg object-cover border border-gray-200"
                        onError={(e) => (e.target.src = placeholderFoto)}
                      />
                    </div>
                  </div>

                  {/* Info Waktu */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                      <Clock size={16} className="text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Jam Masuk</p>
                        <p className="font-semibold text-sm text-gray-900">
                          {formatTime(item.jam_in) || "--:--"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
                      <Clock size={16} className="text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Jam Keluar</p>
                        <p className="font-semibold text-sm text-gray-900">
                          {formatTime(item.jam_out) || "--:--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Durasi */}
                  <div className="mt-3 flex items-center justify-center gap-2 bg-blue-50 rounded-lg p-3">
                    <Timer size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-500">Durasi Kerja:</span>
                    <span className="font-bold text-sm text-blue-900">
                      {hitungDurasi(item.jam_in, item.jam_out)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </>
      )}

      {activeTab === "izin" && (
        <>
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm w-12">No</th>
                    <th className="px-6 py-4 text-left text-sm">Tanggal</th>
                    <th className="px-6 py-4 text-center text-sm">Jam</th>
                    <th className="px-6 py-4 text-center text-sm">Foto Bukti</th>
                    <th className="px-6 py-4 text-left text-sm">Keterangan</th>
                    <th className="px-6 py-4 text-center text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {izinHistory.map((item,index) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {item.jam}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <img
                          src={`${BACKEND_BASE_URL}${item.foto}`}
                          alt="Bukti Izin"
                          className="w-14 h-14 rounded-lg object-cover mx-auto"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.keterangan}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Disetujui
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
           <div className="lg:hidden space-y-4">
              {izinHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <span>
                        {formatDate(item.tanggal)}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                      Disetujui
                    </span>
                  </div>

                  {/* FOTO */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Bukti Izin</p>
                    <img
                      src={`${BACKEND_BASE_URL}${item.foto}`}
                      alt="Bukti Izin"
                      className="w-full h-40 rounded-lg object-cover"
                    />
                  </div>

                  {/* JAM */}
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="text-gray-500">Jam:</span>
                    <span className="font-semibold">{item.jam}</span>
                  </div>

                  {/* KETERANGAN */}
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-500 text-xs mb-1">Keterangan</p>
                    <p className="text-gray-800">
                      {item.keterangan || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
        </>   
      )}
    </div>
  );
}