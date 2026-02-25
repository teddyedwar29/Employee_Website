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
import { getTopProdukLevel } from "@/services/ApiService";

export default function TopProdukLevelPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [limit, setLimit] = useState(7);
  const [selectedLevel, setSelectedLevel] = useState("");

  const [data, setData] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getTopProdukLevel({
        from,
        to,
        limit,
        level: selectedLevel || undefined,
      });

      if (res.success) {
        const formatted = res.data.map((item) => ({
          produk: item.kode_produk,
          trx: item.jumlah_trx,
          omzet: Number(item.omzet),
          level: item.nama_level,
        }));

        setData(formatted);

        // ambil unique level untuk dropdown
        const uniqueLevels = [
          ...new Set(res.data.map((d) => d.nama_level)),
        ];

        setLevels(uniqueLevels);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [from, to, selectedLevel, limit]);

  return (
    <div className="space-y-6">

      {/* ================= FILTER ================= */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Level</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Semua Level</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Top</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="border px-3 py-2 rounded-lg w-20"
          />
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Top Produk {selectedLevel ? `- ${selectedLevel}` : ""}
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="produk" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="trx" fill="#8884d8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="omzet" fill="#82ca9d" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">
          Detail Top Produk
        </h2>

        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Produk</th>
              <th className="px-4 py-2 text-right">Transaksi</th>
              <th className="px-4 py-2 text-right">Omzet</th>
              <th className="px-4 py-2 text-left">Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{item.produk}</td>
                <td className="px-4 py-2 text-right">
                  {new Intl.NumberFormat("id-ID").format(item.trx)}
                </td>
                <td className="px-4 py-2 text-right text-green-600 font-semibold">
                  Rp {new Intl.NumberFormat("id-ID").format(item.omzet)}
                </td>
                <td className="px-4 py-2">{item.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
