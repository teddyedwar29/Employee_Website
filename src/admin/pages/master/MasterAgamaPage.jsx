// File: src/admin/pages/master/MasterAgamaPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

import Modal from '@/components/ui/Modal';
import {
  getAgamaOptions,
  createAgama,
  updateAgama,
  deleteAgama,
} from '@/services/apiService';
import PageHeader from '@/components/ui/PageHeader';


export default function MasterAgamaPage({onMenuClick}) {
  const [religions, setReligions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [namaInput, setNamaInput] = useState('');

  // --- LOAD DATA ---
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getAgamaOptions();
      const list = Array.isArray(data) ? data : data?.data || [];
      setReligions(list);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data agama:', err);
      setError(err.message || 'Gagal memuat data agama');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- FILTER ---
  const filteredReligions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return religions.filter((item) => {
      const nama = item.nama_agama || item.nama || '';
      return nama.toLowerCase().includes(q);
    });
  }, [religions, searchTerm]);

  // --- MODAL HANDLER ---
  const openAddModal = () => {
    setNamaInput('');
    setIsAddOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNamaInput(item.nama_agama || item.nama || '');
    setIsEditOpen(true);
  };

  // --- SUBMIT TAMBAH ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!namaInput.trim()) return;

    const payload = {
      nama_agama: namaInput.trim(),
    };

    try {
      await createAgama(payload);
      setIsAddOpen(false);
      setNamaInput('');
      await loadData();

      Swal.fire({
        title: 'Berhasil!',
        text: 'Agama berhasil ditambahkan.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal menambah agama.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };

  // --- SUBMIT EDIT ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!namaInput.trim() || !editingItem) return;

    const payload = {
      nama_agama: namaInput.trim(),
    };

    try {
      await updateAgama(editingItem.id, payload);
      setIsEditOpen(false);
      setEditingItem(null);
      setNamaInput('');
      await loadData();

      Swal.fire({
        title: 'Berhasil!',
        text: 'Agama berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal mengubah agama.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };

  // --- DELETE ---
  const handleDelete = async (item) => {
    const nama = item.nama_agama || item.nama || '-';

    const result = await Swal.fire({
      title: 'Hapus Agama?',
      text: `Yakin ingin menghapus "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAgama(item.id);
      await loadData();

      Swal.fire({
        title: 'Terhapus',
        text: 'Data agama berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text:
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus agama.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };

  // --- UI LOADING / ERROR ---
  if (isLoading && religions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Commet color={['#800020', '#a0002a']} size={48} />
        <p className="mt-4 text-sm text-gray-600">Memuat data agama...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-700 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <>
      {/* HEADER */}
      <PageHeader
        title="Agama"
        description="Kelola data agama karyawan"
        onMenuClick={onMenuClick}
      />

      {/* Toolbar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama agama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
            />
          </div>

          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-[#800020] to-[#a0002a] text-white px-6 py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus size={18} />
            Tambah Agama
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Total:{' '}
          <span className="font-bold text-[#800020]">{filteredReligions.length}</span> dari{' '}
          <span className="font-bold">{religions.length}</span> data
        </p>
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
                  Nama Agama
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReligions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada data agama yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredReligions.map((item, index) => {
                  const nama = item.nama_agama || item.nama || '-';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-800">{nama}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg text-xs font-medium transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg text-xs font-medium transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Agama"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Agama
            </label>
            <input
              type="text"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Misal: Islam, Kristen, Hindu..."
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg hover:shadow-lg"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Agama"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Agama
            </label>
            <input
              type="text"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg hover:shadow-lg"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
