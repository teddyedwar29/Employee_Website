import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMyAbsensi } from "@/services/absensiReportService";
import TeamAttendanceDashboard from "@/shared/attendance/TeamAttendanceDashboard";

import {
  absenMasukMarketing,
  absenKeluarMarketing,
} from "@/marketing/services/marketingAbsensiService";
import { handleResponse } from "@/services/apiService";
import { Camera, X } from "lucide-react";
import { isToday } from "@/utils/date"; 

export default function MarketingAttendancePage() {
  const [modalType, setModalType] = useState(null); // in | out | null
  const [attendanceStatus, setAttendanceStatus] = useState(null); // null | in | out
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [totalKunjungan, setTotalKunjungan] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);


  const fetchKunjungan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        Swal.fire("Error", "Sesi berakhir, silakan login ulang", "error");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/kunjungan-report/AE", {
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
        setTotalKunjungan(allFotos.length);  // gunakan setTotalKunjungan
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

  useEffect(() => {
    fetchAbsensiHariIni();
  }, []);

  const fetchAbsensiHariIni = async () => {
    const res = await getMyAbsensi();

    if (!res.success || !res.data?.length) return;

    const todayAbsensi = res.data.find((item) =>
      isToday(item.tanggal)
    );

    if (!todayAbsensi) return;

    if (todayAbsensi.jam_in) {
      setAttendanceStatus("in");
      setClockInTime(todayAbsensi.jam_in);
    }

    if (todayAbsensi.jam_out) {
      setAttendanceStatus("out");
      setClockOutTime(todayAbsensi.jam_out);
    }
  };

  // dummy (nanti dari JWT)
  const employee = {
    id: "EMP002",
    nama: "Andi Marketing",
    jabatan: "MARKETING",
  };

  // ambil total kunjungan hari ini
  useEffect(() => {
    fetchKunjungan();
  }, []);


  const handleAbsenMasuk = async (foto) => {
    const res = await absenMasukMarketing(foto);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setAttendanceStatus("in");
      setClockInTime(new Date());
      setModalType(null);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleAbsenKeluar = async (foto) => {
    if (totalKunjungan < 5) {
      Swal.fire(
        "Belum bisa absen keluar",
        `Kunjungan baru ${totalKunjungan}/5`,
        "warning"
      );
      return;
    }

    const res = await absenKeluarMarketing(foto);

    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setAttendanceStatus("out");
      setClockOutTime(new Date());
      setModalType(null);
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const canCheckOut =
    attendanceStatus === "in" && totalKunjungan >= 5;

  const [stream, setStream] = useState(null);

  const videoId = modalType ? `video-${modalType}` : null;

  const startCamera = async () => {
    try {
      const video = document.getElementById(videoId);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      if (video) {
        video.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      Swal.fire("Error", "Gagal akses kamera. Izinkan akses kamera di browser.", "error");
    }
  };

  const takePhoto = () => {
    const video = document.getElementById(videoId);
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreviewImage(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setPreviewImage(null);
    startCamera();
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Mulai kamera otomatis saat modal muncul
  useEffect(() => {
    if (modalType) {
      startCamera();
    }
    return () => stopCamera();
  }, [modalType]);

  return (
    <>
      <TeamAttendanceDashboard
        employeeData={employee}
        attendanceStatus={attendanceStatus}
        clockInTime={clockInTime}
        clockOutTime={clockOutTime}
        onAbsenMasuk={() => setModalType("in")}
        onAbsenKeluar={() => {
          console.log("Trigger absen out - modalType set to out");
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
      />

      {/* MODAL ABSEN MASUK & KELUAR - VERSI YANG SUDAH TERBUKTI JALAN */}
      {(modalType === "in" || modalType === "out") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setModalType(null);
                setPreviewImage(null);
                stopCamera();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-center mb-6">
              {modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
            </h3>

            {/* Live Video atau Preview */}
            <div className="mb-6 text-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mx-auto max-h-80 rounded-xl object-cover"
                />
              ) : (
                <video
                  id={`video-${modalType}`}
                  className="mx-auto max-h-80 rounded-xl object-cover"
                  style={{ transform: "scaleX(-1)" }} // mirror effect (selfie)
                  autoPlay
                  muted
                  playsInline
                />
              )}
            </div>

            {/* Tombol Jepret atau Submit */}
            {!previewImage ? (
              <button
                type="button"
                onClick={takePhoto}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 text-lg"
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
                  onClick={async () => {
                    const file = dataURLtoFile(previewImage, "selfie.jpg");
                    if (modalType === "in") {
                      await handleAbsenMasuk(file);
                    } else {
                      await handleAbsenKeluar(file);
                    }
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                    modalType === "in"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
