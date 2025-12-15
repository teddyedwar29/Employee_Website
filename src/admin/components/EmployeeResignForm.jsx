import React, { useState } from "react";
import Swal from "sweetalert2";
import { Commet } from "react-loading-indicators";

export default function EmployeeResignForm({ selectedEmployee, onSubmit, onClose }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    alasan: "",
    tanggal_berhenti: "",
    catatan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.alasan || !formData.tanggal_berhenti) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Harap pilih alasan dan tanggal berhenti.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        karyawan_id: selectedEmployee?.id,
        alasan: formData.alasan,
        tanggal_berhenti: formData.tanggal_berhenti,
        catatan: formData.catatan || null,
      };

      await onSubmit(payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Status karyawan diperbarui.",
      });

      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">

      {/* Overlay loading */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <Commet size={50} color={["#800020", "#a0002a"]} />
          <p className="mt-2 text-gray-600">Menyimpan...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Alasan Berhenti */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Alasan Berhenti
          </label>
          <select
            name="alasan"
            value={formData.alasan}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]"
          >
            <option value="">-- Pilih Alasan --</option>
            <option value="RESIGN">Resign</option>
            <option value="HABIS_KONTRAK">Habis Kontrak</option>
            <option value="PHK">PHK</option>
          </select>
        </div>

        {/* Tanggal Berhenti */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Tanggal Berhenti
          </label>
          <input
            type="date"
            name="tanggal_berhenti"
            value={formData.tanggal_berhenti}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Catatan (opsional) */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Catatan (opsional)
          </label>
          <textarea
            name="catatan"
            rows="2"
            value={formData.catatan}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Batal
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-white bg-[#800020] hover:bg-[#a0002a]"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
