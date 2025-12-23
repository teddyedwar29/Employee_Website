// src/admin/pages/master/MasterGajiSettingPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Commet } from 'react-loading-indicators';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '@/components/ui/Modal';

import {
  getGajiSettings,
  createGajiSetting,
  updateGajiSetting,
  deleteGajiSetting,
  getDepartemenOptions,
  getJabatanOptions,
  getStatusKerjaOptions,
} from '@/services/apiService';
import PageHeader from '@/components/ui/PageHeader';

export default function MasterGajiSettingPage({onMenuClick}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [departemenOptions, setDepartemenOptions] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [statusKerjaOptions, setStatusKerjaOptions] = useState([]);

  // modal / form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  

  const initialForm = {
    departemen_id: '',
    jabatan_id: '',
    status_kerja_id: '',
    gaji_pokok: '',
    tunjangan_pokok: '',
    tunjangan_opsional: [], // [{keterangan, jumlah}]
    potongan_opsional: [],  // [{keterangan, jumlah}]
  };
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [listRes, deps, jabs, swork] = await Promise.all([
        getGajiSettings(),
        getDepartemenOptions(),
        getJabatanOptions(),
        getStatusKerjaOptions(),
      ]);

      setItems(Array.isArray(listRes) ? listRes : listRes?.data || []);
      setDepartemenOptions(Array.isArray(deps) ? deps : deps?.data || []);
      setJabatanOptions(Array.isArray(jabs) ? jabs : jabs?.data || []);
      setStatusKerjaOptions(Array.isArray(swork) ? swork : swork?.data || []);
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAddModal = () => {
    setForm({
      ...initialForm,
      departemen_id: departemenOptions[0]?.id || '',
      jabatan_id: jabatanOptions[0]?.id || '',
      status_kerja_id: statusKerjaOptions[0]?.id || '',
      gaji_pokok: 0,
      tunjangan_pokok: 0,
      tunjangan_opsional: [],
      potongan_opsional: [],
    });
    setIsAddOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      departemen_id: item.departemen_id || item.departemen?.id || '',
      jabatan_id: item.jabatan_id || item.jabatan?.id || '',
      status_kerja_id: item.status_kerja_id || item.status_kerja?.id || '',
      gaji_pokok: item.gaji_pokok ?? 0,
      tunjangan_pokok: item.tunjangan_pokok ?? 0,
      tunjangan_opsional: Array.isArray(item.tunjangan_opsional) ? item.tunjangan_opsional.map(x => ({ ...x })) : (item.tunjangan_opsional || []),
      potongan_opsional: Array.isArray(item.potongan_opsional) ? item.potongan_opsional.map(x => ({ ...x })) : (item.potongan_opsional || []),
    });
    setIsEditOpen(true);
  };

  const handleRemove = async (id) => {
    const ok = await Swal.fire({
      title: 'Hapus setting?',
      text: 'Data setting gaji akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, hapus'
    });
    if (!ok.isConfirmed) return;
    try {
      await deleteGajiSetting(id);
      await load();
      Swal.fire('Terhapus', 'Setting berhasil dihapus', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', err.message || 'Gagal menghapus', 'error');
    }
  };

  // helpers untuk list dynamic
  const addTunjangan = () => setForm(f => ({ ...f, tunjangan_opsional: [...(f.tunjangan_opsional||[]), { keterangan: '', jumlah: 0 }] }));
  const removeTunjangan = (idx) => setForm(f => ({ ...f, tunjangan_opsional: f.tunjangan_opsional.filter((_, i) => i !== idx) }));
  const updateTunjangan = (idx, key, value) => setForm(f => {
    const arr = f.tunjangan_opsional.map((it, i) => i === idx ? ({ ...it, [key]: key === 'jumlah' ? Number(value || 0) : value }) : it);
    return { ...f, tunjangan_opsional: arr };
  });

  const addPotongan = () => setForm(f => ({ ...f, potongan_opsional: [...(f.potongan_opsional||[]), { keterangan: '', jumlah: 0 }] }));
  const removePotongan = (idx) => setForm(f => ({ ...f, potongan_opsional: f.potongan_opsional.filter((_, i) => i !== idx) }));
  const updatePotongan = (idx, key, value) => setForm(f => {
    const arr = f.potongan_opsional.map((it, i) => i === idx ? ({ ...it, [key]: key === 'jumlah' ? Number(value || 0) : value }) : it);
    return { ...f, potongan_opsional: arr };
  });

  const buildPayload = (raw) => {
    // ensure numbers are numbers, and remove empty keterangan rows
    const tunj = (raw.tunjangan_opsional || []).filter(it => (it.keterangan || '').trim() !== '').map(it => ({ keterangan: it.keterangan.trim(), jumlah: Number(it.jumlah || 0) }));
    const pot = (raw.potongan_opsional || []).filter(it => (it.keterangan || '').trim() !== '').map(it => ({ keterangan: it.keterangan.trim(), jumlah: Number(it.jumlah || 0) }));
    return {
      departemen_id: raw.departemen_id,
      jabatan_id: raw.jabatan_id,
      status_kerja_id: raw.status_kerja_id,
      gaji_pokok: Number(raw.gaji_pokok || 0),
      tunjangan_pokok: Number(raw.tunjangan_pokok || 0),
      tunjangan_opsional: tunj,
      potongan_opsional: pot,
    };
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload(form);
    // basic validation
    if (!payload.departemen_id || !payload.jabatan_id || !payload.status_kerja_id) {
      Swal.fire('Lengkapi form', 'Pilih departemen, jabatan, dan status kerja.', 'warning');
      return;
    }
    try {
      await createGajiSetting(payload);
      setIsAddOpen(false);
      await load();
      Swal.fire('Berhasil', 'Setting gaji ditambahkan', 'success');
    } catch (err) {
      console.error('Create error', err);
      Swal.fire('Gagal', err.message || 'Gagal menambah setting', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const payload = buildPayload(form);
    try {
      await updateGajiSetting(editingItem.id, payload);
      setIsEditOpen(false);
      setEditingItem(null);
      await load();
      Swal.fire('Berhasil', 'Setting gaji diperbarui', 'success');
    } catch (err) {
      console.error('Update error', err);
      Swal.fire('Gagal', err.message || 'Gagal mengubah setting', 'error');
    }
  };

  // table rows memo
  const rows = useMemo(() => items, [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Commet color={['#800020', '#a0002a']} size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-700 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 rounded bg-[#800020] text-white">Muat ulang</button>
      </div>
    );
  }

  const showTunjanganOpsional = items.some(
  item => Number(item.total_tunjangan_opsional) > 0
  );

  const showPotonganOpsional = items.some(
    item => Number(item.total_potongan_opsional) > 0
  );

  const hitungTotalGaji = (item) => {
  const gajiPokok = Number(item.gaji_pokok) || 0;
  const tunjanganPokok = Number(item.tunjangan_pokok) || 0;
  const tunjanganOpsional = Number(item.total_tunjangan_opsional) || 0;
  const potonganOpsional = Number(item.total_potongan_opsional) || 0;

  return (
      gajiPokok +
      tunjanganPokok +
      tunjanganOpsional -
      potonganOpsional
    );
  };



  return (
    <>
      <PageHeader
        title="Gaji Setting"
        description="Kelola setting gaji untuk kombinasi departemen / jabatan / status kerja"
        onMenuClick={onMenuClick}
      />

      {/* Header / toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white px-4 py-2 rounded-lg">
            <Plus size={16} /> Tambah Setting
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-3xl shadow-xl p-4">
        {rows.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Belum ada data setting gaji.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Departemen</th>
                  <th className="px-4 py-2">Jabatan</th>
                  <th className="px-4 py-2">Status Kerja</th>
                  <th className="px-4 py-2">Gaji Pokok</th>
                  <th className="px-4 py-2">Tunjangan Pokok</th>

                  {showTunjanganOpsional && (
                    <th>Tunjangan Opsional</th>
                  )}

                  {showPotonganOpsional && (
                    <th>Potongan Opsional</th>
                  )}

                  <th className="px-4 py-2">Total Gaji</th>

                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.departemen?.nama_departemen || item.departemen_id}</td>
                    <td className="px-4 py-3">{item.jabatan?.nama_jabatan || item.jabatan_id}</td>
                    <td className="px-4 py-3">{item.status_kerja?.nama_status || item.status_kerja_id}</td>
                    <td className="px-4 py-3">{item.gaji_pokok ?? 0}</td>
                    <td className="px-4 py-3">{item.tunjangan_pokok ?? 0}</td>
         
                    {showTunjanganOpsional && (
                      <td>
                        {item.total_tunjangan_opsional
                          ? `Rp ${Number(item.total_tunjangan_opsional).toLocaleString()}`
                          : '-'}
                      </td>
                    )}

                    {showPotonganOpsional && (
                      <td className="text-red-600">
                        {item.total_potongan_opsional
                          ? `Rp ${Number(item.total_potongan_opsional).toLocaleString()}`
                          : '-'}
                      </td>
                    )}

                    <td className="font-semibold text-emerald-700">
                      Rp {hitungTotalGaji(item).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(item)} className="px-2 py-1 bg-blue-50 text-blue-700 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => handleRemove(item.id)} className="px-2 py-1 bg-red-50 text-red-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Gaji Setting">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Departemen</div>
              <select required value={form.departemen_id} onChange={(e) => setForm(f => ({ ...f, departemen_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih departemen --</option>
                {departemenOptions.map(d => <option key={d.id} value={d.id}>{d.nama_departemen || d.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Jabatan</div>
              <select required value={form.jabatan_id} onChange={(e) => setForm(f => ({ ...f, jabatan_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih jabatan --</option>
                {jabatanOptions.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan || j.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Status Kerja</div>
              <select required value={form.status_kerja_id} onChange={(e) => setForm(f => ({ ...f, status_kerja_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih status kerja --</option>
                {statusKerjaOptions.map(s => <option key={s.id} value={s.id}>{s.nama_status || s.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Gaji Pokok</div>
              <input type="number" required value={form.gaji_pokok} onChange={(e) => setForm(f => ({ ...f, gaji_pokok: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded" />
            </label>

            <label className="block md:col-span-2">
              <div className="text-sm text-gray-600 mb-1">Tunjangan Pokok</div>
              <input type="number" value={form.tunjangan_pokok} onChange={(e) => setForm(f => ({ ...f, tunjangan_pokok: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded" />
            </label>
          </div>

          {/* tunjangan opsional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Tunjangan Opsional</div>
              <button type="button" onClick={addTunjangan} className="text-sm bg-green-50 px-2 py-1 rounded">Tambah</button>
            </div>
            <div className="space-y-2">
              {(form.tunjangan_opsional || []).length === 0 && <div className="text-xs text-gray-500">Belum ada tunjangan opsional</div>}
              {(form.tunjangan_opsional || []).map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input placeholder="Keterangan" value={t.keterangan} onChange={(e) => updateTunjangan(idx, 'keterangan', e.target.value)} className="flex-1 px-2 py-1 border rounded" />
                  <input type="number" placeholder="Jumlah" value={t.jumlah} onChange={(e) => updateTunjangan(idx, 'jumlah', e.target.value)} className="w-28 px-2 py-1 border rounded" />
                  <button type="button" onClick={() => removeTunjangan(idx)} className="px-2 py-1 bg-red-50 text-red-700 rounded">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          {/* potongan opsional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Potongan Opsional</div>
              <button type="button" onClick={addPotongan} className="text-sm bg-green-50 px-2 py-1 rounded">Tambah</button>
            </div>
            <div className="space-y-2">
              {(form.potongan_opsional || []).length === 0 && <div className="text-xs text-gray-500">Belum ada potongan opsional</div>}
              {(form.potongan_opsional || []).map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input placeholder="Keterangan" value={t.keterangan} onChange={(e) => updatePotongan(idx, 'keterangan', e.target.value)} className="flex-1 px-2 py-1 border rounded" />
                  <input type="number" placeholder="Jumlah" value={t.jumlah} onChange={(e) => updatePotongan(idx, 'jumlah', e.target.value)} className="w-28 px-2 py-1 border rounded" />
                  <button type="button" onClick={() => removePotongan(idx)} className="px-2 py-1 bg-red-50 text-red-700 rounded">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingItem(null); }} title="Edit Gaji Setting">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* reuse the same form UI (keep it concise) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Departemen</div>
              <select required value={form.departemen_id} onChange={(e) => setForm(f => ({ ...f, departemen_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih departemen --</option>
                {departemenOptions.map(d => <option key={d.id} value={d.id}>{d.nama_departemen || d.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Jabatan</div>
              <select required value={form.jabatan_id} onChange={(e) => setForm(f => ({ ...f, jabatan_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih jabatan --</option>
                {jabatanOptions.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan || j.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Status Kerja</div>
              <select required value={form.status_kerja_id} onChange={(e) => setForm(f => ({ ...f, status_kerja_id: e.target.value }))} className="w-full px-3 py-2 border rounded">
                <option value="">-- Pilih status kerja --</option>
                {statusKerjaOptions.map(s => <option key={s.id} value={s.id}>{s.nama_status || s.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Gaji Pokok</div>
              <input type="number" required value={form.gaji_pokok} onChange={(e) => setForm(f => ({ ...f, gaji_pokok: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded" />
            </label>

            <label className="block md:col-span-2">
              <div className="text-sm text-gray-600 mb-1">Tunjangan Pokok</div>
              <input type="number" value={form.tunjangan_pokok} onChange={(e) => setForm(f => ({ ...f, tunjangan_pokok: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded" />
            </label>
          </div>

          {/* repeat tunjangan / potongan UI from add modal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Tunjangan Opsional</div>
              <button type="button" onClick={addTunjangan} className="text-sm bg-green-50 px-2 py-1 rounded">Tambah</button>
            </div>
            <div className="space-y-2">
              {(form.tunjangan_opsional || []).map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input placeholder="Keterangan" value={t.keterangan} onChange={(e) => updateTunjangan(idx, 'keterangan', e.target.value)} className="flex-1 px-2 py-1 border rounded" />
                  <input type="number" placeholder="Jumlah" value={t.jumlah} onChange={(e) => updateTunjangan(idx, 'jumlah', e.target.value)} className="w-28 px-2 py-1 border rounded" />
                  <button type="button" onClick={() => removeTunjangan(idx)} className="px-2 py-1 bg-red-50 text-red-700 rounded">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Potongan Opsional</div>
              <button type="button" onClick={addPotongan} className="text-sm bg-green-50 px-2 py-1 rounded">Tambah</button>
            </div>
            <div className="space-y-2">
              {(form.potongan_opsional || []).map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input placeholder="Keterangan" value={t.keterangan} onChange={(e) => updatePotongan(idx, 'keterangan', e.target.value)} className="flex-1 px-2 py-1 border rounded" />
                  <input type="number" placeholder="Jumlah" value={t.jumlah} onChange={(e) => updatePotongan(idx, 'jumlah', e.target.value)} className="w-28 px-2 py-1 border rounded" />
                  <button type="button" onClick={() => removePotongan(idx)} className="px-2 py-1 bg-red-50 text-red-700 rounded">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsEditOpen(false); setEditingItem(null); }} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#a0002a] text-white rounded">Simpan Perubahan</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
