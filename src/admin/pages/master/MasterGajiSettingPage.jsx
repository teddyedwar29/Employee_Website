// src/admin/pages/master/MasterGajiSettingPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Modal from '../../../components/ui/Modal';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import {
  getGajiSettings,
  createGajiSetting,
  updateGajiSetting,
  deleteGajiSetting,
  // options
  getDepartemenOptions,
  getJabatanOptions,
  getStatusKerjaOptions,
} from '../../../services/apiService';

export default function MasterGajiSettingPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // options
  const [departemenOptions, setDepartemenOptions] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const [form, setForm] = useState({
    departemen_id: '',
    jabatan_id: '',
    status_kerja_id: '',
    gaji_pokok: '',
    tunjangan_pokok: '',
    total_tunjangan_opsional: 0,
    total_potongan_opsional: 0,
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const [list, deps, jabs, statuses] = await Promise.all([
        getGajiSettings(),
        getDepartemenOptions(),
        getJabatanOptions(),
        getStatusKerjaOptions(),
      ]);
      setItems(Array.isArray(list) ? list : list?.data || []);
      setDepartemenOptions(deps?.data || deps || []);
      setJabatanOptions(jabs?.data || jabs || []);
      setStatusOptions(statuses?.data || statuses || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', err.message || 'Gagal load gaji setting', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({
      departemen_id: departemenOptions[0]?.id || '',
      jabatan_id: jabatanOptions[0]?.id || '',
      status_kerja_id: statusOptions[0]?.id || '',
      gaji_pokok: 0,
      tunjangan_pokok: 0,
      total_tunjangan_opsional: 0,
      total_potongan_opsional: 0,
    });
    setIsAddOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createGajiSetting(form); // jangan kirim id
      setIsAddOpen(false);
      await load();
      Swal.fire('Berhasil', 'Gaji setting ditambahkan', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', err.response?.data?.message || err.message || 'Error', 'error');
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      departemen_id: item.departemen_id,
      jabatan_id: item.jabatan_id,
      status_kerja_id: item.status_kerja_id,
      gaji_pokok: item.gaji_pokok,
      tunjangan_pokok: item.tunjangan_pokok,
      total_tunjangan_opsional: item.total_tunjangan_opsional,
      total_potongan_opsional: item.total_potongan_opsional,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateGajiSetting(editing.id, form);
      setIsEditOpen(false);
      setEditing(null);
      await load();
      Swal.fire('Berhasil', 'Diupdate', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', err.response?.data?.message || err.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title:'Hapus?', showCancelButton:true });
    if (!r.isConfirmed) return;
    try {
      await deleteGajiSetting(id);
      await load();
      Swal.fire('Terhapus','Data dihapus','success');
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Gaji Setting</h2>
        <p className="text-sm text-gray-600">Pengaturan komponen gaji per jabatan / departemen</p>
      </div>

      <div className="bg-white/70 rounded-3xl p-6 mb-6 flex items-center justify-between">
        <div className="flex-1">
          <input className="w-full px-4 py-3 rounded-xl border" placeholder="Cari..." />
          <p className="text-xs mt-2">Total: <b className="text-[#800020]">{items.length}</b></p>
        </div>
        <button onClick={openAdd} className="ml-4 bg-[#800020] text-white px-6 py-3 rounded-xl">+ Tambah</button>
      </div>

      <div className="bg-white/70 rounded-3xl p-4 shadow-xl">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-600">
              <th>#</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Status Kerja</th>
              <th>Gaji Pokok</th>
              <th>Tunjangan Pokok</th>
              <th>Total Tunjangan Ops</th>
              <th>Total Potongan Ops</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className="border-t">
                <td className="py-3">{idx+1}</td>
                <td>{it.departemen_nama || it.departemen_id}</td>
                <td>{it.jabatan_nama || it.jabatan_id}</td>
                <td>{it.status_kerja_nama || it.status_kerja_id}</td>
                <td>Rp {Number(it.gaji_pokok).toLocaleString('id-ID')}</td>
                <td>Rp {Number(it.tunjangan_pokok).toLocaleString('id-ID')}</td>
                <td>Rp {Number(it.total_tunjangan_opsional||0).toLocaleString('id-ID')}</td>
                <td>Rp {Number(it.total_potongan_opsional||0).toLocaleString('id-ID')}</td>
                <td>
                  <button onClick={() => openEdit(it)} className="p-2 bg-blue-50">Edit</button>
                  <button onClick={() => handleDelete(it.id)} className="p-2 ml-2 bg-red-50">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Gaji Setting">
        <form onSubmit={handleAdd} className="space-y-4">
          {/* pilih departemen, jabatan, status kerja */}
          <div>
            <label>Departemen</label>
            <select value={form.departemen_id} onChange={(e)=>setForm({...form, departemen_id:e.target.value})} className="w-full">
              {departemenOptions.map(d => <option key={d.id} value={d.id}>{d.nama_departemen || d.nama}</option>)}
            </select>
          </div>
          <div>
            <label>Jabatan</label>
            <select value={form.jabatan_id} onChange={(e)=>setForm({...form, jabatan_id:e.target.value})} className="w-full">
              {jabatanOptions.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan || j.nama}</option>)}
            </select>
          </div>
          <div>
            <label>Gaji Pokok</label>
            <input type="number" value={form.gaji_pokok} onChange={e=>setForm({...form,gaji_pokok:Number(e.target.value)})} className="w-full" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>setIsAddOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={isEditOpen} onClose={()=>setIsEditOpen(false)} title="Edit Gaji Setting">
        <form onSubmit={handleEdit} className="space-y-4">
          {/* sama seperti add, bind ke form */}
          <div>
            <label>Gaji Pokok</label>
            <input type="number" value={form.gaji_pokok} onChange={e=>setForm({...form,gaji_pokok:Number(e.target.value)})} className="w-full" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>setIsEditOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded">Simpan</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
