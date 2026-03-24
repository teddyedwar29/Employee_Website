import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchWithAuthOtomax } from "@/services/authServices";

// =============================================
// CUSTOM TOOLTIP
// =============================================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="text-gray-400 font-medium mb-1">{label}</p>
        <p className="text-emerald-600 font-bold text-base">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// =============================================
// MAIN COMPONENT
// =============================================
export default function MarketingLabaChart({ endDate, kodeUpline }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================================
  // FETCH — 7 hari ke belakang dari endDate,
  // filter by kodeUpline (AE)
  // =============================================
  // Pakai endpoint yang sama dengan card hijau:
  // /pivot/laporan/upline, loop per hari selama 7 hari
  // lalu ambil data yang cocok dengan kodeUpline (AE)
  // =============================================
  const fetchChartData = async () => {
    if (!endDate || !kodeUpline) return;

    setLoading(true);
    setError(null);

    try {
      // Buat array 7 tanggal: endDate - 6 hari s/d endDate
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString("en-CA")); // format YYYY-MM-DD
      }

      // Fetch tiap hari secara paralel
      const results = await Promise.all(
        dates.map(async (date) => {
          const res = await fetchWithAuthOtomax(
            `/pivot/laporan/upline?start=${date}&end=${date}&limit=100`
          );
          if (!res.ok) return { date, laba: 0 };
          const json = await res.json();

          // Cari data yang cocok dengan kodeUpline (AE)
          const matched = json.data?.find(
            (item) => item.kode_upline?.toUpperCase() === kodeUpline.toUpperCase()
          );

          return {
            date,
            laba: matched ? Number(matched.total_laba || 0) : 0,
          };
        })
      );

      // Format label tanggal untuk sumbu X
      const mappedFinal = results.map((item) => ({
        label: new Date(item.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        laba: item.laba,
      }));

      setChartData(mappedFinal);
    } catch (err) {
      setError(err.message);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [endDate, kodeUpline]);

  // =============================================
  // SUMMARY STATS
  // =============================================
  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const values = chartData.map((d) => d.laba);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return {
      max: { value: max, label: chartData.find((d) => d.laba === max)?.label },
      min: { value: min, label: chartData.find((d) => d.laba === min)?.label },
    };
  }, [chartData]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formatShort = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
    return val;
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="bg-white rounded-xl border p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-gray-800">
          📈 Tren Pencapaian 7 Hari Terakhir
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Data harian pencapaian kamu dalam 7 hari ke belakang
        </p>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-48 sm:h-52 flex items-center justify-center text-gray-400 text-sm gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Memuat data...
        </div>
      ) : error ? (
        <div className="h-48 sm:h-52 flex items-center justify-center text-red-400 text-sm">
          ⚠️ {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 sm:h-52 flex items-center justify-center text-gray-300 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="marketingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatShort}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="laba"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#marketingGrad)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3, stroke: "white" }}
              activeDot={{ r: 5, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Summary — Tertinggi & Terendah */}
      {stats && !loading && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
          <div className="bg-emerald-50 rounded-xl px-3 py-3 sm:px-4">
            <p className="text-xs text-gray-400 mb-1">Tertinggi · {stats.max.label}</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 break-words">
              {formatRupiah(stats.max.value)}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl px-3 py-3 sm:px-4">
            <p className="text-xs text-gray-400 mb-1">Terendah · {stats.min.label}</p>
            <p className="text-xs sm:text-sm font-bold text-red-500 break-words">
              {formatRupiah(stats.min.value)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}