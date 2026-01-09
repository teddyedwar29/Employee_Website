import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { fetchWithAuth } from "@/services/authServices";
import { useNavigate } from "react-router-dom";

export default function LaporanPencapaianMarketing({ onMenuClick }) {
  const navigate = useNavigate();

  // ======================
  // USER
  // ======================
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    navigate("/login");
    return null;
  }

  const user = JSON.parse(userStr);
  const kodeAE = user.id; // contoh: AE0004

  // ======================
  // FILTER TANGGAL
  // ======================
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // ======================
  // STATE DATA
  // ======================
  const [uplineTotal, setUplineTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ======================
  // FETCH TOTAL AE
  // ======================
  const fetchTotalUpline = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(
        `/api/pivot/laporan/upline?start=${startDate}&end=${endDate}&limit=100`
      );

      if (!res.ok) throw new Error("Gagal memuat data upline");

      const json = await res.json();

      const matched = json.data.find(
        (item) => item.kode_upline === kodeAE
      );

      setUplineTotal(matched || null);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data pencapaian");
      setUplineTotal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalUpline();
    }
  }, [startDate, endDate]);

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Laporan Pencapaian Marketing"
        description="Laporan laba Otomax berdasarkan pencapaian Anda"
        onMenuClick={onMenuClick}
      />

      {/* FILTER TANGGAL */}
      <div className="bg-white rounded-xl border p-4 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* TABLE TOTAL AE */}
      {!loading && uplineTotal && (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#C65911] text-white">
              <tr>
                <th className="border px-4 py-2 text-left">Kode Upline</th>
                <th className="border px-4 py-2 text-left">Nama</th>
                <th className="border px-4 py-2 text-right">Total Laba</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#FFF3E0] font-bold">
                <td className="border px-4 py-2">{uplineTotal.kode_upline}</td>
                <td className="border px-4 py-2">{uplineTotal.nama_upline}</td>
                <td className="border px-4 py-2 text-right">
                  {Number(uplineTotal.total_laba).toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!loading && !uplineTotal && (
        <div className="text-gray-500">
          Tidak ada data pencapaian pada rentang tanggal ini
        </div>
      )}
    </div>
  );
}
