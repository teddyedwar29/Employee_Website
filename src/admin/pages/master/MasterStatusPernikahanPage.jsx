// File: src/admin/pages/master/MasterStatusPernikahanPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

import Modal from '../../../components/ui/Modal';
import {
  getStatusPernikahanOptions,
  createStatusPernikahan,
  updateStatusPernikahan,
  deleteStatusPernikahan,
} from '../../../services/apiService';

// Helper: generate ID berikutnya, lanjutin dari ID yang sudah ada
const generateNextId = (items) => {
  if (!items || items.length === 0) {
    return 'ST-PRK-001'; // default kalau belum ada data
  }

  let maxNum = 0;
  let prefix = '';

  items.forEach((item, index) => {
    const id = String(item.id || '');
    if (!id) return;

    // ambil angka di paling belakang (apapun prefiks-nya)
    const match = id.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;

      // prefix diambil dari ID pertama yang valid, buang angka di belakang
      if (!prefix) {
        prefix = id.replace(/(\d+)$/, '');
      }
    }
  });

  if (!prefix) {
    prefix = 'ST-PRK-'; // fallback
  }

  const next = maxNum + 1;
  const padded = String(next).padStart(3, '0');
  return `${prefix}${padded}`;
};

export default function MasterStatusPernikahanPage() {
  const [statuses, setStatuses] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [namaInput, setNamaInput] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getStatusPernikahanOptions();
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil status pernikahan:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter((s) => {
      const nama = s.nama_status || s.nama || '';
      return nama.toLowerCase().includes(q);
    });
  }, [items, searchTerm]);

  const openAddModal = () => {
    setNamaInput('');
    setIsAddOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNamaInput(item.nama_status || item.nama || '');
    setIsEditOpen(true);
  };

  const generateNextId = () => {
    if (!statuses.length) {
        return 'ST-PERNI-001';
    }

    // Ambil item terakhir
    const lastItem = statuses[statuses.length - 1];
    const lastId = lastItem.id || 'ST-PERNI-000';

    // Ambil 4 digit terakhir
    const lastNumber = parseInt(lastId.split('-').pop(), 10) || 0;

    // Naikkan 1 lalu pad jadi 4 digit
    const nextNumber = lastNumber + 1;
    return `ST-PERNI-${String(nextNumber).padStart(3, '0')}`;
  };


  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!namaInput.trim()) return;

    const payload = {
      id: generateNextId(),         // ✅ contoh: ST-KONT-0004
      nama: namaInput.trim(),     // ✅ field yang benar
    };

    try {
      await createStatusPernikahan(payload);
      setIsAddOpen(false);
      await loadData();

      Swal.fire({
        title: 'Berhasil!',
        text: 'Status pernikahan berhasil ditambahkan.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: err.message || 'Gagal menambah status pernikahan.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!namaInput.trim() || !editingItem) return;

    try {
      await updateStatusPernikahan(editingItem.id, { nama: namaInput.trim() });
      setIsEditOpen(false);
      setEditingItem(null);
      await loadData();

      Swal.fire({
        title: 'Berhasil!',
        text: 'Status pernikahan berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: err.message || 'Gagal mengubah status pernikahan.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };


  const handleDelete = async (item) => {
    const nama = item.nama_status || item.nama || '-';

    const result = await Swal.fire({
      title: 'Hapus Status?',
      text: `Yakin ingin menghapus status pernikahan "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStatusPernikahan(item.id);
      await loadData();

      Swal.fire({
        title: 'Terhapus',
        text: 'Status pernikahan berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#800020',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: err.message || 'Gagal menghapus status pernikahan.',
        icon: 'error',
        confirmButtonColor: '#800020',
      });
    }
  };

  // --- UI Loading & Error --- //
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Commet color={['#800020', '#a0002a']} size={48} />
        <p className="mt-4 text-sm text-gray-600">Memuat data status pernikahan...</p>
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

  // --- MAIN UI --- //
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Status Pernikahan</h2>
        <p className="text-sm text-gray-600">Kelola data status pernikahan karyawan</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari status pernikahan..."
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
            Tambah Status
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Total:{' '}
          <span className="font-bold text-[#800020]">{filteredItems.length}</span> dari{' '}
          <span className="font-bold">{items.length}</span> data
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
                  Status Pernikahan
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada data status pernikahan yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const nama = item.nama_status || item.nama || '-';

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
        title="Tambah Status Pernikahan"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Status
            </label>
            <input
              type="text"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Misal: Belum Menikah, Menikah, Cerai"
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
        title="Edit Status Pernikahan"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Status
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
