import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import OtomaxPivotTable from "@/admin/components/OtomaxPivotTable";
import ProfitHarianCard from "@/admin/components/ProfitHarianCard";
import { API_BASE_URL } from "@/utils/constants";

export default function LaporanPencapaianMarketing({ onMenuClick }) {
  // ======================
  // USER LOGIN (MARKETING)
  // ======================
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const myUplineCode = user?.id; // contoh: AE0002

  // ======================
  // DATE (LOCAL TIME)
  // ======================
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };

  const today = getLocalDate();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // ======================
  // DATA STATE
  // ======================
  const [data, setData] = useState([]);
  const [uplineTotals, setUplineTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ======================
  // FETCH DETAIL (PIVOT)
  // ======================
  const fetchPivotData = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/pivot/laporan/laba?start=${startDate}&end=${endDate}&page=1&limit=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat data pivot");

      const json = await res.json();

      // FILTER HANYA DATA MILIK MARKETING LOGIN
      const filtered = (json.data || []).filter(
        (row) => row.kode_upline === myUplineCode
      );

      setData(filtered);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // FETCH TOTAL UPLINE
  // ======================
  const fetchUplineTotal = async () => {
    try {
      const url = `${API_BASE_URL}/pivot/laporan/upline?start=${startDate}&end=${endDate}`;
      const res = await fetch(url);
      const json = await res.json();

      const mine = (json.data || []).find(
        (item) => item.kode_upline === myUplineCode
      );

      if (mine) {
        setUplineTotals({
          [mine.kode_upline]: Number(mine.total_laba),
        });
      } else {
        setUplineTotals({});
      }
    } catch (err) {
      console.error("Gagal fetch total upline", err);
      setUplineTotals({});
    }
  };

  // ======================
  // EFFECT
  // ======================
  useEffect(() => {
    if (startDate && endDate && myUplineCode) {
      fetchPivotData();
      fetchUplineTotal();
    }
  }, [startDate, endDate, myUplineCode]);

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
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800020]"
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
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800020]"
          />
        </div>
      </div>


      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-600">
          Memuat laporan pencapaian...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border p-4">
          <OtomaxPivotTable
            data={data}
            uplineTotals={uplineTotals}
          />
        </div>
      )}
    </div>
  );
}
