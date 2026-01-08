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

const userJabatan = user.jabatan;
const userDepartemen = user.departemen;

if (allow.length > 0) {
  const isAllowed = allow.some(rule => {

    // === SUPPORT FORMAT LAMA: ["OPERATOR"] ===
    if (typeof rule === "string") {
      return rule === userJabatan;
    }

    // === FORMAT BARU: { jabatan, departemen } ===
    if (typeof rule === "object") {
      const jabatanMatch =
        !rule.jabatan || rule.jabatan === userJabatan;

      const departemenMatch =
        !rule.departemen || rule.departemen === userDepartemen;

      return jabatanMatch && departemenMatch;
    }

    return false;
  });

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }
}

  return children;
} 