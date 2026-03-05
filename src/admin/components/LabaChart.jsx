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
import { OTOMAX_API_BASE_URL } from "@/utils/constants";

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
export default function LabaChart({ startDate, endDate, selectedMonth, selectedYear }) {
  const [chartMode, setChartMode] = useState("Harian"); // "Harian" | "Bulanan"
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================================
  // FETCH — pakai endpoint yang sudah ada
  // =============================================
  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "";

      if (chartMode === "Harian") {
        // Endpoint harian: ambil 7 hari terakhir dari endDate
        const end = endDate || new Date().toISOString().slice(0, 10);
        const startObj = new Date(end);
        startObj.setDate(startObj.getDate() - 6);
        const start = startObj.toISOString().slice(0, 10);

        url = `${OTOMAX_API_BASE_URL}/pivot/laporan/harian?start=${start}&end=${end}`;
      } else {
        // Endpoint bulanan
        // Jika user pilih bulan+tahun dari filter, pakai itu. Kalau tidak, pakai 7 bulan terakhir.
        if (selectedMonth && selectedYear) {
          const start = `${selectedYear}-01-01`;
          const end = `${selectedYear}-12-31`;
          url = `${OTOMAX_API_BASE_URL}/pivot/laporan/bulanan?start=${start}&end=${end}`;
        } else {
          const now = new Date();
          const endBulan = `${now.getFullYear()}-12-31`;
          const startBulan = `${now.getFullYear() - 1}-01-01`;
          url = `${OTOMAX_API_BASE_URL}/pivot/laporan/bulanan?start=${startBulan}&end=${endBulan}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat data grafik");
      const json = await res.json();

      if (json.success && json.data?.length > 0) {
        // Mapping response ke format { label, laba }
        const mapped = json.data.map((item) => {
          let label = "";
          if (chartMode === "Harian") {
            // endpoint harian → field: tanggal / date / periode
            const raw = item.tanggal || item.date || item.periode || "";
            label = new Date(raw).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          } else {
            // endpoint bulanan → field: bulan, format "2026-02"
            // tambah "-01" agar bisa di-parse dengan benar oleh Date
            const raw = item.bulan ? `${item.bulan}-01` : "";
            label = new Date(raw).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
          }
          return { label, laba: Number(item.total_laba || 0) };
        });
        setChartData(mapped);
      } else {
        setChartData([]);
      }
    } catch (err) {
      setError(err.message);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch saat mode atau filter berubah
  useEffect(() => {
    fetchChartData();
  }, [chartMode, startDate, endDate, selectedMonth, selectedYear]);

  // =============================================
  // SUMMARY STATS
  // =============================================
  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const values = chartData.map((d) => d.laba);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      max: { value: max, label: chartData.find((d) => d.laba === max)?.label },
      min: { value: min, label: chartData.find((d) => d.laba === min)?.label },
      avg: { value: Math.round(avg) },
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
    <div className="bg-white rounded-xl border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            📈 Tren Laba {chartMode === "Harian" ? "7 Hari Terakhir" : "Bulanan"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {chartMode === "Harian"
              ? "Data 7 hari ke belakang dari tanggal akhir filter"
              : selectedMonth && selectedYear
              ? `Sepanjang tahun ${selectedYear}`
              : "Data bulanan tahun ini"}
          </p>
        </div>

        {/* Toggle Harian / Bulanan */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {["Harian", "Bulanan"].map((mode) => (
            <button
              key={mode}
              onClick={() => setChartMode(mode)}
              className={`
                px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${chartMode === mode
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "text-gray-400 hover:text-gray-600"}
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      {loading ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Memuat data {chartMode.toLowerCase()}...
        </div>
      ) : error ? (
        <div className="h-52 flex items-center justify-center text-red-400 text-sm">
          ⚠️ {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="labaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatShort}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="laba"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#labaGrad)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4, stroke: "white" }}
              activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Summary Cards */}
      {stats && !loading && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
          <div className="bg-emerald-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Tertinggi · {stats.max.label}</p>
            <p className="text-sm font-bold text-emerald-600">{formatRupiah(stats.max.value)}</p>
          </div>
          <div className="bg-red-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Terendah · {stats.min.label}</p>
            <p className="text-sm font-bold text-red-500">{formatRupiah(stats.min.value)}</p>
          </div>
        </div>
      )}
    </div>
  );
}