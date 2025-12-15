// src/admin/pages/master/MasterGajiRulePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import {
  getGajiRules,
  createGajiRule,
  updateGajiRule,
  deleteGajiRule,
  getJabatanOptions
} from '../../../services/apiServie';

export default function MasterGajiRulePage() {
  const [items, setItems] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // form fields
  const [jabatanId, setJabatanId] = useState('');
  const [formula, setFormula] = useState('');
  const [variables, setVariables] = useState(''); // plain text or JSON string

  const load = async () => {
    try {
      setIsLoading(true);
      const [rulesRes, jabRes] = await Promise.all([getGajiRules(), getJabatanOptions()]);
      const rules = Array.isArray(rulesRes) ? rulesRes : (rulesRes?.data || []);
      const jabs = Array.isArray(jabRes) ? jabRes : (jabRes?.data || []);
      setItems(rules);
      setJabatanOptions(jabs);
      setError(null);
    } catch (err) {
      console.error('load gaji rule error', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => {
      const jabName = i.jabatan?.nama_jabatan || i.jabatan?.nama || '';
      return (
        jabName.toLowerCase().includes(q) ||
        (i.formula || '').toLowerCase().includes(q) ||
        (i.id || '').toLowerCase().includes(q)
      );
    });
  }, [search, items]);

  // open add modal
  const openAdd = () => {
    setJabatanId(jabatanOptions[0]?.id || '');
    setFormula('');
    setVariables('');
    setIsAddOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setJabatanId(item.id_jabatan_karyawan || item.id_jabatan || '');
    setFormula(item.formula || '');
    setVariables(item.variables || '');
    setIsEditOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    // payload: ikuti spec backend
    const payload = {
      id_jabatan_karyawan: jabatanId || null,
      formula: formula || null,
      variables: variables || null,
    };
    try {
      await createGajiRule(payload);
      setIsAddOpen(false);
      await load();
      Swal.fire({ title: 'Berhasil', text: 'Gaji rule ditambah', icon: 'success', confirmButtonColor: '#800020' });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Gagal', text: err.response?.data?.message || err.message || 'Gagal menambah', icon: 'error', confirmButtonColor: '#800020' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      id_jabatan_karyawan: jabatanId || null,
      formula: formula || null,
      variables: variables || null,
    };
    try {
      await updateGajiRule(editing.id, payload);
      setIsEditOpen(false);
      setEditing(null);
      await load();
      Swal.fire({ title: 'Berhasil', text: 'Gaji rule diperbarui', icon: 'success', confirmButtonColor: '#800020' });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Gagal', text: err.response?.data?.message || err.message || 'Gagal mengubah', icon: 'error', confirmButtonColor: '#800020' });
    }
  };

  const handleDelete = async (item) => {
    const r = await Swal.fire({
      title: 'Hapus?',
      text: `Yakin hapus rule untuk ${item.jabatan?.nama_jabatan || item.id_jabatan_karyawan || item.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020'
    });
    if (!r.isConfirmed) return;
    try {
      await deleteGajiRule(item.id);
      await load();
      Swal.fire({ title: 'Terhapus', text: 'Data dihapus', icon: 'success', confirmButtonColor: '#800020' });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Gagal', text: err.response?.data?.message || err.message || 'Gagal menghapus', icon: 'error', confirmButtonColor: '#800020' });
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Commet color={['#800020', '#a0002a']} size={48} />
        <p className="mt-3 text-sm text-gray-600">Memuat data gaji rule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-red-600">Terjadi kesalahan</h3>
        <p className="text-sm text-gray-700">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded">Muat ulang</button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Gaji Rule</h2>
        <p className="text-sm text-gray-600">Aturan gaji berdasarkan jabatan (formula & variables)</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari jabatan, formula, id..." className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]" />
          </div>

          <button onClick={openAdd} className="bg-gradient-to-r from-[#800020] to-[#a0002a] text-white px-6 py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2">
            <Plus size={18} /> Tambah Rule
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600">Total: <span className="font-bold text-[#800020]">{filtered.length}</span> dari <span className="font-bold">{items.length}</span></p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Jabatan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Formula</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Variables</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada data sesuai pencarian.</td></tr>
              ) : (
                filtered.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{idx+1}</td>
                    <td className="px-6 py-4">{it.jabatan?.nama_jabatan || it.jabatan?.nama || '-'}</td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-700 max-w-sm truncate">{it.formula || '-'}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-600 max-w-md truncate">{it.variables || '-'}</div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={()=>openEdit(it)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg text-xs">
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={()=>handleDelete(it)} className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg text-xs">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={()=>setIsAddOpen(false)} title="Tambah Gaji Rule">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <select value={jabatanId} onChange={(e)=>setJabatanId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Pilih jabatan (opsional)</option>
              {jabatanOptions.map(j=> <option key={j.id} value={j.id}>{j.nama_jabatan || j.nama}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
            <textarea value={formula} onChange={(e)=>setFormula(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
            <p className="text-xs text-gray-500 mt-1">Contoh: gaji_pokok + tunjangan_pokok</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variables (JSON atau text)</label>
            <textarea value={variables} onChange={(e)=>setVariables(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={()=>setIsAddOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={()=>setIsEditOpen(false)} title="Edit Gaji Rule">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <select value={jabatanId} onChange={(e)=>setJabatanId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Pilih jabatan (opsional)</option>
              {jabatanOptions.map(j=> <option key={j.id} value={j.id}>{j.nama_jabatan || j.nama}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
            <textarea value={formula} onChange={(e)=>setFormula(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
            <textarea value={variables} onChange={(e)=>setVariables(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={()=>setIsEditOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded-lg">Simpan Perubahan</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
