import { useMemo } from "react";

export default function OtomaxPivotTable({ data = [], uplineTotals = {} }) {
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

  const calculateUplineTotal = (rows) => {
    return rows.reduce((sum, row) => {
      return sum + Number(row.grand_total || 0);
    }, 0);
  };

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
            const subtotalUpline = calculateUplineTotal(rows);

            return (
              <>
                {rows.map((row, index) => (
                  <tr key={`${upline}-${row.kode_reseller}`}>
                    {/* KODE UPLINE hanya sekali */}
                    <td className="border px-2 py-1 font-semibold">
                      {index === 0 ? upline : ""}
                    </td>

                    <td className="border px-2 py-1">{row.kode_reseller}</td>
                    <td className="border px-2 py-1">{row.nama_reseller}</td>

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

                {/* ROW TOTAL UPLINE */}
                <tr className="bg-orange-100 font-bold">
                  <td className="border px-2 py-2" colSpan={3}>
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
