import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { X, Camera } from "lucide-react";
import TeamAttendanceDashboard from "@/shared/attendance/TeamAttendanceDashboard";
import AttendanceCameraModal from "@/shared/attendance/AttendanceCameraModal";
import { API_BASE_URL } from "@/utils/constants";

import { getMyAbsensi } from "@/services/absensiReportService";
import useCamera from "@/hooks/useCamera";
import {
  absenMasukMarketing,
  absenKeluarMarketing,
} from "@/marketing/services/marketingAbsensiService";

import { handleResponse } from "@/services/apiService";
import { isToday } from "@/utils/date";

export default function MarketingAttendancePage() {



  const [izinForm, setIzinForm] = useState({
   foto: null,
   keterangan: "",
  });

  const [izinPreview, setIzinPreview] = useState(null);
  const [todayHasIzin, setTodayHasIzin] = useState(false);

  // modal: "in" | "out" | null
  const [modalType, setModalType] = useState(null);

  const [isIzinOpen, setIsIzinOpen] = useState(false);
  const [izinKeterangan, setIzinKeterangan] = useState("");

  // status absensi
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  // kunjungan
  const [totalKunjungan, setTotalKunjungan] = useState(0);
  const [loading, setLoading] = useState(false);

  const [hasCheckedIzin, setHasCheckedIzin] = useState(false);

  // =========================
  // FETCH ABSENSI HARI INI
  // =========================
useEffect(() => {
  fetchIzinHariIni();
  fetchKunjungan();
}, []);

useEffect(() => {
  fetchAbsensiHariIni();
}, [hasCheckedIzin]);




  useEffect(() => {
    if (!izinForm.foto) return;
    const url = URL.createObjectURL(izinForm.foto);
    setIzinPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [izinForm.foto]);

  const fetchAbsensiHariIni = async () => {
    // ⛔ BELUM BOLEH JALAN sebelum cek izin
    if (!hasCheckedIzin) return;

    // ⛔ JANGAN override izin
    if (attendanceStatus === "izin") return;

    try {
      const res = await getMyAbsensi();
      if (!res.success || !res.data?.length) return;

      const todayAbsensi = res.data.find((item) =>
        isToday(item.tanggal)
      );
      if (!todayAbsensi) return;

      if (todayAbsensi.jam_out) {
        setAttendanceStatus("out");
        setClockOutTime(todayAbsensi.jam_out);
        return;
      }

      if (todayAbsensi.jam_in) {
        setAttendanceStatus("in");
        setClockInTime(todayAbsensi.jam_in);
      }
    } catch (err) {
      console.error("Gagal fetch absensi:", err);
    }
  };



  // =========================
  // FETCH KUNJUNGAN
  // =========================
  const fetchKunjungan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Sesi berakhir, silakan login ulang", "error");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/kunjungan-report/AE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await handleResponse(response);

      if (data.success && Array.isArray(data.data)) {
        let allFotos = [];
        data.data.forEach((kunj) => {
          if (Array.isArray(kunj.fotos)) {
            allFotos = allFotos.concat(kunj.fotos);
          }
        });
        setTotalKunjungan(allFotos.length);
      } else {
        setTotalKunjungan(0);
      }
    } catch (err) {
      console.error("Error fetch kunjungan:", err);
      setTotalKunjungan(0);
    } finally {
      setLoading(false);
    }
  };

  const {
    videoRef,
    canvasRef,
    previewImage,
    takePhoto,
    retakePhoto,
    dataURLtoFile,
    stopCamera,
  } = useCamera(isIzinOpen);

  // =========================
  // DUMMY EMPLOYEE (NANTI JWT)
  // =========================
  const employee = {
    id: "EMP002",
    nama: "Andi Marketing",
    jabatan: "MARKETING",
  };

  // =========================
  // RULE MARKETING
  // =========================
  const canCheckOut =
    attendanceStatus === "in" && totalKunjungan >= 5;

  // =========================
  // HANDLER ABSENSI
  // =========================
  const handleAbsenMasuk = async (file) => {
    const res = await absenMasukMarketing(file);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setAttendanceStatus("in");
      setClockInTime(new Date());
      setModalType(null);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleAbsenKeluar = async (file) => {
    if (!canCheckOut) {
      Swal.fire(
        "Belum bisa absen keluar",
        `Lengkapi kunjungan (${totalKunjungan}/5)`,
        "warning"
      );
      return;
    }

    const res = await absenKeluarMarketing(file);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setAttendanceStatus("out");
      setClockOutTime(new Date());
      setModalType(null);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };


const handleSubmitIzin = async () => {
  if (!previewImage) {
    Swal.fire("Error", "Foto izin wajib diambil", "warning");
    return;
  }

  const file = dataURLtoFile(previewImage, "izin.jpg");

  const formData = new FormData();
  formData.append("foto", file);
  formData.append("keterangan", izinKeterangan);

  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch(`${API_BASE_URL}/izin/ajukan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire("Berhasil", data.message, "success");
      stopCamera();   
      setAttendanceStatus("izin");
      setTodayHasIzin(true);
      setIsIzinOpen(false);
      setIzinKeterangan("");
    } else {
      Swal.fire("Gagal", data.message, "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Terjadi kesalahan server", "error");
  }
};

  const fetchIzinHariIni = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/izin/my-history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) {
      setHasCheckedIzin(true);
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");

    const izinToday = data.data.find(
      (item) => item.tanggal === today
    );

    if (izinToday) {
      setTodayHasIzin(true);
      setAttendanceStatus("izin"); // 🔥 FINAL
    }

    setHasCheckedIzin(true);
  } catch (err) {
    console.error("Gagal fetch izin:", err);
    setHasCheckedIzin(true);
  }
};





  // =========================
  // RENDER
  // =========================
  return (
    <>
      <TeamAttendanceDashboard
        employeeData={employee}
        attendanceStatus={attendanceStatus}
        clockInTime={clockInTime}
        clockOutTime={clockOutTime}
        todayHasIzin={todayHasIzin} 
        onAbsenMasuk={() => setModalType("in")}
        onAbsenKeluar={() => {
          if (!canCheckOut) {
            Swal.fire(
              "Belum bisa absen keluar",
              `Lengkapi kunjungan (${totalKunjungan}/5)`,
              "info"
            );
            return;
          }
          setModalType("out");
        }}
        onIzin={() => {
          if (attendanceStatus !== null) return;
          setIsIzinOpen(true);
        }}
      />

   <AttendanceCameraModal
      open={modalType === "in" || modalType === "out"}
      title={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
      submitLabel={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
      submitColor={modalType === "in" ? "green" : "orange"}
      onSubmit={(file) => {
        if (modalType === "in") handleAbsenMasuk(file);
        if (modalType === "out") handleAbsenKeluar(file);
      }}
      onClose={() => setModalType(null)}
    />



    {isIzinOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-md max-h-screen overflow-y-auto my-8">

          {/* HEADER */}
          <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Ajukan Izin</h3>
              <button onClick={() => {
                setIsIzinOpen(false);
                setIzinKeterangan("");
              }}>
                <X size={24} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6">

          {/* ===== SELFIE ===== */}
          <div className="text-center">
            {previewImage ? (
              <img
                src={previewImage}
                className="mx-auto rounded-xl max-h-80 object-cover"
                alt="Preview"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="mx-auto rounded-xl max-h-80 object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!previewImage ? (
            <button
              onClick={takePhoto}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Ambil Foto
            </button>
          ) : (
            <button
              onClick={retakePhoto}
              className="w-full bg-gray-500 text-white py-3 rounded-xl"
            >
              Ambil Ulang
            </button>
          )}


            {!previewImage && (
              <p className="text-xs text-gray-500 text-center">
                * Foto selfie wajib diambil
              </p>
            )}

            {/* ===== KETERANGAN ===== */}
            <textarea
              placeholder="Keterangan izin"
              rows={4}
              className="w-full border p-3 rounded-xl resize-none"
              value={izinKeterangan}
              onChange={(e) => setIzinKeterangan(e.target.value)}
            />

            {/* ===== SUBMIT ===== */}
            <button
              disabled={!previewImage}
              onClick={handleSubmitIzin}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition
                ${previewImage
                  ? "bg-[#800020] text-white hover:bg-[#900030]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              Kirim Izin
            </button>
          </div>
        </div>
      </div>
    )}



    </>
  );
}
