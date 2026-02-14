import { useMemo } from "react";

export default function OtomaxPivotTableMarketing({ data = [], totalAll = 0 }) {
  // ======================
  // FILTER: HANYA AK
  // ======================
  const filteredRows = useMemo(() => {
    return data.filter(
      (row) =>
        typeof row.kode_reseller === "string" &&
        !row.kode_reseller.toUpperCase().includes("TOTAL")
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
    <div className="overflow-x-auto">
      <table className="w-full border text-sm border-collapse">
        <thead className="bg-[#C65911] text-white">
          <tr>
            <th
              className="
                border px-3 py-2
              "
            >
              Kode Reseller
            </th>

            <th
              className="
                border px-3 py-2
              "
            >
              Nama Reseller
            </th>

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
              <td
                className="
                  border px-2 py-1
                "
              >
                {row.kode_reseller}
              </td>

              <td
                className="
                  border px-2 py-1
                "
              >
                {row.nama_reseller}
              </td>


              {dateColumns.map((d) => {
                const value = Number(row[d] || 0);
                const isZero = value === 0;

                return (
                  <td
                    key={d}
                    className={`
                      border px-2 py-1 text-right
                      ${isZero ? "bg-red-500 text-white font-semibold" : ""}
                    `}
                  >
                    {formatNumber(value)}
                  </td>
                );
              })}


              <td className="border px-2 py-1 text-right font-bold">
                {formatNumber(row.grand_total)}
              </td>
            </tr>
          ))}

          {/* TOTAL */}
          <tr className="bg-orange-100 font-bold">
            <td className="border px-2 py-2 " colSpan={2}>
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
