import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import TeamAttendanceDashboard from "@/shared/attendance/TeamAttendanceDashboard";
import AttendanceCameraModal from "@/shared/attendance/AttendanceCameraModal";

import { getMyAbsensi } from "@/services/absensiReportService";
import {
  absenMasuk,
  absenKeluar,
} from "@/operator/services/absensiServices";
import useCamera from "@/hooks/useCamera";
import { API_BASE_URL } from "@/utils/constants";
import { X } from "lucide-react";
import { isToday } from "@/utils/date";

export default function AttendancePage() {
  // modal: "in" | "out" | null
  const [modalType, setModalType] = useState(null);

  // status: null | "in" | "out"
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  const [todayHasIzin, setTodayHasIzin] = useState(false);
  const [hasCheckedIzin, setHasCheckedIzin] = useState(false);

  const [isIzinOpen, setIsIzinOpen] = useState(false);
  const [izinKeterangan, setIzinKeterangan] = useState("");


  // =========================
  // FETCH ABSENSI HARI INI
  // =========================
  useEffect(() => {
    fetchIzinHariIni();
  }, []);

  useEffect(() => {
    fetchAbsensiHariIni();
  }, [hasCheckedIzin]);

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
      const izinToday = data.data.find((item) => item.tanggal === today);

      if (izinToday) {
        setTodayHasIzin(true);
        setAttendanceStatus("izin");
      }

      setHasCheckedIzin(true);
    } catch (err) {
      console.error(err);
      setHasCheckedIzin(true);
    }
  };

  

  const fetchAbsensiHariIni = async () => {
    if (!hasCheckedIzin) return;
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





  // =========================
  // HANDLER ABSENSI
  // =========================
  const handleAbsenMasuk = async (file) => {
    const res = await absenMasuk(file);

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
    const res = await absenKeluar(file);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setAttendanceStatus("out");
      setClockOutTime(new Date());
      setModalType(null);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  // =========================
  // DURASI KERJA
  // =========================
  const getWorkDuration = () => {
    if (!clockInTime || !clockOutTime) return "--";

    const toParts = (time) =>
      typeof time === "string"
        ? time.split(":").map(Number)
        : [time.getHours(), time.getMinutes()];

    const [inH, inM] = toParts(clockInTime);
    const [outH, outM] = toParts(clockOutTime);

    let hours = outH - inH;
    let minutes = outM - inM;

    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) hours += 24;

    return `${hours}j ${minutes}m`;
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


  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const employee = {
    id: user?.id || "",
    nama: user?.id?.toUpperCase() || "OPERATOR",
    jabatan: "OPERATOR",
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
        onAbsenKeluar={() => setModalType("out")}
        onIzin={() => {
          if (attendanceStatus !== null) return;
          setIsIzinOpen(true);
        }}
      />


      <AttendanceCameraModal
        open={!!modalType}
        title={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitLabel={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitColor={modalType === "in" ? "green" : "red"}
        onSubmit={modalType === "in" ? handleAbsenMasuk : handleAbsenKeluar}
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
