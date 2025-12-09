// File: src/admin/pages/master/MasterJabatanPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';

import Modal from "../../../components/ui/Modal";

import {
  getJabatanOptions,
  createJabatan,
  updateJabatan,
  deleteJabatan,
} from '../../../services/apiService';

// ====== Modal Tambah/Edit Jabatan ======
function JabatanFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    nama_jabatan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // reset isi form setiap modal dibuka / data edit berubah
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      setFormData({
        nama_jabatan: initialData?.nama_jabatan || '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      nama_jabatan: formData.nama_jabatan.trim(),
    };

    if (!payload.nama_jabatan) {
      setError('Nama jabatan tidak boleh kosong.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(payload);

      await Swal.fire({
        title: isEdit ? 'Berhasil di-update' : 'Berhasil ditambahkan',
        text: isEdit
          ? 'Data jabatan berhasil diperbarui.'
          : 'Data jabatan baru berhasil ditambahkan.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });

      onClose();
    } catch (err) {
      console.error('Gagal menyimpan jabatan:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Nama Jabatan
          </label>
          <input
            type="text"
            name="nama_jabatan"
            value={formData.nama_jabatan}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
            placeholder="Contoh: Operator, IT, HRD..."
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <Commet
                size={16}
                color={['#800020', '#a0002a', '#c00034', '#e0003e']}
              />
            )}
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ====== Halaman Master Jabatan ======
export default function MasterJabatanPage() {
  const [jabatanList, setJabatanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState(null);

  // ambil data dari backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getJabatanOptions();

      let data = [];
      if (Array.isArray(res)) {
        data = res;
      } else if (res && Array.isArray(res.data)) {
        data = res.data;
      } else {
        console.warn('Respon API /jabatan bukan array:', res);
      }

      setJabatanList(data);
    } catch (err) {
      console.error('Gagal memuat jabatan:', err);
      setError(err.message || 'Gagal memuat data jabatan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredJabatan = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return jabatanList.filter((j) =>
      (j.nama_jabatan || j.nama || '')
        .toLowerCase()
        .includes(q)
    );
  }, [jabatanList, searchTerm]);

  // handler tambah
  const handleAddJabatan = async (payload) => {
    await createJabatan(payload);
    await loadData();
  };

  // handler update
  const handleUpdateJabatan = async (payload) => {
    if (!editingJabatan?.id) throw new Error('ID jabatan tidak ditemukan.');
    await updateJabatan(editingJabatan.id, payload);
    await loadData();
  };

  // handler delete
  const handleDeleteJabatan = async (item) => {
    const result = await Swal.fire({
      title: 'Hapus Jabatan?',
      text: `Kamu yakin ingin menghapus jabatan "${item.nama_jabatan || item.nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteJabatan(item.id);
      await Swal.fire({
        title: 'Terhapus',
        text: 'Data jabatan berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
      await loadData();
    } catch (err) {
      console.error('Gagal menghapus jabatan:', err);
      Swal.fire({
        title: 'Gagal',
        text: err.message || 'Terjadi kesalahan saat menghapus data.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };

  // ====== RENDER ======

  if (isLoading && jabatanList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Commet
          size={60}
          color={['#800020', '#a0002a', '#c00034', '#e0003e']}
        />
      </div>
    );
  }

  if (error && jabatanList.length === 0) {
    return (
      <div className="bg-white/80 rounded-3xl p-8 shadow-xl text-center">
        <p className="text-lg font-bold text-red-600 mb-2">Gagal memuat data</p>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg text-sm font-medium"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modal Tambah */}
      <JabatanFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddJabatan}
      />

      {/* Modal Edit */}
      <JabatanFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateJabatan}
        initialData={editingJabatan}
      />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Data Jabatan</h2>
        <p className="text-sm text-gray-600">
          Kelola data jabatan karyawan di perusahaan.
        </p>
      </div>

      {/* Filter + Tombol Tambah */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-to-r from-[#800020] to-[#a0002a] text-white px-6 py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Jabatan
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          Total:{' '}
          <span className="font-bold text-[#800020]">
            {filteredJabatan.length}
          </span>{' '}
          dari {jabatanList.length} data
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Jabatan
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredJabatan.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">
                      {item.nama_jabatan || item.nama}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingJabatan(item);
                          setIsEditOpen(true);
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg text-xs font-medium transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteJabatan(item)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg text-xs font-medium transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJabatan.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Tidak ada data jabatan yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
