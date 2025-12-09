    import { Award, Users } from 'lucide-react';

export default function RightStatsPanel({ totalEmployees, activeEmployees, departments }) {
  const attendancePercent = Math.round((activeEmployees / totalEmployees) * 100);

  return (
    <>
      {/* Kehadiran */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
            <Award size={20} />
          </div>
        </div>
        <p className="text-sm opacity-90 mb-1">KEHADIRAN</p>
        <p className="text-3xl font-bold">{attendancePercent}%</p>
      </div>

      {/* Total Karyawan */}
      <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>
        <p className="text-sm opacity-90 mb-1">TOTAL KARYAWAN</p>
        <p className="text-3xl font-bold">{totalEmployees}</p>
      </div>

      {/* List Departemen */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Departemen</h3>
        <div className="space-y-3">
          {Object.entries(departments).map(([dept, info], index) => (
            <div key={dept} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{dept}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{info.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-semibold mb-2 opacity-90">FITUR BARU</p>
          <h4 className="text-lg font-bold mb-3">Kelola data karyawan</h4>
          <button className="bg-white/30 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/40 transition-all">
            Lihat tutorial
          </button>
        </div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full"></div>
      </div>
    </>
  );
}
