import { useMemo } from "react";

export default function OtomaxPivotTableMarketing({ data = [], totalAll = 0 }) {
  // ======================
  // FILTER: HANYA AK
  // ======================
  const filteredRows = useMemo(() => {
    return data.filter(
      (row) =>
        typeof row.kode_reseller === "string" &&
        row.kode_reseller.startsWith("AK")
    );
  }, [data]);

  // ======================
  // KOLOM TANGGAL DINAMIS
  // ======================
  const dateColumns = useMemo(() => {
    const ignore = [
      "kode_upline",
      "kode_reseller",
      "nama_reseller",
      "grand_total",
    ];

    const cols = new Set();

    filteredRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!ignore.includes(key)) cols.add(key);
      });
    });

    return Array.from(cols);
  }, [filteredRows]);

  const formatNumber = (val) =>
    Number(val || 0).toLocaleString("id-ID");

  // ======================
  // RENDER
  // ======================
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full border text-sm border-collapse">
        <thead className="bg-[#C65911] text-white">
          <tr>
            <th className="border px-3 py-2">Kode AK</th>
            <th className="border px-3 py-2">Nama Reseller</th>

            {dateColumns.map((d) => (
              <th key={d} className="border px-3 py-2 text-center">
                {d}
              </th>
            ))}

            <th className="border px-3 py-2 text-right">Grand Total</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.kode_reseller}>
              <td className="border px-2 py-1 font-semibold">
                {row.kode_reseller}
              </td>
              <td className="border px-2 py-1">
                {row.nama_reseller}
              </td>

              {dateColumns.map((d) => (
                <td key={d} className="border px-2 py-1 text-right">
                  {formatNumber(row[d])}
                </td>
              ))}

              <td className="border px-2 py-1 text-right font-bold">
                {formatNumber(row.grand_total)}
              </td>
            </tr>
          ))}

          {/* TOTAL */}
          <tr className="bg-orange-100 font-bold">
            <td className="border px-2 py-2" colSpan={2}>
              TOTAL
            </td>

            {dateColumns.map((_, i) => (
              <td key={i} className="border"></td>
            ))}

            <td className="border px-2 py-2 text-right text-[#800020]">
              {Number(totalAll).toLocaleString("id-ID")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
