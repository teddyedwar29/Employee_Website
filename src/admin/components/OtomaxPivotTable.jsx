import { useMemo } from "react";

export default function OtomaxPivotTable({ data = [], uplineTotals = {} }) {
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

  const groupedByUpline = useMemo(() => {
  const map = {};

  filteredRows.forEach((row) => {
    if (!map[row.kode_upline]) {
      map[row.kode_upline] = [];
    }
    map[row.kode_upline].push(row);
  });

  return map;
}, [filteredRows]);


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
        if (!ignore.includes(key)) {
          cols.add(key);
        }
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
      <table className="w-full border text-sm">
        {/* ===== HEADER ===== */}
        <thead className="bg-[#C65911] text-white">
          <tr>
            <th className="border px-3 py-2">Kode Upline</th>
            <th className="border px-3 py-2">Nama Upline</th>
            <th className="border px-3 py-2">Kode Reseller</th>
            <th className="border px-3 py-2">Nama Reseller</th>

            {dateColumns.map((d) => (
              <th key={d} className="border px-3 py-2 text-center">
                {d}
              </th>
            ))}

            <th className="border px-3 py-2 text-right">Grand Total</th>
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {Object.entries(groupedByUpline).map(([upline, rows]) => {
            return (
              <>
                {rows.map((row, index) => (
                  <tr key={`${upline}-${row.kode_reseller}`}>
                    {/* KODE UPLINE hanya sekali */}
                    <td className="border px-2 py-1 font-semibold">
                      {index === 0 ? upline : ""}
                    </td>
                    <td className="border px-2 py-1">
                      {index === 0 ? uplineTotals[upline]?.nama || "-" : ""}
                    </td>

                    <td className="border px-2 py-1">{row.kode_reseller}</td>
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

                {/* ROW TOTAL UPLINE */}
                <tr className="bg-orange-100 font-bold">
                  <td className="border px-2 py-2" colSpan={4}>
                    TOTAL {upline}
                  </td>

                  {dateColumns.map((_, i) => (
                    <td key={i} className="border"></td>
                  ))}

                  <td className="border px-2 py-2 text-right text-[#800020]">
                    {uplineTotals[upline]
                      ? formatNumber(uplineTotals[upline].total)
                      : "-"}
                  </td>
                </tr>

              </>
            );
          })}
        </tbody>


      </table>
    </div>
  );
}
