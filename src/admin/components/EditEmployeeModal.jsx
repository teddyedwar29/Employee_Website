// File: src/admin/components/EditEmployeeModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';

// Helper: format string tanggal ke yyyy-mm-dd untuk input[type="date"]
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr).slice(0, 10);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return String(dateStr).slice(0, 10);
  }
};

export default function EditEmployeeModal({
  isOpen,
  onClose,
  onUpdateEmployee,
  employeeData,
  jabatanOptions = [],
  statusKerjaOptions = [],
  statusPernikahanOptions = [],
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

  // Prefill form ketika modal dibuka
  useEffect(() => {
    if (!isOpen || !employeeData) return;

    setError(null);

    setFormData({
      nama: employeeData.nama || '',
      nik: employeeData.nik ? String(employeeData.nik) : '',
      npwp: employeeData.npwp || '',
      status_pajak: employeeData.status_pajak || '',
      id_jabatan_karyawan:
        employeeData.id_jabatan_karyawan ||
        employeeData.jabatan?.id ||
        (jabatanOptions[0] ? jabatanOptions[0].id : ''),
      id_status_pernikahan:
        employeeData.id_status_pernikahan ||
        employeeData.status_pernikahan?.id ||
        (statusPernikahanOptions[0] ? statusPernikahanOptions[0].id : ''),
      id_status_kerja_karyawan:
        employeeData.id_status_kerja_karyawan ||
        employeeData.status_kerja?.id ||
        (statusKerjaOptions[0] ? statusKerjaOptions[0].id : ''),
      alamat: employeeData.alamat || '',
      no_hp: employeeData.no_hp ? String(employeeData.no_hp) : '',
      tanggal_masuk: formatDateForInput(employeeData.tanggal_masuk),
      awal_kontrak: formatDateForInput(employeeData.awal_kontrak),
      akhir_kontrak: formatDateForInput(employeeData.akhir_kontrak),
    });
  }, [isOpen, employeeData, jabatanOptions, statusKerjaOptions, statusPernikahanOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // NIK: hanya angka & max 16 digit
    if (name === 'nik') {
      newValue = value.replace(/\D/g, '').slice(0, 16);
    }

    // No HP: hanya angka
    if (name === 'no_hp') {
      newValue = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeData?.id) return;

    setIsSubmitting(true);
    setError(null);

    // Base data sama persis pattern AddEmployeeModal
    const baseData = {
      nama: formData.nama,
      nik: formData.nik || null,
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

    const dataToSubmit = { ...baseData };

    // ====== FIX: kalau NIK / No HP tidak diubah, jangan dikirim ======
    const originalNik = employeeData.nik ? String(employeeData.nik) : '';
    const originalNoHp = employeeData.no_hp ? String(employeeData.no_hp) : '';

    if (formData.nik.trim() === originalNik.trim()) {
      delete dataToSubmit.nik;
    }

    if (formData.no_hp.trim() === originalNoHp.trim()) {
      delete dataToSubmit.no_hp;
    }
    // ================================================================

    try {
      await onUpdateEmployee(employeeData.id, dataToSubmit);

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Data karyawan berhasil diupdate.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });

      onClose();
    } catch (err) {
      console.error('Error update karyawan:', err);
      setError(err.message || 'Gagal mengupdate karyawan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Karyawan" isOpen={isOpen} onClose={onClose}>
      <div className="relative">

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
              Gagal mengupdate: {error}
            </div>
          )}

          {/* Baris 1: Nama & NIK */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Nama Lengkap
              </label>
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
                {jabatanOptions.map((jabatan) => (
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
                inputMode="numeric"
                pattern="\d*"
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

          {/* Baris 4: Tanggal Masuk, Status Kerja, Status Pernikahan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Tanggal Masuk
              </label>
              <input
                type="date"
                name="tanggal_masuk"
                value={formData.tanggal_masuk}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Status Kerja
              </label>
              <select
                name="id_status_kerja_karyawan"
                value={formData.id_status_kerja_karyawan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
                disabled={statusKerjaOptions.length === 0}
                required
              >
                <option value="">Pilih Status</option>
                {statusKerjaOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nama_status || status.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Status Pernikahan
              </label>
              <select
                name="id_status_pernikahan"
                value={formData.id_status_pernikahan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
                disabled={statusPernikahanOptions.length === 0}
                required
              >
                <option value="">Pilih Status</option>
                {statusPernikahanOptions.map((status) => (
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
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Awal Kontrak
              </label>
              <input
                type="date"
                name="awal_kontrak"
                value={formData.awal_kontrak}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Akhir Kontrak
              </label>
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
              className="px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r cursor-pointer from-[#800020] to-[#a0002a] text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Mengupdate...' : 'Update Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
