import { useEffect, useState } from "react";
import { RefreshCw  } from "lucide-react";
import { OTOMAX_API_BASE_URL } from "@/utils/constants";

export default function ProfitHarianCard({ date }) {
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

  const fetchProfitHarian = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${OTOMAX_API_BASE_URL}/pivot/laporan/harian?start=${date}&end=${date}`
      );
      const json = await res.json();

      if (json.success && json.data.length > 0) {
        setTotalLaba(Number(json.data[0].total_laba));
      } else {
        setTotalLaba(0);
      }

      // ⏱️ simpan waktu update
      setUpdatedAt(formatDateTime());

    } catch (err) {
      console.error("Gagal fetch laba harian", err);
      setTotalLaba(0);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (date) fetchProfitHarian();
  }, [date]);

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
      {/* dekorasi */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium mb-2">
            Total Laba Hari Ini
          </p>

          <h2
            className={`text-4xl font-bold transition-opacity ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {formatRupiah(totalLaba)}
          </h2>

          <p className="text-emerald-100 text-xs mt-2">
            Berdasarkan transaksi hari ini ({date})
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
