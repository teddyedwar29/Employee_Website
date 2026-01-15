import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Camera,
  Plus,
  X,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import { submitKunjungan } from "@/marketing/services/kunjunganService";
import { handleResponse } from "@/services/apiService";
import { API_BASE_URL } from "@/utils/constants";
import AttendanceCameraModal from "@/shared/attendance/AttendanceCameraModal";



export default function KunjunganPage() {
  const getTodayLocalDate = () =>
    new Date().toLocaleDateString("en-CA");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate()); // default hari ini
  const [previewImage, setPreviewImage] = useState(null);

  const [kunjungan, setKunjungan] = useState([]);
  const [totalFoto, setTotalFoto] = useState(0);
  const [loading, setLoading] = useState(true);

  const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [openCamera, setOpenCamera] = useState(false);
  const [photoLocked, setPhotoLocked] = useState(false);


  const [formData, setFormData] = useState({
    foto: null,
    nama_outlet: "",
    lokasi: "",
    keterangan: "",
  });

  // ==================== FETCH KUNJUNGAN BERDASARKAN TANGGAL ====================
  const fetchKunjungan = async (date = selectedDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Sesi berakhir, silakan login ulang", "error");
        setLoading(false);
        return;
      }

      const url = date 
        ? `${API_BASE_URL}/kunjungan-report/AE?tanggal=${date}`
        : `${API_BASE_URL}/kunjungan-report/AE`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await handleResponse(response);

      if (data.success && data.data) {
        let allFotos = [];

        if (Array.isArray(data.data)) {
          data.data.forEach(kunj => {
            if (kunj.fotos && Array.isArray(kunj.fotos)) {
              allFotos = allFotos.concat(kunj.fotos);
            }
          });
        }

        setKunjungan(allFotos);
        setTotalFoto(allFotos.length);
      } else {
        setKunjungan([]);
        setTotalFoto(0);
      }
    } catch (err) {
      console.error("Error fetch kunjungan:", err);
      setKunjungan([]);
      setTotalFoto(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saat page load & saat tanggal berubah
  useEffect(() => {
    fetchKunjungan(selectedDate);
  }, [selectedDate]);

  // Lokasi
  const requestLocation = () => {
    setLocationStatus("loading");
    setLocationMessage("Meminta izin lokasi...");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage("Browser tidak mendukung geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ latitude: lat, longitude: lng });
        setLocationStatus("success");
        setLocationMessage("Lokasi berhasil didapat!");
      },
      (error) => {
        setLocationStatus("error");
        let msg = "Gagal mendapatkan lokasi";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Izin lokasi ditolak. Klik tombol lagi atau izinkan di pengaturan browser";
        }
        setLocationMessage(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.foto) {
      Swal.fire("Error", "Foto kunjungan wajib diisi", "error");
      return;
    }

    try {
      const res = await submitKunjungan({
        foto: formData.foto,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
      });

      if (!res.success) {
        Swal.fire("Gagal", res.message || "Gagal menyimpan", "error");
        return;
      }

      // Refresh data dengan tanggal yang sedang dipilih
      await fetchKunjungan(selectedDate);

      Swal.fire("Berhasil!", "Kunjungan berhasil disimpan", "success");

      // Reset form
      setIsModalOpen(false);
      setPreviewImage(null);
      setFormData({ foto: null, nama_outlet: "", lokasi: "", keterangan: "" });
      setCurrentLocation(null);
      setLocationStatus("idle");
      setLocationMessage("");
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat menyimpan", "error");
    }
  };

  

  const resetForm = () => {
    setFormData({ foto: null, nama_outlet: "", lokasi: "", keterangan: "" });
    setPreviewImage(null);
    setIsModalOpen(false);
    setPhotoLocked(false);
  };

  // Filter pencarian (nama outlet, lokasi, keterangan)
  const filteredData = kunjungan.filter((item) => {
    return (
      !searchTerm ||
      item.nama_outlet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const isToday = selectedDate === getTodayLocalDate();

  return (
    <>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Kunjungan Marketing</h2>
        <p className="text-sm text-gray-600">Catat dan kelola kunjungan outlet harian</p>
      </div>

      {/* TOTAL KUNJUNGAN HARI INI */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6 text-center">
        <p className="text-sm text-gray-600">
          Kunjungan {isToday ? "Hari Ini" : `Tanggal ${selectedDate}`}
        </p>
        <p className={`text-4xl font-bold mt-2 ${totalFoto >= 5 ? "text-green-600" : "text-[#800020]"}`}>
          {totalFoto} {isToday && totalFoto < 5 ? `/ 5` : ""}
        </p>
        {isToday && (
          <p className="text-sm text-gray-600 mt-2">
            Target minimal: 5 kunjungan per hari
          </p>
        )}

        {isToday && totalFoto >= 5 && (
          <div className="mt-4">
            <p className="text-green-600 font-semibold mb-3">Target minimal tercapai! 🎉</p>
            <Link
              to="/marketing/absensi"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-medium"
            >
              Absen Pulang Sekarang
            </Link>
          </div>
        )}
      </div>

      {/* FILTER + TOMBOL TAMBAH - LEBAR SAMA & RAPI */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari outlet, lokasi, keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm"
            />
          </div>

          {/* Filter Tanggal */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl text-sm"
          />

          {/* Tombol Tambah */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#9c495e] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#900030] transition"
          >
            + Tambah Kunjungan
          </button>
        </div>

        {/* Reset Filter */}
        {(searchTerm || selectedDate !== new Date().toISOString().split("T")[0]) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDate(getTodayLocalDate());
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-xl text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* LIST KUNJUNGAN */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
          <p className="mt-4 text-gray-600">Memuat kunjungan...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow text-center">
          <MapPin size={56} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Belum ada kunjungan pada tanggal ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-100">
                {item.foto ? (
                  <img
                    src={`http://localhost:5000${item.foto}`}
                    alt={item.nama_outlet || "Kunjungan"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image size={40} className="text- gray-400" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg">{item.nama_outlet || "Kunjungan"}</h3>
                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                  <MapPin size={12} />
                  {item.latitude && item.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {parseFloat(item.latitude).toFixed(6)}, {parseFloat(item.longitude).toFixed(6)}
                    </a>
                  ) : (
                    "Lokasi tidak tersedia"
                  )}
                </p>

                {item.keterangan && (
                  <p className="text-xs bg-gray-50 p-3 rounded-xl mb-3">
                    {item.keterangan}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH KUNJUNGAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-screen overflow-y-auto my-8">
            <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Tambah Kunjungan</h3>
                <button onClick={resetForm}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                {!photoLocked && (
                  <AttendanceCameraModal
                    embedded
                    open={true}
                    title="Foto Selfie Kunjungan"
                    submitLabel="Gunakan Foto"
                    submitColor="green"
                    onSubmit={(file) => {
                      setFormData({ ...formData, foto: file });
                      setPreviewImage(URL.createObjectURL(file));
                      setPhotoLocked(true); // 🔒 kunci foto
                    }}
                    onRetake={() => {
                      setPhotoLocked(false);
                      setPreviewImage(null);
                    }}
                    onClose={() => {}}
                  />
                )}

              </div>

              {photoLocked && previewImage && (
                <div className="mb-6 text-center">
                  <img
                    src={previewImage}
                    alt="Foto Kunjungan"
                    className="mx-auto rounded-xl max-h-96 object-cover"
                  />
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✓ Foto berhasil digunakan
                  </p>
                </div>
              )}


              <input
                placeholder="Nama Outlet"
                className="w-full border p-3 rounded-xl mb-4"
                value={formData.nama_outlet}
                onChange={(e) => setFormData({ ...formData, nama_outlet: e.target.value })}
              />

              <textarea
                placeholder="Keterangan (opsional)"
                rows={4}
                className="w-full border p-3 rounded-xl mb-6 resize-none"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              />

              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Lokasi Kunjungan</p>
                    {locationStatus === "success" && (
                      <p className="text-xs text-green-600">
                        ✓ Lokasi didapat
                      </p>
                    )}
                    {locationStatus === "error" && (
                      <p className="text-xs text-red-600">{locationMessage}</p>
                    )}
                    {locationStatus === "loading" && (
                      <p className="text-xs text-blue-600">Sedang mengambil lokasi...</p>
                    )}
                    {locationStatus === "idle" && (
                      <p className="text-xs text-gray-500">Lokasi belum diambil</p>
                    )}
                  </div>

                  {locationStatus !== "success" && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={locationStatus === "loading"}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      {locationStatus === "loading" ? "Memuat..." : "Izinkan Lokasi"}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#800020] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#900030] transition"
              >
                Simpan Kunjungan
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}