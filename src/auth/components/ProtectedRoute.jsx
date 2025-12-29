import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allow = [] }) {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // Kalau ada role restriction
  if (allow.length > 0) {
    const userRole = user.jabatan; // pastikan backend kirim "jabatan": "HRD"
    if (!allow.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}