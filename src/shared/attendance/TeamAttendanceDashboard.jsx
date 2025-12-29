import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  LogIn,
  LogOut,
} from "lucide-react";



export default function TeamAttendanceDashboard({
  employeeData,
  attendanceStatus, 
  onAbsenMasuk,
  onAbsenKeluar,  
  clockInTime,
  clockOutTime,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    if (!time) return "--";

    // kalau sudah Date object
    if (time instanceof Date) {
      return time.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    // kalau string dari backend (HH:mm:ss)
    if (typeof time === "string") {
      return time;
    }

    return "--";
  };


  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getWorkDuration = () => {
    if (!clockInTime || !clockOutTime) return "-";
    const diff = clockOutTime - clockInTime;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}j ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          Selamat datang, {employeeData?.nama} 👋
        </p>
        <h1 className="text-3xl font-bold text-gray-800">Absensi</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Time */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl">
            <p className="text-sm">Waktu Sekarang</p>
            <p className="text-4xl font-bold">{formatTime(currentTime)}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Calendar size={16} />
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Status */}
          <div
            className={`rounded-3xl p-6 text-white shadow-xl ${
              attendanceStatus === "in"
                ? "bg-green-500"
                : attendanceStatus === "out"
                ? "bg-orange-500"
                : "bg-gray-400"
            }`}
          >
            <p className="text-sm">Status Absensi</p>
            <p className="text-2xl font-bold">
              {attendanceStatus === "in"
                ? "Sudah Absen Masuk"
                : attendanceStatus === "out"
                ? "Sudah Absen Keluar"
                : "Belum Absen"}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-[#800020]" />
              <span className="font-semibold">Lokasi</span>
            </div>
            <p className="text-sm">Kantor Pusat</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Absen Masuk */}
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
              <LogIn className="mx-auto text-green-600 mb-4" size={36} />
              <h3 className="text-xl font-bold mb-4">Absen Masuk</h3>

              <button
                  onClick={onAbsenMasuk}
                  disabled={attendanceStatus !== null}
                  className={`w-full py-3 rounded-xl text-white font-bold ${
                    attendanceStatus === null
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Absen Masuk
              </button>
            </div>

            {/* Absen Keluar */}
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
              <LogOut className="mx-auto text-orange-600 mb-4" size={36} />
              <h3 className="text-xl font-bold mb-4">Absen Keluar</h3>

              <button
                onClick={onAbsenKeluar}
                disabled={attendanceStatus !== "in"}
                className={`w-full py-3 rounded-xl text-white font-bold ${
                  attendanceStatus === "in"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Absen Keluar
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold mb-4">Ringkasan Hari Ini</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs">Masuk</p>
                <p className="font-bold">
                  {clockInTime ? formatTime(clockInTime) : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs">Pulang</p>
                <p className="font-bold">
                  {clockOutTime ? formatTime(clockOutTime) : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs">Durasi</p>
                <p className="font-bold">{getWorkDuration()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  );

  
}
