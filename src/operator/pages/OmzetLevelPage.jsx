import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getOmzetLevelAnalytics } from "@/services/ApiService";

export default function OmzetLevelPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getOmzetLevelAnalytics({
        from: fromDate,
        to: toDate,
      });

      if (res.success) {
        const transformed = res.data.map((item) => ({
          name: item.level,
          omzet: Number(item.omzet),
          trx: item.jumlah_trx,
          komisi: Number(item.total_komisi),
        }));

        setData(transformed);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Gagal fetch omzet level", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Analisis Omzet Level
      </h1>

      {/* ================= FILTER ================= */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#800020] text-white rounded-lg hover:opacity-90 transition"
        >
          Terapkan
        </button>
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    formatter={(value) =>
                    new Intl.NumberFormat("id-ID").format(value)
                    }
                />
                <Legend />

                <Bar dataKey="omzet" fill="#8884d8" radius={[10, 10, 0, 0]} />
                <Bar dataKey="trx" fill="#82ca9d" radius={[10, 10, 0, 0]} />
                <Bar dataKey="komisi" fill="#ff7300" radius={[10, 10, 0, 0]} />
            </BarChart>

          </ResponsiveContainer>
        )}
      </div>

      {/* ================= TABLE ================= */}
    <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Detail Omzet Level
    </h2>

    <table className="min-w-full text-sm border border-gray-200">
        <thead className="bg-gray-100 text-gray-700">
        <tr>
            <th className="px-4 py-2 text-left">Level</th>
            <th className="px-4 py-2 text-right">Jumlah Transaksi</th>
            <th className="px-4 py-2 text-right">Omzet</th>
            <th className="px-4 py-2 text-right">Total Komisi</th>
        </tr>
        </thead>
        <tbody>
        {data.length === 0 ? (
            <tr>
            <td colSpan="4" className="text-center py-4 text-gray-500">
                Tidak ada data
            </td>
            </tr>
        ) : (
            data.map((item, index) => (
            <tr
                key={index}
                className="border-t hover:bg-gray-50 transition"
            >
                <td className="px-4 py-2 font-medium text-gray-800">
                {item.name}
                </td>

                <td className="px-4 py-2 text-right">
                {new Intl.NumberFormat("id-ID").format(item.trx)}
                </td>

                <td className="px-4 py-2 text-right font-semibold text-indigo-600">
                Rp {new Intl.NumberFormat("id-ID").format(item.omzet)}
                </td>

                <td className="px-4 py-2 text-right text-orange-600">
                Rp {new Intl.NumberFormat("id-ID").format(item.komisi)}
                </td>
            </tr>
            ))
        )}
        </tbody>
    </table>
    </div>

    </div>
  );
}
