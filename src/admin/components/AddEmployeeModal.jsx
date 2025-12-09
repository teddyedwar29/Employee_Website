// File: src/admin/components/AddEmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';

export default function AddEmployeeModal({ 
  isOpen, 
  onClose, 
  onAddEmployee,
  jabatanOptions = [],
  statusKerjaOptions = [],
  statusPernikahanOptions = []
}) {
  
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    id_jabatan_karyawan: '',
    id_status_pernikahan: '',
    npwp: '',
    status_pajak: '',
    alamat: '',
    no_hp: '',
    tanggal_masuk: '',
    awal_kontrak: '',
    akhir_kontrak: '',
    id_status_kerja_karyawan: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFormData({
        nama: '',
        nik: '',
        npwp: '',
        status_pajak: '',
        id_jabatan_karyawan: jabatanOptions?.length ? jabatanOptions[0].id : '',
        id_status_pernikahan: statusPernikahanOptions?.length ? statusPernikahanOptions[0].id : '',
        id_status_kerja_karyawan: statusKerjaOptions?.length ? statusKerjaOptions[0].id : '',
        alamat: '',
        no_hp: '',
        tanggal_masuk: '',
        awal_kontrak: '',
        akhir_kontrak: '',
      });
    }
  }, [isOpen]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'nik') {
      newValue = value.replace(/\D/g, '').slice(0, 16);
    }

    // Opsional: No HP juga hanya angka
    if (name === 'no_hp') {
      newValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: newValue 
    }));
  };

  // ✅ FIXED: Handle submit dengan error handling

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  // const generateId = () => {
  //   return `KRY-${Date.now()}`;
  // };

  const dataToSubmit = {
    // id: generateId(),
    nama: formData.nama,
    // ✅ Convert NIK ke integer (atau null kalau kosong)
    nik: formData.nik || null,
    // ✅ Convert No HP ke integer (atau null kalau kosong)
    no_hp: formData.no_hp || null,
    alamat: formData.alamat === '' ? null : formData.alamat,
    id_jabatan_karyawan: formData.id_jabatan_karyawan || null,
    id_status_kerja_karyawan: formData.id_status_kerja_karyawan || null,
    id_status_pernikahan: formData.id_status_pernikahan || null,
    tanggal_masuk: formData.tanggal_masuk === '' ? null : formData.tanggal_masuk,
    awal_kontrak: formData.awal_kontrak === '' ? null : formData.awal_kontrak,
    akhir_kontrak: formData.akhir_kontrak === '' ? null : formData.akhir_kontrak,
    npwp: formData.npwp === '' ? null : formData.npwp,
    status_pajak: formData.status_pajak === '' ? null : formData.status_pajak,
  };

  console.log('Data yang dikirim ke server:', dataToSubmit);

  try {
    await onAddEmployee(dataToSubmit);
    
    Swal.fire({
      title: 'Berhasil!',
      text: 'Data karyawan berhasil ditambahkan.',
      icon: 'success',
      confirmButtonColor: '#800020',
    });

    onClose();
  } catch (err) {
    console.error('Error caught:', err);
    setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <Modal title="Tambah Karyawan Baru" isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        {/* Overlay loader */}
        {isSubmitting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
            <Commet
              color={["#800020", "#8a0023", "#a0002a", "#c8003d"]}
              size={60}
            />
            <p className="mt-4 text-sm text-gray-600">Menyimpan data...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            Gagal menyimpan: {error}
          </div>
        )}

        {/* Baris 1: Nama & NIK */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">NIK</label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={handleChange}
              maxLength={16}
              inputMode="numeric"
              pattern="\d*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Contoh: 13710..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">NPWP</label>
            <input
              type="text"
              name="npwp"
              value={formData.npwp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Contoh: 13710..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status Pajak</label>
            <input
              type="text"
              name="status_pajak"
              value={formData.status_pajak}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder=""
            />
          </div>
        </div>
        
        {/* Baris 2: Jabatan & No. HP */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Jabatan</label>
            <select
              name="id_jabatan_karyawan"
              value={formData.id_jabatan_karyawan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              disabled={jabatanOptions.length === 0}
              required
            >
              <option value="">Pilih Jabatan</option>
              {jabatanOptions.map(jabatan => (
                <option key={jabatan.id} value={jabatan.id}>
                  {jabatan.nama_jabatan || jabatan.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">No. HP</label>
            <input
              type="text"
              name="no_hp"
              value={formData.no_hp}
              onChange={handleChange}
              maxLength={13}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Contoh: 0812..."
            />
          </div>
        </div>
        
        {/* Baris 3: Alamat */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Alamat</label>
          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
          ></textarea>
        </div>
        
        {/* Baris 4: Tanggal Masuk & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tanggal Masuk</label>
            <input
              type="date"
              name="tanggal_masuk"
              value={formData.tanggal_masuk}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status Kerja</label>
            <select
              name="id_status_kerja_karyawan"
              value={formData.id_status_kerja_karyawan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              disabled={statusKerjaOptions.length === 0}
              required
            >
              <option value="">Pilih Status</option>
              {statusKerjaOptions.map(status => (
                <option key={status.id} value={status.id}>
                  {status.nama_status || status.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status pernikahan</label>
            <select
              name="id_status_pernikahan"
              value={formData.id_status_pernikahan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              disabled={statusPernikahanOptions.length === 0}
              required
            >
              <option value="">Pilih Status</option>
              {statusPernikahanOptions.map(status => (
                <option key={status.id} value={status.id}>
                  {status.nama_status || status.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris 5: Kontrak */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Awal Kontrak</label>
            <input
              type="date"
              name="awal_kontrak"
              value={formData.awal_kontrak}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Akhir Kontrak</label>
            <input
              type="date"
              name="akhir_kontrak"
              value={formData.akhir_kontrak}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>
        </div>

        {/* Tombol */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] cursor-pointer text-white rounded-lg hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Karyawan'}
          </button>
        </div>
        </form>
      </div>
    </Modal>
  );
}