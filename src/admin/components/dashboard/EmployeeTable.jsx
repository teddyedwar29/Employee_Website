    export default function EmployeeTable({ employees }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Daftar Karyawan</h3>
        <a href="#" className="text-xs text-[#800020] font-medium">Lihat semua</a>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Posisi</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Dept</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                <td className="py-3 px-2">
                  <span className="text-sm font-bold text-gray-800">{index + 1}</span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#800020] to-[#a0002a] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs text-gray-600">{emp.position}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs text-gray-600">{emp.department}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs text-gray-500">{emp.email}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
