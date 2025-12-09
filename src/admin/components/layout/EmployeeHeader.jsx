import { Calendar, UserCircle } from 'lucide-react';

function EmployeeHeader() {
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-600 mb-1">Welcome back, Admin 👋</p>
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
    </div>
  );
}

/** chip kecil untuk info total karyawan */
function InfoChip({ label }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl px-4 py-2">
      <UserCircle className="text-[#800020]" size={20} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

/** chip tanggal */
function DateChip() {
  return (
    <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl px-4 py-2">
      <Calendar className="text-[#800020]" size={20} />
      <span className="text-sm text-gray-600">Jumat, 14 November 2025</span>
    </div>
  );
}

EmployeeHeader.InfoChip = InfoChip;
EmployeeHeader.DateChip = DateChip;

export default EmployeeHeader;
