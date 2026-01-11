import { X } from "lucide-react";
import useCamera from "@/hooks/useCamera";

export default function AttendanceCameraModal({
  open,
  title,
  embedded = false,
  submitLabel,
  submitColor = "green",
  onCapture,
  onSubmit,
  onClose,
}) {
  const {
    videoRef,
    canvasRef,
    previewImage,
    takePhoto,
    retakePhoto,
    dataURLtoFile,
    setPreviewImage,
    stopCamera,
  } = useCamera(embedded || !!open);

  if (!open) return null;

  const handleClose = () => {
    stopCamera();
    setPreviewImage(null);
    onClose();
  };

  const handleSubmit = async () => {
    const file = dataURLtoFile(previewImage, "selfie.jpg");
    await onSubmit(file);
  };

  const submitColorMap = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    orange: "bg-orange-500 hover:bg-orange-600",
  };

  // ===== MODE EMBEDDED (UNTUK IZIN) =====
  if (embedded) {
    return (
      <div className="mb-4">
        <div className="mb-4 text-center">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="mx-auto max-h-64 rounded-xl object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              className="mx-auto max-h-64 rounded-xl object-cover"
              style={{ transform: "scaleX(-1)" }}
              autoPlay
              muted
              playsInline
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {!previewImage ? (
          <button
            type="button"
            onClick={takePhoto}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
          >
            Ambil Foto
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit(dataURLtoFile(previewImage, "izin.jpg"))}
            className="w-full bg-[#800020] text-white py-3 rounded-xl font-bold hover:bg-[#900030]"
          >
            Gunakan Foto
          </button>
        )}
      </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-center mb-6">{title}</h3>

        <div className="mb-6 text-center">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="mx-auto max-h-80 rounded-xl object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              className="mx-auto max-h-80 rounded-xl object-cover"
              style={{ transform: "scaleX(-1)" }}
              autoPlay
              muted
              playsInline
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {!previewImage ? (
          <button
            type="button"
            onClick={takePhoto}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 text-lg"
          >
            Jepret Foto
          </button>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={retakePhoto}
              className="w-full bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600"
            >
              Ambil Ulang
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white ${submitColorMap[submitColor]}`}
            >
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
