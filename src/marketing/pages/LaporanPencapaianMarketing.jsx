import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { fetchWithAuthOtomax } from "@/services/authServices";
import { useNavigate } from "react-router-dom";
import MarketingProfitCard from "@/marketing/components/MarketingProfitCard";
import OtomaxPivotTableMarketing from "@/marketing/components/OtomaxPivotTableMarketing";
import MarketingLabaChart from "@/marketing/components/MarketingLabaChart"; // ← TAMBAHAN


export default function LaporanPencapaianMarketing() {
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
  const kodeAE = user.id.toUpperCase(); // contoh: AE0004

  // ======================
  // FILTER TANGGAL
  // ======================
  const getTodayLocalDate = () =>
    new Date().toLocaleDateString("en-CA");

  const today = getTodayLocalDate();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // ======================
  // STATE DATA
  // ======================
  const [uplineTotal, setUplineTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pivotData, setPivotData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [meta, setMeta] = useState(null);


  // ======================
  // FETCH TOTAL AE
  // ======================
  const fetchTotalUpline = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuthOtomax(
        `/pivot/laporan/upline?start=${startDate}&end=${endDate}&limit=100`
      );

      if (!res.ok) throw new Error("Gagal memuat data upline");

      const json = await res.json();

      const matched = json.data.find(
        (item) =>
          item.kode_upline?.toUpperCase() === kodeAE
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

  const fetchPivotMarketing = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuthOtomax(
        `/pivot/laporan/laba` +
          `?start=${startDate}` +
          `&end=${endDate}` +
          `&search=${kodeAE}` +
          `&page=${page}` +
          `&limit=${limit}`
      );

      if (!res.ok) throw new Error("Gagal memuat data pivot");

      const json = await res.json();

      setPivotData(json.data || []);
      setMeta(json.meta || null);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pivot marketing");
      setPivotData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalUpline();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);


  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalUpline();
      fetchPivotMarketing();
    }
  }, [startDate, endDate, page]);


  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-6 lg:p-8 space-y-6 overflow-x-hidden">
      <PageHeader
        title="Laporan Pencapaian Marketing"
        description="Data Realtime"
      />

      {/* CARD + FILTER (SETENGAH LEBAR, VERTIKAL) */}
      <div className="space-y-6">

        {/* CARD HIJAU */}
        <div className="w-full lg:w-1/2">
          <MarketingProfitCard
            startDate={startDate}
            endDate={endDate}
            kodeUpline={kodeAE}
          />
        </div>

        {/* ====================== */}
        {/* GRAFIK TREN 7 HARI ← BARU */}
        {/* ====================== */}
        <div className="w-full lg:w-1/2">
          <MarketingLabaChart
            endDate={endDate}
            kodeUpline={kodeAE}
          />
        </div>

        {/* FILTER TANGGAL */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl border p-4">
          <div className="flex gap-4 flex-wrap">
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
        </div>

      </div>



      {!loading && pivotData.length === 0 && (
        <div className="text-gray-500">
          Tidak ada data AK pada rentang tanggal ini
        </div>
      )}

    {/* TABLE */}
    {!loading && !error && pivotData.length > 0 && (
      <div className="bg-white rounded-xl border p-4 space-y-4">
        
        {/* 🔒 ISOLATED TABLE SCROLL (INI KUNCINYA) */}
        <div className="overflow-x-auto">
          <OtomaxPivotTableMarketing
            data={pivotData}
            totalAll={uplineTotal?.total_laba || 0}
          />
        </div>

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


      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

    </div>
  );
}