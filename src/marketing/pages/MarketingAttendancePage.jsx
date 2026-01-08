import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import TeamAttendanceDashboard from "@/shared/attendance/TeamAttendanceDashboard";
import AttendanceCameraModal from "@/shared/attendance/AttendanceCameraModal";
import { API_BASE_URL } from "@/utils/constants";

import { getMyAbsensi } from "@/services/absensiReportService";
import {
  absenMasukMarketing,
  absenKeluarMarketing,
} from "@/marketing/services/marketingAbsensiService";

import { handleResponse } from "@/services/apiService";
import { isToday } from "@/utils/date";

export default function MarketingAttendancePage() {
  // modal: "in" | "out" | null
  const [modalType, setModalType] = useState(null);

  // status absensi
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  // kunjungan
  const [totalKunjungan, setTotalKunjungan] = useState(0);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH ABSENSI HARI INI
  // =========================
  useEffect(() => {
    fetchAbsensiHariIni();
    fetchKunjungan();
  }, []);

  const fetchAbsensiHariIni = async () => {
    try {
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
      />

      <AttendanceCameraModal
        open={modalType}
        title={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitLabel={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitColor={modalType === "in" ? "green" : "orange"}
        onSubmit={
          modalType === "in" ? handleAbsenMasuk : handleAbsenKeluar
        }
        onClose={() => setModalType(null)}
      />
    </>
  );
}
