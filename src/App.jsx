import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './admin/pages/EmployeeDashboard';
import LoginPage from './auth/pages/LoginPage';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/karyawan" element={<EmployeeDashboard />} />
        <Route path="/admin/dashboard" element={<EmployeeDashboard />} />
        <Route path="/admin/karyawan-berhenti" element={<EmployeeDashboard />} />
        <Route path="/admin/laporan" element={<EmployeeDashboard />} />

        {/* MASTER (semua tetap pakai EmployeeDashboard) */}
        <Route path="/admin/master/jabatan" element={<EmployeeDashboard />} />
        <Route path="/admin/master/status-kerja" element={<EmployeeDashboard />} />
        <Route path="/admin/master/status-pernikahan" element={<EmployeeDashboard />} />
        <Route path="/admin/master/agama" element={<EmployeeDashboard />} />
        <Route path="/admin/master/departemen" element={<EmployeeDashboard />} />
        <Route path="/admin/master/kondisi-akun" element={<EmployeeDashboard />} />
        <Route path="/admin/master/gaji-setting" element={<EmployeeDashboard />} />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}