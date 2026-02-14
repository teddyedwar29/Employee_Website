import { useEffect, useState } from "react";
import { RefreshCw  } from "lucide-react";
import { OTOMAX_API_BASE_URL } from "@/utils/constants";

export default function ProfitHarianCard({ date, startDate, endDate, selectedMonth, selectedYear }) {
  const [totalLaba, setTotalLaba] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUpdated, setShowUpdated] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");

  const formatDateTime = () => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  };


  // Format Rupiah
  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);

  const getTodayLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };

  const isToday = date === getTodayLocalDate();


  const fetchProfitHarian = async () => {
    try {
      setLoading(true);

      let url = "";

      if (selectedMonth && selectedYear) {
        // MODE BULANAN
        const start = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
        const end = new Date(selectedYear, selectedMonth, 0)
          .toISOString()
          .slice(0, 10);

        url = `${OTOMAX_API_BASE_URL}/pivot/laporan/bulanan?start=${start}&end=${end}`;
      }
      else if (startDate && endDate) {
        // MODE HARIAN / RANGE (PAKAI ENDPOINT HARIAN)
        url = `${OTOMAX_API_BASE_URL}/pivot/laporan/harian?start=${startDate}&end=${endDate}`;
      }



      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        const total = json.data.reduce(
          (acc, item) => acc + Number(item.total_laba || 0),
          0
        );
        setTotalLaba(total);
      } else {
        setTotalLaba(0);
      }



      setUpdatedAt(formatDateTime());
    } catch (err) {
      console.error("Gagal fetch laba", err);
      setTotalLaba(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProfitHarian();
  }, [date, startDate, endDate, selectedMonth, selectedYear]);




  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
      {/* dekorasi */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

      <div className="relative flex items-center justify-between">
        <div>
         <p className="text-emerald-100 text-sm font-medium mb-2">
            {selectedMonth && selectedYear
              ? `Total Laba ${new Date(
                  selectedYear,
                  selectedMonth - 1
                ).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}`
              : startDate !== endDate
              ? `Total Laba ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`
              : "Total Laba Hari Ini"}
          </p>





          <h2
            className={`text-4xl font-bold transition-opacity ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {formatRupiah(totalLaba)}
          </h2>

          <p className="text-emerald-100 text-xs mt-2">
            {selectedMonth && selectedYear
              ? `Berdasarkan transaksi bulan ${new Date(
                  selectedYear,
                  selectedMonth - 1
                ).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}`
              : startDate !== endDate
              ? `Berdasarkan transaksi ${startDate} s/d ${endDate}`
              : `Berdasarkan transaksi hari ini (${date})`}
          </p>





          {updatedAt && (
            <p className="text-emerald-200 text-[11px] mt-1 italic">
              Terakhir diperbarui: {updatedAt}
            </p>
          )}
        </div>

        <button
          onClick={fetchProfitHarian}
          disabled={loading}
          title="Refresh laba hari ini"
          className={`
            bg-white/20 p-4 rounded-2xl backdrop-blur-sm
            transition hover:bg-white/30
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <RefreshCw
            className={`w-10 h-10 ${loading ? "animate-spin" : ""}`}
          />
        </button>

      </div>

      {loading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <div className="h-full bg-white animate-pulse" />
        </div>
      )}

      {showUpdated && (
        <div className="absolute top-4 right-4 bg-black/75 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          ✅ Data diperbarui<br />
          <span className="text-xs text-gray-300">{updatedAt}</span>
        </div>
      )}

    </div>
  );
}
