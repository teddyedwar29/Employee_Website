import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Calendar } from "lucide-react";
import { getLaporanMasaAktifReseller } from "@/services/ApiService";

export default function LaporanMasaAktifReseller() {
  const [data, setData] = useState([]);
  const ITEMS_PER_PAGE = 15;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    }, [data]);

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchData();
        setCurrentPage(1);
    }, 400); // debounce 400ms

    return () => clearTimeout(delay);
  }, [search]);


  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const params = {
        // WAJIB: backend masih butuh ini
        search: user?.id, // AE0002
      };

      const res = await getLaporanMasaAktifReseller(params);


      if (res?.status && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      Swal.fire(
        `${error}`,
        "Gagal memuat laporan masa aktif reseller",
        `${error}`
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };


    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
    );


  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* ===== HEADER ===== */}
      <h1 className="text-2xl font-bold mb-2">
        Laporan Masa Aktif Reseller
      </h1>
      <p className="text-gray-600 mb-6">
        Daftar reseller berdasarkan aktivitas terakhir
      </p>

      {/* ===== LOADING ===== */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]" />
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">
            Tidak ada data laporan masa aktif reseller
          </p>
        </div>
      ) : (
        <>
        
             {/* ===== SEARCH ===== */}
          {/* <div className="mb-4 max-w-sm">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode / nama reseller..."
                className="
                w-full px-4 py-2 border rounded-lg text-sm
                focus:ring-2 focus:ring-[#800020] focus:border-[#800020]
                "
            />
          </div> */}

        
          {/* ===== DESKTOP TABLE ===== */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm font-medium w-12">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium">
                      Kode Reseller
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium">
                      Nama Reseller
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium">
                      Nama Upline
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium">
                      Terakhir Aktif
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.kode_reseller}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {item.nama_reseller}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {item.nama_upline}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={16} className="text-[#800020]" />
                        {formatDateTime(item.tgl_aktivitas)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
            Halaman <span className="font-semibold">{currentPage}</span> dari{" "}
            <span className="font-semibold">{totalPages}</span>
            </p>

            <div className="flex gap-2">
            <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium border
                ${
                    currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
            >
                Prev
            </button>

            <button
                onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium border
                ${
                    currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
            >
                Next
            </button>
            </div>
        </div>
        )}


          {/* ===== MOBILE CARD ===== */}
          <div className="lg:hidden space-y-4">
            {paginatedData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <span className="font-semibold text-gray-900">
                    {item.nama_reseller}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Kode:</span>{" "}
                    <span className="font-medium">
                      {item.kode_reseller}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Upline:</span>{" "}
                    <span className="font-medium">
                      {item.nama_upline}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    {formatDateTime(item.tgl_aktivitas)}
                  </div>

                    {/* NOMOR DI BAWAH */}
                <div className="mt-4 pt-2 border-t text-right">
                    <span className="text-xs text-gray-500">
                    #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </span>
                </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
