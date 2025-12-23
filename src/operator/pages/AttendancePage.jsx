import TeamAttendanceDashboard from "../../shared/attendance/TeamAttendanceDashboard";

export default function AttendancePage() {
  const employee = {
    id: "EMP001",
    nama: "Budi Santoso",
    jabatan: "Marketing"
  };

  return <TeamAttendanceDashboard employeeData={employee} />;
}
