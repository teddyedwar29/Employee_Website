import React from 'react';
import Modal from '../../components/ui/Modal';
import { UserCircle, Phone, MapPin, FileText, Calendar, Shield } from 'lucide-react';

// Helper function (SAMA KAYAK DI DataEmployee.jsx)
const getJabatanName = (id, jabatanOptions) => {
  if (!jabatanOptions) return '...';
  const jabatan = jabatanOptions.find(j => j.id == id);
  return jabatan ? (jabatan.nama_jabatan || jabatan.nama) : 'N/A';
};

const getStatusName = (id, statusKerjaOptions) => {
  if (!statusKerjaOptions) return '...';
  const status = statusKerjaOptions.find(s => s.id == id);
  return status ? (status.nama_status || status.nama) : 'N/A';
};

const getStatusPernikahanName = (id, statusPernikahanOptions) => {
  if (!statusPernikahanOptions) return '...';
  const status = statusPernikahanOptions.find(s => s.id == id);
  return status ? (status.nama_status || status.nama) : 'N/A';
}

// Component kecil untuk nampilin baris data
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 border-b border-gray-100">
    <div className="flex-shrink-0 w-8 pt-0.5">
      <Icon className="text-gray-400" size={16} />
    </div>
    <div className="flex-grow">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

export default function DetailEmployeeModal({ 
  isOpen, 
  onClose, 
  employeeData, // Data karyawan yang diklik
  jabatanOptions,
  statusKerjaOptions,
  statusPernikahanOptions
}) {
  
  // Jangan render apa-apa kalo datanya belum siap
  if (!employeeData) {
    return null;
  }

  // Kita panggil helper di sini
  const namaJabatan = getJabatanName(employeeData.id_jabatan_karyawan, jabatanOptions);
  const namaStatus = getStatusName(employeeData.id_status_kerja_karyawan, statusKerjaOptions);
  const namaStatusPernikahan = getStatusPernikahanName(
  employeeData.id_status_pernikahan || employeeData.status_pernikahan?.id,
  statusPernikahanOptions
  );
  return (
    <Modal title="Detail Karyawan" isOpen={isOpen} onClose={onClose}>
      {/* Header Info */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-4">
        <div className="w-16 h-16 bg-linear-to-br from-[#800020] to-[#a0002a] rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {(employeeData.nama || '?').charAt(0)}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{employeeData.nama}</h3>
          <p className="text-sm text-gray-500">{employeeData.nik || 'NIK tidak ada'}</p>
        </div>
      </div>

      {/* List Detail Data */}
      <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
        <DetailRow 
          icon={UserCircle} 
          label="Jabatan" 
          value={namaJabatan} 
        />
        <DetailRow 
          icon={Shield} 
          label="Status Kerja" 
          value={namaStatus} 
        />
        <DetailRow 
          icon={Phone} 
          label="No. HP" 
          value={employeeData.no_hp} 
        />
        <DetailRow 
          icon={MapPin} 
          label="Alamat" 
          value={employeeData.alamat} 
        />
        <DetailRow 
          icon={Shield} 
          label="Status Pernikahan" 
          value={namaStatusPernikahan} 
        />
        <DetailRow 
          icon={MapPin} 
          label="NPWP" 
          value={employeeData.npwp} 
        />
        <DetailRow 
          icon={MapPin} 
          label="Status Pajak" 
          value={employeeData.status_pajak} 
        />
        <DetailRow 
          icon={Calendar} 
          label="Tanggal Masuk" 
          value={employeeData.tanggal_masuk} 
        />
        <DetailRow 
          icon={FileText} 
          label="Awal Kontrak" 
          value={employeeData.awal_kontrak} 
        />
        <DetailRow 
          icon={FileText} 
          label="Akhir Kontrak" 
          value={employeeData.akhir_kontrak} 
        />
        <DetailRow 
          icon={FileText} 
          label="Durasi Kontrak" 
          value={employeeData.durasi_kontrak ? `${employeeData.durasi_kontrak} days` : null}
        />
      </div>

      {/* Footer (Tombol Tutup) */}
      <div className="pt-6 text-right">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}