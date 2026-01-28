import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchWithAuthOtomax } from "@/services/authServices";

export default function MarketingProfitCard({
  startDate,
  endDate,
  kodeUpline,
}) {
  const [totalLaba, setTotalLaba] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");

  const formatDateTime = () =>
    new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);

  const fetchPencapaian = async () => {
    if (!startDate || !endDate || !kodeUpline) return;

    try {
      setLoading(true);

      const res = await fetchWithAuthOtomax(
        `/pivot/laporan/upline?start=${startDate}&end=${endDate}&limit=100`
      );

      if (!res.ok) throw new Error("Gagal fetch pencapaian marketing");

      const json = await res.json();

      const matched = json.data.find(
        (item) =>
          item.kode_upline?.toUpperCase() === kodeUpline.toUpperCase()
      );

      setTotalLaba(matched ? Number(matched.total_laba) : 0);
      setUpdatedAt(formatDateTime());
    } catch (err) {
      console.error(err);
      setTotalLaba(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPencapaian();
  }, [startDate, endDate]);

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
      {/* dekorasi */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium mb-2">
            Total Pencapaian Anda
          </p>

          <h2
            className={`text-4xl font-bold transition-opacity ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {formatRupiah(totalLaba)}
          </h2>

          <p className="text-emerald-100 text-xs mt-2">
            Periode {startDate} s/d {endDate}
          </p>

          {updatedAt && (
            <p className="text-emerald-200 text-[11px] mt-1 italic">
              Terakhir diperbarui: {updatedAt}
            </p>
          )}
        </div>

        <button
          onClick={fetchPencapaian}
          disabled={loading}
          title="Refresh pencapaian"
          className="
            bg-white/20 p-4 rounded-2xl backdrop-blur-sm
            transition hover:bg-white/30
            disabled:opacity-50 disabled:cursor-not-allowed
          "
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
    </div>
  );
}
