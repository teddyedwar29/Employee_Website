import { useEffect, useState } from "react";
import OtomaxPivotTable from "@/admin/components/OtomaxPivotTable";
import PageHeader from "@/components/ui/PageHeader";
import { OTOMAX_API_BASE_URL } from "@/utils/constants";
import ProfitHarianCard from "@/admin/components/ProfitHarianCard";

export default function OtomaxDataPage({ onMenuClick }) {

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset(); // menit
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };
  // ======================
  // STATE FILTER TANGGAL
  // ======================
  const today = getLocalDate();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [uplineTotals, setUplineTotals] = useState({});

  // ======================
  // STATE DATA & PAGINATION
  // ======================
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // ======================
  // FETCH DATA (PIVOT)
  // ======================
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${OTOMAX_API_BASE_URL}/pivot/laporan/laba` +
        `?start=${startDate}&end=${endDate}&page=${page}&limit=${limit}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");


      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat data pivot");

      const json = await res.json();

      setData(json.data || []);
      setMeta(json.meta || null);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // fetch data total upline
  const fetchUplineTotals = async () => {
  try {
    const url = `${OTOMAX_API_BASE_URL}/pivot/laporan/upline?start=${startDate}&end=${endDate}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.success) {
      const map = {};
      json.data.forEach((item) => {
        map[item.kode_upline] = {
          total: Number(item.total_laba),
          nama: item.nama_upline,
        };
      });
      setUplineTotals(map);
    }
  } catch (err) {
    console.error("Gagal fetch total upline", err);
  }
};


  // ======================
  // EFFECT
  // ======================
  // Reset ke page 1 kalau tanggal berubah
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, search]);

  // Fetch data saat filter / page berubah
  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
      fetchUplineTotals();
    }
  }, [startDate, endDate, page, search]);

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pivot Laporan Laba Otomax Harian"
        description="Laporan laba reseller berdasarkan tanggal hari ini"
        onMenuClick={onMenuClick}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfitHarianCard date={startDate} />
      </div>

      {/* laporan Pivot Harian */}

      <PageHeader
        title="Pivot Laporan Laba Otomax"
        description="Laporan laba reseller berdasarkan rentang tanggal"
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

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Cari AE / AK
          </label>
          <input
            type="text"
            placeholder="Contoh: AE0002 atau AK0041"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800020]"
          />
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-600">
          Memuat data pivot...
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
        <div className="bg-white rounded-xl border p-4 space-y-4">
          <OtomaxPivotTable data={data} uplineTotals={uplineTotals} />

          {/* PAGINATION */}
          {meta && meta.total_pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-gray-600">
                Page {meta.page} of {meta.total_pages}
              </span>

              <button
                disabled={page === meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
