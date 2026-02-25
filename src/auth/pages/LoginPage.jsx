import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import LoginForm from "@/auth/components/LoginForm";
import { login } from "@/services/authServices";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async ({ id, password }) => {
    try {
      const res = await login(id, password);

      const token = res.access_token;
      const decoded = jwtDecode(token);

      localStorage.setItem("access_token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: decoded.sub,
          jabatan: decoded.jabatan,
          departemen: decoded.departemen,
          status_kerja: decoded.status_kerja,
        })
      );

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang",
        timer: 1500,
        showConfirmButton: false,
      });

      let path = "/login";

      const jabatan = decoded.jabatan?.toUpperCase();
      const departemen = decoded.departemen?.toUpperCase();

      // ===== KETUA (LEVEL KHUSUS) =====
      if (jabatan === "KETUA") {
        if (departemen === "HRD") {
          path = "/admin/dashboard";
        } 
        else if (departemen === "OPERATOR") {
          path = "/operator/absensi";
        } 
        else if (departemen === "AREA EKSEKUTIF") {
          path = "/marketing/absensi";
        } 
        else {
          path = "/login"; // fallback
        }
      }

      // ===== NON KETUA =====
      else if (jabatan === "OPERATOR") {
        path = "/operator/absensi";
      }
      else if (jabatan === "MARKETING") {
        path = "/marketing/absensi";
      }
      else if (jabatan === "IT") {
        path = "/it/absensi";
      }
      else {
        path = "/login"; // fallback aman
      }

      window.location.href = path;

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: err.message || "ID atau password salah",
      });
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
