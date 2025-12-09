import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './admin/pages/EmployeeDashboard';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute baru untuk halaman data karyawan */}
        <Route path="/admin/karyawan" element={<EmployeeDashboard />} />
        
        {/* Rute yang sudah ada untuk dashboard */}
        <Route path="/admin/dashboard" element={<EmployeeDashboard />} />

        <Route path="/admin/karyawan-berhenti" element={<EmployeeDashboard />} />

        {/* Rute baru untuk halaman master jabatan */}
        <Route path="/admin/master/jabatan" element={<EmployeeDashboard />} />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        {/* route master */}
      </Routes>
    </BrowserRouter>
  );
}