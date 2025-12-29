// src/marketing/components/MarketingAbsensiModal.jsx
import { useState } from "react";
import Swal from "sweetalert2";

const MarketingAbsensiModal = ({ title, onSubmit, onClose }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = e.target.foto.files[0];
    if (!file) {
      Swal.fire("Error", "Foto wajib diisi", "error");
      return;
    }
    onSubmit(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-6 cursor-pointer">
            <input
              type="file"
              name="foto"
              accept="image/*"
              capture="camera"  // biar langsung buka kamera di HP
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-xl" />
              ) : (
                <div className="text-gray-400">
                  <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-2">Klik untuk ambil foto</p>
                </div>
              )}
            </div>
          </label>

          <button
            type="submit"
            className="w-full bg-[#800020] text-white py-4 rounded-xl font-semibold hover:bg-[#900030]"
          >
            {title}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarketingAbsensiModal;