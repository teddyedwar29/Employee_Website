import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './admin/pages/EmployeeDashboard';
import LoginPage from './auth/pages/LoginPage';
import OperatorLayout from "./operator/layout/OperatorLayout";
import MarketingLayout from "./marketing/layout/MarketingLayout";
import AttendancePage from './operator/pages/AttendancePage';
import MarketingAttendancePage from './marketing/pages/MarketingAttendancePage';
import ProtectedRoute from "@/auth/components/ProtectedRoute";
import RiwayatAbsensi from "./operator/pages/RiwayatAbsensi";
import KunjunganPage from './marketing/pages/KunjunganPage';
import RiwayatAbsensiMarketing from './marketing/pages/RiwayatAbsensiMarketing';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ADMIN ROUTES - HANYA UNTUK HRD */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allow={["HRD"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

        {/* OPERATOR ROUTES */} 
        <Route
          path="/operator"
          element={
            <ProtectedRoute allow={["OPERATOR"]}>
              <OperatorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="absensi" element={<AttendancePage />} />
          <Route path="riwayat" element={<RiwayatAbsensi />} />
        </Route>

        {/* MARKETING ROUTES */}
        <Route
          path="/marketing"
          element={
            <ProtectedRoute allow={["MARKETING"]}>  
              <MarketingLayout />
            </ProtectedRoute>
          }
        >
          <Route path="absensi" element={<MarketingAttendancePage />} />
          <Route path="kunjungan" element={<KunjunganPage />} />
          <Route path="riwayat" element={<RiwayatAbsensiMarketing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}