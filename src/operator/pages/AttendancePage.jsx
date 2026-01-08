import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import TeamAttendanceDashboard from "@/shared/attendance/TeamAttendanceDashboard";
import AttendanceCameraModal from "@/shared/attendance/AttendanceCameraModal";

import { getMyAbsensi } from "@/services/absensiReportService";
import {
  absenMasuk,
  absenKeluar,
} from "@/operator/services/absensiServices";

import { isToday } from "@/utils/date";

export default function AttendancePage() {
  // modal: "in" | "out" | null
  const [modalType, setModalType] = useState(null);

  // status: null | "in" | "out"
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  // =========================
  // FETCH ABSENSI HARI INI
  // =========================
  useEffect(() => {
    fetchAbsensiHariIni();
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
  // DUMMY EMPLOYEE (NANTI JWT)
  // =========================
  const employee = {
    id: "EMP001",
    nama: "Budi Santoso",
    jabatan: "OPERATOR",
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
        getWorkDuration={getWorkDuration}
        onAbsenMasuk={() => setModalType("in")}
        onAbsenKeluar={() => setModalType("out")}
      />

      <AttendanceCameraModal
        open={modalType}
        title={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitLabel={modalType === "in" ? "Absen Masuk" : "Absen Keluar"}
        submitColor={modalType === "in" ? "green" : "red"}
        onSubmit={modalType === "in" ? handleAbsenMasuk : handleAbsenKeluar}
        onClose={() => setModalType(null)}
      />
    </>
  );
}
