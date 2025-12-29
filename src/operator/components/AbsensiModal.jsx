import { useState } from "react";

export default function AbsensiModal({
  title,
  onSubmit,
  onClose,
}) {
  const [foto, setFoto] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-xl p-6 w-80 modal-pop">
        <h2 className="font-bold text-lg mb-4">{title}</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files[0])}
          className="mb-4"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Batallll
          </button>
          <button
            disabled={!foto}
            onClick={() => onSubmit(foto)}
            className="px-4 py-2 rounded bg-[#800020] text-white disabled:opacity-50"
          >
            Kirimmmm
          </button>
        </div>
      </div>
    </div>
  );
}
